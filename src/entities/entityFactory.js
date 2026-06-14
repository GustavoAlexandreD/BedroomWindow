import { Furniture } from "./furniture.js";
import { OBJLoader } from "../models/obj-loader.js";
import { TextureLoader } from "../graphics/texture-loader.js";
import { createRenderable } from "../graphics/renderer.js";
import { Cat } from "./cat.js";

export class EntityFactory {
    constructor(gl, entityManager, audioManager, sceneObjects, collisionSystem) {
        this.gl = gl;
        this.entityManager = entityManager;
        this.audioManager = audioManager;
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
                objPath: "assets/models/GothicBed_01_1k.obj",
                texPath: "assets/textures/gothic_bed_ready.jpg",
                flipY: false,
                scale: 30.0,
                boxSize: [20.0, 15.0, 40.0]
            },
            "gato": {
                name: "Gato low poly",
                objPath: "assets/models/cat.obj",
                texPath: "assets/textures/cat_free.png",
                flipY: false,
                scale: 5.0,
                boxSize: [5.0, 5.0, 5.0]
            },
            "relogio": {
                name:"Relogio",
                objPath: "assets/models/vintage_grandfather_clock_01_1k.obj",
                texPath: "assets/textures/vintage_grandfather_clock_01_diff_1k.jpg",
                flipY: false,
                scale: 30.0,
                boxSize: [15.0, 20.0, 15.0]
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
        
        const texture = await this.textureLoader.load(bp.texPath, { 
            flipY: bp.flipY !== undefined ? bp.flipY : true 
        });
        
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
        let entity = null;
        if (type == "gato") {
            entity = new Cat (
                id, bp.name, position, 
                assets.renderable, assets.texture, this.audioManager,
                bp.scale, bp.boxSize
            )
        } else {
            entity = new Furniture(
                id, bp.name, position, 
                assets.renderable, assets.texture, 
                bp.scale, bp.boxSize
            );
        }

        this.entityManager.entities.push(entity);
        this.sceneObjects.push(entity.getDrawData());
        
        if (this.collisionSystem && entity.boxSize) {
            this.collisionSystem.addBox(entity.position, entity.boxSize);
        }

        return entity;
    }
}