export class ShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.uniforms = {};
        this.attributes = {};
    }

    createDefaultProgram() {
        const vertexSource = `
            attribute vec3 aPosition;
            attribute vec3 aNormal;
            attribute vec2 aUV;

            uniform mat4 uModel;
            uniform mat4 uView;
            uniform mat4 uProjection;
            uniform mat4 uNormalMatrix;

            varying vec3 vWorldPos;
            varying vec3 vNormal;
            varying vec2 vUV;

            void main() {
                vec4 worldPos = uModel * vec4(aPosition, 1.0);
                vWorldPos = worldPos.xyz;
                vNormal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
                vUV = aUV;
                gl_Position = uProjection * uView * worldPos;
            }
        `;

        const fragmentSource = `
            precision mediump float;

            varying vec3 vWorldPos;
            varying vec3 vNormal;
            varying vec2 vUV;

            uniform vec3 uCameraPos;
            uniform vec3 uLightPos;
            uniform vec3 uLightColor;
            uniform vec3 uAmbientColor;
            uniform vec3 uSpecularColor;
            uniform float uShininess;

            uniform bool uUseTexture;
            uniform sampler2D uTexture;
            uniform vec4 uSolidColor;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(uLightPos - vWorldPos);
                vec3 viewDir = normalize(uCameraPos - vWorldPos);
                vec3 reflectDir = reflect(-lightDir, normal);

                float diff = max(dot(normal, lightDir), 0.0);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);

                vec4 albedo = uUseTexture ? texture2D(uTexture, vUV) : uSolidColor;
                vec3 ambient = uAmbientColor * albedo.rgb;
                vec3 diffuse = diff * uLightColor * albedo.rgb;
                vec3 specular = spec * uSpecularColor * uLightColor;
                vec3 color = ambient + diffuse + specular;

                gl_FragColor = vec4(color, albedo.a);
            }
        `;

        this.program = this.createProgram(vertexSource, fragmentSource);
        this._cacheLocations();
        return this.program;
    }

    createProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const vertexShader = this._compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            throw new Error(`Erro ao linkar shader program: ${error}`);
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return program;
    }

    _compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Erro ao compilar shader: ${error}`);
        }

        return shader;
    }

    _cacheLocations() {
        const gl = this.gl;
        const p = this.program;

        this.attributes.aPosition = gl.getAttribLocation(p, "aPosition");
        this.attributes.aNormal = gl.getAttribLocation(p, "aNormal");
        this.attributes.aUV = gl.getAttribLocation(p, "aUV");

        this.uniforms.uModel = gl.getUniformLocation(p, "uModel");
        this.uniforms.uView = gl.getUniformLocation(p, "uView");
        this.uniforms.uProjection = gl.getUniformLocation(p, "uProjection");
        this.uniforms.uNormalMatrix = gl.getUniformLocation(p, "uNormalMatrix");
        this.uniforms.uCameraPos = gl.getUniformLocation(p, "uCameraPos");
        this.uniforms.uLightPos = gl.getUniformLocation(p, "uLightPos");
        this.uniforms.uLightColor = gl.getUniformLocation(p, "uLightColor");
        this.uniforms.uAmbientColor = gl.getUniformLocation(p, "uAmbientColor");
        this.uniforms.uSpecularColor = gl.getUniformLocation(p, "uSpecularColor");
        this.uniforms.uShininess = gl.getUniformLocation(p, "uShininess");
        this.uniforms.uUseTexture = gl.getUniformLocation(p, "uUseTexture");
        this.uniforms.uTexture = gl.getUniformLocation(p, "uTexture");
        this.uniforms.uSolidColor = gl.getUniformLocation(p, "uSolidColor");
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setMatrices({ model, view, projection, normalMatrix }) {
        const gl = this.gl;
        gl.uniformMatrix4fv(this.uniforms.uModel, false, model);
        gl.uniformMatrix4fv(this.uniforms.uView, false, view);
        gl.uniformMatrix4fv(this.uniforms.uProjection, false, projection);
        gl.uniformMatrix4fv(this.uniforms.uNormalMatrix, false, normalMatrix);
    }

    setCameraPosition(position) {
        this.gl.uniform3fv(this.uniforms.uCameraPos, position);
    }

    setMaterial({
        useTexture = false,
        solidColor = [1, 1, 1, 1],
        shininess = 32.0
    } = {}) {
        const gl = this.gl;
        gl.uniform1i(this.uniforms.uUseTexture, useTexture ? 1 : 0);
        gl.uniform4fv(this.uniforms.uSolidColor, solidColor);
        gl.uniform1f(this.uniforms.uShininess, shininess);
    }

    setTexture(texture, unit = 0) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.uniforms.uTexture, unit);
    }

    setPhongLight({
        position = [2, 2, 2],
        lightColor = [1, 1, 1],
        ambientColor = [0.15, 0.15, 0.15],
        specularColor = [1, 1, 1]
    } = {}) {
        const gl = this.gl;
        gl.uniform3fv(this.uniforms.uLightPos, position);
        gl.uniform3fv(this.uniforms.uLightColor, lightColor);
        gl.uniform3fv(this.uniforms.uAmbientColor, ambientColor);
        gl.uniform3fv(this.uniforms.uSpecularColor, specularColor);
    }

    /**
     * Luz móvel orbital para cumprir requisito de luz em movimento.
     * Use no loop: shader.setPhongLight({ position: shader.getAnimatedLightPosition(t) })
     */
    getAnimatedLightPosition(timeSeconds, radius = 3, height = 2) {
        return [
            Math.cos(timeSeconds) * radius,
            height + Math.sin(timeSeconds * 0.7) * 0.4,
            Math.sin(timeSeconds) * radius
        ];
    }
}
