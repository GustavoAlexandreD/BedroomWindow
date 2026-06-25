import { Object } from "./entity.js";

export class Door extends Object {
    constructor(id, name, position, renderableData, texture, audioManager, scale = 1.0, boxSize = [5.0, 10.0, 5.0]) {
        super({ id, name, position, audioManager });

        this.meshData = renderableData;
        this.texture = texture;

        const safePosition = Array.isArray(position) && position.length >= 3 ? position : [0, 0, 0];
        this.transform = {
            x: safePosition[0],
            y: safePosition[1],
            z: safePosition[2],
            rx: 0,
            ry: 0,
            rz: 0,
            scale: scale
        };
        this.boxSize = Array.isArray(boxSize) && boxSize.length >= 3 ? boxSize : [1.0, 2.0, 0.2];

        this.isOpen = false;
        this.closedRy = this.transform.ry;
        this.openRy = (this.closedRy + 90) % 360;
        this.closedPosition = [...safePosition];
        this.openOffset = this._calculateOpenOffset();
    }

    _calculateOpenOffset() {
        const halfWidth = (this.boxSize[0] * this.transform.scale) / 2;
        const closedRad = this.closedRy * Math.PI / 180;
        const openRad = ((this.closedRy + 90) % 360) * Math.PI / 180;

        const hingeX = this.closedPosition[0] - halfWidth * Math.cos(closedRad);
        const hingeZ = this.closedPosition[2] - halfWidth * Math.sin(closedRad);

        const openCenterX = hingeX + halfWidth * Math.cos(openRad);
        const openCenterZ = hingeZ + halfWidth * Math.sin(openRad);

        return [openCenterX - this.closedPosition[0] + 2.0 , 0, openCenterZ - this.closedPosition[2] + 5.0];
    }

    toggle() {
        if (!this.isOpen) {
            this.closedRy = this.transform.ry;
            this.openRy = (this.closedRy + 90) % 360;
            this.openOffset = this._calculateOpenOffset();
            this.transform.ry = this.openRy;
            this.transform.x = this.closedPosition[0] + this.openOffset[0]/2;
            this.transform.z = this.closedPosition[2] + this.openOffset[2]/2;
        } else {
            this.transform.ry = this.closedRy;
            this.transform.x = this.closedPosition[0];
            this.transform.z = this.closedPosition[2];
        }

        this.position = [this.transform.x, this.transform.y, this.transform.z];
        this.isOpen = !this.isOpen;
    }

    update(dt) {
        // Porta não precisa de animação contínua no momento.
    }

    getDrawData() {
        return {
            ...this.meshData,
            texture: this.texture,
            transform: this.transform
        };
    }
}
