export class ShaderManager {
    constructor(device) {
        this.device = device;
        this.shaderCache = new Map();
    }

    async loadBasicShader() {
        // Simple shader with colored vertices
        const shaderCode = `
            struct Uniforms {
                transform: mat4x4f
            };
            
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;
            
            struct VertexInput {
                @location(0) position: vec3f,
                @location(1) color: vec3f,
            }
            
            struct VertexOutput {
                @builtin(position) position: vec4f,
                @location(0) color: vec3f,
            }
            
            @vertex
            fn vertexMain(input: VertexInput) -> VertexOutput {
                var output: VertexOutput;
                output.position = uniforms.transform * vec4f(input.position, 1.0);
                output.color = input.color;
                return output;
            }
            
            @fragment
            fn fragmentMain(@location(0) color: vec3f) -> @location(0) vec4f {
                return vec4f(color, 1.0);
            }
        `;
        
        const shaderModule = this.device.createShaderModule({
            label: 'Basic shader',
            code: shaderCode
        });
        
        return shaderModule;
    }
    
    async loadShader(name, code) {
        // Check if shader is already in cache
        if (this.shaderCache.has(name)) {
            return this.shaderCache.get(name);
        }
        
        // Create and cache new shader
        const shaderModule = this.device.createShaderModule({
            label: name,
            code: code
        });
        
        this.shaderCache.set(name, shaderModule);
        return shaderModule;
    }
    
    async loadShaderFromURL(name, url) {
        // Check if shader is already in cache
        if (this.shaderCache.has(name)) {
            return this.shaderCache.get(name);
        }
        
        // Load shader from URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load shader from ${url}: ${response.statusText}`);
        }
        
        const code = await response.text();
        return this.loadShader(name, code);
    }
}
