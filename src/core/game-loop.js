import { InputHandler } from "./input/input-handler.js";

const canvas = document.querySelector("canvas");
const input = new InputHandler(canvas);

function gameLoop() {
    if (!input.isPaused) {

        // Movimento
        const move = input.getMovementVector();

        // Câmera
        const mouse = input.getMouseDelta();

        // Lanterna
        const flashlight = input.isFlashlightOn();

        // 👉 Aqui você integra com:
        // - player.position
        // - camera.rotation
        // - shader (light ligada/desligada)

    }

    requestAnimationFrame(gameLoop);
}

gameLoop();