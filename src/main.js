// main.js
import * as Utils from "./utils/webgl_utils.js";
import * as Math3D from "./utils/math.js";
import { Room } from "./graphics/room.js";
import { createOutsideScenario } from "./graphics/outside_scenario.js";
import { createCamera, updateCameraMovement, updateCameraLook, getViewMatrix } from "./graphics/camera.js";
import { OBJLoader } from "./models/obj-loader.js"
import { TextureLoader } from "./graphics/texture-loader.js"
import { createRenderable } from "./graphics/renderer.js";
import { Furniture } from "./entities/furniture.js"
import { EntityManager } from "./game/entity-manager.js";
import { CollisionSystem } from "./game/collision.js"

let gl, prog, lightProg;
let sceneObjects = [];
let collisionSystem;
// Câmera
let camera;
let lastTime = 0;
let windowsPosition = [];

// Input
const input = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

const models = ["assets/models/lua.obj", "assets/models/cama.obj", "assets/models/mesa_cabeceira.obj", "assets/models/relogio_parede.obj", "assets/models/blob_sorrateiro.obj", "assets/models/glob_rastejante.obj", "assets/models/grub_batedor.obj", "assets/fake_gato.obj"];
const texSrc = ["assets/textures/wood_table_disp_4k.png", "assets/textures/grama.jpg"];
const dynamicLightColor = [1.0, 0.42, 0.1]; // Ajuste aqui para mudar a cor da luz
const InitialplayerLightRadius = 90.0; // Raio da luz ao redor do jogador (ajuste conforme necessário)
let playerLightRadius; // Variável que será animada ao longo do tempo

async function init() {
  const loadedImages = await Promise.all(
    texSrc.map(url => Utils.loadImage(url))
  );

  const roomImg = await Utils.loadImage("assets/textures/dark-grunge-texture.jpg");
  const outsideImg = await Utils.loadImage("assets/textures/grama.jpg");

  initGL();
  setupInput();

  camera = createCamera();
  windowsPosition = [];

  const roomTexture = Utils.createWebGLTexture(gl, roomImg);
  const outsideTexture = Utils.createWebGLTexture(gl, outsideImg);

  // Colisões
  // Inicia o sistema de colisão
  collisionSystem = new CollisionSystem();

  // Registra a "caixa invisível" da mesa.
  collisionSystem.addBox([0.0, 0.0, -60.0], [15.0, 20.0, 15.0])

  // Quartos
  const roomInstance1 = new Room([0,0,0], [0,0], [0,0], [0,0], [2,2]);
  const room1 = roomInstance1.createRoom(gl);
  const { boundBoxes: boundBox1, windowsPosition: windowsPosition1 } = roomInstance1.createBoundBoxes();
  room1.isLightSource = false;
  room1.transform.y = -15;
  room1.texture = roomTexture;
  sceneObjects.push(room1);
  for(let i = 0; i<boundBox1.length; i++){
    collisionSystem.addBox(boundBox1[i][0], boundBox1[i][1]);
  }

  const roomInstance2 = new Room([-125,0,0], [1,0], [0,0], [2,2], [2,3]);
  const room2 = roomInstance2.createRoom(gl);
  const { boundBoxes: boundBox2, windowsPosition: windowsPosition2 } = roomInstance2.createBoundBoxes();
  room2.isLightSource = false;
  room2.transform.y = -15;
  room2.texture = roomTexture;
  sceneObjects.push(room2);
  for(let i = 0; i<boundBox2.length; i++){
    collisionSystem.addBox(boundBox2[i][0], boundBox2[i][1]);
  }

  const roomInstance3 = new Room([-250,0,0], [2,2], [0,0], [2,3], [1,0]);
  const room3 = roomInstance3.createRoom(gl);
  const { boundBoxes: boundBox3, windowsPosition: windowsPosition3 } = roomInstance3.createBoundBoxes();
  room3.isLightSource = false;
  room3.transform.y = -15;
  room3.texture = roomTexture;
  sceneObjects.push(room3);
  for(let i = 0; i<boundBox3.length; i++){
    collisionSystem.addBox(boundBox3[i][0], boundBox3[i][1]);
  }

  const roomInstance4 = new Room([-375,0,0], [1,0], [0,0], [1,0], [0,0]);
  const room4 = roomInstance4.createRoom(gl);
  const { boundBoxes: boundBox4, windowsPosition: windowsPosition4 } = roomInstance4.createBoundBoxes();
  room4.isLightSource = false;
  room4.transform.y = -15;
  room4.texture = roomTexture;
  sceneObjects.push(room4);
  for(let i = 0; i<boundBox4.length; i++){
    collisionSystem.addBox(boundBox4[i][0], boundBox4[i][1]);
  }

  const roomInstance5 = new Room([0,0,-125], [2,3], [0,0], [0,0], [1,0]);
  const room5 = roomInstance5.createRoom(gl);
  const { boundBoxes: boundBox5, windowsPosition: windowsPosition5 } = roomInstance5.createBoundBoxes();
  room5.isLightSource = false;
  room5.transform.y = -15;
  room5.texture = roomTexture;
  sceneObjects.push(room5);
  for(let i = 0; i<boundBox5.length; i++){
    collisionSystem.addBox(boundBox5[i][0], boundBox5[i][1]);
  }
  
  const roomInstance6 = new Room([-125,0,-125], [0,0], [1,0], [1,0], [2,3]);
  const room6 = roomInstance6.createRoom(gl);
  const { boundBoxes: boundBox6, windowsPosition: windowsPosition6 } = roomInstance6.createBoundBoxes();
  room6.isLightSource = false;
  room6.transform.y = -15;
  room6.texture = roomTexture;
  sceneObjects.push(room6);
  for(let i = 0; i<boundBox6.length; i++){
    collisionSystem.addBox(boundBox6[i][0], boundBox6[i][1]);
  }

  const roomInstance7 = new Room([-250,0,-125], [1,0], [2,2], [2,3], [0,0]);
  const room7 = roomInstance7.createRoom(gl);
  const { boundBoxes: boundBox7, windowsPosition: windowsPosition7 } = roomInstance7.createBoundBoxes();
  room7.isLightSource = false;
  room7.transform.y = -15;
  room7.texture = roomTexture;
  sceneObjects.push(room7);
  for(let i = 0; i<boundBox7.length; i++){
    collisionSystem.addBox(boundBox7[i][0], boundBox7[i][1]);
  }

  const roomInstance8 = new Room([-375,0,-125], [0,0], [1,0], [0,0], [0,0]);
  const room8 = roomInstance8.createRoom(gl);
  const { boundBoxes: boundBox8, windowsPosition: windowsPosition8 } = roomInstance8.createBoundBoxes();
  room8.isLightSource = false;
  room8.transform.y = -15;
  room8.texture = roomTexture;
  sceneObjects.push(room8);
  for(let i = 0; i<boundBox8.length; i++){
    collisionSystem.addBox(boundBox8[i][0], boundBox8[i][1]);
  }

   const roomInstance9 = new Room([0,0,-250], [1,0], [2,3], [0,0], [0,0]);
  const room9 = roomInstance9.createRoom(gl);
  const { boundBoxes: boundBox9, windowsPosition: windowsPosition9 } = roomInstance9.createBoundBoxes();
  room9.isLightSource = false;
  room9.transform.y = -15;
  room9.texture = roomTexture;
  sceneObjects.push(room9);
  for(let i = 0; i<boundBox9.length; i++){
    collisionSystem.addBox(boundBox9[i][0], boundBox9[i][1]);
  }

  const roomInstance10 = new Room([-125,0,-250], [1,0], [0,0], [0,0], [0,0]);
  const room10 = roomInstance10.createRoom(gl);
  const { boundBoxes: boundBox10, windowsPosition: windowsPosition10 } = roomInstance10.createBoundBoxes();
  room10.isLightSource = false;
  room10.transform.y = -15;
  room10.texture = roomTexture;
  sceneObjects.push(room10);
  for(let i = 0; i<boundBox10.length; i++){
    collisionSystem.addBox(boundBox10[i][0], boundBox10[i][1]);
  }

  const roomInstance11 = new Room([-250,0,-250], [0,0], [1,0], [0,0], [2,2]);
  const room11 = roomInstance11.createRoom(gl);
  const { boundBoxes: boundBox11, windowsPosition: windowsPosition11 } = roomInstance11.createBoundBoxes();
  room11.isLightSource = false;
  room11.transform.y = -15;
  room11.texture = roomTexture;
  sceneObjects.push(room11);
  for(let i = 0; i<boundBox11.length; i++){
    collisionSystem.addBox(boundBox11[i][0], boundBox11[i][1]);
  }

  const roomInstance12 = new Room([-375,0,-250], [1,0], [0,0], [2,2], [0,0]);
  const room12 = roomInstance12.createRoom(gl);
  const { boundBoxes: boundBox12, windowsPosition: windowsPosition12 } = roomInstance12.createBoundBoxes();
  room12.isLightSource = false;
  room12.transform.y = -15;
  room12.texture = roomTexture;
  sceneObjects.push(room12);
  for(let i = 0; i<boundBox12.length; i++){
    collisionSystem.addBox(boundBox12[i][0], boundBox12[i][1]);
  }

  const roomInstance13 = new Room([0,0,-375], [0,0], [1,0], [0,0], [1,0]);
  const room13 = roomInstance13.createRoom(gl);
  const { boundBoxes: boundBox13, windowsPosition: windowsPosition13 } = roomInstance13.createBoundBoxes();
  room13.isLightSource = false;
  room13.transform.y = -15;
  room13.texture = roomTexture;
  sceneObjects.push(room13);
  for(let i = 0; i<boundBox13.length; i++){
    collisionSystem.addBox(boundBox13[i][0], boundBox13[i][1]);
  }
  
  const roomInstance14 = new Room([-125,0,-375], [0,0], [1,0], [1,0], [0,0]);
  const room14 = roomInstance14.createRoom(gl);
  const { boundBoxes: boundBox14, windowsPosition: windowsPosition14 } = roomInstance14.createBoundBoxes();
  room14.isLightSource = false;
  room14.transform.y = -15;
  room14.texture = roomTexture;
  sceneObjects.push(room14);
  for(let i = 0; i<boundBox14.length; i++){
    collisionSystem.addBox(boundBox14[i][0], boundBox14[i][1]);
  }

  const roomInstance15 = new Room([-250,0,-375], [2,3], [0,0], [0,0], [1,0]);
  const room15 = roomInstance15.createRoom(gl);
  const { boundBoxes: boundBox15, windowsPosition: windowsPosition15 } = roomInstance15.createBoundBoxes();
  room15.isLightSource = false;
  room15.transform.y = -15;
  room15.texture = roomTexture;
  sceneObjects.push(room15);
  for(let i = 0; i<boundBox15.length; i++){
    collisionSystem.addBox(boundBox15[i][0], boundBox15[i][1]);
  }

  const roomInstance16 = new Room([-375,0,-375], [0,0], [1,0], [1,0], [0,0]);
  const room16 = roomInstance16.createRoom(gl);
  const { boundBoxes: boundBox16, windowsPosition: windowsPosition16 } = roomInstance16.createBoundBoxes();
  room16.isLightSource = false;
  room16.transform.y = -15;
  room16.texture = roomTexture;
  sceneObjects.push(room16);
  for(let i = 0; i<boundBox16.length; i++){
    collisionSystem.addBox(boundBox16[i][0], boundBox16[i][1]);
  }

  windowsPosition.push(...windowsPosition1, ...windowsPosition2, ...windowsPosition3, ...windowsPosition4, ...windowsPosition5, ...windowsPosition6, ...windowsPosition7, ...windowsPosition8, ...windowsPosition9, ...windowsPosition10, ...windowsPosition11, ...windowsPosition12, ...windowsPosition13, ...windowsPosition14, ...windowsPosition15, ...windowsPosition16);

  // Cenário externo
  const outside = createOutsideScenario(gl);
  outside.isLightSource = false;
  outside.transform.y = -15;
  outside.texture = outsideTexture;
  sceneObjects.push(outside);

  // Modelos OBJ
  // 1. Instancia os carregadores
  const objLoader = new OBJLoader()
  const textureLoader = new TextureLoader(gl)
  const entityManager = new EntityManager()
  
  // 2. Carrega o modelo 3D (a lista de pontos) e a imagem (textura)
  const mesaData = await objLoader.load("assets/models/mesa_cabeceira.obj")
  const texturaMadeira = await textureLoader.load("assets/textures/wood_table_diff_4k.jpg")

  // 3. O 'renderer.js' espera a geometria num formato específico (data.position, etc)
  const geometriaFormatada = {
    data: {
      position: mesaData.vertices,
      normal: mesaData.normals,
      texcoord: mesaData.uvs,
      indices: mesaData.indices
    }
  }

  // 4. Envia os pontos para a memória da Placa de Vídeo (cria os Buffers)
  const mesaRenderable = createRenderable(gl, geometriaFormatada)

  // 5. Cria o móvel no mundo
  const minhaMesa = new Furniture(
    "mesa-1",
    "Mesa de Cabeceira",
    [0.0, -0.5, -2.7],
    mesaRenderable,
    texturaMadeira,
    20.0
  )

  // 6. Adiciona ao Gerenciador para a lógica (física, atualizações)
  entityManager.entities.push(minhaMesa);

  // 7. Adiciona a malha 3D da mesa na lista de desenho da Placa de Vídeo
  sceneObjects.push(minhaMesa.getDrawData())

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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}

function setupInput() {
  const canvas = gl.canvas;

  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

  canvas.onclick = () => {
    canvas.requestPointerLock();
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
  playerLightRadius = InitialplayerLightRadius - (time * 0.0003);
  console.log("Posicao da camera:", camera.position[0].toFixed(2), camera.position[2].toFixed(2));
  if (camera.position[0] >= -290 && camera.position[0] <= -195 && camera.position[2] >= -430 && camera.position[2] <= -425) {
    window.location.href = "win.html";
    return;
  }
  if (playerLightRadius <= 40.0) {
    window.location.href = "gameOver.html";
    return;
  }
  playerLightRadius = playerLightRadius - (playerLightRadius/8) * Math.sin(time * 0.001); // Anima o raio da luz do jogador para um efeito pulsante

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  updateCameraMovement(camera, input, deltaTime, collisionSystem, windowsPosition);

  const aspect = gl.canvas.width / gl.canvas.height;
  const projection = Math3D.createPerspective(60, aspect, 0.5, 2000);
  const view = getViewMatrix(camera);

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
      // Use a posição do jogador/câmera como fonte de luz dinâmica
      gl.uniform3f(
        gl.getUniformLocation(program, "u_lightPosDynamic"),
        camera.position[0],
        camera.position[1],
        camera.position[2]
      );
      // Envia o raio da luz do jogador
      gl.uniform1f(
        gl.getUniformLocation(program, "u_lightRadius"),
        playerLightRadius
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

      // Se tiver o buffer de índices (É um móvel ou monstro .obj)
      if (obj.indexBuffer) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
          // Usa drawElements para ligar os pontos corretamente!
          gl.drawElements(gl.TRIANGLES, obj.numIndices, gl.UNSIGNED_INT, 0);
      } 
      // Se não tiver índices (É o quarto/labirinto gerado por código)
      else {
          gl.drawArrays(gl.TRIANGLES, 0, obj.numVertices);
      }
  });

  requestAnimationFrame(draw);
}

window.onload = init;