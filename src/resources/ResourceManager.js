import { ModelLoader } from './ModelLoader.js';
import { TextureLoader } from './TextureLoader.js';

export class ResourceManager {
    constructor() {
        this.modelLoader = new ModelLoader();
        this.textureLoader = new TextureLoader();
        this.resources = new Map();
        this.device = null;
    }
    
    async loadModel(url) {
        if (this.resources.has(url)) {
            return this.resources.get(url);
        }
        
        const model = await this.modelLoader.loadObj(url);
        this.resources.set(url, model);
        return model;
    }
    
    async loadModelWithTexture(url) {
        if (this.resources.has(url + "_with_texture")) {
            return this.resources.get(url + "_with_texture");
        }
        
        const modelData = await this.modelLoader.loadObjWithMtl(url);
        this.resources.set(url + "_with_texture", modelData);
        return modelData;
    }
    
    async loadTexture(url) {
        if (!this.device) {
            throw new Error("Device not set in ResourceManager. Call setDevice() before loading textures.");
        }
        
        if (this.resources.has(url)) {
            return this.resources.get(url);
        }
        
        const texture = await this.textureLoader.loadTexture(url);
        this.resources.set(url, texture);
        return texture;
    }
    
    setDevice(device) {
        this.device = device;
        this.textureLoader.setDevice(device);
    }
    
    getResource(url) {
        return this.resources.get(url);
    }
    
    update(deltaTime) {
        // Resource updates, if needed
        return true;
    }
}
