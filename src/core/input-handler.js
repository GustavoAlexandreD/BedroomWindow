export class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;

        // ===== Estado do input =====
        this.keys = {};
        this.mouse = {
            dx: 0,
            dy: 0,
            sensitivity: 0.002
        };

        // ===== Estados do jogo =====
        this.isPaused = false;
        this.flashlightOn = false;

        // ===== Bindings =====
        this._bindKeyboard();
        this._bindMouse();
        this._bindPointerLock();
    }

    // ===============================
    // 🎮 KEYBOARD
    // ===============================
    _bindKeyboard() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // ESC → pause
            if (e.key === "Escape") {
                this.togglePause();
            }

            if (e.key === "f") {
                window.dispatchEvent(new CustomEvent("playerInteract"));
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    // ===============================
    // 🖱️ MOUSE
    // ===============================
    _bindMouse() {
        // Movimento da câmera
        document.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement === this.canvas && !this.isPaused) {
                this.mouse.dx += e.movementX;
                this.mouse.dy += e.movementY;
            }
        });

        // Clique esquerdo → lanterna
        document.addEventListener("mousedown", (e) => {
            if (e.button === 0 && !this.isPaused) {
                this.toggleFlashlight();
            }
        });
    }

    // ===============================
    // 🔒 POINTER LOCK (FPS CAMERA)
    // ===============================
    _bindPointerLock() {
        this.canvas.addEventListener("click", () => {
            if (!this.isPaused) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener("pointerlockchange", () => {
            if (document.pointerLockElement !== this.canvas) {
                // perdeu foco → pausa
                this.setPause(true);
            }
        });
    }

    // ===============================
    // 🎯 MOVIMENTO (WASD + SETAS)
    // ===============================
    getMovementVector() {
        let x = 0;
        let z = 0;

        if (this.keys["w"] || this.keys["arrowup"]) z -= 1;
        if (this.keys["s"] || this.keys["arrowdown"]) z += 1;
        if (this.keys["a"] || this.keys["arrowleft"]) x -= 1;
        if (this.keys["d"] || this.keys["arrowright"]) x += 1;

        return { x, z };
    }

    // ===============================
    // 🎥 CAMERA (mouse)
    // ===============================
    getMouseDelta() {
        const dx = this.mouse.dx * this.mouse.sensitivity;
        const dy = this.mouse.dy * this.mouse.sensitivity;

        // reset após leitura (evita acumular infinito)
        this.mouse.dx = 0;
        this.mouse.dy = 0;

        return { dx, dy };
    }

    // ===============================
    // 🔦 LANTERNA
    // ===============================
    toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;

        console.log("Lanterna:", this.flashlightOn ? "ON" : "OFF");
    }

    isFlashlightOn() {
        return this.flashlightOn;
    }

    // ===============================
    // ⏸️ PAUSE SYSTEM
    // ===============================
    togglePause() {
        this.setPause(!this.isPaused);
    }

    setPause(state) {
        this.isPaused = state;

        if (this.isPaused) {
            document.exitPointerLock();
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
        }
    }

    // ===============================
    // 🧾 UI MENU (simples)
    // ===============================
    showPauseMenu() {
        let menu = document.getElementById("pause-menu");

        if (!menu) {
            menu = document.createElement("div");
            menu.id = "pause-menu";

            Object.assign(menu.style, {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "32px",
                fontFamily: "sans-serif",
                zIndex: "999"
            });

            menu.innerHTML = `
                <div style="text-align:center">
                    <h1>PAUSED</h1>
                    <p>Clique para continuar</p>
                </div>
            `;

            menu.addEventListener("click", () => {
                this.setPause(false);
                this.canvas.requestPointerLock();
            });

            document.body.appendChild(menu);
        }

        menu.style.display = "flex";
    }

    hidePauseMenu() {
        const menu = document.getElementById("pause-menu");
        if (menu) {
            menu.style.display = "none";
        }
    }
}