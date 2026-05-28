// Cria os buffers a partir  da geometria carregada no parsing de objetos
export function createRenderable(gl, geom) {
    const positions = geom.data.position || [];
    const normals = geom.data.normal || [];
    const texcoords = geom.data.texcoord || [];

    const bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const bufNorm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufNorm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const bufTex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufTex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    return {
        buffer: bufPos,
        normalBuffer: bufNorm,
        bufferTexCoord: bufTex,
        numVertices: positions.length / 3,
        transform: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }
    };
}