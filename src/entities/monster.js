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
        }
    }

}
