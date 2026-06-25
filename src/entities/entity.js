import { irParaGameOver } from "../gameover/gameover.js";

/**
 * Classe abstrata base das entidades do jogo.
 * As subclasses DEVEM sobrescrever:
 * - spawn()
 * - iniciarBarulhoTemporizado()
 * - iniciarQuebraJanelaTemporizada()
 */
export class Object{
    constructor({
        id,
        name,
        position = [0, 0, 0],
        audioManager = null,
        windowSystem = null,
        gameState = null
    } = {}) {
        if (new.target === Object) {
            throw new Error("Object é abstrata e não pode ser instanciada diretamente.");
        }

        this.id = id ?? `entity-${Date.now()}`;
        this.name = name ?? "entity";
        this.position = position;
        this.audioManager = audioManager;
        this.windowSystem = windowSystem;
        this.gameState = gameState;

        this.isActive = false;
        this.isBroken = false;

        this._noiseIntervalId = null;
        this._breakTimeoutId = null;
    }

    /**
     * (ABSTRATO) Spawn da entidade.
     * Deve chamar função já existente que faz barulho na janela.
     */
    spawn() {
        throw new Error(`${this.constructor.name} precisa sobrescrever spawn().`);
    }

    /**
     * (ABSTRATO) Função temporizada para barulho da entidade.
     */
    iniciarBarulhoTemporizado() {
        throw new Error(`${this.constructor.name} precisa sobrescrever iniciarBarulhoTemporizado().`);
    }

    /**
     * Encerra timers da entidade.
     */
    dispose() {
        if (this.audioManager && typeof this.audioManager.stopEntityCharacteristicLoop === "function") {
            this.audioManager.stopEntityCharacteristicLoop(this.id);
        }
        if (this._noiseIntervalId) {
            clearInterval(this._noiseIntervalId);
            this._noiseIntervalId = null;
        }
        if (this._breakTimeoutId) {
            clearTimeout(this._breakTimeoutId);
            this._breakTimeoutId = null;
        }
        this.isActive = false;
    }

    _tocarSom3D(nomeSom, options = {}) {
        if (!this.audioManager || typeof this.audioManager.play3D !== "function") return;
        this.audioManager.play3D(nomeSom, this.position, options);
    }
}
