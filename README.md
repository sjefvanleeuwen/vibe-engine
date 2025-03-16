# Vibe Engine

A modern 3D game engine built with WebGPU and JavaScript.

## Overview

Vibe Engine is a component-based 3D game engine designed for the web platform using WebGPU. It provides a comprehensive set of tools and systems for game development with a focus on performance, modularity, and ease of use.

## Key Features

- WebGPU-based rendering for modern graphics capabilities
- Component-based architecture for flexible game object composition
- Comprehensive math utilities for 3D operations
- Physics integration for realistic interactions
- Animation system for skeletal and keyframe animations
- Particle system for visual effects
- Audio management with spatial sound support
- Input handling for various devices
- UI system for in-game interfaces
- Networking for multiplayer functionality
- AI tools for enemy and NPC behavior
- Debugging utilities for development

## Architecture

The engine is built with separation of concerns in mind, with distinct modules for different aspects of game development:

1. [Engine Initialization](./docs/1-engine-initialization.md)
2. [Rendering Pipeline](./docs/2-rendering-pipeline.md)
3. [Scene Management](./docs/3-scene-management.md)
4. [Resource Management](./docs/4-resource-management.md)
5. [Component Based Design](./docs/5-component-design.md)
6. [Math Library](./docs/6-math-library.md)
7. [Input Management](./docs/7-input-management.md)
8. [Camera System](./docs/8-camera-system.md)
9. [Time Management](./docs/9-time-management.md)
10. [Debugging Tools](./docs/10-debugging-tools.md)
11. [Audio System](./docs/11-audio-system.md)
12. [UI System](./docs/12-ui-system.md)
13. [Physics Integration](./docs/13-physics-integration.md)
14. [Animation System](./docs/14-animation-system.md)
15. [Particle System](./docs/15-particle-system.md)
16. [Networking](./docs/16-networking.md)
17. [Scripting System](./docs/17-scripting-system.md)
18. [Serialization System](./docs/18-serialization-system.md)
19. [AI System](./docs/19-ai-system.md)

For a comprehensive architecture overview, see the [Core Overview](./docs/0-core.md).

## Proposed Project Structure

```
vibe-engine/
├── src/                      # Source code
│   ├── core/                 # Core engine functionality
│   │   ├── Engine.js         # Main engine class
│   │   ├── Time.js           # Time management
│   │   └── Debug.js          # Debugging utilities
│   ├── renderer/             # WebGPU rendering
│   │   ├── Renderer.js       # Main renderer
│   │   ├── ShaderLibrary.js  # WGSL shader collection
│   │   └── RenderPass.js     # Render pass management
│   ├── scene/                # Scene management
│   │   ├── Scene.js          # Scene graph
│   │   ├── Entity.js         # Game object
│   │   └── Transform.js      # Spatial transformation
│   ├── components/           # Component system
│   │   ├── Component.js      # Base component class
│   │   ├── MeshComponent.js  # Visual representation
│   │   └── CameraComponent.js # Camera functionality
│   ├── resources/            # Asset management
│   │   ├── ResourceManager.js # Resource loading/caching
│   │   ├── TextureLoader.js  # Texture handling
│   │   └── ModelLoader.js    # 3D model importing
│   ├── math/                 # Math utilities
│   │   ├── Vector3.js        # 3D vector operations
│   │   ├── Matrix4.js        # 4x4 matrix operations
│   │   └── Quaternion.js     # Rotation representation
│   ├── input/                # Input handling
│   │   ├── InputManager.js   # Input detection
│   │   └── InputMap.js       # Input configuration
│   ├── physics/              # Physics system
│   │   ├── PhysicsWorld.js   # Physics simulation
│   │   ├── RigidBody.js      # Physical object
│   │   └── Collider.js       # Collision shape
│   ├── animation/            # Animation system
│   │   ├── Animator.js       # Animation controller
│   │   └── AnimationClip.js  # Animation data
│   ├── particles/            # Particle effects
│   │   ├── ParticleSystem.js # Particle manager
│   │   └── Emitter.js        # Particle emitter
│   ├── audio/                # Audio system
│   │   ├── AudioManager.js   # Sound management
│   │   └── AudioSource.js    # Sound emitter
│   ├── ui/                   # User interface
│   │   ├── UIManager.js      # UI controller
│   │   ├── UIElement.js      # UI component base
│   │   └── Text.js           # Text rendering
│   ├── network/              # Multiplayer
│   │   ├── NetworkManager.js # Network handling
│   │   └── Replication.js    # State synchronization
│   ├── scripting/            # Script system
│   │   ├── ScriptManager.js  # Script handling
│   │   └── Script.js         # Script component
│   ├── serialization/        # Data persistence
│   │   └── Serializer.js     # Object serialization
│   └── ai/                   # Artificial Intelligence
│       ├── PathFinder.js     # Navigation
│       └── BehaviorTree.js   # Decision making
├── docs/                     # Documentation
│   ├── 0-core.md            # Architecture overview
│   ├── 1-engine-initialization.md
│   └── ...                   # Other module docs
├── examples/                 # Example projects
│   ├── basic/               # Basic example
│   └── advanced/            # Advanced features demo
├── assets/                   # Example assets
│   ├── models/              # 3D models
│   ├── textures/            # Image files
│   └── sounds/              # Audio files
├── tests/                    # Unit tests
├── index.js                  # Main entry point
└── package.json              # Dependencies
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm start`
4. Open your browser to `http://localhost:8080`

## Browser Compatibility

Vibe Engine requires a browser with WebGPU support. Currently, this includes:
- Chrome 113+ with WebGPU flag enabled
- Edge 113+ with WebGPU flag enabled
- Firefox Nightly with WebGPU flag enabled

## License

[MIT License](LICENSE)
