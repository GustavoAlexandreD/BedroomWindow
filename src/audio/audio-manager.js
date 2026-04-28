export class AudioManager {
    constructor() {
        // =========================
        // 🎧 CONTEXTO GLOBAL
        // =========================
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        this.listener = this.context.listener;

        // =========================
        // 📦 ASSETS
        // =========================
        this.paths = {
            "musica-principal": "assets/audio/musica-principal.mp3",
            "batida-janela": "assets/audio/batida-janela.mp3",
            "som-chuva-janela": "assets/audio/som-chuva-janela.mp3",
            "som-gato": "assets/audio/som-gato.mp3",
            "som-coruja": "assets/audio/som-coruja.mp3",
            "vidro-quebrando": "assets/audio/vidro-quebrando.mp3",
            "som-monstro": "assets/audio/som-monstro.mp3"
        };

        // Compatibilidade com nomes antigos usados em outras partes do projeto.
        this.alias = {
            bgm: "musica-principal",
            knock: "batida-janela",
            monster: "som-monstro",
            glassBreak: "vidro-quebrando",
            rain: "som-chuva-janela",
            cat: "som-gato",
            owl: "som-coruja"
        };

        this.buffers = {};

        // =========================
        // 🔊 CONTROLE
        // =========================
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 1;

        this.bgmGain = this.context.createGain();
        this.bgmGain.gain.value = 0.3;

        this.sfxGain = this.context.createGain();
        this.sfxGain.gain.value = 0.7;

        this.bgmGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);

        // =========================
        // 🎵 BGM
        // =========================
        this.bgmSource = null;
        this.rainSource = null;

        // =========================
        // 🧠 POOL (performance)
        // =========================
        this.activeSources = new Set();
        this.entityCharacteristicTimers = new Map();

        // =========================
        // 🔄 INIT
        // =========================
        this._initUnlock();
        this._loadAll();
    }

    // =========================
    // 🔓 UNLOCK AUDIO (autoplay fix)
    // =========================
    _initUnlock() {
        const unlock = () => {
            this.context.resume();
            document.removeEventListener("click", unlock);
        };
        document.addEventListener("click", unlock);
    }

    // =========================
    // 📦 LOAD
    // =========================
    async _loadSound(url) {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return await this.context.decodeAudioData(arrayBuffer);
    }

    async _loadAll() {
        const entries = Object.entries(this.paths);

        for (const [key, path] of entries) {
            this.buffers[key] = await this._loadSound(path);
        }

        console.log("✅ Áudios carregados");
    }

    _resolveName(name) {
        return this.alias[name] || name;
    }

    // =========================
    // 🎵 BGM (2D)
    // =========================
    playBGM() {
        const key = this._resolveName("musica-principal");
        if (!this.buffers[key]) return;

        if (this.bgmSource) return;

        const source = this.context.createBufferSource();
        source.buffer = this.buffers[key];
        source.loop = true;

        source.connect(this.bgmGain);
        source.start(0);

        this.bgmSource = source;
    }

    stopBGM() {
        if (!this.bgmSource) return;

        this.bgmSource.stop();
        this.bgmSource.disconnect();
        this.bgmSource = null;
    }

    setBGMVolume(v) {
        this.bgmGain.gain.value = v;
    }

    playRainLoop(position = [0, 0, 0]) {
        const key = this._resolveName("som-chuva-janela");
        const buffer = this.buffers[key];
        if (!buffer || this.rainSource) return;

        const { source } = this._create3DSource(buffer, position, {
            refDistance: 8,
            maxDistance: 120,
            rolloffFactor: 0.15
        });
        source.loop = true;
        source.start(0);
        this.rainSource = source;
    }

    stopRainLoop() {
        if (!this.rainSource) return;
        this.rainSource.stop();
        this.rainSource.disconnect();
        this.rainSource = null;
    }

    // =========================
    // 🔊 CRIAR SOM 3D
    // =========================
    _create3DSource(buffer, position, options = {}) {
        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const panner = this.context.createPanner();

        // 🔥 Configuração avançada
        panner.panningModel = "HRTF";
        panner.distanceModel = "inverse";

        panner.refDistance = options.refDistance || 1;
        panner.maxDistance = options.maxDistance || 100;
        panner.rolloffFactor = options.rolloffFactor || 1;

        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;

        // posição
        panner.positionX.setValueAtTime(position[0], this.context.currentTime);
        panner.positionY.setValueAtTime(position[1], this.context.currentTime);
        panner.positionZ.setValueAtTime(position[2], this.context.currentTime);

        source.connect(panner).connect(this.sfxGain);

        return { source, panner };
    }

    // =========================
    // 🎮 PLAY 3D
    // =========================
    play3D(name, position, options = {}) {
        const key = this._resolveName(name);
        const buffer = this.buffers[key];
        if (!buffer) return;

        const { source } = this._create3DSource(buffer, position, options);

        source.start(0);

        this.activeSources.add(source);

        source.onended = () => {
            this.activeSources.delete(source);
            source.disconnect();
        };
    }

    // =========================
    // 🔁 LOOP 3D (ex: passos)
    // =========================
    playLoop3D(name, position) {
        const key = this._resolveName(name);
        const buffer = this.buffers[key];
        if (!buffer) return;

        const { source, panner } = this._create3DSource(buffer, position);

        source.loop = true;
        source.start(0);

        const obj = { source, panner };

        this.activeSources.add(source);

        source.onended = () => {
            this.activeSources.delete(source);
        };

        return obj;
    }

    /**
     * Ao spawnar entidade: sempre toca batida na janela.
     */
    playEntitySpawn(entityType, position, options = {}) {
        this.play3D("batida-janela", position, {
            refDistance: 1.8,
            maxDistance: 35,
            ...options
        });

        // Chance pequena de já tocar também o som característico ao spawn.
        if (Math.random() < 0.25) {
            this.playEntityCharacteristic(entityType, position);
        }
    }

    playEntityCharacteristic(entityType, position, options = {}) {
        const map = {
            cat: "som-gato",
            gato: "som-gato",
            owl: "som-coruja",
            coruja: "som-coruja",
            monster: "som-monstro",
            monstro: "som-monstro"
        };
        const soundName = map[String(entityType || "").toLowerCase()];
        if (!soundName) return;

        this.play3D(soundName, position, {
            refDistance: 2.2,
            maxDistance: 45,
            rolloffFactor: 1.1,
            ...options
        });
    }

    /**
     * Toca som característico de tempos em tempos (intervalo aleatório).
     */
    startEntityCharacteristicLoop(entityId, entityType, getPosition, minMs = 5000, maxMs = 11000) {
        this.stopEntityCharacteristicLoop(entityId);

        const scheduleNext = () => {
            const wait = minMs + Math.random() * Math.max(0, maxMs - minMs);
            const timeoutId = setTimeout(() => {
                const position = (typeof getPosition === "function") ? getPosition() : [0, 0, 0];
                this.playEntityCharacteristic(entityType, position);
                scheduleNext();
            }, wait);

            this.entityCharacteristicTimers.set(entityId, timeoutId);
        };

        scheduleNext();
    }

    stopEntityCharacteristicLoop(entityId) {
        const timeoutId = this.entityCharacteristicTimers.get(entityId);
        if (!timeoutId) return;
        clearTimeout(timeoutId);
        this.entityCharacteristicTimers.delete(entityId);
    }

    stopLoop(loopObj) {
        if (!loopObj) return;

        loopObj.source.stop();
        loopObj.source.disconnect();
    }

    // =========================
    // 🎯 ATUALIZAR POSIÇÃO SOM
    // =========================
    updateSourcePosition(panner, position) {
        const t = this.context.currentTime;

        panner.positionX.setValueAtTime(position[0], t);
        panner.positionY.setValueAtTime(position[1], t);
        panner.positionZ.setValueAtTime(position[2], t);
    }

    // =========================
    // 👂 LISTENER (player/câmera)
    // =========================
    updateListener(position, forward) {
        const t = this.context.currentTime;

        this.listener.positionX.setValueAtTime(position[0], t);
        this.listener.positionY.setValueAtTime(position[1], t);
        this.listener.positionZ.setValueAtTime(position[2], t);

        this.listener.forwardX.setValueAtTime(forward[0], t);
        this.listener.forwardY.setValueAtTime(forward[1], t);
        this.listener.forwardZ.setValueAtTime(forward[2], t);

        this.listener.upX.setValueAtTime(0, t);
        this.listener.upY.setValueAtTime(1, t);
        this.listener.upZ.setValueAtTime(0, t);
    }

    // =========================
    // 🔇 CONTROLE GLOBAL
    // =========================
    muteAll() {
        this.masterGain.gain.value = 0;
    }

    unmuteAll() {
        this.masterGain.gain.value = 1;
    }

    setMasterVolume(v) {
        this.masterGain.gain.value = v;
    }
}