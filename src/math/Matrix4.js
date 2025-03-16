export function createRotationMatrix(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Create a rotation matrix around the z-axis
    return new Float32Array([
        cos, -sin, 0, 0,
        sin,  cos, 0, 0,
        0,    0,   1, 0,
        0,    0,   0, 1
    ]);
}

export function createProjectionMatrix(aspectRatio) {
    // Simple projection matrix that accounts for aspect ratio
    const scale = 0.8; // Scale to 80% to make it more visible
    
    if (aspectRatio >= 1) {
        // Landscape or square orientation
        return new Float32Array([
            scale/aspectRatio, 0, 0, 0,
            0, scale, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    } else {
        // Portrait orientation
        return new Float32Array([
            scale, 0, 0, 0,
            0, scale*aspectRatio, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
}

export function multiplyMatrices(a, b) {
    const result = new Float32Array(16);
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }
    
    return result;
}
