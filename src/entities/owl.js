import { Entity } from "./entity.js";

export class Owl extends Entity {
    constructor(deps = {}) {
        super({ name: "owl", ...deps });
        this.noiseIntervalMs = 2200;
        this.breakAfterMs = 17000;
    }

    spawn() {
        this.isActive = true;
        this._fazerBarulhoNaJanelaExistente();
        if (this.audioManager?.playEntitySpawn) {
            this.audioManager.playEntitySpawn("owl", this.position, {
                refDistance: 2.0,
                maxDistance: 28,
                rolloffFactor: 1.2
            });
            this.audioManager.startEntityCharacteristicLoop(
                this.id,
                "owl",
                () => this.position,
                7000,
                14000
            );
        } else {
            this._tocarSom3D("batida-janela", { refDistance: 2.0, maxDistance: 28, rolloffFactor: 1.2 });
        }
        this.iniciarBarulhoTemporizado();
        this.iniciarQuebraJanelaTemporizada();
    }

    iniciarBarulhoTemporizado() {
        if (this._noiseIntervalId) clearInterval(this._noiseIntervalId);
        this._noiseIntervalId = setInterval(() => {
            if (!this.isActive || this.isBroken) return;
            this._fazerBarulhoNaJanelaExistente();
            this._tocarSom3D("batida-janela", { refDistance: 2.0, maxDistance: 28, rolloffFactor: 1.2 });
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
