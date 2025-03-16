export class PipelineFactory {
    constructor(device) {
        this.device = device;
        this.pipelineCache = new Map();
    }
    
    createBasicPipeline(shaderModule, canvasFormat, bindGroupLayout) {
        // Make sure we have a correct pipeline configuration
        console.log("Creating pipeline with format:", canvasFormat);
        
        return this.device.createRenderPipeline({
            label: 'Basic 3D pipeline',
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: 'vertexMain',
                buffers: [{
                    arrayStride: 6 * 4, // 6 floats (3 for position, 3 for color), 4 bytes each
                    attributes: [
                        {
                            // Position (x, y, z)
                            format: 'float32x3',
                            offset: 0,
                            shaderLocation: 0
                        },
                        {
                            // Color (r, g, b)
                            format: 'float32x3',
                            offset: 3 * 4, // Offset after position (3 floats)
                            shaderLocation: 1
                        }
                    ]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragmentMain',
                targets: [{
                    format: canvasFormat
                }]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back'  // Enable back-face culling for 3D
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        });
    }
    
    createCustomPipeline(config) {
        // Check if a matching pipeline already exists in cache
        const key = JSON.stringify(config);
        if (this.pipelineCache.has(key)) {
            return this.pipelineCache.get(key);
        }
        
        // Create new pipeline
        const pipeline = this.device.createRenderPipeline(config);
        
        // Cache it for later reuse
        this.pipelineCache.set(key, pipeline);
        
        return pipeline;
    }
}
