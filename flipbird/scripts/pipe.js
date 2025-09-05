class Pipe {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.x = x;
        this.width = 60;
        this.speed = 3;
        
        this.gapSize = 150;
        this.gapY = getRandomInt(100, canvas.height - this.gapSize - 100);
        
        this.topHeight = this.gapY;
        this.bottomY = this.gapY + this.gapSize;
        this.bottomHeight = canvas.height - this.bottomY;
        
        this.passed = false;
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw() {
        this.ctx.fillStyle = '#32CD32';
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        
        this.ctx.fillRect(this.x, 0, this.width, this.topHeight);
        this.ctx.strokeRect(this.x, 0, this.width, this.topHeight);
        
        this.ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
        this.ctx.strokeRect(this.x, this.bottomY, this.width, this.bottomHeight);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);
        this.ctx.fillRect(this.x - 5, this.bottomY, this.width + 10, 30);
    }
    
    getTopBounds() {
        return {
            x: this.x,
            y: 0,
            width: this.width,
            height: this.topHeight
        };
    }
    
    getBottomBounds() {
        return {
            x: this.x,
            y: this.bottomY,
            width: this.width,
            height: this.bottomHeight
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    hasPassedBird(birdX) {
        return !this.passed && this.x + this.width < birdX;
    }
}