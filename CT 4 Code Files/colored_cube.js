//Canvas elemeent & initialize the WebGL context
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

//Check for WebGL being supported
if (!gl) {
	console.error("Webgl not supported.");
	alert("Use another browser.");
	throw new Error("Unable to initialize WebGL.");
	} else {
	console.log("WebGL initialized successfully.");
}

//Vertex Shader
const vertexShaderSource = `
	attribute vec3 aPosition;
	attribute vec3 aColor;
	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;
	varying vec3 vColor;
	
	void main() {
		gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
		vColor = aColor;
	}
`;

//Fragment Shader
const fragmentShaderSource = `
	precision mediump float;
	varying vec3 vColor;
	
	void main() {
		vec3 vibrantColor = vColor * 1.2;
		gl_FragColor = vec4(vibrantColor, 1.0);
	}
`;

//Create & complie a shader
function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	console.log("Shader compiled successfully.");
	return shader;
}

//Create & compile both the vertex and fragment shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

//Link shaders
function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Program linking error:", gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	console.log("Program linked successfully.");
	return program;
}

//Create and link the WebGL program
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

//Defining the vertices & colors
const vertices = new Float32Array([
	// Front face
	-1.0, -1.0, 1.0,  74 / 255, 122 / 255, 48 / 255,
	1.0, -1.0, 1.0,  232 / 255, 117 / 255, 45 / 255,
	1.0, 1.0, 1.0,  242 / 255, 193 / 255, 78 / 255,
	-1.0, 1.0, 1.0,  217 / 255, 123 / 255, 43 / 255,
	
	//Back face
	-1.0, -1.0, -1.0,  46 / 255, 125 / 255, 50 / 255,
	1.0, -1.0, -1.0,  79 / 255, 109 / 255, 64 / 255,
	1.0, 1.0, -1.0,  139 / 255, 58 / 255, 58 / 255,
	-1.0, 1.0, -1.0,  166 / 255, 73 / 255, 45 / 255,
	]);

//Define the indices to form the triangles that make up the cube	
const indices = new Uint16Array([
	//Front 
	0, 1, 2,  2, 3, 0,
	//Back
	4, 5, 6,  6, 7, 4,
	//Top
	3, 2, 6,  6, 7, 3,
	//Bottom
	0, 1, 5,  5, 4, 0,
	//Right
	1, 2, 6,  6, 5, 1,
	//Left
	0, 3, 7,  7, 4, 0,
	]);

//Bind buffers for vertex position & colors
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//Bind buffers for indices 
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

gl.useProgram(program);

const aPosition = gl.getAttribLocation(program, "aPosition");
const aColor = gl.getAttribLocation(program, "aColor");

//Bind position data to the aPosition attribute
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * 4, 0);
gl.enableVertexAttribArray(aPosition);

//Bind color data to the aColor attribute
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
gl.enableVertexAttribArray(aColor);

const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

if (aPosition === -1 || aColor === -1 || uModelViewMatrix === -1 || uProjectionMatrix === -1) {
	console.error("Failed to get the location of an attribute or uniform.");
	} else {
	console.log("All atrributes and uniform locations obtained successfully.");
	}

const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 3, canvas.width / canvas.height, 0.1, 100.0);

//Initialize the model view matrix and transformation variables
let modelViewMatrix = mat4.create(); 
let rotation = 0;
let swayAngle = 0;
const swaySpeed = 0.10;
const rotationSpeed = 0.06;
const swayIntensity = 0.10; 
const rotationIntensity = 0.06;

//Render function for drawing & animation
function render() {
	gl.clearColor(42 / 255, 59 / 255, 45 / 255, 1.0); //Dark green background
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	
	// Reset the model view matrix
	mat4.identity(modelViewMatrix);
	
	// Apply sway motion
	const swayX = Math.sin(swayAngle) * swayIntensity;
	const swayY = Math.cos(swayAngle * 0.8) * (swayIntensity / 2);
	mat4.translate(modelViewMatrix, modelViewMatrix, [swayX, swayY, -4]);  // Moved closer for visibility
	
	// Update sway angle
	swayAngle += swaySpeed;
	
	// Apply rotation
	mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation * rotationIntensity);
	mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation * rotationIntensity);
	rotation += rotationSpeed;
	
	gl.useProgram(program);
	//Set the model view & projection matrices in the shaders
	gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
	
	//Draw cube
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	
	requestAnimationFrame(render); //Continue animation
}
render();
	
	