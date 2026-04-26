import * as mat4 from '../utils/math.js';

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;

        this.position = new Float32Array([0, 1.6, 3]); // altura tipo player
        this.front = new Float32Array([0, 0, -1]);
        this.up = new Float32Array([0, 1, 0]);

        this.yaw = -90;
        this.pitch = 0;
    }

    updateRotation(deltaYaw, deltaPitch) {
        this.yaw += deltaYaw;
        this.pitch += deltaPitch;

        // trava o pitch (evita virar de cabeça pra baixo)
        this.pitch = Math.max(-89, Math.min(89, this.pitch));

        this._updateVectors();
    }

    _updateVectors() {
        const radYaw = (this.yaw * Math.PI) / 180;
        const radPitch = (this.pitch * Math.PI) / 180;

        const x = Math.cos(radYaw) * Math.cos(radPitch);
        const y = Math.sin(radPitch);
        const z = Math.sin(radYaw) * Math.cos(radPitch);

        this.front = mat4.normalize([x, y, z]);
    }

    getViewMatrix() {
        const target = [
            this.position[0] + this.front[0],
            this.position[1] + this.front[1],
            this.position[2] + this.front[2]
        ];

        return mat4.createCamera(this.position, target, this.up);
    }
}