import { Furniture } from "./furniture.js";
import { OBJLoader } from "../models/obj-loader.js";
import { TextureLoader } from "../graphics/texture-loader.js";
import { createRenderable } from "../graphics/renderer.js";

export class EntityFactory {
    constructor(gl, entityManager, sceneObjects, collisionSystem) {
        this.gl = gl;
        this.entityManager = entityManager;
        this.sceneObjects = sceneObjects;
        this.collisionSystem = collisionSystem;

        this.textureLoader = new TextureLoader(gl);
        this.assetCache = {};

        // Todos os caminhos de arquivos ficam aqui
        this.blueprints = {
            "mesa_cabeceira": {
                name: "Mesa de Cabeceira",
                objPath: "assets/models/mesa_cabeceira.obj",
                texPath: "assets/textures/wood_table_diff_4k.jpg",
                scale: 20.0,
                boxSize: [15.0, 20.0, 15.0]
            },
            "cama": {
                name: "Cama",
                objPath: "assets/models/cama.obj",
                texPath: "assets/textures/wood_table_diff_4k.jpg", 
                scale: 30.0,
                boxSize: [40.0, 15.0, 80.0]
            },
            "gato": {
                name: "Gato",
                objPath: "assets/models/fake_gato.obj",
                texPath: "assets/textures/wood_table_disp_4k.png",
                scale: 5.0,
                boxSize: [5.0, 5.0, 5.0]
            }
            // Adicione os monstros aqui seguindo o mesmo padrão
        };
    }

    // Apenas faz o download e guarda no Cache. Não coloca no mapa
    async loadBlueprint(type) {
        if (this.assetCache[type]) return this.assetCache[type];

        const bp = this.blueprints[type];
        if (!bp) throw new Error(`Blueprint "${type}" não encontrado!`);

        const loaderLocal = new OBJLoader();
        const rawData = await loaderLocal.load(bp.objPath);
        
        const texture = await this.textureLoader.load(bp.texPath);
        
        const geom = {
            data: {
                position: rawData.vertices,
                normal: rawData.normals,
                texcoord: rawData.uvs,
                indices: rawData.indices
            }
        };

        this.assetCache[type] = {
            renderable: createRenderable(this.gl, geom),
            texture: texture
        };

        return this.assetCache[type];
    }


     // Percorre o dicionário e carrega absolutamente tudo de uma vez.
    async preloadAll() {
        console.log("Iniciando carregamento de todos os assets 3D...");
        const promises = Object.keys(this.blueprints).map(type => this.loadBlueprint(type));
        await Promise.all(promises);
        console.log("Todos os assets foram carregados na Placa de Vídeo!");
    }

    async createFurniture(type, position) {
        const assets = await this.loadBlueprint(type); 
        const bp = this.blueprints[type];
        const id = `${type}-${Date.now()}`;
        
        const furniture = new Furniture(
            id, bp.name, position, 
            assets.renderable, assets.texture, 
            bp.scale, bp.boxSize
        );

        this.entityManager.entities.push(furniture);
        this.sceneObjects.push(furniture.getDrawData());
        
        if (this.collisionSystem && furniture.boxSize) {
            this.collisionSystem.addBox(furniture.position, furniture.boxSize);
        }

        return furniture;
    }
}