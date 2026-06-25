import { Object } from "./entity.js";

const clueImages = {
    pista_1: "assets/textures/pista-1.png",
    pista_2: "assets/textures/pista-2.png",
    pista_3: "assets/textures/pista-3.png",
    pista_4: "assets/textures/pista-4.png"
};

export class Paper extends Object {
    static currentOpenPaper = null;

    constructor(id, name, position, renderableData, texture, audioManager, scale = 1.0, boxSize = null) {
        super({ id, name, position, audioManager });

        this.meshData = renderableData;
        this.texture = texture;

        this.transform = {
            x: position[0],
            y: position[1],
            z: position[2],
            rx: 0,
            ry: 0,
            rz: 0,
            scale: scale
        };
        this.boxSize = boxSize;

        this.reading = false;
        this.clueId = null;
    }

    setClueId(clueId) {
        this.clueId = clueId;
    }

    toggle() {
        if (!this.clueId) {
            return;
        }

        if (!this.reading) {
            if (Paper.currentOpenPaper && Paper.currentOpenPaper !== this) {
                Paper.currentOpenPaper.hideClue();
                Paper.currentOpenPaper.reading = false;
            }
            this.showClue();
            this.reading = true;
            Paper.currentOpenPaper = this;
        } else {
            this.hideClue();
            this.reading = false;
            if (Paper.currentOpenPaper === this) {
                Paper.currentOpenPaper = null;
            }
        }
    }

    showClue() {
        if (!this.clueId) return;

        let overlay = document.getElementById("clue-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "clue-overlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
            overlay.style.zIndex = "9999";
            overlay.style.cursor = "pointer";
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = "";
        const image = document.createElement("img");
        image.src = clueImages[this.clueId] || "";
        image.style.maxWidth = "80%";
        image.style.maxHeight = "80%";
        image.style.border = "4px solid white";
        image.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)";
        overlay.appendChild(image);

        overlay.onclick = () => {
            this.hideClue();
            this.reading = false;
            if (Paper.currentOpenPaper === this) {
                Paper.currentOpenPaper = null;
            }
        };
    }

    hideClue() {
        const overlay = document.getElementById("clue-overlay");
        if (overlay) {
            overlay.remove();
        }
        if (Paper.currentOpenPaper === this) {
            Paper.currentOpenPaper = null;
        }
    }

    update(dt) {
        // Papel não precisa de animação contínua.
    }

    getDrawData() {
        return {
            ...this.meshData,
            texture: this.texture,
            transform: this.transform
        };
    }
}
