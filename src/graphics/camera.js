import * as mat4 from '../math/mat4.js';

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;

        // Estado (Apenas dados de posicionamento e orientação)
        this.position = new Float32Array([0, 0, 0]);
        this.front = new Float32Array([0, 0, -1]);
        this.up = new Float32Array([0, 1, 0]);

        // Ângulos (Recebidos do Player)
        this.yaw = -90;
        this.pitch = 0;
    }

    /**
     * Atualiza os vetores de direção baseados nos ângulos atuais.
     * Chamado pelo Game.js após atualizar o Player.
     */
    _updateVectors() {
        const radYaw = (this.yaw * Math.PI) / 180;
        const radPitch = (this.pitch * Math.PI) / 180;

        const x = Math.cos(radYaw) * Math.cos(radPitch);
        const y = Math.sin(radPitch);
        const z = Math.sin(radYaw) * Math.cos(radPitch);

        // Atualiza o vetor frontal (para onde a câmera olha)
        this.front = this._normalize([x, y, z]);
    }

    /**
     * Gera a Matriz de Visualização (View Matrix) para o Shader
     */
    getViewMatrix() {
        // target = posição + direção para onde olha
        const target = this._add(this.position, this.front);
        return mat4.createCamera(this.position, target, this.up);
    }

    // --- Utilitários Matemáticos Essenciais ---
    _normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return len === 0 ? [0, 0, 0] : [v[0] / len, v[1] / len, v[2] / len];
    }

    _add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }
}