/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');


		
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();


		this.numTriangles = 0;

		///////////////////////////////////////////////////////////////////////////

		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

		this.normalBuffer = gl.createBuffer();

		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
        this.lightColorLoc = gl.getUniformLocation(this.prog, 'lightColor');
        this.viewPositionLoc = gl.getUniformLocation(this.prog, 'viewPosition');
        this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');

		///////////////////////////////////////////////////////////////////////////
		
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		///////////////////////////////////////////////////////////////////////////

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

		gl.useProgram(this.prog);


        const lightColor = [1.0, 1.0, 1.0]; 
        const ambientLight = [0.2, 0.2, 0.2];
        const viewPosition = [0.0, 0.0, -5.0];
        const shininess = 32.0;

        gl.uniform3fv(this.lightColorLoc, lightColor);
        gl.uniform3fv(this.ambientLoc, ambientLight);
        gl.uniform3fv(this.viewPositionLoc, viewPosition);
        gl.uniform1f(this.shininessLoc, shininess);

		///////////////////////////////////////////////////////////////////////////

	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		///////////////////////////////////////////////////////////////////////////

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

		gl.uniform3fv(this.lightPosLoc, [lightX, lightY, -5]);

		///////////////////////////////////////////////////////////////////////////

		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);


	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img, position) {

		if (position == 0) {
			gl.useProgram(this.prog);
		
			const texture1 = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture1);
	
			// You can set the texture image data using the following command.
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGB,
				gl.RGB,
				gl.UNSIGNED_BYTE,
				img);
	

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture1);
			gl.uniform1i(gl.getUniformLocation(this.prog, 'tex'), 0);
			gl.uniform1i(gl.getUniformLocation(this.prog, 'useTex'), 1);
	
		} else if (position == 1) {
			gl.useProgram(this.prog);
		
			const texture2 = gl.createTexture();
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, texture2);
	
			// You can set the texture image data using the following command.
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGB,
				gl.RGB,
				gl.UNSIGNED_BYTE,
				img);
	


			gl.bindTexture(gl.TEXTURE_2D, texture2);
			gl.uniform1i(gl.getUniformLocation(this.prog, 'tex2'), 1);
			gl.uniform1i(gl.getUniformLocation(this.prog, 'useTex2'), 1);
	
		}

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {			
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.enableLightingLoc, show);
	}
	
	setAmbientLight(ambient) {
		gl.useProgram(this.prog);
		let ambient3 = [ambient, ambient, ambient]
		gl.uniform3fv(this.ambientLoc, ambient3);

	}

	setSpecularLight(specular) {
		gl.useProgram(this.prog);
		gl.uniform1fv(this.shininessLoc, [parseFloat(specular)]);
	}
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal;
			varying vec4 v_position; 

			void main()
			{
				v_position = mvp * vec4(pos,1);
				v_texCoord = texCoord;
				v_normal = normal;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform bool useTex;
			uniform bool useTex2;

			uniform sampler2D tex;
			uniform sampler2D tex2;


			uniform vec3 color; 
			uniform vec3 lightPos;
			uniform vec3 ambient;

			uniform float shininess;
			uniform vec3 viewPosition;

			varying vec2 v_texCoord;
			varying vec3 v_normal;
			varying vec4 v_position;


			vec4 blendedTexture;
			vec4 textureColor;
			vec4 textureColor2;

			void main()
			{
				if(showTex && enableLighting){

					vec3 normal = normalize(v_normal);
					vec3 lightDir = normalize(lightPos - vec3(v_position));
					vec3 viewDir = normalize(viewPosition - vec3(v_position));

					// Diffuse lighting
					float diff = max(dot(normal, lightDir), 0.0);
					 float diffuseIntensity = 0.5;
					vec3 diffuseColor = diffuseIntensity * diff * vec3(1.0, 1.0, 1.0); // default white light

					vec3 specularColor = vec3(0.0, 0.0, 0.0);
	
					// Specular lighting
					if (dot(v_normal, lightDir) > 0.0) {
						vec3 reflection = normalize(2.0 * dot(v_normal, lightDir) * v_normal - lightDir);
						specularColor = pow(max(dot(reflection, viewDir), 0.0), shininess) * vec3(1.0, 1.0, 1.0);
					}

					//textures
					textureColor = texture2D(tex, v_texCoord);
					textureColor2 = texture2D(tex2, v_texCoord);

					if (useTex && useTex2) {
						blendedTexture = mix(textureColor, textureColor2, 0.5);

					} else if (useTex) {
						blendedTexture = textureColor;

					} else if (useTex2) {
						blendedTexture = textureColor2;

					} else {
						blendedTexture = vec4(1.0, 0.0, 0.0, 1.0); // Fallback color (e.g., red)

					}
						
					vec3 finalColor = (ambient + diffuseColor + specularColor) * blendedTexture.rgb;
        			gl_FragColor = vec4(finalColor, blendedTexture.a);
				}
				else if(showTex) {
					textureColor = texture2D(tex, v_texCoord);
					textureColor2 = texture2D(tex2, v_texCoord);

					if (useTex && useTex2) {
						blendedTexture = mix(textureColor, textureColor2, 0.5);

					} else if (useTex) {
						blendedTexture = textureColor;

					} else if (useTex2) {
						blendedTexture = textureColor2;

					} else {
						blendedTexture = vec4(0.5, 0.5, 0.5, 1.0);

					}

					gl_FragColor = blendedTexture;
				}
				else{
					gl_FragColor =  vec4(1.0, 0, 0, 1.0);
				}
			}`;

// Light direction parameters for Task 2
var lightX = 10;
var lightY = 10;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////