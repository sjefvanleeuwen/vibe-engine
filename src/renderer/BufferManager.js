export class BufferManager {
    constructor(device) {
        this.device = device;
    }
    
    createVertexBuffer(data) {
        const buffer = this.device.createBuffer({
            label: 'Vertex buffer',
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        
        this.device.queue.writeBuffer(buffer, 0, data);
        return buffer;
    }
    
    createIndexBuffer(data) {
        const buffer = this.device.createBuffer({
            label: 'Index buffer',
            size: data.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
        
        this.device.queue.writeBuffer(buffer, 0, data);
        return buffer;
    }
    
    createUniformBuffer(size) {
        return this.device.createBuffer({
            label: 'Uniform buffer',
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }
    
    updateBuffer(buffer, data, offset = 0) {
        this.device.queue.writeBuffer(buffer, offset, data);
    }
}
