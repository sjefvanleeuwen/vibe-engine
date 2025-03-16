import { createRotationMatrix, createProjectionMatrix, multiplyMatrices } from '../math/Matrix4.js';
import { ResourceManager } from '../resources/ResourceManager.js';

export class Renderer {
    constructor() {
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.vertexBuffer = null;
        this.uniformBuffer = null;
        this.uniformBindGroup = null;
        this.rotation = 0;
        this.width = 0;
        this.height = 0;
        
        // Initialize ResourceManager in the constructor
        this.resourceManager = new ResourceManager();
    }
    
    async initialize(canvas) {
        // 1. Get WebGPU adapter and device
        if (!navigator.gpu) {
            throw new Error("WebGPU not supported on this browser.");
        }
        
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No appropriate GPU adapter found.");
        }
        
        this.device = await adapter.requestDevice();
        
        // Pass device to ResourceManager immediately after creation
        this.resourceManager.setDevice(this.device);
        
        // 2. Configure the canvas
        this.context = canvas.getContext('webgpu');
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.configureContext(canvasFormat);
        
        // 3. Create shader module
        const shaderModule = this.device.createShaderModule({
            label: 'Basic shader',
            code: this.getShaderCode()
        });
        
        // 3. Create shader module for textured objects
        const texturedShaderModule = this.device.createShaderModule({
            label: 'Textured shader',
            code: this.getTexturedShaderCode()
        });
        
        // 4. Create uniform buffer for transformation
        this.uniformBuffer = this.device.createBuffer({
            label: 'Rotation matrix uniform buffer',
            size: 4 * 16, // 4x4 matrix of 32-bit floats
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        // 5. Create bind group layout and bind group
        const bindGroupLayout = this.device.createBindGroupLayout({
            label: 'Bind group layout',
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: { type: 'uniform' }
            }]
        });
        
        this.uniformBindGroup = this.device.createBindGroup({
            label: 'Uniform bind group',
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer }
            }]
        });
        
        // 5. Create texture sampler
        this.sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
        });
        
        // 6. Create render pipeline
        this.pipeline = this.device.createRenderPipeline({
            label: 'Basic render pipeline',
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
                            offset: 3 * 4, // 3 floats * 4 bytes
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
                topology: 'triangle-list'
            }
        });
        
        // 6. Create pipeline with texture support
        const bindGroupLayoutWithTexture = this.device.createBindGroupLayout({
            label: 'Bind group layout with texture',
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                }
            ]
        });
        
        this.pipelineWithTexture = this.device.createRenderPipeline({
            label: 'Textured render pipeline',
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayoutWithTexture]
            }),
            vertex: {
                module: texturedShaderModule,
                entryPoint: 'vertexMain',
                buffers: [{
                    arrayStride: 5 * 4, // 5 floats (3 for position, 2 for texture coords), 4 bytes each
                    attributes: [
                        {
                            // Position (x, y, z)
                            format: 'float32x3',
                            offset: 0,
                            shaderLocation: 0
                        },
                        {
                            // Texture coords (u, v)
                            format: 'float32x2',
                            offset: 3 * 4, // 3 floats * 4 bytes
                            shaderLocation: 1
                        }
                    ]
                }]
            },
            fragment: {
                module: texturedShaderModule,
                entryPoint: 'fragmentMain',
                targets: [{
                    format: canvasFormat
                }]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });
        
        // 7. Load vertex buffer from OBJ file
        try {
            // Load model data from OBJ file - the ResourceManager is now properly initialized
            const modelUrl = './models/square.obj';
            const modelData = await this.resourceManager.loadModel(modelUrl);
            
            this.vertexBuffer = this.device.createBuffer({
                label: 'Vertex buffer',
                size: modelData.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            
            this.device.queue.writeBuffer(this.vertexBuffer, 0, modelData);
            this.vertexCount = modelData.length / 6; // 6 values per vertex (3 pos + 3 color)
            
            console.log(`Loaded model from ${modelUrl} with ${this.vertexCount} vertices`);
        } catch (error) {
            console.error("Error loading model:", error);
            
            // Fallback to a hardcoded square if loading fails
            console.log("Using fallback geometry");
            const fallbackData = new Float32Array([
                // Position (XYZ), Color (RGB)
                -0.5,  0.5, 0.0,   1.0, 0.0, 0.0,  // top left, red
                -0.5, -0.5, 0.0,   0.0, 1.0, 0.0,  // bottom left, green
                 0.5, -0.5, 0.0,   0.0, 0.0, 1.0,  // bottom right, blue
                
                -0.5,  0.5, 0.0,   1.0, 0.0, 0.0,  // top left, red
                 0.5, -0.5, 0.0,   0.0, 0.0, 1.0,  // bottom right, blue
                 0.5,  0.5, 0.0,   1.0, 1.0, 0.0   // top right, yellow
            ]);
            
            this.vertexBuffer = this.device.createBuffer({
                label: 'Vertex buffer',
                size: fallbackData.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            
            this.device.queue.writeBuffer(this.vertexBuffer, 0, fallbackData);
            this.vertexCount = 6;
        }
        
        // 7. Load model and texture from OBJ/MTL files
        try {
            // Load the model with texture info
            const modelUrl = './models/square.obj';
            const modelData = await this.resourceManager.loadModelWithTexture(modelUrl);
            
            // Store the model data and texture info
            this.vertexBuffer = this.device.createBuffer({
                label: 'Vertex buffer',
                size: modelData.vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            
            this.device.queue.writeBuffer(this.vertexBuffer, 0, modelData.vertices);
            this.vertexCount = modelData.vertexCount;
            
            // Load the texture if provided
            if (modelData.texturePath) {
                // Load the texture and create a bind group
                const texture = await this.resourceManager.loadTexture(modelData.texturePath);
                
                // Create bind group for texture
                this.textureBindGroup = this.device.createBindGroup({
                    label: 'Texture bind group',
                    layout: bindGroupLayoutWithTexture,
                    entries: [
                        {
                            binding: 0,
                            resource: { buffer: this.uniformBuffer }
                        },
                        {
                            binding: 1,
                            resource: this.sampler
                        },
                        {
                            binding: 2,
                            resource: texture.createView()
                        }
                    ]
                });
                
                console.log(`Loaded texture: ${modelData.texturePath}`);
                this.hasTexture = true;
            } else {
                this.hasTexture = false;
            }
            
            console.log(`Loaded model from ${modelUrl} with ${this.vertexCount} vertices`);
        } catch (error) {
            console.error("Error loading model or texture:", error);
            // Fallback to default square with no texture
            console.log("Using fallback geometry");
            const fallbackData = new Float32Array([
                // Position (XYZ), Color (RGB)
                -0.5,  0.5, 0.0,   1.0, 0.0, 0.0,  // top left, red
                -0.5, -0.5, 0.0,   0.0, 1.0, 0.0,  // bottom left, green
                 0.5, -0.5, 0.0,   0.0, 0.0, 1.0,  // bottom right, blue
                
                -0.5,  0.5, 0.0,   1.0, 0.0, 0.0,  // top left, red
                 0.5, -0.5, 0.0,   0.0, 0.0, 1.0,  // bottom right, blue
                 0.5,  0.5, 0.0,   1.0, 1.0, 0.0   // top right, yellow
            ]);
            
            this.vertexBuffer = this.device.createBuffer({
                label: 'Vertex buffer',
                size: fallbackData.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            
            this.device.queue.writeBuffer(this.vertexBuffer, 0, fallbackData);
            this.vertexCount = 6;
        }
    }
    
    getShaderCode() {
        return `
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
                return vec4f(color, 1.0);  // This uses the interpolated vertex colors
            }
        `;
    }
    
    getTexturedShaderCode() {
        return `
            struct Uniforms {
                transform: mat4x4f
            };
            
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;
            @group(0) @binding(1) var texSampler: sampler;
            @group(0) @binding(2) var tex: texture_2d<f32>;
            
            struct VertexInput {
                @location(0) position: vec3f,
                @location(1) texcoord: vec2f,
            }
            
            struct VertexOutput {
                @builtin(position) position: vec4f,
                @location(0) texcoord: vec2f,
            }
            
            @vertex
            fn vertexMain(input: VertexInput) -> VertexOutput {
                var output: VertexOutput;
                output.position = uniforms.transform * vec4f(input.position, 1.0);
                output.texcoord = input.texcoord;
                return output;
            }
            
            @fragment
            fn fragmentMain(@location(0) texcoord: vec2f) -> @location(0) vec4f {
                return textureSample(tex, texSampler, texcoord);
            }
        `;
    }
    
    configureContext(canvasFormat) {
        this.context.configure({
            device: this.device,
            format: canvasFormat,
            alphaMode: 'opaque'
        });
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        if (this.context && this.device) {
            const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
            this.configureContext(canvasFormat);
            this.updateTransformMatrix();
        }
    }
    
    updateTransformMatrix() {
        if (!this.device || !this.uniformBuffer) return;
        
        // Calculate aspect ratio
        const aspectRatio = (this.height > 0) ? this.width / this.height : 1;
        
        // Create rotation matrix
        const rotationMatrix = createRotationMatrix(this.rotation);
        
        // Create projection matrix that preserves aspect ratio
        const projectionMatrix = createProjectionMatrix(aspectRatio);
        
        // Combine matrices (projection * rotation)
        const matrix = multiplyMatrices(projectionMatrix, rotationMatrix);
        
        // Update uniform buffer
        this.device.queue.writeBuffer(this.uniformBuffer, 0, matrix);
    }
    
    update(deltaTime) {
        // Update rotation (45 degrees per second)
        this.rotation += deltaTime * 0.785;
        
        // Update matrix with rotation and projection
        this.updateTransformMatrix();
    }
    
    render() {
        if (!this.hasTexture && (!this.pipeline || !this.vertexBuffer || !this.uniformBindGroup)) {
            return;
        }
        
        if (this.hasTexture && (!this.pipelineWithTexture || !this.vertexBuffer || !this.textureBindGroup)) {
            return;
        }
        
        // Create command encoder
        const commandEncoder = this.device.createCommandEncoder();
        
        // Begin render pass
        const renderPassDescriptor = {
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 },
                storeOp: 'store'
            }]
        };
        
        const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
        
        if (this.hasTexture) {
            // Render with texture
            renderPass.setPipeline(this.pipelineWithTexture);
            renderPass.setBindGroup(0, this.textureBindGroup);
        } else {
            // Render with colors
            renderPass.setPipeline(this.pipeline);
            renderPass.setBindGroup(0, this.uniformBindGroup);
        }
        
        renderPass.setVertexBuffer(0, this.vertexBuffer);
        renderPass.setViewport(0, 0, this.width, this.height, 0, 1);
        renderPass.draw(this.vertexCount);
        renderPass.end();
        
        // Submit command buffer
        this.device.queue.submit([commandEncoder.finish()]);
    }
}
