import { createRenderable } from './renderer.js';
import { addQuad } from './geometry_generator.js';

export class Room{
    constructor([x,y,z], wall0 = [0,0], wall1 = [0,0], wall2 = [0,0], wall3 = [0,0]){
        this.roomPosition = [x,y,z];
        this.walls = [
            { type: wall0[0], windows: wall0[1] },
            { type: wall1[0], windows: wall1[1] },
            { type: wall2[0], windows: wall2[1] },
            { type: wall3[0], windows: wall3[1] }
        ];
    }

    createRoom(gl){
        const positions = [];
        const normals = [];
        const texcoords = [];

        const length = 120.0; 
        const width = 120.0;  
        const height = 50.0; 
        const windowHeight = 20.0; 
        const windowDepth = 5.0; 
        const rightPosition = this.roomPosition[0] + width/2;
        const leftPosition = this.roomPosition[0] - width/2;
        const frontPosition = this.roomPosition[2] - length/2;
        const backPosition = this.roomPosition[2] + length/2;
        let wBottom = 12.0; 
        let wTop = wBottom + windowHeight;
        let windowWidth;


        // Chão
        addQuad([leftPosition, 0, frontPosition], [rightPosition, 0, frontPosition], [rightPosition, 0, backPosition], [leftPosition, 0, backPosition], [0, 1, 0], positions, normals, texcoords);

        //Teto
        addQuad([leftPosition, height, frontPosition], [rightPosition, height, frontPosition], [rightPosition, height, backPosition], [leftPosition, height, backPosition], [0, -1, 0], positions, normals, texcoords);


        for(let i=0; i<4; i++){
            if(this.walls[i].type === 0){
                // Parede sem janelas
                switch(i){
                    case 0: // Parede Frontal
                        addQuad([leftPosition, 0, frontPosition], [leftPosition, height, frontPosition], [rightPosition, height, frontPosition], [rightPosition, 0, frontPosition], [0, 0, 1], positions, normals, texcoords);
                        break;
                    case 1: // Parede de Fundo
                        addQuad([leftPosition, 0, backPosition], [rightPosition, 0, backPosition], [rightPosition, height, backPosition], [leftPosition, height, backPosition], [0, 0, -1], positions, normals, texcoords);
                        break;
                    case 2: // Parede Direita
                        addQuad([rightPosition, 0, frontPosition], [rightPosition, height, frontPosition], [rightPosition, height, backPosition], [rightPosition, 0, backPosition], [-1, 0, 0], positions, normals, texcoords);
                        break;
                    case 3: // Parede Esquerda
                        addQuad([leftPosition, 0, frontPosition], [leftPosition, 0, backPosition], [leftPosition, height, backPosition], [leftPosition, height, frontPosition], [1, 0, 0], positions, normals, texcoords);
                        break;
                }
            }else if(this.walls[i].type === 1){
                wBottom = 0.0;
                let doorWidth = 20.0;
                let wallWidth = (width - doorWidth) / 2;
                // Parede com porta
                switch(i){
                    case 0: // Parede Frontal
                        addQuad([leftPosition, wTop, frontPosition], [rightPosition, wTop, frontPosition], [rightPosition, height, frontPosition], [leftPosition, height, frontPosition], [0, 0, 1], positions, normals, texcoords);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<3; j = j+2){
                            x1 = x + wallWidth;
                            addQuad([x, wBottom, frontPosition], [x, wTop, frontPosition], [x1, wTop, frontPosition], [x1, wBottom, frontPosition], [0, 0, 1], positions, normals, texcoords);
                            if(j+2 >= 3) continue;
                            x2 = x1 + doorWidth;
                            
                            // Teto do porta
                            addQuad([x1, wTop, frontPosition], [x1, wTop, frontPosition-windowDepth], [x2, wTop, frontPosition-windowDepth], [x2, wTop, frontPosition], [0, -1, 0], positions, normals, texcoords);

                            // Chão da porta
                            addQuad([x1, wBottom, frontPosition], [x1, wBottom, frontPosition-windowDepth], [x2, wBottom, frontPosition-windowDepth], [x2, wBottom, frontPosition], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do porta 
                            addQuad([x1, wBottom, frontPosition], [x1, wBottom, frontPosition-windowDepth], [x1, wTop, frontPosition-windowDepth], [x1, wTop, frontPosition], [1, 0, 0], positions, normals, texcoords);
                            
                            // Lateral Direita do porta 
                            addQuad([x2, wBottom, frontPosition], [x2, wTop, frontPosition], [x2, wTop, frontPosition-windowDepth], [x2, wBottom, frontPosition-windowDepth], [-1, 0, 0], positions, normals, texcoords);
                            x = x2;
                        }
                        break;
                    case 1: // Parede de Fundo
                        addQuad([leftPosition, wTop, backPosition], [rightPosition, wTop, backPosition], [rightPosition, height, backPosition], [leftPosition, height, backPosition], [0, 0, -1], positions, normals, texcoords);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<3; j = j+2){
                            x1 = x + wallWidth;
                            addQuad([x, wBottom, backPosition], [x, wTop, backPosition], [x1, wTop, backPosition], [x1, wBottom, backPosition], [0, 0, -1], positions, normals, texcoords);
                            if(j+2 >= 3) continue;
                            x2 = x1 + doorWidth;
                            
                            // Teto do porta
                            addQuad([x1, wTop, backPosition], [x1, wTop, backPosition+windowDepth], [x2, wTop, backPosition+windowDepth], [x2, wTop, +backPosition], [0, -1, 0], positions, normals, texcoords);

                            // Chão da porta
                            addQuad([x1, wBottom, backPosition], [x1, wBottom, backPosition+windowDepth], [x2, wBottom, backPosition+windowDepth], [x2, wBottom, backPosition], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do porta 
                            addQuad([x1, wBottom, backPosition], [x1, wBottom, backPosition+windowDepth], [x1, wTop, backPosition+windowDepth], [x1, wTop, backPosition], [1, 0, 0], positions, normals, texcoords);
                            
                            // Lateral Direita do porta 
                            addQuad([x2, wBottom, backPosition], [x2, wTop, backPosition], [x2, wTop, backPosition+windowDepth], [x2, wBottom, backPosition+windowDepth], [-1, 0, 0], positions, normals, texcoords);
                            x = x2;
                        }
                        break;
                    case 2: // Parede Direita
                        addQuad([rightPosition, wTop, frontPosition], [rightPosition, wTop, backPosition], [rightPosition, height, backPosition], [rightPosition, height, frontPosition], [-1, 0, 0], positions, normals, texcoords);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<3; j = j+2){
                            z1 = z + wallWidth;
                            addQuad([rightPosition, wBottom, z], [rightPosition, wTop, z], [rightPosition, wTop, z1], [rightPosition, wBottom, z1], [-1, 0, 0], positions, normals, texcoords);
                            if(j+2 >= 3) continue;
                            z2 = z1 + doorWidth;
                            
                            // Teto do porta
                            addQuad([rightPosition, wTop, z1], [rightPosition+windowDepth, wTop, z1], [rightPosition+windowDepth, wTop, z2], [rightPosition, wTop, z2], [0, -1, 0], positions, normals, texcoords);

                            // Chão da porta
                            addQuad([rightPosition, wBottom, z1], [rightPosition+windowDepth, wBottom, z1], [rightPosition+windowDepth, wBottom, z2], [rightPosition, wBottom, z2], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do janela 
                            addQuad([rightPosition, wBottom, z2], [rightPosition+windowDepth, wBottom, z2], [rightPosition+windowDepth, wTop, z2], [rightPosition, wTop, z2], [0, 0, -1], positions, normals, texcoords);
                            
                            // Lateral Direita do janela 
                            addQuad([rightPosition, wBottom, z1], [rightPosition+windowDepth, wBottom, z1], [rightPosition+windowDepth, wTop, z1], [rightPosition, wTop, z1], [0, 0, 1], positions, normals, texcoords);
                            z = z2;
                        }
                        break;
                    case 3: // Parede Esquerda
                        addQuad([leftPosition, wTop, frontPosition], [leftPosition, wTop, backPosition], [leftPosition, height, backPosition], [leftPosition, height, frontPosition], [1, 0, 0], positions, normals, texcoords);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<3; j = j+2){
                            z1 = z + wallWidth;
                            addQuad([leftPosition, wBottom, z], [leftPosition, wTop, z], [leftPosition, wTop, z1], [leftPosition, wBottom, z1], [1, 0, 0], positions, normals, texcoords);
                            if(j+2 >= 3) continue;
                            z2 = z1 + doorWidth;
                            
                            // Teto do porta
                            addQuad([leftPosition, wTop, z1], [leftPosition-windowDepth, wTop, z1], [leftPosition-windowDepth, wTop, z2], [leftPosition, wTop, z2], [0, -1, 0], positions, normals, texcoords);
                            
                            // Chão da porta
                            addQuad([leftPosition, wBottom, z1], [leftPosition-windowDepth, wBottom, z1], [leftPosition-windowDepth, wBottom, z2], [leftPosition, wBottom, z2], [0, 1, 0], positions, normals, texcoords);

                            // Lateral Esquerda do janela 
                            addQuad([leftPosition, wBottom, z2], [leftPosition-windowDepth, wBottom, z2], [leftPosition-windowDepth, wTop, z2], [leftPosition, wTop, z2], [0, 0, -1], positions, normals, texcoords);
                            
                            // Lateral Direita do janela 
                            addQuad([leftPosition, wBottom, z1], [leftPosition-windowDepth, wBottom, z1], [leftPosition-windowDepth, wTop, z1], [leftPosition, wTop, z1], [0, 0, 1], positions, normals, texcoords);
                            z = z2;
                        }
                        break;
                }
            }else if(this.walls[i].type === 2){
                // Parede com janelas
                const quantity_of_windows = this.walls[i].windows;
                let windowWidth = width / (2*quantity_of_windows + 1);
                wBottom = 12.0;
                switch(i){
                    case 0: // Parede Frontal
                        addQuad([leftPosition, wTop, frontPosition], [rightPosition, wTop, frontPosition], [rightPosition, height, frontPosition], [leftPosition, height, frontPosition], [0, 0, 1], positions, normals, texcoords);
                        addQuad([leftPosition, 0, frontPosition], [rightPosition, 0, frontPosition], [rightPosition, wBottom, frontPosition], [leftPosition, wBottom, frontPosition], [0, 0, 1], positions, normals, texcoords);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            x1 = x + windowWidth;
                            addQuad([x, wBottom, frontPosition], [x, wTop, frontPosition], [x1, wTop, frontPosition], [x1, wBottom, frontPosition], [0, 0, 1], positions, normals, texcoords);
                            if(j+1 > quantity_of_windows) break;
                            x2 = x1 + windowWidth;
                            
                            // Teto do janela
                            addQuad([x1, wTop, frontPosition], [x1, wTop, frontPosition-windowDepth], [x2, wTop, frontPosition-windowDepth], [x2, wTop, frontPosition], [0, -1, 0], positions, normals, texcoords);
                            
                            // Chão do janela
                            addQuad([x1, wBottom, frontPosition], [x1, wBottom, frontPosition-windowDepth], [x2, wBottom, frontPosition-windowDepth], [x2, wBottom, frontPosition], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do janela 
                            addQuad([x1, wBottom, frontPosition], [x1, wBottom, frontPosition-windowDepth], [x1, wTop, frontPosition-windowDepth], [x1, wTop, frontPosition], [1, 0, 0], positions, normals, texcoords);
                            
                            // Lateral Direita do janela 
                            addQuad([x2, wBottom, frontPosition], [x2, wTop, frontPosition], [x2, wTop, frontPosition-windowDepth], [x2, wBottom, frontPosition-windowDepth], [-1, 0, 0], positions, normals, texcoords);

                            x = x2;
                        }
                        break;
                    case 1: // Parede de Fundo
                        addQuad([leftPosition, wTop, backPosition], [rightPosition, wTop, backPosition], [rightPosition, height, backPosition], [leftPosition, height, backPosition], [0, 0, -1], positions, normals, texcoords);
                        addQuad([leftPosition, 0, backPosition], [rightPosition, 0, backPosition], [rightPosition, wBottom, backPosition], [leftPosition, wBottom, backPosition], [0, 0, -1], positions, normals, texcoords);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            x1 = x + windowWidth;
                            addQuad([x, wBottom, backPosition], [x, wTop, backPosition], [x1, wTop, backPosition], [x1, wBottom, backPosition], [0, 0, -1], positions, normals, texcoords);
                            if(j+1 > quantity_of_windows) break;
                            x2 = x1 + windowWidth;
                            
                            // Teto do janela
                            addQuad([x1, wTop, backPosition], [x1, wTop, backPosition+windowDepth], [x2, wTop, backPosition+windowDepth], [x2, wTop, backPosition], [0, -1, 0], positions, normals, texcoords);
                            
                            // Chão do janela
                            addQuad([x1, wBottom, backPosition], [x1, wBottom, backPosition+windowDepth], [x2, wBottom, backPosition+windowDepth], [x2, wBottom, backPosition], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do janela 
                            addQuad([x1, wBottom, backPosition], [x1, wBottom, backPosition+windowDepth], [x1, wTop, backPosition+windowDepth], [x1, wTop, backPosition], [1, 0, 0], positions, normals, texcoords);
                            
                            // Lateral Direita do janela 
                            addQuad([x2, wBottom, backPosition], [x2, wTop, backPosition], [x2, wTop, backPosition+windowDepth], [x2, wBottom, backPosition+windowDepth], [-1, 0, 0], positions, normals, texcoords);

                            x = x2;
                        }
                        break;
                    case 2: // Parede Direita
                        addQuad([rightPosition, wTop, frontPosition], [rightPosition, wTop, backPosition], [rightPosition, height, backPosition], [rightPosition, height, frontPosition], [-1, 0, 0], positions, normals, texcoords);
                        addQuad([rightPosition, 0, frontPosition], [rightPosition, 0, backPosition], [rightPosition, wBottom, backPosition], [rightPosition, wBottom, frontPosition], [-1, 0, 0], positions, normals, texcoords);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            z1 = z + windowWidth;
                            addQuad([rightPosition, wBottom, z], [rightPosition, wTop, z], [rightPosition, wTop, z1], [rightPosition, wBottom, z1], [-1, 0, 0], positions, normals, texcoords);
                            if(j+1 > quantity_of_windows) break;
                            z2 = z1 + windowWidth;
                            
                            // Teto do janela
                            addQuad([rightPosition, wTop, z1], [rightPosition+windowDepth, wTop, z1], [rightPosition+windowDepth, wTop, z2], [rightPosition, wTop, z2], [0, -1, 0], positions, normals, texcoords);
                            
                            // Chão do janela
                            addQuad([rightPosition, wBottom, z1], [rightPosition+windowDepth, wBottom, z1], [rightPosition+windowDepth, wBottom, z2], [rightPosition, wBottom, z2], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do janela 
                            addQuad([rightPosition, wBottom, z2], [rightPosition+windowDepth, wBottom, z2], [rightPosition+windowDepth, wTop, z2], [rightPosition, wTop, z2], [0, 0, -1], positions, normals, texcoords);
                            
                            // Lateral Direita do janela 
                            addQuad([rightPosition, wBottom, z1], [rightPosition+windowDepth, wBottom, z1], [rightPosition+windowDepth, wTop, z1], [rightPosition, wTop, z1], [0, 0, 1], positions, normals, texcoords);

                            z = z2;
                        }
                        break;
                    case 3: // Parede Esquerda
                        addQuad([leftPosition, wTop, frontPosition], [leftPosition, wTop, backPosition], [leftPosition, height, backPosition], [leftPosition, height, frontPosition], [1, 0, 0], positions, normals, texcoords);
                        addQuad([leftPosition, 0, frontPosition], [leftPosition, 0, backPosition], [leftPosition, wBottom, backPosition], [leftPosition, wBottom, frontPosition], [1, 0, 0], positions, normals, texcoords);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            z1 = z + windowWidth;
                            addQuad([leftPosition, wBottom, z], [leftPosition, wTop, z], [leftPosition, wTop, z1], [leftPosition, wBottom, z1], [1, 0, 0], positions, normals, texcoords);
                            if(j+1 > quantity_of_windows) break;
                            z2 = z1 + windowWidth;
                            
                            // Teto do janela
                            addQuad([leftPosition, wTop, z1], [leftPosition-windowDepth, wTop, z1], [leftPosition-windowDepth, wTop, z2], [leftPosition, wTop, z2], [0, -1, 0], positions, normals, texcoords);
                            
                            // Chão do janela
                            addQuad([leftPosition, wBottom, z1], [leftPosition-windowDepth, wBottom, z1], [leftPosition-windowDepth, wBottom, z2], [leftPosition, wBottom, z2], [0, 1, 0], positions, normals, texcoords);
                            
                            // Lateral Esquerda do janela 
                            addQuad([leftPosition, wBottom, z2], [leftPosition-windowDepth, wBottom, z2], [leftPosition-windowDepth, wTop, z2], [leftPosition, wTop, z2], [0, 0, -1], positions, normals, texcoords);
                            
                            // Lateral Direita do janela 
                            addQuad([leftPosition, wBottom, z1], [leftPosition-windowDepth, wBottom, z1], [leftPosition-windowDepth, wTop, z1], [leftPosition, wTop, z1], [0, 0, 1], positions, normals, texcoords);

                            z = z2;
                        }
                        break;
                }
            }
        }
        return createRenderable(gl, { data: { position: positions, normal: normals, texcoord: texcoords } });
    }

    createBoundBoxes(){
        const length = 120.0; 
        const width = 120.0; 
        const windowHeight = 20.0;
        const rightPosition = this.roomPosition[0] + width/2;
        const leftPosition = this.roomPosition[0] - width/2;
        const frontPosition = this.roomPosition[2] - length/2;
        const backPosition = this.roomPosition[2] + length/2;
        let windowWidth;
        const boundBoxes = [];
        const windowsPosition = [];

        for(let i=0; i<4; i++){
            if(this.walls[i].type === 0){
                // Parede sem janelas
                switch(i){
                    case 0: // Parede Frontal
                        boundBoxes.push([[this.roomPosition[0], this.roomPosition[1], this.roomPosition[2]-60], [120.0, 50.0, 5.0]]);
                        break;
                    case 1: // Parede de Fundo
                        boundBoxes.push([[this.roomPosition[0], this.roomPosition[1], this.roomPosition[2]+60], [120.0, 50.0, 5.0]]);
                        break;
                    case 2: // Parede Direita
                        boundBoxes.push([[this.roomPosition[0]+60, this.roomPosition[1], this.roomPosition[2]], [5.0, 50.0, 120.0]]);
                        break;
                    case 3: // Parede Esquerda
                        boundBoxes.push([[this.roomPosition[0]-60, this.roomPosition[1], this.roomPosition[2]], [5.0, 50.0, 120.0]]);
                        break;
                }
            }else if(this.walls[i].type === 1){
                let doorWidth = 20.0;
                let wallWidth = (width - doorWidth) / 2;
                // Parede com porta
                switch(i){
                    case 0: // Parede Frontal
                        boundBoxes.push([[this.roomPosition[0], this.roomPosition[1]+32, this.roomPosition[2]-60], [120.0, 18.0, 5.0]]);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<3; j = j+2){
                            x1 = x + wallWidth;
                            boundBoxes.push([[x1-wallWidth/2, this.roomPosition[1], this.roomPosition[2]-60], [wallWidth, 32.0, 5.0]]);
                            if(j+2 >= 3) continue;
                            x2 = x1 + doorWidth;
                            x = x2;
                        }
                        break;
                    case 1: // Parede de Fundo
                        boundBoxes.push([[this.roomPosition[0], this.roomPosition[1]+32, this.roomPosition[2]+60], [120.0, 18.0, 5.0]]);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<3; j = j+2){
                            x1 = x + wallWidth;
                            boundBoxes.push([[x1-wallWidth/2, this.roomPosition[1], this.roomPosition[2]+60], [wallWidth, 32.0, 5.0]]);
                            if(j+2 >= 3) continue;
                            x2 = x1 + doorWidth;
                            x = x2;
                        }
                        break;
                    case 2: // Parede Direita
                        boundBoxes.push([[this.roomPosition[0]+60, this.roomPosition[1]+32, this.roomPosition[2]], [5.0, 18.0, 120.0]]);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<3; j = j+2){
                            z1 = z + wallWidth;
                            boundBoxes.push([[this.roomPosition[0]+60, this.roomPosition[1], z1-wallWidth/2], [5.0, 32.0, wallWidth]]);
                            if(j+2 >= 3) continue;
                            z2 = z1 + doorWidth;
                            z = z2;
                        }
                        break;
                    case 3: // Parede Esquerda
                        boundBoxes.push([[this.roomPosition[0]-60, this.roomPosition[1]+32, this.roomPosition[2]], [120.0, 18.0, 5.0]]);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<3; j = j+2){
                            z1 = z + wallWidth;
                            boundBoxes.push([[this.roomPosition[0]-60, this.roomPosition[1], z1-wallWidth/2], [5.0, 32.0, wallWidth]]);
                            if(j+2 >= 3) continue;
                            z2 = z1 + doorWidth;
                            z = z2;
                        }
                        break;
                }
            }else if(this.walls[i].type === 2){
                // Parede com janelas
                const quantity_of_windows = this.walls[i].windows;
                let windowWidth = width / (2*quantity_of_windows + 1);
                switch(i){
                    case 0: // Parede Frontal
                        boundBoxes.push([[this.roomPosition[0], this.roomPosition[1]+32, this.roomPosition[2]-60], [120.0, 18.0, 5.0]]);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            x1 = x + windowWidth;
                            boundBoxes.push([[x1-windowWidth/2, this.roomPosition[1], this.roomPosition[2]-60], [windowWidth, 32.0, 5.0]]);
                            if(j+1 > quantity_of_windows) break;
                            x2 = x1 + windowWidth;
                            windowsPosition.push([[x1, this.roomPosition[1]+windowHeight/2, this.roomPosition[2]-60], [x2, this.roomPosition[1]+windowHeight/2, this.roomPosition[2]-60]]);
                            x = x2;
                        }
                        break;
                    case 1: // Parede de Fundo
                        boundBoxes.push([[this.roomPosition[0], this.roomPosition[1]+32, this.roomPosition[2]+60], [120.0, 18.0, 5.0]]);
                        var x, x1, x2;
                        x = leftPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            x1 = x + windowWidth;
                            boundBoxes.push([[x1-windowWidth/2, this.roomPosition[1], this.roomPosition[2]+60], [windowWidth, 32.0, 5.0]]);
                            if(j+1 > quantity_of_windows) break;
                            x2 = x1 + windowWidth;
                            windowsPosition.push([[x1, this.roomPosition[1]+windowHeight/2, this.roomPosition[2]+60], [x2, this.roomPosition[1]+windowHeight/2, this.roomPosition[2]+60]]);
                            x = x2;
                        }
                        break;
                    case 2: // Parede Direita
                        boundBoxes.push([[this.roomPosition[0]+60, this.roomPosition[1]+32, this.roomPosition[2]], [120.0, 18.0, 5.0]]);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            z1 = z + windowWidth;
                            boundBoxes.push([[this.roomPosition[0]+60, this.roomPosition[1], z1-windowWidth/2], [5.0, 32.0, windowWidth]]);
                            if(j+1 > quantity_of_windows) break;
                            z2 = z1 + windowWidth;
                            windowsPosition.push([[this.roomPosition[0]+60, this.roomPosition[1]+windowHeight/2, z1], [this.roomPosition[0]+60, this.roomPosition[1]+windowHeight/2, z2]]);
                            z = z2;
                        }
                        break;
                    case 3: // Parede Esquerda
                        boundBoxes.push([[this.roomPosition[0]-60, this.roomPosition[1]+32, this.roomPosition[2]], [120.0, 18.0, 5.0]]);
                        var z, z1, z2;
                        z = frontPosition;
                        for(let j=0; j<quantity_of_windows+1; j++){
                            z1 = z + windowWidth;
                            boundBoxes.push([[this.roomPosition[0]-60, this.roomPosition[1], z1-windowWidth/2], [5.0, 32.0, windowWidth]]);
                            if(j+1 > quantity_of_windows) break;
                            z2 = z1 + windowWidth;
                            windowsPosition.push([[this.roomPosition[0]-60, this.roomPosition[1]+windowHeight/2, z1], [this.roomPosition[0]-60, this.roomPosition[1]+windowHeight/2, z2]]);
                            z = z2;
                        }
                        break;
                }
            }
        }
        return { boundBoxes, windowsPosition };
    }
}