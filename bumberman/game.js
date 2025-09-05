const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const COLS = 20;
const ROWS = 15;

const TILE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    BLOCK: 2,
    BOMB: 3,
    EXPLOSION: 4
};

const ITEMS = {
    BOMB_UP: 1,
    FIRE_UP: 2,
    SPEED_UP: 3
};

class Game {
    constructor() {
        this.map = [];
        this.player = null;
        this.enemies = [];
        this.bombs = [];
        this.explosions = [];
        this.items = [];
        this.gameOver = false;
        this.victory = false;
        this.keys = {};
        
        this.initMap();
        this.initPlayer();
        this.initEnemies();
        this.bindEvents();
        this.gameLoop();
    }
    
    initMap() {
        for (let row = 0; row < ROWS; row++) {
            this.map[row] = [];
            for (let col = 0; col < COLS; col++) {
                if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                    this.map[row][col] = TILE_TYPES.WALL;
                } else if (row % 2 === 0 && col % 2 === 0) {
                    this.map[row][col] = TILE_TYPES.WALL;
                } else if (Math.random() < 0.3 && 
                          !(row === 1 && col === 1) && !(row === 1 && col === 2) && !(row === 2 && col === 1) &&
                          !(row === 13 && col === 17) && !(row === 13 && col === 15) && !(row === 11 && col === 17)) {
                    this.map[row][col] = TILE_TYPES.BLOCK;
                } else {
                    this.map[row][col] = TILE_TYPES.EMPTY;
                }
            }
        }
    }
    
    initPlayer() {
        this.player = new Player(1, 1);
    }
    
    initEnemies() {
        // 맵 우하단 확실한 빈 공간에 적들 배치 (홀수 위치)
        this.enemies.push(new Enemy(17, 13)); // 우하단 빈 공간
        this.enemies.push(new Enemy(15, 13)); // 좌측 빈 공간  
        this.enemies.push(new Enemy(17, 11)); // 위쪽 빈 공간
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.player.placeBomb(this);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    update() {
        if (this.gameOver || this.victory) return;
        
        this.player.update(this);
        
        this.enemies.forEach(enemy => enemy.update(this));
        
        this.bombs.forEach((bomb, index) => {
            bomb.update(this);
            if (bomb.exploded) {
                this.bombs.splice(index, 1);
            }
        });
        
        this.explosions.forEach((explosion, index) => {
            explosion.update();
            if (explosion.finished) {
                this.explosions.splice(index, 1);
            }
        });
        
        this.checkCollisions();
        
        if (this.enemies.length === 0) {
            this.victory = true;
        }
    }
    
    checkCollisions() {
        this.enemies.forEach((enemy, enemyIndex) => {
            if (Math.abs(enemy.x - this.player.x) < 0.6 && 
                Math.abs(enemy.y - this.player.y) < 0.6) {
                this.gameOver = true;
            }
            
            this.explosions.forEach(explosion => {
                if (Math.round(enemy.x) === explosion.x && 
                    Math.round(enemy.y) === explosion.y) {
                    this.enemies.splice(enemyIndex, 1);
                }
            });
        });
        
        this.explosions.forEach(explosion => {
            if (Math.round(this.player.x) === explosion.x && 
                Math.round(this.player.y) === explosion.y) {
                this.gameOver = true;
            }
        });
        
        this.items.forEach((item, itemIndex) => {
            if (Math.round(this.player.x) === item.x && 
                Math.round(this.player.y) === item.y) {
                this.player.collectItem(item);
                this.items.splice(itemIndex, 1);
            }
        });
    }
    
    render() {
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;
                
                switch (this.map[row][col]) {
                    case TILE_TYPES.WALL:
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        ctx.fillStyle = '#A0522D';
                        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                        break;
                    case TILE_TYPES.BLOCK:
                        ctx.fillStyle = '#CD853F';
                        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        ctx.fillStyle = '#DEB887';
                        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                        break;
                }
            }
        }
        
        this.items.forEach(item => item.render(ctx));
        this.bombs.forEach(bomb => bomb.render(ctx));
        this.explosions.forEach(explosion => explosion.render(ctx));
        
        this.player.render(ctx);
        this.enemies.forEach(enemy => enemy.render(ctx));
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff0000';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('게임 오버!', canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText('F5를 눌러서 다시 시작하세요', canvas.width / 2, canvas.height / 2 + 50);
        }
        
        if (this.victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff00';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('승리!', canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText('모든 적을 제거했습니다!', canvas.width / 2, canvas.height / 2 + 50);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    canMoveTo(x, y, skipBombCheck = false) {
        // 캐릭터가 주로 있을 타일 위치
        const col = Math.round(x);
        const row = Math.round(y);
        
        // 경계 확인
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
        
        // 해당 타일이 빈 공간인지 확인
        if (this.map[row][col] === TILE_TYPES.WALL) return false;
        if (this.map[row][col] === TILE_TYPES.BLOCK) return false;
        
        // 폭탄과의 충돌 검사 (skipBombCheck가 true면 건너뛰기)
        if (!skipBombCheck) {
            const bombAt = this.bombs.find(bomb => 
                bomb.x === col && bomb.y === row);
            if (bombAt) return false;
        }
        
        return true;
    }
    
    destroyBlock(x, y) {
        if (this.map[y] && this.map[y][x] === TILE_TYPES.BLOCK) {
            this.map[y][x] = TILE_TYPES.EMPTY;
            
            if (Math.random() < 0.3) {
                const itemType = Math.floor(Math.random() * 3) + 1;
                this.items.push(new Item(x, y, itemType));
            }
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.1;
        this.bombCount = 1;
        this.bombPower = 2; // 기본 위력 2로 설정하여 +모양 폭발
        this.activeBombs = 0;
        this.justPlacedBombAt = null; // 방금 설치한 폭탄 위치 기억
    }
    
    update(game) {
        let newX = this.x;
        let newY = this.y;
        
        if (game.keys['ArrowLeft'] || game.keys['KeyA']) {
            newX -= this.speed;
        }
        if (game.keys['ArrowRight'] || game.keys['KeyD']) {
            newX += this.speed;
        }
        if (game.keys['ArrowUp'] || game.keys['KeyW']) {
            newY -= this.speed;
        }
        if (game.keys['ArrowDown'] || game.keys['KeyS']) {
            newY += this.speed;
        }
        
        // 현재 위치가 방금 설치한 폭탄 위치인지 확인
        const currentPos = {x: Math.round(this.x), y: Math.round(this.y)};
        const isOnJustPlacedBomb = this.justPlacedBombAt && 
            currentPos.x === this.justPlacedBombAt.x && 
            currentPos.y === this.justPlacedBombAt.y;
        
        // 폭탄 위에서 벗어나려는 경우 폭탄 체크 건너뛰기
        const skipBombCheck = isOnJustPlacedBomb;
        
        if (game.canMoveTo(newX, this.y, skipBombCheck)) {
            this.x = newX;
        }
        if (game.canMoveTo(this.x, newY, skipBombCheck)) {
            this.y = newY;
        }
        
        // 폭탄 위치에서 벗어났으면 justPlacedBombAt 초기화
        if (this.justPlacedBombAt && !isOnJustPlacedBomb) {
            const newPos = {x: Math.round(this.x), y: Math.round(this.y)};
            if (newPos.x !== this.justPlacedBombAt.x || newPos.y !== this.justPlacedBombAt.y) {
                this.justPlacedBombAt = null;
            }
        }
    }
    
    placeBomb(game) {
        if (this.activeBombs < this.bombCount) {
            const bombX = Math.round(this.x);
            const bombY = Math.round(this.y);
            
            const existingBomb = game.bombs.find(bomb => 
                bomb.x === bombX && bomb.y === bombY);
                
            if (!existingBomb) {
                game.bombs.push(new Bomb(bombX, bombY, this.bombPower, this));
                this.activeBombs++;
                // 방금 설치한 폭탄 위치 기억
                this.justPlacedBombAt = {x: bombX, y: bombY};
            }
        }
    }
    
    collectItem(item) {
        switch (item.type) {
            case ITEMS.BOMB_UP:
                this.bombCount++;
                break;
            case ITEMS.FIRE_UP:
                this.bombPower++;
                break;
            case ITEMS.SPEED_UP:
                this.speed = Math.min(this.speed + 0.02, 0.15);
                break;
        }
    }
    
    render(ctx) {
        const x = this.x * TILE_SIZE + TILE_SIZE / 2;
        const y = this.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.fillStyle = '#0066cc';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y + 3, 8, 0, Math.PI);
        ctx.fill();
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.05;
        this.direction = Math.floor(Math.random() * 4);
        this.changeDirectionTimer = 0;
    }
    
    update(game) {
        this.changeDirectionTimer++;
        if (this.changeDirectionTimer > 60) {
            this.direction = Math.floor(Math.random() * 4);
            this.changeDirectionTimer = 0;
        }
        
        let newX = this.x;
        let newY = this.y;
        
        switch (this.direction) {
            case 0: newY -= this.speed; break;
            case 1: newX += this.speed; break;
            case 2: newY += this.speed; break;
            case 3: newX -= this.speed; break;
        }
        
        if (game.canMoveTo(newX, this.y)) {
            this.x = newX;
        } else {
            this.direction = Math.floor(Math.random() * 4);
        }
        
        if (game.canMoveTo(this.x, newY)) {
            this.y = newY;
        } else {
            this.direction = Math.floor(Math.random() * 4);
        }
    }
    
    render(ctx) {
        const x = this.x * TILE_SIZE + TILE_SIZE / 2;
        const y = this.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y + 5, 6, 0, Math.PI);
        ctx.fill();
    }
}

class Bomb {
    constructor(x, y, power, owner) {
        this.x = x;
        this.y = y;
        this.power = power;
        this.owner = owner;
        this.timer = 120;
        this.exploded = false;
    }
    
    update(game) {
        this.timer--;
        if (this.timer <= 0 && !this.exploded) {
            this.explode(game);
            this.exploded = true;
            this.owner.activeBombs--;
        }
    }
    
    explode(game) {
        const directions = [
            {dx: 0, dy: 0},
            {dx: 1, dy: 0}, {dx: -1, dy: 0},
            {dx: 0, dy: 1}, {dx: 0, dy: -1}
        ];
        
        directions.forEach(dir => {
            for (let i = 0; i < this.power; i++) {
                const newX = this.x + dir.dx * i;
                const newY = this.y + dir.dy * i;
                
                if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) break;
                if (game.map[newY][newX] === TILE_TYPES.WALL) break;
                
                game.explosions.push(new Explosion(newX, newY));
                
                if (game.map[newY][newX] === TILE_TYPES.BLOCK) {
                    game.destroyBlock(newX, newY);
                    break;
                }
            }
        });
    }
    
    render(ctx) {
        const x = this.x * TILE_SIZE + TILE_SIZE / 2;
        const y = this.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.fillStyle = this.timer < 30 && this.timer % 10 < 5 ? '#ff6666' : '#333';
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💣', x, y + 4);
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.timer = 30;
        this.finished = false;
    }
    
    update() {
        this.timer--;
        if (this.timer <= 0) {
            this.finished = true;
        }
    }
    
    render(ctx) {
        const x = this.x * TILE_SIZE;
        const y = this.y * TILE_SIZE;
        
        ctx.fillStyle = `rgba(255, ${100 + this.timer * 5}, 0, ${this.timer / 30})`;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${this.timer / 30})`;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💥', x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 7);
    }
}

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
    
    render(ctx) {
        const x = this.x * TILE_SIZE + TILE_SIZE / 2;
        const y = this.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        
        switch (this.type) {
            case ITEMS.BOMB_UP:
                ctx.fillText('B', x, y + 5);
                break;
            case ITEMS.FIRE_UP:
                ctx.fillText('F', x, y + 5);
                break;
            case ITEMS.SPEED_UP:
                ctx.fillText('S', x, y + 5);
                break;
        }
    }
}

const game = new Game();