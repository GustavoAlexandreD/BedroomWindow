export class WebGLContext {
    constructor(canvas, options = {}) {
        this.canvas = canvas;

        this.options = {
            antialias: true,
            alpha: false,
            depth: true,
            stencil: false,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            ...options
        };

        this.gl = this._initContext();
        this.isWebGL2 = (this.gl instanceof WebGL2RenderingContext);

        this.extensions = this._loadExtensions();

        this._initGLState();
        this._setupResizeObserver();
    }

    // =========================
    // INIT
    // =========================

    _initContext() {
        let gl = this.canvas.getContext("webgl2", this.options);

        if (!gl) {
            console.warn("WebGL2 não suportado, usando WebGL1...");
            gl = this.canvas.getContext("webgl", this.options) ||
                 this.canvas.getContext("experimental-webgl", this.options);
        }

        if (!gl) {
            throw new Error("WebGL não suportado neste navegador.");
        }

        return gl;
    }

    _loadExtensions() {
        const gl = this.gl;

        const extensions = {
            vao: null,
            instancing: null,
            uint32: null
        };

        if (this.isWebGL2) {
            extensions.vao = true;
            extensions.instancing = true;
            extensions.uint32 = true;
        } else {
            extensions.vao = gl.getExtension("OES_vertex_array_object");
            extensions.instancing = gl.getExtension("ANGLE_instanced_arrays");
            extensions.uint32 = gl.getExtension("OES_element_index_uint");
        }

        return extensions;
    }

    _initGLState() {
        const gl = this.gl;

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.frontFace(gl.CCW);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    _setupResizeObserver() {
        const resize = () => this.resize();

        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(resize);
            this.resizeObserver.observe(this.canvas);
        } else {
            window.addEventListener("resize", resize);
        }

        this.resize();
    }

    // =========================
    // RESIZE
    // =========================

    resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;

            this.gl.viewport(0, 0, width, height);
        }
    }

    // =========================
    // CLEAR / FRAME
    // =========================

    clear(r = 0, g = 0, b = 0, a = 1) {
        const gl = this.gl;

        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    // =========================
    // UTILITÁRIOS
    // =========================

    createBuffer(data, target = this.gl.ARRAY_BUFFER, usage = this.gl.STATIC_DRAW) {
        const gl = this.gl;

        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, usage);

        return buffer;
    }

    createVertexArray() {
        const gl = this.gl;

        if (this.isWebGL2) {
            return gl.createVertexArray();
        }

        if (this.extensions.vao) {
            return this.extensions.vao.createVertexArrayOES();
        }

        return null;
    }

    bindVertexArray(vao) {
        const gl = this.gl;

        if (this.isWebGL2) {
            gl.bindVertexArray(vao);
        } else if (this.extensions.vao) {
            this.extensions.vao.bindVertexArrayOES(vao);
        }
    }

    drawIndexed(mode, count, type = null) {
        const gl = this.gl;

        if (!type) {
            type = this.extensions.uint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        }

        gl.drawElements(mode, count, type, 0);
    }

    // =========================
    // DEBUG
    // =========================

    checkError(label = "") {
        const gl = this.gl;
        const err = gl.getError();

        if (err !== gl.NO_ERROR) {
            console.error(`WebGL Error (${label}):`, err);
        }
    }

    getInfo() {
        const gl = this.gl;

        return {
            version: gl.getParameter(gl.VERSION),
            renderer: gl.getParameter(gl.RENDERER),
            vendor: gl.getParameter(gl.VENDOR),
            shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            webgl2: this.isWebGL2
        };
    }

    // =========================
    // DESTROY
    // =========================

    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}