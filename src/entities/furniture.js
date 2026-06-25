import { Object} from "./entity.js"

export class Furniture extends Object{
    constructor(id, name, position, renderableData, texture, scale = 1.0, boxSize = [10.0, 10.0, 10.0]) {
        super({ id, name, position })
        
        // Dados compartilhados da GPU (Buffers, Indices, etc)
        this.meshData = renderableData; 
        this.texture = texture;
        
        // Dados individuais DESTA mesa específica
        this.transform = {
            x: position[0],
            y: position[1],
            z: position[2],
            rx: 0,
            ry: 0,
            rz: 0,
            scale: scale
        };
        this.boxSize = boxSize; 
    }

    update(dt) {}

    getDrawData() {
        // Na hora de desenhar, nós juntamos a malha da GPU com a posição deste objeto específico!
        return {
            ...this.meshData, // Puxa os buffers (buffer, normalBuffer, indexBuffer...)
            texture: this.texture,
            transform: this.transform
        };
    }
}