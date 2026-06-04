import { Entity } from "./entity.js"

export class Furniture extends Entity {
    constructor(id, name, position, renderableData, texture, scale = 1.0) {
        super({ id, name, position })
        this.renderable = renderableData
        this.renderable.texture = texture
        this.renderable.transform = {
            x: position[0],
            y: position[1],
            z: position[2],
            rx: 0,
            ry: 0,
            rz: 0,
            scale: scale
        }
    }

    update(dt) {

    }

    getDrawData() {
        return this.renderable
    }
}

