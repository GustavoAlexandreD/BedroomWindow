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
     * (ABSTRATO) Função temporizada para quebrar janela + fim de jogo + barulho de vidro.
     */
    iniciarQuebraJanelaTemporizada() {
        throw new Error(`${this.constructor.name} precisa sobrescrever iniciarQuebraJanelaTemporizada().`);
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

    /**
     * Tenta chamar uma função existente de barulho na janela
     * sem acoplar em um nome único.
     */
    _fazerBarulhoNaJanelaExistente() {
        const target = this.windowSystem;
        if (!target) return false;

        const candidates = [
            "fazerBarulhoNaJanela",
            "makeWindowNoise",
            "playWindowNoise",
            "triggerWindowNoise"
        ];

        for (const fnName of candidates) {
            const fn = target[fnName];
            if (typeof fn === "function") {
                fn.call(target, this);
                return true;
            }
        }
        return false;
    }

    _tocarSom3D(nomeSom, options = {}) {
        if (!this.audioManager || typeof this.audioManager.play3D !== "function") return;
        this.audioManager.play3D(nomeSom, this.position, options);
    }

    _tocarSomQuebraVidro() {
        if (!this.audioManager) return;
        if (typeof this.audioManager.play3D === "function") {
            this.audioManager.play3D("vidro-quebrando", this.position, { refDistance: 2.0, maxDistance: 40 });
        }
    }

    _quebrarJanelaEFimDeJogo() {
        this.isBroken = true;
        this._tocarSomQuebraVidro();

        if (this.windowSystem) {
            if (typeof this.windowSystem.breakWindow === "function") {
                this.windowSystem.breakWindow(this);
            } else if (typeof this.windowSystem.quebrarJanela === "function") {
                this.windowSystem.quebrarJanela(this);
            }
        }

        if (this.gameState) {
            if (typeof this.gameState.gameOver === "function") {
                this.gameState.gameOver();
            } else if (typeof this.gameState.setGameOver === "function") {
                this.gameState.setGameOver(true);
            } else if (typeof this.gameState.ativo !== "undefined") {
                this.gameState.ativo = false;
            }
        }

        irParaGameOver({
            motivo: "janela-quebrada",
            entidade: this.name,
            entidadeId: this.id
        });
    }
}
