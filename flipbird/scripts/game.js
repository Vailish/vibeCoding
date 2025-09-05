class FlipBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.items = [];
        this.score = 0;
        this.itemCount = 0;
        this.gameState = 'start';
        this.lastPipeSpawn = 0;
        this.pipeSpawnDelay = 120;
        this.lastItemSpawn = 0;
        this.itemSpawnDelay = 10000;
        
        this.keys = {};
        
        this.initEventListeners();
        this.gameLoop();
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            } else if (e.code === 'KeyX') {
                e.preventDefault();
                this.useInvincibilityItem();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        this.canvas.addEventListener('click', () => {
            this.handleInput();
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    handleInput() {
        if (this.gameState === 'playing') {
            this.bird.jump();
        }
    }
    
    useInvincibilityItem() {
        if (this.gameState === 'playing' && this.itemCount > 0 && !this.bird.isInvincible) {
            this.itemCount--;
            this.bird.activateInvincibility();
            this.updateItemCount();
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        this.resetGame();
    }
    
    restartGame() {
        this.gameState = 'playing';
        document.getElementById('gameOverScreen').style.display = 'none';
        this.resetGame();
    }
    
    resetGame() {
        this.bird.reset();
        this.pipes = [];
        this.items = [];
        this.score = 0;
        this.itemCount = 0;
        this.lastPipeSpawn = 0;
        this.lastItemSpawn = 0;
        this.updateScore();
        this.updateItemCount();
    }
    
    spawnPipe() {
        if (Date.now() - this.lastPipeSpawn > this.pipeSpawnDelay * 16.67) {
            this.pipes.push(new Pipe(this.canvas, this.canvas.width));
            this.lastPipeSpawn = Date.now();
        }
    }
    
    spawnItem() {
        if (Date.now() - this.lastItemSpawn > this.itemSpawnDelay) {
            const y = getRandomInt(50, this.canvas.height - 100);
            this.items.push(new InvincibilityItem(this.canvas, this.canvas.width, y));
            this.lastItemSpawn = Date.now();
        }
    }
    
    updateItems() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update();
            
            if (item.isOffScreen()) {
                this.items.splice(i, 1);
                continue;
            }
            
            if (!item.collected && checkCollision(this.bird.getBounds(), item.getBounds())) {
                item.collect();
                this.itemCount++;
                this.updateItemCount();
                this.items.splice(i, 1);
            }
        }
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update();
            
            if (pipe.isOffScreen()) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            if (pipe.hasPassedBird(this.bird.x)) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
            }
        }
    }
    
    checkCollisions() {
        if (this.bird.isInvincible) return;
        
        const birdBounds = this.bird.getBounds();
        
        if (this.bird.y <= 0 || this.bird.y + this.bird.height >= this.canvas.height) {
            this.gameOver();
            return;
        }
        
        for (const pipe of this.pipes) {
            if (checkCollision(birdBounds, pipe.getTopBounds()) || 
                checkCollision(birdBounds, pipe.getBottomBounds())) {
                this.gameOver();
                return;
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateItemCount() {
        document.getElementById('itemCount').textContent = this.itemCount;
    }
    
    clearCanvas() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.8, '#87CEEB');
        gradient.addColorStop(0.8, '#90EE90');
        gradient.addColorStop(1, '#228B22');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        const cloudPositions = [
            { x: 100, y: 50 },
            { x: 300, y: 80 },
            { x: 500, y: 40 },
            { x: 650, y: 70 }
        ];
        
        cloudPositions.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 25, cloud.y, 30, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    update() {
        if (this.gameState === 'playing') {
            this.bird.update();
            this.spawnPipe();
            this.spawnItem();
            this.updatePipes();
            this.updateItems();
            this.checkCollisions();
        }
    }
    
    draw() {
        this.clearCanvas();
        this.drawClouds();
        
        if (this.gameState === 'playing' || this.gameState === 'gameOver') {
            this.pipes.forEach(pipe => pipe.draw());
            this.items.forEach(item => item.draw());
            this.bird.draw();
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new FlipBirdGame();
});