// Cria os buffers a partir  da geometria carregada no parsing de objetos
export function createRenderable(gl, geom) {
    const positions = geom.data.position || [];
    const normals = geom.data.normal || [];
    const texcoords = geom.data.texcoord || [];
    const indices = geom.data.indices || null;

    const bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const bufNorm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufNorm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const bufTex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufTex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    let renderable = {
        buffer: bufPos,
        normalBuffer: bufNorm,
        bufferTexCoord: bufTex,
        numVertices: positions.length / 3,
        transform: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }
    }

    // SE O MODELO TIVER ÍNDICES
    if (indices && indices.length > 0) {
        // Ativamos a extensão de segurança para modelos com muitos triângulos
        gl.getExtension("OES_element_index_uint");
        
        const bufIdx = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIdx);
        // Usamos Uint32Array para suportar modelos pesados
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
        
        renderable.indexBuffer = bufIdx;
        renderable.numIndices = indices.length;
    }
    return renderable;
}