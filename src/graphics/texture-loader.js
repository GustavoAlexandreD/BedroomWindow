export class TextureLoader {
    constructor(gl) {
        this.gl = gl;
        this.cache = new Map();
    }

    /**
     * Carrega uma textura 2D e armazena em cache por URL.
     */
    async load(url, options = {}) {
        const {
            flipY = true,
            wrapS = this.gl.REPEAT,
            wrapT = this.gl.REPEAT,
            minFilter = this.gl.LINEAR_MIPMAP_LINEAR,
            magFilter = this.gl.LINEAR
        } = options;

        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Pixel temporário para evitar warnings antes do carregamento da imagem.
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array([255, 255, 255, 255])
        );

        const image = await this._loadImage(url);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            image
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapS);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        this.cache.set(url, texture);
        return texture;
    }

    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Falha ao carregar textura: ${url}`));
            image.src = url;
        });
    }

    destroy(texture = null) {
        if (texture) {
            this.gl.deleteTexture(texture);
            return;
        }

        for (const cachedTexture of this.cache.values()) {
            this.gl.deleteTexture(cachedTexture);
        }
        this.cache.clear();
    }
}
