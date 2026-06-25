// Função auxiliar para adicionar um quadrilátero (composto por dois triângulos) a um array de vértices, normais e coordenadas de textura
    export function addQuad(p1, p2, p3, p4, n, positions, normals, texcoords) {
        positions.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
        for(let i=0; i<6; i++) normals.push(...n);
        texcoords.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    }
