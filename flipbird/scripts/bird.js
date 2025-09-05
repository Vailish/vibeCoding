class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.x = 100;
        this.y = canvas.height / 2;
        this.width = 40;
        this.height = 30;
        
        this.velocity = 0;
        this.gravity = 0.5;
        this.jumpStrength = -10;
        this.maxVelocity = 12;
        
        this.rotation = 0;
        this.maxRotation = Math.PI / 6;
        
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.invincibilityDuration = 1000;
    }
    
    jump() {
        this.velocity = this.jumpStrength;
    }
    
    update() {
        this.velocity += this.gravity;
        this.velocity = clamp(this.velocity, -this.maxVelocity, this.maxVelocity);
        this.y += this.velocity;
        
        this.rotation = clamp(this.velocity / this.maxVelocity * this.maxRotation, -this.maxRotation, this.maxRotation);
        
        this.y = clamp(this.y, 0, this.canvas.height - this.height);
        
        if (this.isInvincible) {
            this.invincibilityTimer -= 16.67;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }
    }
    
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.rotate(this.rotation);
        
        if (this.isInvincible) {
            this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        }
        
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        if (this.isInvincible) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.7, '#FFA500');
            gradient.addColorStop(1, '#FF8C00');
        } else {
            gradient.addColorStop(0, '#FF69B4');
            gradient.addColorStop(0.7, '#FF1493');
            gradient.addColorStop(1, '#DC143C');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.ellipse(this.width / 4, 0, 8, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(-8, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-6, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(8, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(10, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
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
    
    activateInvincibility() {
        this.isInvincible = true;
        this.invincibilityTimer = this.invincibilityDuration;
    }
    
    reset() {
        this.y = this.canvas.height / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
    }
}