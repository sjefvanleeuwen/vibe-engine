import { Engine } from './src/core/Engine.js';

// Wait for DOM to load then initialize the engine
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('vibeCanvas');
    
    // Create and start the engine
    const engine = new Engine(canvas);
    engine.start();
});
