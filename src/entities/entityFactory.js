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
                boxSize: [15.0, 20.0, 10.0]
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
            },
            "quadro": {
                name:"Quadro",
                objPath: "assets/models/fancy_picture_frame_01_1k.obj",
                color: [1.0, 0.0, 0.0, 1.0],
                scale: 10.0,
                boxSize: [10.0, 10.0, 10.0]
            },
            "lamparina": {
                nome:"Lamparina",
                objPath: "assets/models/Lantern_01_1k.obj",
                texPath: "assets/textures/Lantern_01_brass_diff_1k.jpg",
                flipY: false,
                scale: 5.0,
                boxSize: null,
                isLightSource: true
            },
            "sofa": {
                nome:"Sofa",
                objPath: "assets/models/couch.obj",
                texPath: "assets/textures/couch_fabric.jpg",
                flipY: false,
                scale: 40.0,
                boxSize: [40.0, 20.0, 10.0]
            },
            "armario": {
                nome:"Armario",
                objPath: "assets/models/armario.obj",
                texPath: "assets/textures/wood_table_diff_4k.jpg",
                flipY: false,
                scale: 40.0,
                boxSize: [25.0, 20.0, 10.0]
            },
            "livros": {
                nome:"Livros",
                objPath: "assets/models/books.obj",
                color: [0.5, 0.5, 0.5, 1.0],
                scale: 25.0,
                boxSize: null
            },
            "livros_1": {
                nome:"Livros_1",
                objPath: "assets/models/books_1.obj",
                color: [0.1, 0.4, 0.9, 1.0],
                scale: 20.0,
                boxSize: null
            },
            "papeis": {
                nome:"Papeis",
                objPath: "assets/models/paper_debris_1_002.obj",
                texPath: "assets/textures/paper_debris_1_001_d.png",
                flipY: false,
                scale: 12.0,
                boxSize: null
            },
            "papeis_1": {
                nome:"Papeis",
                objPath: "assets/models/paper_debris_1_003.obj",
                texPath: "assets/textures/paper_debris_1_001_d.png",
                flipY: false,
                scale: 12.0,
                boxSize: null
            },
            "papeis_2": {
                nome:"Papeis",
                objPath: "assets/models/paper_debris_1_001.obj",
                texPath: "assets/textures/paper_debris_1_001_d.png",
                flipY: false,
                scale: 12.0,
                boxSize: null
            },
            "mesa": {
                nome:"mesa",
                objPath: "assets/models/mesa.obj",
                texPath: "assets/textures/wood_table_diff_4k.jpg",
                flipY: false,
                scale: 30.0,
                boxSize: [25.0, 20.0, 10.0]
            },
            "janela_block": {
                nome:"Madeira na janela",
                objPath: "assets/models/windows_block.obj",
                texPath: "assets/textures/wood_table_diff_4k.jpg",
                flipY: false,
                scale: 35.0,
                boxSize: [3.0, 20.0, 10.0]
            },
            "mesa_jantar": {
                nome:"Mesa de Jantar",
                objPath: "assets/models/mesa_jantar.obj",
                texPath: "assets/textures/mesa_jantar.jpg",
                scale: 50.0,
                boxSize: [3.0, 20.0, 10.0]
            },
            "fogao": {
                nome:"Fogao",
                objPath: "assets/models/CastIronStove_pieces.obj",
                texPath: "assets/textures/CastIronStoveTex.png",
                scale: 40.0,
                boxSize: [3.0, 20.0, 10.0]
            },
            "porta": {
                name:"Porta",
                objPath: "assets/models/door.obj",
                color: [1.0, 1.0, 0.8, 1.0],
                scale: 35.0,
                boxSize: [5.0, 20.0, 5.0]
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
        
        let texture = null;
        if (bp.texPath) {
            texture = await this.textureLoader.load(bp.texPath, { 
                flipY: bp.flipY !== undefined ? bp.flipY : true 
            });
        }
        
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
        // Pega nos dados visuais da entidade
        const drawData = entity.getDrawData();
        
        // Se o blueprint tiver uma cor sólida, injetamos a cor nos dados de desenho!
        if (bp.color) {
            drawData.color = bp.color;
        }

        drawData.id = id;

        if (bp.isLightSource) {
            drawData.isLightSource = true;
        }

        this.sceneObjects.push(drawData);
        
        if (this.collisionSystem && entity.boxSize) {
            this.collisionSystem.addBox(entity.position, entity.boxSize);
        }

        return entity;
    }
}