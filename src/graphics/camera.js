import { normalize, cross, lookat } from "../utils/math.js";

export function createCamera() {
  return {
    position: [0, 5, 0], 
    yaw: 0,               
    pitch: 0,             
    speed: 20.0,
    sensitivity: 0.003
  };
}

function getForward(camera) {
  return normalize([
    Math.sin(camera.yaw) * Math.cos(camera.pitch),
    Math.sin(camera.pitch),
   -Math.cos(camera.yaw) * Math.cos(camera.pitch)
  ]);
}

function getRight(camera) {
  return normalize(
    cross(getForward(camera), [0, 1, 0])
  );
}

export function updateCameraMovement(camera, input, deltaTime, collisionSystem, windowsPosition) {
  const velocity = camera.speed * deltaTime;

  const moveForward = [Math.sin(camera.yaw), 0, -Math.cos(camera.yaw)];
  const moveRight = [Math.cos(camera.yaw), 0, Math.sin(camera.yaw)];

  // 1. Criamos uma cópia da posição atual para calcular o próximo passo
  let nextPos = [...camera.position];

  if (input.forward) {
    nextPos[0] += moveForward[0] * velocity;
    nextPos[2] += moveForward[2] * velocity;
  }
  if (input.backward) {
    nextPos[0] -= moveForward[0] * velocity;
    nextPos[2] -= moveForward[2] * velocity;
  }
  if (input.left) {
    nextPos[0] -= moveRight[0] * velocity;
    nextPos[2] -= moveRight[2] * velocity;
  }
  if (input.right) {
    nextPos[0] += moveRight[0] * velocity;
    nextPos[2] += moveRight[2] * velocity;
  }

  // Se o sistema de colisão existir, ele filtra o nosso passo!
  if (collisionSystem) {
      // O tamanho físico do jogador (Largura X, Altura Y, Profundidade Z)
      const playerSize = [5.0, 15.0, 5.0]; 
      
      // A função moveWithCollision impede a câmara de atravessar a mesa
      // deslizando-a pela parede (anti-tunneling)
      nextPos = collisionSystem.moveWithCollision(camera.position, nextPos, playerSize);
  }

  let passingWindow = false;
  if (windowsPosition) {
    for (const windowPos of windowsPosition) {
      const [start, end] = windowPos;
      const minX = Math.min(start[0], end[0]);
      const maxX = Math.max(start[0], end[0]);
      const minZ = Math.min(start[2], end[2]);
      const maxZ = Math.max(start[2], end[2]);
      const tolerance = 3.0;

      const insideX = nextPos[0] >= minX - tolerance && nextPos[0] <= maxX + tolerance;
      const insideZ = nextPos[2] >= minZ - tolerance && nextPos[2] <= maxZ + tolerance;

      if (insideX && insideZ) {
        passingWindow = true;
        break;
      }else{
        passingWindow = false;
      }
    }
  }

  if (passingWindow) {
    nextPos[1] = 12; // aumenta um pouco para passar pela janela
  } else {
    nextPos[1] = 5; // mantém a altura normal
  }

    // FOV permanece constante; nenhuma interpolação aqui

  const margin = 5.0; // margem para evitar que a câmera fique muito próxima da parede
  const startLimit = 60.0 - margin;
  const endLimit = -435.0 + margin;

  if (nextPos[0] > startLimit) nextPos[0] = startLimit;
  if (nextPos[0] < endLimit) nextPos[0] = endLimit;

  if (nextPos[2] > startLimit) nextPos[2] = startLimit;
  if (nextPos[2] < endLimit) nextPos[2] = endLimit;

  camera.position[0] = nextPos[0];
  camera.position[1] = nextPos[1];
  camera.position[2] = nextPos[2];
}

export function updateCameraLook(camera, dx, dy) {
  camera.yaw   += dx * camera.sensitivity;
  camera.pitch -= dy * camera.sensitivity;

  // evita virar a cabeça 360° pra cima
  const limit = Math.PI / 2 - 0.01;
  camera.pitch = Math.max(-limit, Math.min(limit, camera.pitch));
}

export function getViewMatrix(camera) {
  const forward = getForward(camera);
  const target = [
    camera.position[0] + forward[0],
    camera.position[1] + forward[1],
    camera.position[2] + forward[2]
  ];

  return lookat(
    camera.position,
    target,
    [0, 1, 0]
  );
}