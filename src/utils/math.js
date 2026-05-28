// Operações de matriz para transformações 3D

export function translationMatrix(tx, ty, tz) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

export function scaleMatrix(sx, sy, sz) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
}

export function rotateY(angle) {
    var rad = angle * Math.PI / 180.0;
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}

export function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

export function multiply(a, b) {
    var c = new Float32Array(16);
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            c[i * 4 + j] = a[i * 4 + 0] * b[0 * 4 + j] +
                a[i * 4 + 1] * b[1 * 4 + j] +
                a[i * 4 + 2] * b[2 * 4 + j] +
                a[i * 4 + 3] * b[3 * 4 + j];
        }
    }
    return c;
}

// Cria uma matriz de perspectiva usando os parâmetros fornecidos

export function createPerspective(fovy, aspect, near, far) {
    fovy = fovy * Math.PI / 180.0;
    var fy = 1 / Math.tan(fovy / 2);
    var fx = fy / aspect;
    var A = -(far + near) / (far - near);
    var B = -2 * far * near / (far - near);
    return new Float32Array([fx, 0, 0, 0, 0, fy, 0, 0, 0, 0, A, -1, 0, 0, B, 0]);
}

export function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

export function subtract(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }

export function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function lookat(eye, target, up) {
    const z = normalize(subtract(eye, target));
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ]);
}