# Vibe Engine

A modern 3D game engine built with WebGPU and JavaScript.

## Current Status

Vibe Engine is in early development with the following components implemented:

- ✅ WebGPU initialization and canvas setup
- ✅ Basic rendering pipeline with shader support
- ✅ Matrix math utilities for transforms
- ✅ Resource management for models and textures
- ✅ OBJ model loading with MTL material support
- ✅ Texture loading and rendering
- ✅ Animation through rotation transforms

## Overview

Vibe Engine is a component-based 3D game engine designed for the web platform using WebGPU. It provides a comprehensive set of tools and systems for game development with a focus on performance, modularity, and ease of use.

## Getting Started

1. Clone the repository
2. Ensure you have a WebGPU-compatible browser
3. Open index.html or run a local server
4. You should see a rotating colored square (or textured square if textures are available)

## Browser Compatibility

Vibe Engine requires a browser with WebGPU support. Currently, this includes:
- Chrome 113+ with WebGPU flag enabled
- Edge 113+ with WebGPU flag enabled
- Firefox Nightly with WebGPU flag enabled

## Project Structure

```
vibe-engine/
├── src/                      # Source code
│   ├── core/                 # Core engine functionality
│   │   ├── Engine.js         # Main engine class
│   │   ├── Time.js           # Time management
│   │   ├── Input.js          # Input handling
│   │   └── Debug.js          # Debugging utilities
│   ├── renderer/             # WebGPU rendering
│   │   ├── Renderer.js       # Main renderer
│   │   ├── ShaderManager.js  # Shader management
│   │   ├── PipelineFactory.js # Pipeline creation
│   │   ├── BufferManager.js  # GPU buffer management
│   │   ├── UniformBindingManager.js # Binding setup
│   │   ├── TextureManager.js # Texture handling
│   │   ├── RenderPass.js     # Render pass abstraction
│   │   └── PostProcess.js    # Post-processing effects
│   ├── scene/                # Scene management
│   │   ├── Scene.js          # Scene container
│   │   ├── Entity.js         # Entity base class
│   │   ├── Component.js      # Component system
│   │   ├── Transform.js      # Spatial transformations
│   │   └── Camera.js         # Camera controls
│   ├── resources/            # Asset management
│   │   ├── ResourceManager.js # Central resource management
│   │   ├── ModelLoader.js    # 3D model loading
│   │   ├── TextureLoader.js  # Texture loading
│   │   ├── ShaderLoader.js   # Shader loading
│   │   └── AudioLoader.js    # Audio loading
│   ├── physics/              # Physics system
│   │   ├── PhysicsWorld.js   # Physics simulation
│   │   ├── RigidBody.js      # Dynamic physics objects
│   │   ├── Collider.js       # Collision shapes
│   │   └── Constraints.js    # Physics constraints
│   ├── animation/            # Animation system
│   │   ├── Animator.js       # Animation controller
│   │   ├── Skeleton.js       # Skeletal animation
│   │   ├── AnimationClip.js  # Animation data
│   │   └── Keyframe.js       # Keyframe interpolation
│   ├── ui/                   # User interface
│   │   ├── UIManager.js      # UI rendering/management
│   │   ├── UIElement.js      # Base UI element
│   │   ├── Text.js           # Text rendering
│   │   └── Layout.js         # UI layout system
│   ├── audio/                # Audio system
│   │   ├── AudioManager.js   # Audio playback
│   │   ├── SoundEffect.js    # Effect sounds
│   │   ├── Music.js          # Background music
│   │   └── SpatialAudio.js   # 3D audio
│   ├── particles/            # Particle effects
│   │   ├── ParticleSystem.js # Particle management
│   │   ├── Emitter.js        # Particle emission
│   │   └── ParticleEffect.js # Effect presets
│   ├── ai/                   # Artificial intelligence
│   │   ├── PathFinding.js    # Navigation
│   │   ├── BehaviorTree.js   # Decision making
│   │   └── StateMachine.js   # State management
│   ├── network/              # Networking
│   │   ├── NetworkManager.js # Connection handling
│   │   ├── Replication.js    # State synchronization
│   │   └── RPC.js            # Remote procedure calls
│   ├── scripting/            # Scripting system
│   │   ├── ScriptManager.js  # Script execution
│   │   └── Script.js         # Script container
│   └── math/                 # Math utilities
│       ├── Vector2.js        # 2D vector operations
│       ├── Vector3.js        # 3D vector operations
│       ├── Matrix4.js        # 4x4 matrix operations
│       ├── Quaternion.js     # Rotations
│       └── MathUtils.js      # Math helpers
├── models/                   # 3D model assets
│   ├── square.obj            # Square model
│   ├── square.mtl            # Square material
│   └── cube.obj              # Cube model
├── textures/                 # Texture assets
├── shaders/                  # WGSL shader files
├── audio/                    # Audio assets
├── examples/                 # Example scenes
├── docs/                     # Documentation
├── tests/                    # Unit tests
├── index.html                # Main HTML page
└── index.js                  # Entry point
```

## Architecture Documentation

See the architecture documentation for details on the engine design:

1. [Engine Initialization](./1-engine-initialization.md)
2. [Rendering Pipeline](./2-rendering-pipeline.md)
3. [Scene Management](./3-scene-management.md)
4. [Resource Management](./4-resource-management.md)
5. [Component Based Design](./5-component-design.md)
6. [Math Library](./6-math-library.md)
7. [Input Management](./7-input-management.md)
8. [Camera System](./8-camera-system.md)
9. [Time Management](./9-time-management.md)
10. [Debugging Tools](./10-debugging-tools.md)
11. [Audio System](./11-audio-system.md)
12. [UI System](./12-ui-system.md)
13. [Physics Integration](./13-physics-integration.md)
14. [Animation System](./14-animation-system.md)
15. [Particle System](./15-particle-system.md)
16. [Networking](./16-networking.md)
17. [Scripting System](./17-scripting-system.md)
18. [Serialization System](./18-serialization-system.md)
19. [AI System](./19-ai-system.md)

## License

[MIT License](LICENSE)
