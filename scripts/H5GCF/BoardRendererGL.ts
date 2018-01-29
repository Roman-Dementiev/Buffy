namespace JewelWarrior
{
	const kJewelColors = [
		[0.1, 0.8, 0.1],
		[0.9, 0.1, 0.1],
		[0.9, 0.3, 0.8],
		[0.8, 1.0, 1.0],
		[0.2, 0.4, 1.0],
		[1.0, 0.4, 0.1],
		[1.0, 0.9, 0.1]
	];

	export type JewelGL = {
		x: number,
		y: number,
		type: JewelType,
		random: number,
		scale: number
	};

	class BoardRendererGL extends BoardRenderer<WebGLRenderingContext> implements IBoardRenderer
	{
		private program: WebGLProgram;
		private aVertex: number;
		private aNormal: number;
		private uScale: WebGLUniformLocation;
		private uColor: WebGLUniformLocation;
		private geometry: WebGL.Geometry;
//		private glBoard: BoardGL;
		private jewels: JewelGL[];

		public getProgram(): WebGLProgram { return this.program; }

		public constructor(config: GameConfig)
		{
			super(config);
		}

		protected initContext(callback: Callback)
		{
			let gl = WebGL.createContext(this.canvas);
			this.context = gl;

			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.CULL_FACE);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

			this.program = this.setupShaders();
			this.setupTexture();
			gl.useProgram(this.program);

			this.aVertex = gl.getAttribLocation(this.program, "aVertex");
			this.aNormal = gl.getAttribLocation(this.program, "aNormal");
			this.uScale = gl.getUniformLocation(this.program, "uScale");
			this.uColor = gl.getUniformLocation(this.program, "uColor");

			gl.enableVertexAttribArray(this.aVertex);
			gl.enableVertexAttribArray(this.aNormal);

			gl.uniform1f(
				gl.getUniformLocation(this.program, "uAmbient"),
				0.12
			);
			gl.uniform3f(
				gl.getUniformLocation(this.program, "uLightPosition"),
				20, 15, -10
			);

			WebGL.loadModel(gl, "models/jewel.dae", (geom) => {
				this.geometry = geom;
			});
			WebGL.setProjection(
				gl, this.program, 60, this.numCols / this.numRows, 0.1, 100
			);

			if (callback) {
				callback();
			}
		}

		private setLayout(layout: JewelLayout)
		{
			this.jewels = [];
			for (let x = 0; x < this.numCols; x++) {
				for (let y = 0; y < this.numRows; y++) {
					let type = layout[x][y];
					let jewel = this.getJewel(x, y);
					if (jewel) {
						jewel.type = type;
					} else {
						this.createJewel(x, y, type);
					}
				}
			}
		}

		private getJewel(col: number, row: number): JewelGL
		{
			for (let jewel of this.jewels) {
				if (jewel.x == col && jewel.y == row) {
					return jewel;
				}
			}
			return null;
		}

		private createJewel(col: number, row: number, type: JewelType): JewelGL
		{
			let jewel = {
				x: col,
				y: row,
				type: type,
				random: Math.random() * 2 - 1,
				scale: 1
			};
			this.jewels.push(jewel);
			return jewel;
		}

		public start(board: IBoard)
		{
			this.setLayout(board.getLayout());
			super.start(board);
		}

		protected render(time: number, prevTime: number)
		{
			if (!this.paused) {
				this.renderAnimations(time, prevTime);
				if (this.geometry) {
					this.renderGeometry();
				}
			}
		}

		protected renderGeometry()
		{
			let canvas = this.canvas;
			let gl = this.context;
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.viewport(0, 0, canvas.width, canvas.height);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vbo);
			gl.vertexAttribPointer(
				this.aVertex, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.nbo);
			gl.vertexAttribPointer(
				this.aNormal, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.ibo);

			for (let jewel of this.jewels) {
				this.renderJewel(jewel);
			}
		}

		public renderJewel(jewel: JewelGL)
		{
			let gl = this.context,
				x = jewel.x - this.numCols / 2 + 0.5,  // make position
				y = -jewel.y + this.numRows / 2 - 0.5, // relative to center
				scale = jewel.scale,
				n = this.geometry.num;

			var mv = WebGL.setModelView(gl, this.program,
				[x * 4.4, y * 4.4, -32], // scale and move back
				Date.now() / 1500 + jewel.random * 100, // rotate
				[0, 1, 0.1] // rotation axis
			);
			WebGL.setNormalMatrix(gl, this.program, mv);

			// add effect for selected jewel
			if (this.cursor && jewel.x == this.cursor.col && jewel.y == this.cursor.row) {
				scale *= 1.0 + Math.sin(Date.now() / 100) * 0.1;
			}

			gl.uniform1f(this.uScale, scale);
			gl.uniform3fv(this.uColor, kJewelColors[jewel.type]);

			gl.cullFace(gl.FRONT);
			gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

			gl.cullFace(gl.BACK);
			gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
		}

		public redrawBoard(callback?: Callback)
		{
			this.setLayout(this.board.getLayout());
			if (callback) {
				callback();
			}
		}

		public moveJewels(moved: MoveEventItem[], callback?: Callback)
		{
			let count = moved.length;

			for (let e of moved) {
				let x = e.fromX, y = e.fromY,
					dx = e.toX - e.fromX,
					dy = e.toY - e.fromY,
					dist = Math.abs(dx) + Math.abs(dy),
					jewel = this.getJewel(x, y);

				if (!jewel) {
					jewel = this.createJewel(x, y, e.type);
				}

				this.addAnimation(200 * dist, new MoveAnimation(jewel, e),
					/*callback*/() => {
					if (--count == 0) {
						if (callback) {
							callback();
						}
					}
				});
			}
		}

		public removeJewels(removed: RemoveEventItem[], callback?: Callback)
		{
			let count = removed.length;

			for (let e of removed) {
				let jewel = this.getJewel(e.x, e.y);
				if (!jewel) continue;

				this.addAnimation(400, new RemoveAnimation(jewel),
					/*callback*/() => {
					this.jewels.splice(this.jewels.indexOf(jewel), 1);
					if (--count == 0) {
						if (callback) {
							callback();
						}
					}
				});
			}
		}

		public refill(layout: JewelLayout, callback?: Callback)
		{
			this.setLayout(layout);
		}

		public levelUpAnimation(callback?: Callback)
		{
			this.addAnimation(500, new LevelUpAnimation(), callback);
		}s

		gameOverAnimation(callback?: Callback)
		{
			this.removeJewels(this.jewels);
		}

		private setupTexture()
		{
			let gl = this.context,
				image = new Image();
			image.addEventListener("load", () => {
				let texture = WebGL.createTexture(gl, image);
				//gl.uniform1i(
				//	gl.getUniformLocation(program, "uTexture"),
				//	"uTexture", 0
				//);
				let uTexture = gl.getUniformLocation(this.program, "uTexture");
				gl.uniform1i(uTexture, gl.TEXTURE0);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
			}, false);
			image.src = "images/jewelpattern.jpg";
		}

		private setupShaders()
		{
			let gl = this.context;
			var vsource =
				"attribute vec3 aVertex;\r\n" +
				"attribute vec3 aNormal;\r\n" +

				"uniform mat4 uModelView;\r\n" +
				"uniform mat4 uProjection;\r\n" +
				"uniform mat3 uNormalMatrix;\r\n" +
				"uniform vec3 uLightPosition;\r\n" +

				"uniform float uScale;\r\n" +

				"varying float vDiffuse;\r\n" +
				"varying float vSpecular;\r\n" +
				"varying vec4 vPosition;\r\n" +
				"varying vec3 vNormal;\r\n" +

				"void main(void) {\r\n" +
				"    vPosition = uModelView * vec4(aVertex * uScale, 1.0);\r\n" +
				"    vNormal = normalize(aVertex);\r\n" +

				"    vec3 normal = normalize(uNormalMatrix * aNormal);\r\n" +
				"    vec3 lightDir = uLightPosition - vPosition.xyz;\r\n" +
				"    lightDir = normalize(lightDir);\r\n" +

				"    vDiffuse = max(dot(normal, lightDir), 0.0);\r\n" +

				"    vec3 viewDir = normalize(vPosition.xyz);\r\n" +
				"    vec3 reflectDir = reflect(lightDir, normal);\r\n" +
				"    float specular = dot(reflectDir, viewDir);\r\n" +
				"    vSpecular = pow(specular, 16.0);\r\n" +

				"    gl_Position = uProjection * vPosition;\r\n" +
				"}"
				;

			var fsource =
				"#ifdef GL_ES\r\n" +
				"precision mediump float;\r\n" +
				"#endif\r\n" +

				"uniform sampler2D uTexture;\r\n" +
				"uniform float uAmbient;\r\n" +
				"uniform vec3 uColor;\r\n" +

				"varying float vDiffuse;\r\n" +
				"varying float vSpecular;\r\n" +
				"varying vec3 vNormal;\r\n" +

				"void main(void) {\r\n" +
				"    float theta = acos(vNormal.y) / 3.14159;" +
				"    float phi = atan(vNormal.z, vNormal.x) / (2.0 * 3.14159);" +
				"    vec2 texCoord = vec2(-phi, theta);" +

				"    float texColor = texture2D(uTexture, texCoord).r;\r\n" +

				"    float light = uAmbient + vDiffuse + vSpecular + texColor;\r\n" +

				"    gl_FragColor = vec4(uColor * light, 0.7);\r\n" +
				"}\r\n"
				;

			let vshader = WebGL.createShader(gl, gl.VERTEX_SHADER, vsource),
				fshader = WebGL.createShader(gl, gl.FRAGMENT_SHADER, fsource);

			return WebGL.createProgram(gl, vshader, fshader);
		}
	};

	abstract class Animation implements IAnimation
	{
		constructor() { }

		public before(renderer: BoardRendererGL, pos: number) { }
		public abstract render(renderer: BoardRendererGL, pos: number, delta: number);
		public done(renderer: BoardRendererGL) { }
	};

	class MoveAnimation extends Animation
	{
		private jewel: JewelGL;
		private x: number;
		private y: number;
		private dx: number;
		private dy: number;

		constructor(jewel: JewelGL, move: MoveEventItem)
		{
			super();
			this.jewel = jewel;
			this.x = move.fromX;
			this.y = move.fromY;
			this.dx = move.toX - move.fromX;
			this.dy = move.toY - move.fromY;
		}

		public render(renderer: BoardRendererGL, pos: number, delta: number)
		{
			pos = Math.sin(pos * Math.PI / 2);
			this.jewel.x = this.x + this.dx * pos;
			this.jewel.y = this.y + this.dy * pos;
		}

		public done(renderer: BoardRendererGL)
		{
			this.jewel.x = this.x + this.dx;
			this.jewel.y = this.y + this.dy;
			super.done(renderer);
		}
	};

	class RemoveAnimation extends Animation
	{
		private jewel: JewelGL;
		private startX: number;
		private startY: number;

		constructor(jewel: JewelGL)
		{
			super();
			this.jewel = jewel;
			this.startX = jewel.x;
			this.startY = jewel.y;
		}

		public render(renderer: BoardRendererGL, pos: number, delta: number)
		{
			this.jewel.x = this.startX + this.jewel.random * pos * 2;
			this.jewel.y = this.startY + pos * pos * 2;
			this.jewel.scale = 1 - pos;
		}
	};

	class LevelUpAnimation extends Animation
	{
		public constructor()
		{
			super();
		}

		public render(renderer: BoardRendererGL, pos: number, delta: number)
		{
			let gl = renderer.getContext();
			gl.uniform1f(
				gl.getUniformLocation(renderer.getProgram(), "uAmbient"),
				0.12 + Math.sin(pos * Math.PI) * 0.5
			);
		}
	}

	if (JewelWarrior.factory) {
		JewelWarrior.factory.createRenderer = (config: GameConfig) =>
		{
			return new BoardRendererGL(config);
		};
	}
};
