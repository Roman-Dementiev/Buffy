﻿namespace JewelWarrior.WebGL
{
	export type Mat4 = number[];
	export type Mat3 = number[];
	export type Vec4 = number[];
	export type Vec3 = number[];

	export type TextureImage = ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

	export type Geometry = {
		vbo: WebGLBuffer,
		nbo: WebGLBuffer,
		ibo: WebGLBuffer,
		num: number
	};


	export function createContext(canvas: HTMLCanvasElement): WebGLRenderingContext
	{
		let gl = canvas.getContext("webgl") ||
			canvas.getContext("experimental-webgl");
		return gl;
	}

	export function createShader(gl: WebGLRenderingContext, shaderType: number, source): WebGLShader
	{
		let shader = gl.createShader(shaderType);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw gl.getShaderInfoLog(shader);
		}
		return shader;
	}

	export function createTexture(gl: WebGLRenderingContext, image: TextureImage): WebGLTexture
	{
		let texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(
			gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(
			gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0,
			gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	export function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram
	{
		let program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw gl.getProgramInfoLog(program);
		}
		return program;
	}

	export function createFloatBuffer(gl: WebGLRenderingContext, data: number[], usage?: number): WebGLBuffer
	{
		if (typeof usage == 'undefined')
			usage = gl.STATIC_DRAW;
		let buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
		return buffer;
	}

	export function createIndexBuffer(gl: WebGLRenderingContext, data: number[], usage?: number): WebGLBuffer
	{
		if (typeof usage == 'undefined') usage = gl.STATIC_DRAW;
		let buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), usage);
		return buffer;
	}

	export function setModelView(gl: WebGLRenderingContext, program: WebGLProgram, pos: Vec3, rot: number, axis: Vec3): Mat4
	{
		let mvMatrix = WebGL.createIdentityMat4();
		WebGL.translateMat4(mvMatrix, pos);
		WebGL.rotateMat4(mvMatrix, rot, axis);

		gl.uniformMatrix4fv(
			gl.getUniformLocation(program, "uModelView"),
			false,
			mvMatrix
		);
		return mvMatrix;
	}

	export function setProjection(gl: WebGLRenderingContext, program: WebGLProgram, fov: number, aspect: number, near: number, far: number)
	{
		let projMatrix = WebGL.createPerspectiveMat4(fov, aspect, near, far);
		gl.uniformMatrix4fv(
			gl.getUniformLocation(program, "uProjection"),
			false,
			projMatrix
		);
		return projMatrix;
	}

	export function setNormalMatrix(gl: WebGLRenderingContext, program: WebGLProgram, mvMatrix: Mat4)
	{
		var normalMatrix = WebGL.toMat3(mvMatrix);
		gl.uniformMatrix3fv(
			gl.getUniformLocation(program, "uNormalMatrix"),
			false,
			normalMatrix
		);
		return normalMatrix;
	}

	export function createIdentityMat4(): Mat4
	{
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	export function toMat3(M: Mat4)
	{
		return [
			M[0], M[1], M[2],
			M[4], M[5], M[6],
			M[8], M[9], M[10],
		];
	}

	export function translateMat4(M: Mat4, V: Vec3)
	{
		var x = V[0], y = V[1], z = V[2];
		M[12] = M[0] * x + M[4] * y + M[8] * z + M[12];
		M[13] = M[1] * x + M[5] * y + M[9] * z + M[13];
		M[14] = M[2] * x + M[6] * y + M[10] * z + M[14];
		M[15] = M[3] * x + M[7] * y + M[11] * z + M[15];
	}

	export function rotateMat4(M: Mat4, angle: number, axis: Vec3)
	{
		let x = axis[0], y = axis[1], z = axis[2],
			axisLength = Math.sqrt(x * x + y * y + z * z),
			sA = Math.sin(angle),
			cA = Math.cos(angle),
			t = 1 - cA;

		// normalize axis to unit vector
		x /= axisLength;
		y /= axisLength;
		z /= axisLength;

		// copy values
		var M00 = M[0], M01 = M[1], M02 = M[2], M03 = M[3],
			M10 = M[4], M11 = M[5], M12 = M[6], M13 = M[7],
			M20 = M[8], M21 = M[9], M22 = M[10], M23 = M[11];

		// rotation matrix
		var R00 = x * x * t + cA, R01 = y * x * t + z * sA, R02 = z * x * t - y * sA,
			R10 = x * y * t - z * sA, R11 = y * y * t + cA, R12 = z * y * t + x * sA,
			R20 = x * z * t + y * sA, R21 = y * z * t - x * sA, R22 = z * z * t + cA;

		// multiply matrices
		M[0] = M00 * R00 + M10 * R01 + M20 * R02;
		M[1] = M01 * R00 + M11 * R01 + M21 * R02;
		M[2] = M02 * R00 + M12 * R01 + M22 * R02;
		M[3] = M03 * R00 + M13 * R01 + M23 * R02;
		M[4] = M00 * R10 + M10 * R11 + M20 * R12;
		M[5] = M01 * R10 + M11 * R11 + M21 * R12;
		M[6] = M02 * R10 + M12 * R11 + M22 * R12;
		M[7] = M03 * R10 + M13 * R11 + M23 * R12;
		M[8] = M00 * R20 + M10 * R21 + M20 * R22;
		M[9] = M01 * R20 + M11 * R21 + M21 * R22;
		M[10] = M02 * R20 + M12 * R21 + M22 * R22;
		M[11] = M03 * R20 + M13 * R21 + M23 * R22;
	}

	export function createPerspectiveMat4(
		fov: number,            // field-of-view in degrees (commonly used range: 45-90)
		aspectRatio: number,    // normally width / height ratio of canvas
		near: number,           // closes rendering distance
		far: number             // farest rendering distance
	)
	{
		var f = 1.0 / Math.tan(fov * Math.PI / 360),
			nf = 1 / (near - far);
		return [
			f / aspectRatio, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) * nf, -1,
			0, 0, (2 * far * near) * nf, 0
		];
	}

	export function loadModel(gl: WebGLRenderingContext, url: string, callback: (g: Geometry) => any)
	{
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		// override mime type to make sure it’s loaded as XML
		xhr.overrideMimeType("text/xml");
		xhr.onreadystatechange = function ()
		{
			if (xhr.readyState == 4) {
				if (xhr.status == 200 && xhr.responseXML) {
					callback(parseCollada(gl, xhr.responseXML));
				}
			}
		};
		xhr.send(null);
	}


	function parseCollada(gl: WebGLRenderingContext, xml: Document): Geometry
	{
		let 
			$ = function (str: string, parent?: any)
			{
				return (parent || xml).querySelectorAll(str);
			},
			getInput = function (sem, par)
			{
				var el = $("input[semantic=" + sem + "]", par)[0];
				return $("source[id=" + el.getAttribute("source").substr(1) + "]", mesh)[0];
			},
			parseVals = function (el)
			{
				var strvals = el.textContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
				return strvals.split(/\s+/).map(parseFloat);
			},
			mesh = $("geometry > mesh")[0],
			polylist = $("polylist", mesh)[0],
			vrtInput = getInput("VERTEX", polylist),
			posInput = getInput("POSITION", vrtInput),
			nrmInput = getInput("NORMAL", polylist),
			nrmList = parseVals($("float_array", nrmInput)[0]),
			idxList = parseVals($("p", polylist)[0]),
			vertices, normals, indices,
			i, j, v, n;

		vertices = parseVals($("float_array", posInput)[0]);
		normals = [];
		indices = [];

		for (i = 0; i < idxList.length; i += 6) {
			for (j = 0; j < 3; j++) {
				v = idxList[i + j * 2];
				n = idxList[i + j * 2 + 1];
				indices.push(v);
				normals[v * 3] = nrmList[n * 3];
				normals[v * 3 + 1] = nrmList[n * 3 + 1];
				normals[v * 3 + 2] = nrmList[n * 3 + 2];
			}
		}

		return {
			vbo: createFloatBuffer(gl, vertices),
			nbo: createFloatBuffer(gl, normals),
			ibo: createIndexBuffer(gl, indices),
			num: indices.length
		};
	}
};
