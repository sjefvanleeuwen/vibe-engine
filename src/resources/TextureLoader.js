export class TextureLoader {
    constructor() {
        this.device = null;
        this.textureCache = new Map();
    }
    
    setDevice(device) {
        if (!device) {
            console.error("Attempted to set null device in TextureLoader");
            return;
        }
        this.device = device;
        console.log("Device successfully set in TextureLoader");
    }
    
    async loadTexture(url) {
        // Check cache first
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url);
        }
        
        if (!this.device) {
            throw new Error("Device not set in TextureLoader");
        }
        
        console.log(`Loading texture from ${url}`);
        
        try {
            // Load the image
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load texture from ${url}: ${response.statusText}`);
            }
            
            const imageBlob = await response.blob();
            const imageBitmap = await createImageBitmap(imageBlob);
            
            console.log(`Created image bitmap: ${imageBitmap.width}x${imageBitmap.height}`);
            
            // Create the texture
            const texture = this.device.createTexture({
                label: `Texture: ${url}`,
                size: [imageBitmap.width, imageBitmap.height, 1],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            
            // Copy image data to texture
            this.device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: texture },
                [imageBitmap.width, imageBitmap.height]
            );
            
            console.log(`Texture loaded and copied to GPU: ${url}`);
            
            // Cache and return the texture
            this.textureCache.set(url, texture);
            return texture;
        } catch (error) {
            console.error(`Error loading texture ${url}:`, error);
            throw error;
        }
    }
}
