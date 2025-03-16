export class UniformBindingManager {
    constructor(device) {
        this.device = device;
        this.bindGroupLayout = this.createMatrixBindGroupLayout();
    }
    
    createMatrixBindGroupLayout() {
        return this.device.createBindGroupLayout({
            label: 'Matrix bind group layout',
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: { type: 'uniform' }
            }]
        });
    }
    
    getBindGroupLayout() {
        return this.bindGroupLayout;
    }
    
    createMatrixBindGroup(uniformBuffer) {
        return this.device.createBindGroup({
            label: 'Matrix bind group',
            layout: this.bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer }
            }]
        });
    }
    
    createCustomBindGroupLayout(entries) {
        return this.device.createBindGroupLayout({
            entries: entries
        });
    }
    
    createCustomBindGroup(layout, entries) {
        return this.device.createBindGroup({
            layout: layout,
            entries: entries
        });
    }
}
