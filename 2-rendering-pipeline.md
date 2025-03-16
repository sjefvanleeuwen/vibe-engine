# 2. Rendering Pipeline

This document outlines the approach for building the Rendering Pipeline.

## Overview

The Renderer module manages render passes, creation of pipelines, shader management, and drawing calls using WebGPU's API. It has been split into several specialized modules for better separation of concerns:

1. **Main Renderer** - Coordinates the overall rendering process
2. **Shader Manager** - Handles shader loading and compilation
3. **Pipeline Factory** - Creates and caches render pipelines
4. **Buffer Manager** - Manages GPU buffers (vertex, index, uniform)
5. **Uniform Binding Manager** - Handles binding groups and layouts

## Approach

1. Define basic shader modules (vertex and fragment shaders) using the ShaderManager.
2. Create pipeline configurations and states using the PipelineFactory.
3. Manage multiple render passes if needed.
4. Use BufferManager to create and update GPU buffers.
5. Use UniformBindingManager for binding resources to shaders.
6. Coordinate all rendering operations in the main Renderer class.

## Implementation Steps

- Create specialized manager classes for different rendering concerns:
  - ShaderManager for loading and compiling WGSL shaders
  - PipelineFactory for pipeline creation and caching
  - BufferManager for vertex, index, and uniform buffers
  - UniformBindingManager for binding resources to pipelines
- Create a main Renderer class that coordinates these managers
- Implement render passes and command submission
- Enable easy swapping of pipeline configurations for future improvements

## Considerations

- Use caching in shader and pipeline management to avoid redundant creation
- Optimize resource binding to minimize overhead
- Prepare for future integration with post-processing effects
- Factor the rendering system as independently testable modules
- Keep state updates decoupled from pipeline setup
- Implement resource cleanup and GPU memory management

## Module Relationships

- **Renderer** - Core class that coordinates all rendering operations
  - Uses ShaderManager to load and compile shaders
  - Uses PipelineFactory to create render pipelines
  - Uses BufferManager to create and update GPU buffers
  - Uses UniformBindingManager to bind resources to shaders

- **ShaderManager** - Loads and compiles shaders
  - Provides caching for shader modules
  - Supports loading from strings or URLs

- **PipelineFactory** - Creates and manages render pipelines
  - Configures vertex and fragment stages
  - Manages pipeline caching for performance

- **BufferManager** - Creates and updates GPU buffers
  - Handles vertex, index, and uniform buffers
  - Manages buffer updates efficiently

- **UniformBindingManager** - Creates binding groups and layouts
  - Configures binding layouts for shader resources
  - Creates binding groups for connecting resources to shaders
