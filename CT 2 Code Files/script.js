const maxDepth = 0; //depth of recursion for the Sierpinski Gasket

//Vertex Shader source code
const vertexShaderSource = `
	attribute vec4 a_Position;
	void main() {
		gl_Position = a_Position;
	}
`;

//Fragment Shader source Code
const fragmentShaderSource = `
	void main() {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); //Set color to red
	}
`;

//Function to create the shader with a check 
function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compile failed: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

//Function to create & link the shader program with a check
function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Program Linking Failed: " + gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

//Recursive function
function subdivideTriangle(p1, p2, p3, depth, vertices) {
	if (depth === 0) {
		vertices.push(p1[0], p1[1]);
		vertices.push(p2[0], p2[1]);
		vertices.push(p3[0], p3[1]);
	} else {
		const mid12 = midpoint(p1, p2);
		const mid23 = midpoint(p2, p3);
		const mid31 = midpoint(p3, p1);
		
		subdivideTriangle(p1, mid12, mid31, depth - 1, vertices);
		subdivideTriangle(mid12, p2, mid23, depth - 1, vertices);
		subdivideTriangle(mid31, mid23, p3, depth - 1, vertices);
	}
}

//Function for calculating the midpoint
function midpoint(p1, p2) {
	return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) /2];
}
		

function main() {
	const canvas = document.getElementById("webgl-canvas"); //getting the canvas element from HTML
	const gl = canvas.getContext("webgl");
	
	if (!gl) {
		console.log("WebGL not supported, faillng back to experimental-webgl");
		return;
	}
	
	//Creating & compiling the vertex shader
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	
	const program = createProgram(gl, vertexShader, fragmentShader);
	gl.useProgram(program);
	
	//Define the initial vertices of the main triangle
	const vertices = [];
	const p1 = [0.0, 0.5];
	const p2 =	[-0.5, -0.5];
	const p3 =	[0.5, -0.5];
	
	//Recursivley subdivide the triangle
	subdivideTriangle(p1, p2, p3, maxDepth, vertices);
	
	const vertexData = new Float32Array(vertices);
	
	//Buffer creation & sending the vertex data to the GPU
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
	
	const a_Position = gl.getAttribLocation(program, "a_Position");
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	//Set background color
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	//Draw the vertices store in the array
	gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 2);
}

window.onload = main;