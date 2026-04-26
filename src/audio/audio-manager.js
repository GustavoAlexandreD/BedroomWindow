export class AudioManager {
    constructor() {
        // =========================
        // 🔊 CONFIGURAÇÃO DE PATHS
        // =========================
        this.paths = {
            bgm: "assets/audio/bgm.mp3",
            glassBreak: "assets/audio/glass_break.mp3",
            knock: "assets/audio/knock.mp3",
            meow: "assets/audio/meow.mp3",
            owl: "assets/audio/owl.mp3",
            monster: "assets/audio/monster.mp3",
            footsteps: "assets/audio/footsteps.mp3"
        };

        // =========================
        // 🔉 VOLUMES
        // =========================
        this.volumes = {
            bgm: 0.3,
            sfx: 0.7
        };

        // =========================
        // 🎵 ÁUDIOS
        // =========================
        this.sounds = {};

        this._loadSounds();
    }

    // =========================
    // 📦 PRELOAD DOS ÁUDIOS
    // =========================
    _loadSounds() {
        for (const key in this.paths) {
            const audio = new Audio(this.paths[key]);

            audio.preload = "auto";

            // Música de fundo em loop
            if (key === "bgm") {
                audio.loop = true;
                audio.volume = this.volumes.bgm;
            } else {
                audio.volume = this.volumes.sfx;
            }

            this.sounds[key] = audio;
        }
    }

    // =========================
    // 🎵 BACKGROUND MUSIC
    // =========================
    playBGM() {
        const bgm = this.sounds.bgm;

        if (bgm && bgm.paused) {
            bgm.play().catch(() => {
                console.warn("Autoplay bloqueado — aguarde interação do usuário.");
            });
        }
    }

    stopBGM() {
        const bgm = this.sounds.bgm;
        bgm.pause();
        bgm.currentTime = 0;
    }

    setBGMVolume(volume) {
        this.sounds.bgm.volume = volume;
    }

    // =========================
    // 🔊 SFX GENÉRICO
    // =========================
    _playSFX(name) {
        const original = this.sounds[name];
        if (!original) return;

        // clone para permitir sobreposição (ex: vários passos)
        const sound = original.cloneNode();
        sound.volume = this.volumes.sfx;
        sound.play();
    }

    // =========================
    // 🔊 SFX ESPECÍFICOS
    // =========================
    playGlassBreak() {
        this._playSFX("glassBreak");
    }

    playKnock() {
        this._playSFX("knock");
    }

    playMeow() {
        this._playSFX("meow");
    }

    playOwl() {
        this._playSFX("owl");
    }

    playMonster() {
        this._playSFX("monster");
    }

    playFootsteps() {
        this._playSFX("footsteps");
    }

    // =========================
    // 🔇 CONTROLE GLOBAL
    // =========================
    muteAll() {
        for (const key in this.sounds) {
            this.sounds[key.muted = true];
        }
    }

    unmuteAll() {
        for (const key in this.sounds) {
            this.sounds[key].muted = false;
        }
    }
}