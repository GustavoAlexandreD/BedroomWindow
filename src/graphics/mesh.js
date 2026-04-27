import * as mat4 from "../utils/math.js";

export class Mesh {
    constructor(gl, meshData, shaderManager) {
        this.gl = gl;
        this.shader = shaderManager;

        this.modelMatrix = mat4.identityMatrix();
        this.normalMatrix = mat4.identityMatrix();

        this.material = {
            useTexture: false,
            solidColor: [1, 1, 1, 1],
            shininess: 32.0
        };

        this.texture = null;
        this.indexType = (meshData.indices instanceof Uint32Array) ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        this.indexCount = meshData.indices.length;

        this.vao = this._createVertexArray(meshData);
    }

    _createVertexArray(meshData) {
        const gl = this.gl;
        const vao = gl.createVertexArray ? gl.createVertexArray() : null;

        if (vao) {
            gl.bindVertexArray(vao);
        }

        this.positionBuffer = this._createArrayBuffer(meshData.vertices);
        this.normalBuffer = this._createArrayBuffer(meshData.normals);
        this.uvBuffer = this._createArrayBuffer(meshData.uvs);
        this.indexBuffer = this._createElementArrayBuffer(meshData.indices);

        this._bindAttributes();

        if (vao) {
            gl.bindVertexArray(null);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return vao;
    }

    _createArrayBuffer(data) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    }

    _createElementArrayBuffer(data) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    }

    _bindAttributes() {
        const gl = this.gl;
        const attrs = this.shader.attributes;

        if (attrs.aPosition >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.enableVertexAttribArray(attrs.aPosition);
            gl.vertexAttribPointer(attrs.aPosition, 3, gl.FLOAT, false, 0, 0);
        }

        if (attrs.aNormal >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.enableVertexAttribArray(attrs.aNormal);
            gl.vertexAttribPointer(attrs.aNormal, 3, gl.FLOAT, false, 0, 0);
        }

        if (attrs.aUV >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.enableVertexAttribArray(attrs.aUV);
            gl.vertexAttribPointer(attrs.aUV, 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    setModelMatrix(matrix) {
        this.modelMatrix = matrix;
        this.normalMatrix = this._computeNormalMatrixFromModel(matrix);
    }

    setMaterial({
        useTexture = this.material.useTexture,
        solidColor = this.material.solidColor,
        shininess = this.material.shininess
    } = {}) {
        this.material = { useTexture, solidColor, shininess };
    }

    setTexture(texture) {
        this.texture = texture;
        this.material.useTexture = Boolean(texture);
    }

    draw({ viewMatrix, projectionMatrix, cameraPosition, light }) {
        const gl = this.gl;

        this.shader.use();
        this.shader.setMatrices({
            model: this.modelMatrix,
            view: viewMatrix,
            projection: projectionMatrix,
            normalMatrix: this.normalMatrix
        });
        this.shader.setCameraPosition(cameraPosition);
        this.shader.setPhongLight(light);
        this.shader.setMaterial(this.material);

        if (this.material.useTexture && this.texture) {
            this.shader.setTexture(this.texture, 0);
        }

        if (this.vao && gl.bindVertexArray) {
            gl.bindVertexArray(this.vao);
        } else {
            this._bindAttributes();
        }

        gl.drawElements(gl.TRIANGLES, this.indexCount, this.indexType, 0);

        if (this.vao && gl.bindVertexArray) {
            gl.bindVertexArray(null);
        }
    }

    /**
     * Matriz normal (inversa transposta do 3x3 superior da model matrix).
     */
    _computeNormalMatrixFromModel(model) {
        const m00 = model[0], m01 = model[1], m02 = model[2];
        const m10 = model[4], m11 = model[5], m12 = model[6];
        const m20 = model[8], m21 = model[9], m22 = model[10];

        const c00 = (m11 * m22) - (m12 * m21);
        const c01 = -((m10 * m22) - (m12 * m20));
        const c02 = (m10 * m21) - (m11 * m20);
        const c10 = -((m01 * m22) - (m02 * m21));
        const c11 = (m00 * m22) - (m02 * m20);
        const c12 = -((m00 * m21) - (m01 * m20));
        const c20 = (m01 * m12) - (m02 * m11);
        const c21 = -((m00 * m12) - (m02 * m10));
        const c22 = (m00 * m11) - (m01 * m10);

        const det = (m00 * c00) + (m01 * c01) + (m02 * c02);
        if (Math.abs(det) < 1e-8) {
            return mat4.identityMatrix();
        }

        const invDet = 1 / det;
        const inv00 = c00 * invDet;
        const inv01 = c10 * invDet;
        const inv02 = c20 * invDet;
        const inv10 = c01 * invDet;
        const inv11 = c11 * invDet;
        const inv12 = c21 * invDet;
        const inv20 = c02 * invDet;
        const inv21 = c12 * invDet;
        const inv22 = c22 * invDet;

        return new Float32Array([
            inv00, inv10, inv20, 0,
            inv01, inv11, inv21, 0,
            inv02, inv12, inv22, 0,
            0, 0, 0, 1
        ]);
    }

    destroy() {
        const gl = this.gl;
        if (this.vao && gl.deleteVertexArray) gl.deleteVertexArray(this.vao);
        if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer);
        if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
        if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    }
}
