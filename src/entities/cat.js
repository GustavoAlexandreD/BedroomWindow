import { Entity } from "./entity.js";

export class Cat extends Entity {
    constructor(deps = {}) {
        super({ name: "cat", ...deps });
        this.noiseIntervalMs = 1700;
        this.breakAfterMs = 14000;
    }

    spawn() {
        this.isActive = true;
        this._fazerBarulhoNaJanelaExistente();
        if (this.audioManager?.playEntitySpawn) {
            this.audioManager.playEntitySpawn("cat", this.position, { refDistance: 1.5, maxDistance: 25 });
            this.audioManager.startEntityCharacteristicLoop(
                this.id,
                "cat",
                () => this.position,
                6000,
                12000
            );
        } else {
            this._tocarSom3D("batida-janela", { refDistance: 1.5, maxDistance: 25 });
        }
        this.iniciarBarulhoTemporizado();
        this.iniciarQuebraJanelaTemporizada();
    }

    iniciarBarulhoTemporizado() {
        if (this._noiseIntervalId) clearInterval(this._noiseIntervalId);
        this._noiseIntervalId = setInterval(() => {
            if (!this.isActive || this.isBroken) return;
            this._fazerBarulhoNaJanelaExistente();
            this._tocarSom3D("batida-janela", { refDistance: 1.5, maxDistance: 25 });
        }, this.noiseIntervalMs);
    }

    iniciarQuebraJanelaTemporizada() {
        if (this._breakTimeoutId) clearTimeout(this._breakTimeoutId);
        this._breakTimeoutId = setTimeout(() => {
            if (!this.isActive || this.isBroken) return;
            this._quebrarJanelaEFimDeJogo();
        }, this.breakAfterMs);
    }
}
