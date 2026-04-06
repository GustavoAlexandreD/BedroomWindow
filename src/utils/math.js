export function createPerspective(fovy, aspect, near, far) {
    const f = 1.0 / Math.tan((fovy * Math.PI / 180) / 2);
    const nf = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
    ]);
}


export function createCamera(eye, center, up) {
    const z = normalize(subtract(eye, center)); // Forward
    const x = normalize(cross(up, z));         // Right
    const y = cross(z, x);                      // Up

    return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ]);
}

function subtract(a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

function cross(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}

export function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

export function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0]/len, v[1]/len, v[2]/len];
}

export function identityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}


export function identity(mat) {
    return multiplyMatrices(mat, identityMatrix());
}

export function translateMatrix(tx, ty, tz) {
     return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1
    ]);
}

export function scaleMatrix(sx, sy, sz) {
    return new Float32Array([
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1
    ]);
}

export function rotateXMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    ]);
}

export function rotateYMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    ]);
}

export function rotateZMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Multiplies two matrices (Standard Column-Major Multiplication)
 */
export function multiplyMatrices(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            let sum = 0;
            for (let i = 0; i < 4; i++) {
                sum += a[i * 4 + row] * b[col * 4 + i];
            }
            out[col * 4 + row] = sum;
        }
    }
    return out;
}

/**
 * Multiplica matriz atual por translação
 */
export function translate(mat, tx, ty, tz) {
    return multiplyMatrices(mat, translateMatrix(tx, ty, tz));
}

export function scale(mat, sx, sy, sz) {
    return multiplyMatrices(mat, scaleMatrix(sx, sy, sz));
}

// =======================
// Rotação em torno do próprio eixo do objeto
// =======================
export function rotateX(mat, angle, cx = 0, cy = 0, cz = 0) {
    let m = translate(mat, -cx, -cy, -cz);
    m = multiplyMatrices(m, rotateXMatrix(angle));
    return translate(m, cx, cy, cz);
}

export function rotateY(mat, angle, cx = 0, cy = 0, cz = 0) {
    let m = translate(mat, -cx, -cy, -cz);
    m = multiplyMatrices(m, rotateYMatrix(angle));
    return translate(m, cx, cy, cz);
}

export function rotateZ(mat, angle, cx = 0, cy = 0, cz = 0) {
    let m = translate(mat, -cx, -cy, -cz);
    m = multiplyMatrices(m, rotateZMatrix(angle));
    return translate(m, cx, cy, cz);
}