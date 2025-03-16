import { Engine } from './src/core/Engine.js';
import { TextRenderer } from './src/ui/TextRenderer.js';

// Load Google's Exo 2 font with a font loading API check
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Wait for DOM to load then initialize the engine
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('vibeCanvas');
    
    // Create and start the engine
    const engine = new Engine(canvas);
    
    // Start the engine first to ensure WebGPU is initialized
    engine.start();
    
    // Ensure font is loaded before rendering text
    await new Promise((resolve) => {
        // Use Font Loading API if available
        if (document.fonts && document.fonts.load) {
            console.log("Using Font Loading API to load Exo 2...");
            document.fonts.load('bold 16px "Exo 2"').then(() => {
                console.log("Exo 2 font loaded successfully!");
                resolve();
            }).catch(err => {
                console.warn("Font loading error:", err);
                resolve(); // Continue anyway
            });
        } else {
            // Fallback to timeout
            console.log("Font Loading API not available, using timeout...");
            setTimeout(resolve, 1000);
        }
    });
    
    // Create text renderer and add demo text
    const textRenderer = new TextRenderer(engine);
    await textRenderer.init(); // Wait for initialization
    
    // Try using Arial first to verify the text renderer works correctly
    textRenderer.addText('Hello, WebGPU Text! (Arial)', 50, 50, { 
        fontSize: 48,
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: 'Arial',
        fontWeight: 'bold'
    });
    
    // Add Exo 2 text with EXTREME scaling to make it visible
    textRenderer.addText('Hello, WebGPU Text! (Exo 2)', 50, 120, { 
        fontSize: 24, // MUCH larger
        color: [0.5, 1.0, 0.5, 1.0], // Green to distinguish
        fontFamily: 'Exo 2',
        fontWeight: 'bold',
        webFontScaleFactor: 2.0 // Doubled scaling factor
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
});
