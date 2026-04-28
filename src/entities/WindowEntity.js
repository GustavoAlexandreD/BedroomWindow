import { irParaGameOver } from "../menu_e_gameover/gameover.js";

export class WindowEntity {
    constructor(position, { audioManager = null, timerMax = 3 } = {}) {
        this.position = position;
        this.audioManager = audioManager;
        this.state = "idle"; // idle | monster | friend | breaking
        this.timerMax = timerMax;
        this.timer = timerMax;
        this.health = 100;
        this.gameOverTriggered = false;
    }

    setMonsterState() {
        this.state = "monster";
        this.timer = this.timerMax;
        this.gameOverTriggered = false;
    }

    update(dt) {
        if (this.state !== "monster" || this.gameOverTriggered) return;

        // Timer da janela reduz até zerar.
        this.timer -= dt;
        if (this.timer <= 0) {
            this.break();
        }
    }

    break() {
        if (this.gameOverTriggered) return;

        this.state = "breaking";
        this.gameOverTriggered = true;

        if (this.audioManager?.play3D) {
            this.audioManager.play3D("vidro-quebrando", this.position, {
                refDistance: 2.0,
                maxDistance: 40
            });
        }

        irParaGameOver({
            motivo: "timer-janela-zerado",
            contador: 0
        });
    }
}