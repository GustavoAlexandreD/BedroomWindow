import { Entity } from "./entity.js"

export class Cat extends Entity {
    constructor(id, name, position, renderableData, texture, audioManager, scale = 1.0, boxSize = [10.0, 10.0, 10.0]) {
        super({ id, name, position, audioManager });
        
        this.meshData = renderableData; 
        this.texture = texture;
        
        this.transform = {
            x: position[0],
            y: position[1],
            z: position[2],
            rx: 0, ry: 0, rz: 0,
            scale: scale
        };
        this.boxSize = boxSize; 

        // Controle da Animação
        this.startY = position[1];             // Onde ele começa (escondido)
        this.targetY = position[1] + 6.0;     // Altura do topo da cama
        this.animState = "IDLE";               // Começa dormindo
        this.speed = 10.0;                     // Velocidade da subida
        this.waitTimer = 0;                    
    }

    interact() {
        if (this.animState === "IDLE") {
            this.animState = "EMERGING"; // Acorda o gato!
        }
    }

    update(dt) {
        if (!dt) return; 

        if (this.animState === "EMERGING") {
            this.transform.y += this.speed * dt;
            if (this.transform.y >= this.targetY) {
                this.transform.y = this.targetY; 
                this.animState = "MEOWING";
                this.waitTimer = 2.0; // Fica 2 segundos miando
                this._tocarSom3D("som-gato", { volume: 50.0 }); // Toca o som!
            }
        } 
        else if (this.animState === "MEOWING") {
            this.waitTimer -= dt;
            if (this.waitTimer <= 0) {
                this.animState = "HIDING";
            }
        } 
        else if (this.animState === "HIDING") {
            this.transform.y -= this.speed * dt;
            if (this.transform.y <= this.startY) {
                this.transform.y = this.startY; 
                this.animState = "IDLE"; 
            }
        }
    }

    getDrawData() {
        return {
            ...this.meshData,
            texture: this.texture,
            transform: this.transform
        };
    }
}