import { createRenderable } from './renderer.js';
import { addQuad } from './geometry_generator.js';

export function createRoom(gl) {
    const positions = [];
    const normals = [];
    const texcoords = [];

    const length = 60.0; 
    const width = 60.0;  
    const height = 50.0; 
    const windowSize = 20.0; 
    const windowDepth = 5.0; 
    const wBottom = 12.0; 
    const wTop = wBottom + windowSize;

    //Teto
    addQuad([-width, height, -length], [width, height, -length], [width, height, length], [-width, height, length], [0, -1, 0], positions, normals, texcoords);

    // Chão
    addQuad([-width, 0, -length], [width, 0, -length], [width, 0, length], [-width, 0, length], [0, 1, 0], positions, normals, texcoords);

    // Parede Frontal
    addQuad([-width, 0, -length], [-width, height, -length], [width, height, -length], [width, 0, -length], [1, 0, 0], positions, normals, texcoords);

    // Parede de Fundo
    addQuad([-width, 0, length], [width, 0, length], [width, height, length], [-width, height, length], [-1, 0, 0], positions, normals, texcoords);

    // Parede direita e esquerda com janelas
    [-1, 1].forEach(side => {
        const x = width * side;
        const nWall = [0, 0, -side]; // Normal apontando para dentro do corredor
        const nWindowSide = [0, 0, side]; // Normal das laterais internas do janela

        // Z-positions para as 3 janelas
        const windowZs = [];
        for (let i = 0; i < 3; i++) {
            const zCenter = -length + (i + 1) * (length * 2 / 4);
            windowZs.push({ start: zCenter - windowSize/2, end: zCenter + windowSize/2 });
        }
        
        // Faixas horizontais superior e inferior da parede (acima e abaixo das janelas)
        addQuad([x, 0, -length], [x, 0, length], [x, wBottom, length], [x, wBottom, -length], nWall, positions, normals, texcoords);
        addQuad([x, wTop, -length], [x, wTop, length], [x, height, length], [x, height, -length], nWall, positions, normals, texcoords);

        // Segmentos verticais entre/antes/depois das janelas
        // 'hz' é o cenntro  de uma das janelas, assim como na variávell 'n' deixei assim porque achei menos confuso
        let lastZ = -length;
        windowZs.forEach(hz => {
            // Parede entre o último Z e o início do buraco atual
            if (hz.start > lastZ) {
                addQuad([x, wBottom, lastZ], [x, wBottom, hz.start], [x, wTop, hz.start], [x, wTop, lastZ], nWall, positions, normals, texcoords);
            }

            // Construção da janela
            const deepX = x + (windowDepth * side);
            
            // Teto do janela
            addQuad([x, wTop, hz.start], [deepX, wTop, hz.start], [deepX, wTop, hz.end], [x, wTop, hz.end], [0, -1, 0], positions, normals, texcoords);
            
            // Chão do janela
            addQuad([x, wBottom, hz.start], [x, wBottom, hz.end], [deepX, wBottom, hz.end], [deepX, wBottom, hz.start], [0, 1, 0], positions, normals, texcoords);
            
            // Lateral Esquerda do janela 
            addQuad([x, wBottom, hz.start], [deepX, wBottom, hz.start], [deepX, wTop, hz.start], [x, wTop, hz.start], [0, 0, 1], positions, normals, texcoords);
            
            // Lateral Direita do janela 
            addQuad([x, wBottom, hz.end], [x, wTop, hz.end], [deepX, wTop, hz.end], [deepX, wBottom, hz.end], [0, 0, -1], positions, normals, texcoords);

            lastZ = hz.end;
        });

        // Última parte de parede após a última janela até o fim da parede
        addQuad([x, wBottom, lastZ], [x, wBottom, length], [x, wTop, length], [x, wTop, lastZ], nWall, positions, normals, texcoords);
    });

    return createRenderable(gl, { data: { position: positions, normal: normals, texcoord: texcoords } });
}