import { Engine } from './src/core/Engine.js';
import { TextRenderer } from './src/ui/TextRenderer.js';

// Wait for DOM to load then initialize the engine
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('vibeCanvas');
    
    // Create and start the engine
    const engine = new Engine(canvas);
    
    // Start the engine first to ensure WebGPU is initialized
    engine.start();
    
    // Create text renderer and add some demo text after a small delay
    // to ensure WebGPU initialization is complete
    setTimeout(async () => {
        const textRenderer = new TextRenderer(engine);
        await textRenderer.init(); // Wait for initialization
        
        textRenderer.addText('Hello, WebGPU Text!', 50, 50, { 
            fontSize: 24, 
            color: [1.0, 1.0, 1.0, 1.0],
            fontFamily: 'Arial'
        });
        
        // Properly hook into the engine rendering system by modifying its render method
        const originalRender = engine.render;
        engine.render = function() {
            // Call the original render method first to get the rendered scene
            originalRender.apply(this);
            
            // Now add our text rendering on top using the renderer's device and context
            if (textRenderer.initialized && this.renderer && this.renderer.device && this.renderer.context) {
                try {
                    // Create command encoder using the renderer's device
                    const commandEncoder = this.renderer.device.createCommandEncoder();
                    
                    // Begin render pass for text overlay
                    const renderPassDescriptor = {
                        colorAttachments: [{
                            view: this.renderer.context.getCurrentTexture().createView(),
                            loadOp: 'load', // Important: use 'load' to preserve the existing content
                            storeOp: 'store'
                        }]
                    };
                    
                    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
                    textRenderer.render(renderPass);
                    renderPass.end();
                    
                    // Submit command buffer
                    this.renderer.device.queue.submit([commandEncoder.finish()]);
                } catch (error) {
                    console.error("Error in text rendering:", error);
                }
            }
        };
    }, 500); // Increased delay for better initialization timing
});
