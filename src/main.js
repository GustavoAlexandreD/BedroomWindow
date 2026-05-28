// main.js
import * as Utils from "./utils/webgl_utils.js";
import { createRenderable } from "./graphics/renderer.js";
import * as Math3D from "./utils/math.js";
import { createRoom } from "./graphics/room.js";
import { createOutsideScenario } from "./graphics/outside_scenario.js";
import { createCamera, updateCameraMovement, updateCameraLook, getViewMatrix } from "./graphics/camera.js";

let gl, prog, lightProg;
let sceneObjects = [];
let angle = 0;
let sunSpeed = 0;
let cont = 0;
// let bgMusic;
// Câmera
let camera;
let lastTime = 0;

// Input
const input = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

const models = ["assets/models/lua.obj", "assets/models/cama.obj", "assets/models/mesa_cabeceira.obj", "assets/models/relogio_parede.obj", "assets/models/blob_sorrateiro.obj", "assets/models/glob_rastejante.obj", "assets/models/grub_batedor.obj", "assets/fake_gato.obj"];
const texSrc = ["assets/textures/wood_table_disp_4k.png", "assets/textures/grama.jpg"];
const dynamicLightColor = [0.12, 0.36, 1.0]; // Ajuste aqui para mudar a cor da luz

async function init() {
  const loadedImages = await Promise.all(
    texSrc.map(url => Utils.loadImage(url))
  );

  const roomImg = await Utils.loadImage("assets/textures/dark-grunge-texture.jpg");
  const outsideImg = await Utils.loadImage("assets/textures/grama.jpg");

  initGL();
  setupInput();

  camera = createCamera();

  const modelParsers = [];
  const textureLibrary = loadedImages.map(img =>
    Utils.createWebGLTexture(gl, img)
  );
  const roomTexture = Utils.createWebGLTexture(gl, roomImg);
  const outsideTexture = Utils.createWebGLTexture(gl, outsideImg);

  // Quarto
  const room = createRoom(gl);
  room.isLightSource = false;
  room.transform.y = -15;
  room.texture = roomTexture;
  sceneObjects.push(room);

  // Cenário externo
  const outside = createOutsideScenario(gl);
  outside.isLightSource = false;
  outside.transform.y = -15;
  outside.texture = outsideTexture;
  sceneObjects.push(outside);

  // Modelos OBJ
  // ***** IMPORTANTE: Fazer a leitura dos modelos OBJ *****

  requestAnimationFrame(draw);
}

function initGL() {
  const canvas = document.getElementById("glcanvas1");
  gl = Utils.getGL(canvas);

  const vtxSrc = document.getElementById("vertex-shader").text;
  const fragSrc = document.getElementById("frag-shader").text;

  const lightFragSrc = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D tex;
    void main() {
      gl_FragColor = texture2D(tex, v_texCoord);
    }
  `;

  const vShader = Utils.createShader(gl, gl.VERTEX_SHADER, vtxSrc);
  const fShader = Utils.createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const lfShader = Utils.createShader(gl, gl.FRAGMENT_SHADER, lightFragSrc);

  prog = Utils.createProgram(gl, vShader, fShader);
  lightProg = Utils.createProgram(gl, vShader, lfShader);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.02, 0.05, 0.15, 1.0);
  gl.enable(gl.DEPTH_TEST);
}

function setupInput() {
  const canvas = gl.canvas;

  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

  canvas.onclick = () => {
    canvas.requestPointerLock();

    // if (bgMusic && bgMusic.paused) {
    //   bgMusic.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
    // }
  };

  document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
      updateCameraLook(camera, e.movementX, e.movementY);
    }
  });

  window.addEventListener("keydown", e => {
    if (e.key === "w") input.forward = true;
    if (e.key === "s") input.backward = true;
    if (e.key === "a") input.left = true;
    if (e.key === "d") input.right = true;
  });

  window.addEventListener("keyup", e => {
    if (e.key === "w") input.forward = false;
    if (e.key === "s") input.backward = false;
    if (e.key === "a") input.left = false;
    if (e.key === "d") input.right = false;
  });
}

function draw(time = 0) {
  const deltaTime = (time - lastTime) * 0.001;
  lastTime = time;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  angle++;
  cont++;
  if(sunSpeed < 15 && cont == 200){
    sunSpeed++;
    cont = 0;
  }else{
    if(sunSpeed == 15){
      cont = 0;
    }
  }

  updateCameraMovement(camera, input, deltaTime);

  const aspect = gl.canvas.width / gl.canvas.height;
  const projection = Math3D.createPerspective(60, aspect, 0.5, 2000);
  const view = getViewMatrix(camera);

  const radius = 100.0; // Distância da lua à origem
  const speedFactor = 0.015; // movimento mais lento
  const sunAngle = Math.sqrt(angle * sunSpeed) * speedFactor;
  const lx = Math.cos(sunAngle) * radius;
  const ly = Math.sin(sunAngle) * radius;
  const lz = 0;

  sceneObjects.forEach((obj, index) => {
    const program = obj.isLightSource ? lightProg : prog;
    gl.useProgram(program);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "projection"),
      false,
      projection
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "view"),
      false,
      view
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    const posLoc = gl.getAttribLocation(program, "position");
    if (posLoc !== -1) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    }

    const normLoc = gl.getAttribLocation(program, "normal");

    if (normLoc !== -1 && obj.normalBuffer) { 
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
        gl.enableVertexAttribArray(normLoc);
        gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
    }
    
    if (!obj.isLightSource) {
      gl.uniform3f(
        gl.getUniformLocation(program, "u_lightPosStatic"),
        20, 50, 40
      );
      gl.uniform3f(
        gl.getUniformLocation(program, "u_lightPosDynamic"),
        lx, ly, lz
      );
      gl.uniform3f(
        gl.getUniformLocation(program, "u_lightColorDynamic"),
        dynamicLightColor[0],
        dynamicLightColor[1],
        dynamicLightColor[2]
      );
      gl.uniform3f(
        gl.getUniformLocation(program, "u_viewPosition"),
        camera.position[0],
        camera.position[1],
        camera.position[2]
      );
      if(index == 5){
        obj.transform.ry = angle * 4
      }
    } else {
      obj.transform.x = lx;
      obj.transform.y = ly;
      obj.transform.z = lz;
    }

    const uUseTexLoc = gl.getUniformLocation(program, "u_useTexture");
    const uColorLoc = gl.getUniformLocation(program, "u_color");
    const texAttribLoc = gl.getAttribLocation(program, "texCoord");

    if (obj.bufferTexCoord && obj.texture) {

        // Avisa o shader: "Verdadeiro, use textura"
        gl.uniform1i(uUseTexLoc, 1);

        const texLoc = gl.getAttribLocation(program, "texCoord");
        if (obj.bufferTexCoord && texLoc !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferTexCoord);
            gl.enableVertexAttribArray(texLoc);
            gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);
        gl.uniform1i(gl.getUniformLocation(program, "tex"), 0);

    }else{
        // Avisa o shader: "Falso, use a cor u_color"
        gl.uniform1i(uUseTexLoc, 0);

        // Define a cor (Usa branco se obj.color não estiver definido)
        const colorToSend = obj.color ? obj.color : [1.0, 1.0, 1.0, 1.0];
        gl.uniform4fv(uColorLoc, colorToSend);

        // Boas práticas: Desvincular textura e desativar atributo para não dar erro
        gl.bindTexture(gl.TEXTURE_2D, null);
        if (texAttribLoc !== -1) {
            gl.disableVertexAttribArray(texAttribLoc);
        }

    }

    const matS = Math3D.scaleMatrix(
      obj.transform.scale,
      obj.transform.scale,
      obj.transform.scale
    );
    const matR = Math3D.rotateY(obj.transform.ry || 0);
    const matT = Math3D.translationMatrix(
      obj.transform.x,
      obj.transform.y,
      obj.transform.z
    );

    const model = Math3D.multiply(Math3D.multiply(matR, matS), matT);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "transf"),
      false,
      model
    );

    gl.drawArrays(gl.TRIANGLES, 0, obj.numVertices);
  });

  requestAnimationFrame(draw);
}

window.onload = init;