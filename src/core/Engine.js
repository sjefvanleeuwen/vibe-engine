import { Renderer } from '../renderer/Renderer.js';

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.resizeTimeoutId = null;
        
        // Add resize handler
        window.addEventListener('resize', this.handleResizeEvent.bind(this));
    }

    async start() {
        try {
            // Initialize the renderer
            this.renderer = new Renderer();
            await this.renderer.initialize(this.canvas);
            
            // Set initial size
            this.handleResize();
            
            // Start the main loop
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
            
            console.log("Engine started successfully");
        } catch (error) {
            console.error("Failed to start engine:", error);
        }
    }

    // Debounce resize events to avoid excessive updates
    handleResizeEvent() {
        if (this.resizeTimeoutId) {
            clearTimeout(this.resizeTimeoutId);
        }
        
        this.resizeTimeoutId = setTimeout(() => {
            this.handleResize();
            this.resizeTimeoutId = null;
        }, 100); // Wait for resize to "settle" before updating
    }

    handleResize() {
        if (!this.renderer) return;
        
        // Get CSS dimensions
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        // Set drawing buffer size to match CSS with device pixel ratio
        const devicePixelRatio = window.devicePixelRatio || 1;
        const bufferWidth = Math.floor(displayWidth * devicePixelRatio);
        const bufferHeight = Math.floor(displayHeight * devicePixelRatio);
        
        if (this.canvas.width !== bufferWidth || this.canvas.height !== bufferHeight) {
            // Update canvas drawing buffer size
            this.canvas.width = bufferWidth;
            this.canvas.height = bufferHeight;
            
            console.log(`Canvas resized: ${bufferWidth}x${bufferHeight}, ratio: ${bufferWidth/bufferHeight}`);
            
            // Update renderer with new size
            this.renderer.resize(bufferWidth, bufferHeight);
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time (in seconds)
        const deltaTime = (currentTime - this.lastTime) * 0.001;
        this.lastTime = currentTime;
        
        // Update and render
        this.update(deltaTime);
        this.render();
        
        // Request next frame
        requestAnimationFrame(this.loop.bind(this));
    }
    
    update(deltaTime) {
        this.renderer.update(deltaTime);
    }
    
    render() {
        this.renderer.render();
    }
}
