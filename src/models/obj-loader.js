export class OBJLoader {
    constructor() {
        this.reset();
    }

    reset() {
        this.rawPositions = [];
        this.rawNormals = [];
        this.rawUVs = [];

        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.indices = [];

        this.vertexMap = new Map();
    }

    async load(url, options = {}) {
        const {
            normalize = true,
            flipUV = true,
            generateNormals = true,
            flipNormals = false
        } = options;

        this.reset();

        const response = await fetch(url);
        const text = await response.text();

        this.parse(text, flipUV);

        if (generateNormals && this.normals.length === 0) {
            this.generateNormals(flipNormals);
        }

        const mesh = this.buildMesh();

        if (normalize) {
            this.normalize(mesh.vertices);
        }

        return mesh;
    }

    parse(text, flipUV) {
        const lines = text.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            const parts = line.split(/\s+/);
            const type = parts[0];

            switch (type) {
                case 'v':
                    this.rawPositions.push([
                        +parts[1], +parts[2], +parts[3]
                    ]);
                    break;

                case 'vn':
                    this.rawNormals.push([
                        +parts[1], +parts[2], +parts[3]
                    ]);
                    break;

                case 'vt':
                    this.rawUVs.push([
                        +parts[1],
                        flipUV ? 1 - (+parts[2]) : +parts[2]
                    ]);
                    break;

                case 'f':
                    this.parseFace(parts.slice(1));
                    break;
            }
        }
    }

    parseFace(face) {
        for (let i = 1; i < face.length - 1; i++) {
            this.processVertex(face[0]);
            this.processVertex(face[i]);
            this.processVertex(face[i + 1]);
        }
    }

    resolveIndex(i, arrayLength) {
        return i >= 0 ? i : arrayLength + i;
    }

    processVertex(data) {
        if (this.vertexMap.has(data)) {
            this.indices.push(this.vertexMap.get(data));
            return;
        }

        let [v, vt, vn] = data.split('/').map(x => x ? parseInt(x) : null);

        // OBJ começa em 1, negativos contam de trás
        v = this.resolveIndex((v || 0) - 1, this.rawPositions.length);
        vt = vt !== null ? this.resolveIndex(vt - 1, this.rawUVs.length) : null;
        vn = vn !== null ? this.resolveIndex(vn - 1, this.rawNormals.length) : null;

        const pos = this.rawPositions[v] || [0, 0, 0];
        const uv = vt !== null ? (this.rawUVs[vt] || [0, 0]) : [0, 0];
        const norm = vn !== null ? (this.rawNormals[vn] || [0, 0, 0]) : [0, 0, 0];

        this.vertices.push(...pos);
        this.uvs.push(...uv);
        this.normals.push(...norm);

        const index = (this.vertices.length / 3) - 1;
        this.vertexMap.set(data, index);
        this.indices.push(index);
    }

    buildMesh() {
        const vertexCount = this.vertices.length / 3;
        const useUint32 = vertexCount > 65535;

        return {
            vertices: new Float32Array(this.vertices),
            normals: new Float32Array(this.normals),
            uvs: new Float32Array(this.uvs),
            indices: new (useUint32 ? Uint32Array : Uint16Array)(this.indices)
        };
    }

    normalize(vertices) {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;

            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }

        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const cz = (minZ + maxZ) / 2;

        const scale = 1 / Math.max(
            maxX - minX,
            maxY - minY,
            maxZ - minZ,
            1e-6
        );

        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i]     = (vertices[i]     - cx) * scale;
            vertices[i + 1] = (vertices[i + 1] - cy) * scale;
            vertices[i + 2] = (vertices[i + 2] - cz) * scale;
        }
    }

    generateNormals(flip = false) {
        this.normals = new Array(this.vertices.length).fill(0);

        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i] * 3;
            const i1 = this.indices[i + 1] * 3;
            const i2 = this.indices[i + 2] * 3;

            const v0x = this.vertices[i0];
            const v0y = this.vertices[i0 + 1];
            const v0z = this.vertices[i0 + 2];

            const v1x = this.vertices[i1];
            const v1y = this.vertices[i1 + 1];
            const v1z = this.vertices[i1 + 2];

            const v2x = this.vertices[i2];
            const v2y = this.vertices[i2 + 1];
            const v2z = this.vertices[i2 + 2];

            const edge1x = v1x - v0x;
            const edge1y = v1y - v0y;
            const edge1z = v1z - v0z;

            const edge2x = v2x - v0x;
            const edge2y = v2y - v0y;
            const edge2z = v2z - v0z;

            let nx = edge1y * edge2z - edge1z * edge2y;
            let ny = edge1z * edge2x - edge1x * edge2z;
            let nz = edge1x * edge2y - edge1y * edge2x;

            if (flip) {
                nx = -nx;
                ny = -ny;
                nz = -nz;
            }

            this.normals[i0]     += nx;
            this.normals[i0 + 1] += ny;
            this.normals[i0 + 2] += nz;

            this.normals[i1]     += nx;
            this.normals[i1 + 1] += ny;
            this.normals[i1 + 2] += nz;

            this.normals[i2]     += nx;
            this.normals[i2 + 1] += ny;
            this.normals[i2 + 2] += nz;
        }

        // normalização
        for (let i = 0; i < this.normals.length; i += 3) {
            const x = this.normals[i];
            const y = this.normals[i + 1];
            const z = this.normals[i + 2];

            const len = Math.hypot(x, y, z) || 1;

            this.normals[i]     = x / len;
            this.normals[i + 1] = y / len;
            this.normals[i + 2] = z / len;
        }
    }
}