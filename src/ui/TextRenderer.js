export class TextRenderer {
    constructor(engine) {
        this.engine = engine;
        this.device = null; // Will be set during init
        this.context = null; // Will be set during init
        this.texts = [];
        this.textureCache = new Map();
        this.pipeline = null;
        this.initialized = false;
        this.canvasWidthUniform = null;
        this.canvasHeightUniform = null;
        
        // Don't auto-initialize in constructor
        // Wait for explicit init call after engine is ready
    }
    
    async init() {
        // Try multiple times with a delay to ensure WebGPU is ready
        let attempts = 0;
        const maxAttempts = 10; // Increased max attempts
        
        while (!this.initialized && attempts < maxAttempts) {
            attempts++;
            
            // Check if engine is properly initialized
            if (!this.engine) {
                console.error('Engine not available for TextRenderer');
                return false;
            }
            
            // Wait for renderer to be initialized and device to be available
            if (!this.engine.renderer || !this.engine.renderer.device) {
                console.log(`WebGPU device not yet available in renderer - attempt ${attempts}/${maxAttempts}`);
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                } else {
                    console.error('Failed to get WebGPU device after multiple attempts');
                    return false;
                }
            }
            
            // Get device and context from engine's renderer
            this.device = this.engine.renderer.device;
            this.context = this.engine.renderer.context;
            
            // Verify device again just to be sure
            if (!this.device) {
                console.error('WebGPU device still not available after update');
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    continue;
                } else {
                    return false;
                }
            }
            
            try {
                // Create uniform buffer for canvas dimensions
                this.canvasSizeBuffer = this.device.createBuffer({
                    size: 8, // two 32-bit floats
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                });
                
                // Create shader modules
                const shaderModule = this.device.createShaderModule({
                    code: TextRenderer.SHADER_CODE
                });
                
                // Create the render pipeline for text
                this.pipeline = this.device.createRenderPipeline({
                    layout: 'auto',
                    vertex: {
                        module: shaderModule,
                        entryPoint: 'vertexMain',
                        buffers: [{
                            arrayStride: 8 * 4, // position (2 floats) + uv (2 floats) + color (4 floats)
                            attributes: [
                                { shaderLocation: 0, offset: 0, format: 'float32x2' },  // position
                                { shaderLocation: 1, offset: 8, format: 'float32x2' },  // uv
                                { shaderLocation: 2, offset: 16, format: 'float32x4' }, // color
                            ]
                        }]
                    },
                    fragment: {
                        module: shaderModule,
                        entryPoint: 'fragmentMain',
                        targets: [{
                            format: this.context.getCurrentTexture().format,
                            blend: {
                                color: {
                                    srcFactor: 'src-alpha',
                                    dstFactor: 'one-minus-src-alpha',
                                    operation: 'add'
                                },
                                alpha: {
                                    srcFactor: 'one',
                                    dstFactor: 'one-minus-src-alpha',
                                    operation: 'add'
                                }
                            }
                        }]
                    },
                    primitive: {
                        topology: 'triangle-list'
                    },
                    multisample: {
                        count: 1
                    }
                });
                
                // Update canvas dimensions
                this._updateCanvasDimensions();
                
                // Process any text that was added before initialization
                for (const textObj of this.texts) {
                    if (!textObj.vertexBuffer) {
                        this._createTextResources(textObj);
                    }
                }
                
                this.initialized = true;
                console.log('TextRenderer initialized successfully');
                return true;
            } catch (error) {
                console.error('Error initializing TextRenderer:', error);
                if (attempts < maxAttempts) {
                    console.log(`Retrying initialization - attempt ${attempts}/${maxAttempts}`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    return false;
                }
            }
        }
        
        return this.initialized;
    }
    
    _updateCanvasDimensions() {
        if (!this.device || !this.canvasSizeBuffer) return;
        
        const canvasWidth = this.engine.canvas.width || 800;
        const canvasHeight = this.engine.canvas.height || 600;
        
        const dimensions = new Float32Array([canvasWidth, canvasHeight]);
        this.device.queue.writeBuffer(this.canvasSizeBuffer, 0, dimensions);
    }
    
    addText(text, x, y, options = {}) {
        const { 
            fontSize = 16, 
            color = [1.0, 1.0, 1.0, 1.0], 
            fontFamily = 'sans-serif',
            fontWeight = 'normal',
            webFontScaleFactor = 1.0 // New parameter for web font scaling
        } = options;
        
        this.texts.push({
            text,
            position: { x, y },
            fontSize,
            color,
            fontFamily,
            fontWeight,
            webFontScaleFactor, // Store the scale factor
            vertexBuffer: null,
            texture: null,
            bindGroup: null
        });
        
        // Create text texture and resources if initialized
        if (this.initialized) {
            const lastIndex = this.texts.length - 1;
            this._createTextResources(this.texts[lastIndex]);
        }
        
        return this.texts.length - 1;
    }
    
    updateText(id, newText, x, y, options = {}) {
        if (id < 0 || id >= this.texts.length) return;
        
        const textObj = this.texts[id];
        if (newText !== undefined) textObj.text = newText;
        if (x !== undefined) textObj.position.x = x;
        if (y !== undefined) textObj.position.y = y;
        
        if (options.fontSize !== undefined) textObj.fontSize = options.fontSize;
        if (options.color !== undefined) textObj.color = options.color;
        if (options.fontFamily !== undefined) textObj.fontFamily = options.fontFamily;
        if (options.fontWeight !== undefined) textObj.fontWeight = options.fontWeight;
        
        // Recreate text resources
        this._createTextResources(textObj);
    }
    
    _createTextResources(textObj) {
        if (!this.initialized || !this.device) {
            console.warn('Cannot create text resources - TextRenderer not initialized');
            return;
        }
        
        try {
            // Apply device pixel ratio scaling for font size
            const devicePixelRatio = window.devicePixelRatio || 1;
            
            // Apply additional scaling for web fonts - EXTREME scaling for testing
            const webFontScale = textObj.webFontScaleFactor || 1.0;
            const scaledFontSize = textObj.fontSize * devicePixelRatio * webFontScale;
            
            // REALLY make sure we're using the right font
            let fontFamily = textObj.fontFamily;
            if (fontFamily === 'Exo 2') {
                // Force quotes around the font name and add fallback
                fontFamily = '"Exo 2", Arial, sans-serif';
            }
            
            const fontWeight = textObj.fontWeight || 'bold'; // Use bold by default for better visibility
            const fontString = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
            
            console.log(`ATTEMPTING TO RENDER: "${textObj.text}" with: ${fontString}`);
            
            // Create text texture using Canvas API
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Pre-test if font is available
            const testString = 'abcdefghijklmnopqrstuvwxyz';
            const fallbackWidth = ctx.measureText(testString).width;
            
            // Wait a moment and try to set the font
            ctx.font = fontString;
            const actualWidth = ctx.measureText(testString).width;
            
            console.log(`Font test - Fallback width: ${fallbackWidth}, Actual width: ${actualWidth}`);
            console.log(`Font actually using: ${ctx.font}`);
            
            // Get proper metrics
            const metrics = ctx.measureText(textObj.text);
            
            // Get proper font metrics for better positioning
            const fontAscent = metrics.actualBoundingBoxAscent || (scaledFontSize * 0.7);
            const fontDescent = metrics.actualBoundingBoxDescent || (scaledFontSize * 0.3);
            const fontHeight = fontAscent + fontDescent;
            
            // Log font metrics for debugging
            console.log(`Font metrics - width: ${metrics.width}, ascent: ${fontAscent}, descent: ${fontDescent}, total height: ${fontHeight}`);
            
            const width = Math.ceil(metrics.width);
            const height = Math.ceil(fontHeight * 1.2); // Slightly more than needed to avoid clipping
            
            canvas.width = width;
            canvas.height = height;
            
            // Clear and draw text with proper positioning
            ctx.clearRect(0, 0, width, height);
            ctx.font = fontString; // Need to set font again after changing canvas size
            ctx.fillStyle = `rgba(${textObj.color[0] * 255}, ${textObj.color[1] * 255}, ${textObj.color[2] * 255}, ${textObj.color[3]})`;
            ctx.textBaseline = 'top'; // More consistent across fonts
            ctx.fillText(textObj.text, 0, 0);
            
            // Create texture from canvas
            const textureData = ctx.getImageData(0, 0, width, height);
            
            // Cleanup old texture if it exists
            if (textObj.texture) {
                textObj.texture.destroy();
            }
            
            textObj.texture = this.device.createTexture({
                size: [width, height, 1],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            
            this.device.queue.writeTexture(
                { texture: textObj.texture },
                textureData.data,
                { bytesPerRow: width * 4 },
                { width, height }
            );
            
            // Create sampler
            const sampler = this.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear'
            });
            
            // Create bind group with canvas size buffer
            textObj.bindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: sampler },
                    { binding: 1, resource: textObj.texture.createView() },
                    { binding: 2, resource: { buffer: this.canvasSizeBuffer } }
                ]
            });
            
            // Create vertex buffer
            const x = textObj.position.x;
            const y = textObj.position.y;
            const w = width;
            const h = height;
            
            // Get the actual canvas dimensions from the engine
            const canvasWidth = this.engine.canvas.width || 800;
            const canvasHeight = this.engine.canvas.height || 600;
            
            const vertices = new Float32Array([
                // positions   // uvs      // colors
                x,     y,      0, 0,       textObj.color[0], textObj.color[1], textObj.color[2], textObj.color[3],
                x + w, y,      1, 0,       textObj.color[0], textObj.color[1], textObj.color[2], textObj.color[3],
                x,     y + h,  0, 1,       textObj.color[0], textObj.color[1], textObj.color[2], textObj.color[3],
                
                x + w, y,      1, 0,       textObj.color[0], textObj.color[1], textObj.color[2], textObj.color[3],
                x + w, y + h,  1, 1,       textObj.color[0], textObj.color[1], textObj.color[2], textObj.color[3],
                x,     y + h,  0, 1,       textObj.color[0], textObj.color[1], textObj.color[2], textObj.color[3],
            ]);
            
            // Cleanup old vertex buffer if it exists
            if (textObj.vertexBuffer) {
                textObj.vertexBuffer.destroy();
            }
            
            textObj.vertexBuffer = this.device.createBuffer({
                size: vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });
            
            new Float32Array(textObj.vertexBuffer.getMappedRange()).set(vertices);
            textObj.vertexBuffer.unmap();
        } catch (error) {
            console.error('Error creating text resources:', error);
        }
    }
    
    render(renderPass) {
        if (!this.initialized || this.texts.length === 0 || !this.pipeline) {
            return;
        }
        
        try {
            // Update canvas dimensions before rendering
            this._updateCanvasDimensions();
            
            renderPass.setPipeline(this.pipeline);
            
            for (const textObj of this.texts) {
                if (!textObj.bindGroup || !textObj.vertexBuffer) continue;
                
                renderPass.setBindGroup(0, textObj.bindGroup);
                renderPass.setVertexBuffer(0, textObj.vertexBuffer);
                renderPass.draw(6); // 6 vertices for 2 triangles making a quad
            }
        } catch (error) {
            console.error('Error rendering text:', error);
        }
    }
    
    update() {
        // Update method called by engine each frame if needed
    }
    
    // WebGPU shader for text rendering
    static get SHADER_CODE() {
        return `
            struct CanvasSize {
                width: f32,
                height: f32,
            }
            
            @group(0) @binding(2) var<uniform> canvasSize: CanvasSize;
            
            struct VertexInput {
                @location(0) position: vec2f,
                @location(1) uv: vec2f,
                @location(2) color: vec4f,
            };
            
            struct VertexOutput {
                @builtin(position) position: vec4f,
                @location(0) uv: vec2f,
                @location(1) color: vec4f,
            };
            
            @vertex
            fn vertexMain(input: VertexInput) -> VertexOutput {
                var output: VertexOutput;
                
                // Convert from pixel coordinates to clip space using the actual canvas dimensions
                let x = (input.position.x / canvasSize.width) * 2.0 - 1.0;
                let y = -((input.position.y / canvasSize.height) * 2.0 - 1.0);
                
                output.position = vec4f(x, y, 0.0, 1.0);
                output.uv = input.uv;
                output.color = input.color;
                
                return output;
            }
            
            @group(0) @binding(0) var texSampler: sampler;
            @group(0) @binding(1) var textTexture: texture_2d<f32>;
            
            @fragment
            fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
                let texColor = textureSample(textTexture, texSampler, input.uv);
                return texColor * input.color;
            }
        `;
    }
}
