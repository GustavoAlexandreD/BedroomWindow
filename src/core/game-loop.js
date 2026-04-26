import { InputHandler } from "./input/input-handler.js";
import { Camera } from "./camera/camera.js";
import * as mat4 from "../utils/math.js";

const canvas = document.querySelector("canvas");

const input = new InputHandler(canvas);
const camera = new Camera(canvas);

const speed = 0.1;

function gameLoop() {
    if (!input.isPaused) {

        // =========================
        // 🎮 MOVIMENTO
        // =========================
        const move = input.getMovementVector();

        // vetor lateral (right) normalizado
        const right = mat4.normalize([
            camera.front[2],
            0,
            -camera.front[0]
        ]);

        // frente/trás
        camera.position[0] += camera.front[0] * move.z * speed;
        camera.position[2] += camera.front[2] * move.z * speed;

        // esquerda/direita
        camera.position[0] += right[0] * move.x * speed;
        camera.position[2] += right[2] * move.x * speed;


        // =========================
        // 🖱️ MOUSE (ROTAÇÃO)
        // =========================
        const mouse = input.getMouseDelta();
        camera.updateRotation(mouse.dx * 100, -mouse.dy * 100);


        // =========================
        // 🔦 LANTERNA
        // =========================
        const flashlight = input.isFlashlightOn();

        // 👉 aqui você manda pro shader depois
        // ex: gl.uniform1i(uFlashlight, flashlight ? 1 : 0);


        // =========================
        // 🎥 MATRIZ VIEW
        // =========================
        const viewMatrix = camera.getViewMatrix();

        // 👉 enviar pro shader:
        // gl.uniformMatrix4fv(uView, false, viewMatrix);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();