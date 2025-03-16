export class ModelLoader {
    constructor() {
        this.modelCache = new Map();
    }

    async loadObj(url) {
        // Check cache first
        if (this.modelCache.has(url)) {
            return this.modelCache.get(url);
        }

        // Fetch the OBJ file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load model from ${url}: ${response.statusText}`);
        }

        const text = await response.text();
        const model = this.parseObj(text);
        
        // Cache the result
        this.modelCache.set(url, model);
        
        return model;
    }

    async loadObjWithMtl(url) {
        // Check cache first
        const cacheKey = url + "_with_mtl";
        if (this.modelCache.has(cacheKey)) {
            return this.modelCache.get(cacheKey);
        }

        // Fetch the OBJ file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load model from ${url}: ${response.statusText}`);
        }

        const objText = await response.text();
        
        // Parse the OBJ file to find the MTL reference
        const mtlFile = this.extractMtlFilename(objText, url);
        let materials = {};
        let texturePath = null;
        
        // Load MTL file if referenced
        if (mtlFile) {
            materials = await this.loadMtl(mtlFile);
            // Get the texture path from the first material that has one
            for (const matName in materials) {
                if (materials[matName].map_Kd) {
                    texturePath = materials[matName].map_Kd;
                    break;
                }
            }
        }
        
        // Parse the OBJ file with texture coordinates
        const modelData = this.parseObjWithTexture(objText, materials);
        
        // Add texture path to result
        const result = {
            vertices: modelData.vertices,
            vertexCount: modelData.vertexCount,
            texturePath: texturePath
        };
        
        // Cache the result
        this.modelCache.set(cacheKey, result);
        
        return result;
    }
    
    extractMtlFilename(objText, objUrl) {
        // Find the mtllib directive in the OBJ file
        const mtlMatch = objText.match(/^mtllib\s+(.+)$/m);
        if (!mtlMatch) return null;
        
        // Get the MTL filename
        const mtlFilename = mtlMatch[1].trim();
        
        // Convert relative path to absolute
        const objPath = objUrl.substring(0, objUrl.lastIndexOf('/') + 1);
        return objPath + mtlFilename;
    }
    
    async loadMtl(mtlUrl) {
        const response = await fetch(mtlUrl);
        if (!response.ok) {
            console.warn(`Failed to load MTL from ${mtlUrl}: ${response.statusText}`);
            return {};
        }
        
        const mtlText = await response.text();
        return this.parseMtl(mtlText, mtlUrl);
    }
    
    parseMtl(mtlText, mtlUrl) {
        const materials = {};
        let currentMaterial = null;
        
        // Get the base path for resolving texture paths
        const basePath = mtlUrl.substring(0, mtlUrl.lastIndexOf('/') + 1);
        
        console.log("MTL base path:", basePath);
        
        // Parse the MTL file
        const lines = mtlText.split('\n');
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (!parts.length) continue;
            
            const command = parts[0].toLowerCase();
            
            if (command === 'newmtl') {
                currentMaterial = parts[1];
                materials[currentMaterial] = {};
            } else if (currentMaterial) {
                // Parse material properties
                switch (command) {
                    case 'map_kd':
                        // Get the texture path
                        const texturePath = parts.slice(1).join(' ');
                        
                        // Handle paths starting with "../" by resolving relative to base path
                        if (texturePath.startsWith('../')) {
                            // Go up one directory from the MTL location and then follow the path
                            const parentDir = basePath.split('/').slice(0, -2).join('/') + '/';
                            materials[currentMaterial].map_Kd = parentDir + texturePath.substring(3);
                        } else {
                            // Handle as a path relative to the MTL file
                            materials[currentMaterial].map_Kd = basePath + texturePath;
                        }
                        
                        console.log("Resolved texture path:", materials[currentMaterial].map_Kd);
                        break;
                    // Add other material properties as needed
                }
            }
        }
        
        return materials;
    }

    parseObj(text) {
        const positions = [];
        const colors = [];
        const normals = [];
        const vertexData = [];
        
        console.log("Parsing OBJ file...");

        // Split the text into lines and log the first few lines for debugging
        const lines = text.split('\n');
        console.log(`OBJ file has ${lines.length} lines`);
        console.log("First few lines:", lines.slice(0, 5));
        
        // First pass: collect vertex data
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            
            if (parts[0] === 'v') {
                // Vertex position
                positions.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3] || 0)
                );
            } else if (parts[0] === 'vt') {
                // Texture coordinate or color
                colors.push(
                    parseFloat(parts[1] || 0),
                    parseFloat(parts[2] || 0),
                    parseFloat(parts[3] || 0)
                );
            } else if (parts[0] === 'vn') {
                // Normal
                normals.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                );
            }
        }
        
        console.log(`Parsed ${positions.length/3} positions, ${colors.length/3} colors, ${normals.length/3} normals`);

        // Second pass: process faces
        let faceCount = 0;
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            
            if (parts[0] === 'f') {
                faceCount++;
                // A face line has format: f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3
                // Process triangles (3 vertices per face)
                for (let i = 1; i <= 3; i++) {
                    const indices = parts[i].split('/');
                    
                    const posIndex = parseInt(indices[0]) - 1; // OBJ indices are 1-based
                    const texIndex = indices[1] ? parseInt(indices[1]) - 1 : -1;
                    const normIndex = indices[2] ? parseInt(indices[2]) - 1 : -1;
                    
                    // Position (x, y, z) - with bounds check
                    if (posIndex >= 0 && posIndex * 3 + 2 < positions.length) {
                        vertexData.push(
                            positions[posIndex * 3],
                            positions[posIndex * 3 + 1],
                            positions[posIndex * 3 + 2]
                        );
                    } else {
                        console.error(`Invalid position index: ${posIndex}`);
                        // Use default position
                        vertexData.push(0, 0, 0);
                    }
                    
                    // Color (r, g, b) - with bounds check
                    if (texIndex >= 0 && texIndex * 3 + 2 < colors.length) {
                        vertexData.push(
                            colors[texIndex * 3],
                            colors[texIndex * 3 + 1],
                            colors[texIndex * 3 + 2]
                        );
                    } else {
                        // Use a bright color that's easy to see
                        vertexData.push(1.0, 0.5, 0.0); // Orange
                    }
                }
            }
        }
        
        console.log(`Processed ${faceCount} faces, generated ${vertexData.length/6} vertices`);
        
        return new Float32Array(vertexData);
    }

    parseObjWithTexture(objText, materials) {
        const positions = [];
        const texCoords = [];
        const vertexData = [];
        let currentMaterial = null;
        let vertexCount = 0;
        
        // Parse the OBJ file
        const lines = objText.split('\n');
        
        // First pass: collect vertex data
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (!parts.length) continue;
            
            const command = parts[0].toLowerCase();
            
            if (command === 'v') {
                // Vertex position
                positions.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3] || 0)
                );
            } else if (command === 'vt') {
                // Texture coordinate
                texCoords.push(
                    parseFloat(parts[1] || 0),
                    parseFloat(parts[2] || 0)
                );
            } else if (command === 'usemtl') {
                // Material change
                currentMaterial = parts[1];
            }
        }
        
        // Second pass: process faces
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (!parts.length) continue;
            
            const command = parts[0].toLowerCase();
            
            if (command === 'f') {
                // Face - format is typically f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3
                for (let i = 1; i <= 3; i++) {
                    const indices = parts[i].split('/');
                    
                    const posIndex = parseInt(indices[0]) - 1; // OBJ indices are 1-based
                    const texIndex = indices[1] ? parseInt(indices[1]) - 1 : -1;
                    
                    // Add position (x, y, z)
                    if (posIndex >= 0 && posIndex * 3 + 2 < positions.length) {
                        vertexData.push(
                            positions[posIndex * 3],
                            positions[posIndex * 3 + 1],
                            positions[posIndex * 3 + 2]
                        );
                    } else {
                        vertexData.push(0, 0, 0);
                    }
                    
                    // Add texture coordinates (u, v)
                    if (texIndex >= 0 && texIndex * 2 + 1 < texCoords.length) {
                        vertexData.push(
                            texCoords[texIndex * 2],
                            texCoords[texIndex * 2 + 1]
                        );
                    } else {
                        vertexData.push(0, 0);
                    }
                    
                    vertexCount++;
                }
            }
        }
        
        return {
            vertices: new Float32Array(vertexData),
            vertexCount: vertexCount
        };
    }
}
