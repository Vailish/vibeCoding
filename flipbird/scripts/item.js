class InvincibilityItem {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 3;
        
        this.collected = false;
        this.animationFrame = 0;
    }
    
    update() {
        this.x -= this.speed;
        this.animationFrame++;
    }
    
    draw() {
        if (this.collected) return;
        
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        const pulse = Math.sin(this.animationFrame * 0.1) * 0.2 + 1;
        this.ctx.scale(pulse, pulse);
        
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('S', 0, 0);
        
        this.ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    collect() {
        this.collected = true;
    }
}