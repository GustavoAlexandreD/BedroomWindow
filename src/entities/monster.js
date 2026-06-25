import { Object} from "./entity.js";

export class Monster extends Object{
    constructor(deps = {}) {
        super({ name: "monster", ...deps });
        this.noiseIntervalMs = 1200;
        this.breakAfterMs = 9000;
    }

    spawn() {
        this.isActive = true;
        this._fazerBarulhoNaJanelaExistente();
        if (this.audioManager?.playEntitySpawn) {
            this.audioManager.playEntitySpawn("monster", this.position, {
                refDistance: 2.5,
                maxDistance: 35,
                rolloffFactor: 1.4
            });
            this.audioManager.startEntityCharacteristicLoop(
                this.id,
                "monster",
                () => this.position,
                4000,
                9000
            );
        } else {
            this._tocarSom3D("batida-janela", { refDistance: 2.5, maxDistance: 35, rolloffFactor: 1.4 });
        }
        this.iniciarBarulhoTemporizado();
        this.iniciarQuebraJanelaTemporizada();
    }

    iniciarBarulhoTemporizado() {
        if (this._noiseIntervalId) clearInterval(this._noiseIntervalId);
        this._noiseIntervalId = setInterval(() => {
            if (!this.isActive || this.isBroken) return;
            this._fazerBarulhoNaJanelaExistente();
            this._tocarSom3D("batida-janela", { refDistance: 2.5, maxDistance: 35, rolloffFactor: 1.4 });
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
