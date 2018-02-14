var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JewelWarrior;
(function (JewelWarrior) {
    var kJewelColors = [
        [0.1, 0.8, 0.1],
        [0.9, 0.1, 0.1],
        [0.9, 0.3, 0.8],
        [0.8, 1.0, 1.0],
        [0.2, 0.4, 1.0],
        [1.0, 0.4, 0.1],
        [1.0, 0.9, 0.1]
    ];
    var BoardRendererGL = (function (_super) {
        __extends(BoardRendererGL, _super);
        function BoardRendererGL(config) {
            return _super.call(this, config) || this;
        }
        BoardRendererGL.prototype.getProgram = function () { return this.program; };
        BoardRendererGL.prototype.initContext = function (callback) {
            var _this = this;
            var gl = JewelWarrior.WebGL.createContext(this.canvas);
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
            gl.uniform1f(gl.getUniformLocation(this.program, "uAmbient"), 0.12);
            gl.uniform3f(gl.getUniformLocation(this.program, "uLightPosition"), 20, 15, -10);
            JewelWarrior.WebGL.loadModel(gl, "models/jewel.dae", function (geom) {
                _this.geometry = geom;
            });
            JewelWarrior.WebGL.setProjection(gl, this.program, 60, this.numCols / this.numRows, 0.1, 100);
            if (callback) {
                callback();
            }
        };
        BoardRendererGL.prototype.setLayout = function (layout) {
            this.jewels = [];
            for (var x = 0; x < this.numCols; x++) {
                for (var y = 0; y < this.numRows; y++) {
                    var type = layout[x][y];
                    var jewel = this.getJewel(x, y);
                    if (jewel) {
                        jewel.type = type;
                    }
                    else {
                        this.createJewel(x, y, type);
                    }
                }
            }
        };
        BoardRendererGL.prototype.getJewel = function (col, row) {
            for (var _i = 0, _a = this.jewels; _i < _a.length; _i++) {
                var jewel = _a[_i];
                if (jewel.x == col && jewel.y == row) {
                    return jewel;
                }
            }
            return null;
        };
        BoardRendererGL.prototype.createJewel = function (col, row, type) {
            var jewel = {
                x: col,
                y: row,
                type: type,
                random: Math.random() * 2 - 1,
                scale: 1
            };
            this.jewels.push(jewel);
            return jewel;
        };
        BoardRendererGL.prototype.start = function (board) {
            this.setLayout(board.getLayout());
            _super.prototype.start.call(this, board);
        };
        BoardRendererGL.prototype.render = function (time, prevTime) {
            if (!this.paused) {
                this.renderAnimations(time, prevTime);
                if (this.geometry) {
                    this.renderGeometry();
                }
            }
        };
        BoardRendererGL.prototype.renderGeometry = function () {
            var canvas = this.canvas;
            var gl = this.context;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vbo);
            gl.vertexAttribPointer(this.aVertex, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.nbo);
            gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.ibo);
            for (var _i = 0, _a = this.jewels; _i < _a.length; _i++) {
                var jewel = _a[_i];
                this.renderJewel(jewel);
            }
        };
        BoardRendererGL.prototype.renderJewel = function (jewel) {
            var gl = this.context, x = jewel.x - this.numCols / 2 + 0.5, // make position
            y = -jewel.y + this.numRows / 2 - 0.5, // relative to center
            scale = jewel.scale, n = this.geometry.num;
            var mv = JewelWarrior.WebGL.setModelView(gl, this.program, [x * 4.4, y * 4.4, -32], // scale and move back
            Date.now() / 1500 + jewel.random * 100, // rotate
            [0, 1, 0.1] // rotation axis
            );
            JewelWarrior.WebGL.setNormalMatrix(gl, this.program, mv);
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
        };
        BoardRendererGL.prototype.redrawBoard = function (callback) {
            this.setLayout(this.board.getLayout());
            if (callback) {
                callback();
            }
        };
        BoardRendererGL.prototype.moveJewels = function (moved, callback) {
            var count = moved.length;
            for (var _i = 0, moved_1 = moved; _i < moved_1.length; _i++) {
                var e = moved_1[_i];
                var x = e.fromX, y = e.fromY, dx = e.toX - e.fromX, dy = e.toY - e.fromY, dist = Math.abs(dx) + Math.abs(dy), jewel = this.getJewel(x, y);
                if (!jewel) {
                    jewel = this.createJewel(x, y, e.type);
                }
                this.addAnimation(200 * dist, new MoveAnimation(jewel, e), 
                /*callback*/ function () {
                    if (--count == 0) {
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
        };
        BoardRendererGL.prototype.removeJewels = function (removed, callback) {
            var _this = this;
            var count = removed.length;
            var _loop_1 = function (e) {
                var jewel = this_1.getJewel(e.x, e.y);
                if (!jewel)
                    return "continue";
                this_1.addAnimation(400, new RemoveAnimation(jewel), 
                /*callback*/ function () {
                    _this.jewels.splice(_this.jewels.indexOf(jewel), 1);
                    if (--count == 0) {
                        if (callback) {
                            callback();
                        }
                    }
                });
            };
            var this_1 = this;
            for (var _i = 0, removed_1 = removed; _i < removed_1.length; _i++) {
                var e = removed_1[_i];
                _loop_1(e);
            }
        };
        BoardRendererGL.prototype.refill = function (layout, callback) {
            this.setLayout(layout);
        };
        BoardRendererGL.prototype.levelUpAnimation = function (callback) {
            this.addAnimation(500, new LevelUpAnimation(), callback);
        };
        BoardRendererGL.prototype.gameOverAnimation = function (callback) {
            this.removeJewels(this.jewels);
        };
        BoardRendererGL.prototype.setupTexture = function () {
            var _this = this;
            var gl = this.context, image = new Image();
            image.addEventListener("load", function () {
                var texture = JewelWarrior.WebGL.createTexture(gl, image);
                //gl.uniform1i(
                //	gl.getUniformLocation(program, "uTexture"),
                //	"uTexture", 0
                //);
                var uTexture = gl.getUniformLocation(_this.program, "uTexture");
                gl.uniform1i(uTexture, gl.TEXTURE0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }, false);
            image.src = "images/jewelpattern.jpg";
        };
        BoardRendererGL.prototype.setupShaders = function () {
            var gl = this.context;
            var vsource = "attribute vec3 aVertex;\r\n" +
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
                "}";
            var fsource = "#ifdef GL_ES\r\n" +
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
                "}\r\n";
            var vshader = JewelWarrior.WebGL.createShader(gl, gl.VERTEX_SHADER, vsource), fshader = JewelWarrior.WebGL.createShader(gl, gl.FRAGMENT_SHADER, fsource);
            return JewelWarrior.WebGL.createProgram(gl, vshader, fshader);
        };
        return BoardRendererGL;
    }(JewelWarrior.BoardRenderer));
    ;
    var Animation = (function () {
        function Animation() {
        }
        Animation.prototype.before = function (renderer, pos) { };
        Animation.prototype.done = function (renderer) { };
        return Animation;
    }());
    ;
    var MoveAnimation = (function (_super) {
        __extends(MoveAnimation, _super);
        function MoveAnimation(jewel, move) {
            var _this = _super.call(this) || this;
            _this.jewel = jewel;
            _this.x = move.fromX;
            _this.y = move.fromY;
            _this.dx = move.toX - move.fromX;
            _this.dy = move.toY - move.fromY;
            return _this;
        }
        MoveAnimation.prototype.render = function (renderer, pos, delta) {
            pos = Math.sin(pos * Math.PI / 2);
            this.jewel.x = this.x + this.dx * pos;
            this.jewel.y = this.y + this.dy * pos;
        };
        MoveAnimation.prototype.done = function (renderer) {
            this.jewel.x = this.x + this.dx;
            this.jewel.y = this.y + this.dy;
            _super.prototype.done.call(this, renderer);
        };
        return MoveAnimation;
    }(Animation));
    ;
    var RemoveAnimation = (function (_super) {
        __extends(RemoveAnimation, _super);
        function RemoveAnimation(jewel) {
            var _this = _super.call(this) || this;
            _this.jewel = jewel;
            _this.startX = jewel.x;
            _this.startY = jewel.y;
            return _this;
        }
        RemoveAnimation.prototype.render = function (renderer, pos, delta) {
            this.jewel.x = this.startX + this.jewel.random * pos * 2;
            this.jewel.y = this.startY + pos * pos * 2;
            this.jewel.scale = 1 - pos;
        };
        return RemoveAnimation;
    }(Animation));
    ;
    var LevelUpAnimation = (function (_super) {
        __extends(LevelUpAnimation, _super);
        function LevelUpAnimation() {
            return _super.call(this) || this;
        }
        LevelUpAnimation.prototype.render = function (renderer, pos, delta) {
            var gl = renderer.getContext();
            gl.uniform1f(gl.getUniformLocation(renderer.getProgram(), "uAmbient"), 0.12 + Math.sin(pos * Math.PI) * 0.5);
        };
        return LevelUpAnimation;
    }(Animation));
    if (JewelWarrior.factory) {
        JewelWarrior.factory.createRenderer = function (config) {
            return new BoardRendererGL(config);
        };
    }
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=BoardRendererGL.js.map