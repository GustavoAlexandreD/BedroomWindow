export class CollisionSystem {
    constructor() {
        this.colliders = [];
        this.EPS = 0.001;
    }

    addBox(position, size, entity = null) {
        this.colliders.push({
            position: [...position],
            size: [...size],
            entity: entity || null
        });
    }

    clear() {
        this.colliders = [];
    }

    // =========================
    // 📦 AABB CHECK
    // =========================
    checkAABB(posA, sizeA, posB, sizeB) {
        const aMin = [
            posA[0] - sizeA[0] / 2 - this.EPS,
            posA[1] - sizeA[1] / 2 - this.EPS,
            posA[2] - sizeA[2] / 2 - this.EPS
        ];

        const aMax = [
            posA[0] + sizeA[0] / 2 + this.EPS,
            posA[1] + sizeA[1] / 2 + this.EPS,
            posA[2] + sizeA[2] / 2 + this.EPS
        ];

        const bMin = [
            posB[0] - sizeB[0] / 2,
            posB[1] - sizeB[1] / 2,
            posB[2] - sizeB[2] / 2
        ];

        const bMax = [
            posB[0] + sizeB[0] / 2,
            posB[1] + sizeB[1] / 2,
            posB[2] + sizeB[2] / 2
        ];

        return (
            aMin[0] <= bMax[0] &&
            aMax[0] >= bMin[0] &&
            aMin[1] <= bMax[1] &&
            aMax[1] >= bMin[1] &&
            aMin[2] <= bMax[2] &&
            aMax[2] >= bMin[2]
        );
    }

    _getColliderPosition(collider) {
        if (collider.entity && collider.entity.transform) {
            return [
                collider.entity.transform.x,
                collider.entity.transform.y,
                collider.entity.transform.z
            ];
        }
        return collider.position;
    }

    _getColliderSize(collider) {
        if (!collider.entity || !collider.entity.transform) {
            return collider.size;
        }

        const rx = collider.entity.transform.rx || 0;
        const ry = collider.entity.transform.ry || 0;
        const rz = collider.entity.transform.rz || 0;
        const hw = [collider.size[0] / 2, collider.size[1] / 2, collider.size[2] / 2];

        const degToRad = Math.PI / 180.0;
        const cx = Math.cos(rx * degToRad);
        const sx = Math.sin(rx * degToRad);
        const cy = Math.cos(ry * degToRad);
        const sy = Math.sin(ry * degToRad);
        const cz = Math.cos(rz * degToRad);
        const sz = Math.sin(rz * degToRad);

        const r00 = cz * cy;
        const r01 = cz * sy * sx - sz * cx;
        const r02 = cz * sy * cx + sz * sx;

        const r10 = sz * cy;
        const r11 = sz * sy * sx + cz * cx;
        const r12 = sz * sy * cx - cz * sx;

        const r20 = -sy;
        const r21 = cy * sx;
        const r22 = cy * cx;

        return [
            Math.abs(r00) * hw[0] + Math.abs(r01) * hw[1] + Math.abs(r02) * hw[2],
            Math.abs(r10) * hw[0] + Math.abs(r11) * hw[1] + Math.abs(r12) * hw[2],
            Math.abs(r20) * hw[0] + Math.abs(r21) * hw[1] + Math.abs(r22) * hw[2]
        ].map(v => v * 2);
    }

    _hasCollision(position, size) {
        for (const collider of this.colliders) {
            const colliderPosition = this._getColliderPosition(collider);
            const colliderSize = this._getColliderSize(collider);
            if (this.checkAABB(position, size, colliderPosition, colliderSize)) {
                return true;
            }
        }
        return false;
    }

    // =========================
    // 🧠 RESOLVE COM SLIDING
    // =========================
    resolveCollision(oldPos, newPos, playerSize) {
        let result = [...oldPos];

        // ===== X =====
        const testX = [newPos[0], result[1], result[2]];
        if (!this._hasCollision(testX, playerSize)) {
            result[0] = newPos[0];
        }

        // ===== Z =====
        const testZ = [result[0], result[1], newPos[2]];
        if (!this._hasCollision(testZ, playerSize)) {
            result[2] = newPos[2];
        }

        // ===== Y =====
        const testY = [result[0], newPos[1], result[2]];
        if (!this._hasCollision(testY, playerSize)) {
            result[1] = newPos[1];
        }

        return result;
    }

    // =========================
    // 🚀 ANTI-TUNNELING (SUBSTEPS)
    // =========================
    moveWithCollision(oldPos, desiredPos, playerSize = [0.5, 1.8, 0.5], steps = 4) {
        let current = [...oldPos];

        const step = [
            (desiredPos[0] - oldPos[0]) / steps,
            (desiredPos[1] - oldPos[1]) / steps,
            (desiredPos[2] - oldPos[2]) / steps,
        ];

        for (let i = 0; i < steps; i++) {
            const next = [
                current[0] + step[0],
                current[1] + step[1],
                current[2] + step[2],
            ];

            current = this.resolveCollision(current, next, playerSize);
        }

        return current;
    }

    // =========================
    // 🧱 CHÃO (SIMPLES)
    // =========================
    isGrounded(position, playerSize) {
        const down = [
            position[0],
            position[1] - 0.05,
            position[2]
        ];

        return this._hasCollision(down, playerSize);
    }

    getColliderCount() {
        return this.colliders.length;
    }
}