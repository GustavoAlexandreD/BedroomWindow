import { createRenderable } from './renderer.js';
import { addQuad } from './geometry_generator.js';

export function createOutsideScenario(gl) {
    const positions = [];
    const normals = [];
    const texcoords = [];

    const length = 700; 
    const width = 500;

    // Chao externo (Redor da casa)
    addQuad([-width, -1, -length], [width, -1, -length], [width, -1, length], [-width, -1, length], [0, 1, 0], positions, normals, texcoords);

    return createRenderable(gl, { data: { position: positions, normal: normals, texcoord: texcoords } });
}