class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.keys = {};
        this.gameTime = 0;
        this.lastTime = performance.now();
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.experienceOrbs = [];
        this.terrain = [];
        
        this.generateTerrain();
        
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 1000; // 1초마다 적 생성
        
        this.isPaused = false;
        this.isGameOver = false;
        this.gameStats = {
            enemiesKilled: 0,
            survivalTime: 0
        };
        
        this.setupEventListeners();
        this.gameLoop(performance.now());
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        this.render();
        
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    update(deltaTime) {
        if (this.isGameOver) return;
        
        this.gameTime += deltaTime;
        this.gameStats.survivalTime = this.gameTime;
        this.updateUI();
        
        // 플레이어 체력 체크
        if (this.player.health <= 0) {
            this.gameOver();
            return;
        }
        
        this.player.update(this.keys, deltaTime);
        
        this.spawnEnemies(deltaTime);
        
        this.enemies.forEach(enemy => enemy.update(this.player, deltaTime));
        this.projectiles.forEach(projectile => projectile.update(deltaTime));
        this.experienceOrbs.forEach(orb => orb.update(this.player, deltaTime));
        this.terrain.forEach(obstacle => {
            if (obstacle.update) obstacle.update(deltaTime);
        });
        
        this.handleCollisions();
        this.handleTerrainCollisions();
        this.cleanupObjects();
        
        this.player.updateWeapons(deltaTime, this.enemies, this.projectiles);
    }
    
    spawnEnemies(deltaTime) {
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnDelay) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            console.log('적 생성! 현재 적 수:', this.enemies.length);
            
            if (this.enemySpawnDelay > 500) {
                this.enemySpawnDelay -= 10;
            }
        }
    }
    
    spawnEnemy() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            const side = Math.floor(Math.random() * 4);
            
            switch(side) {
                case 0: // 위
                    x = Math.random() * this.canvas.width;
                    y = -50;
                    break;
                case 1: // 오른쪽
                    x = this.canvas.width + 50;
                    y = Math.random() * this.canvas.height;
                    break;
                case 2: // 아래
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + 50;
                    break;
                case 3: // 왼쪽
                    x = -50;
                    y = Math.random() * this.canvas.height;
                    break;
            }
            
            attempts++;
        } while (this.isPositionBlocked(x, y, 30, 30) && attempts < maxAttempts);
        
        // 최대 시도 후에도 막힌 경우, 맵 중앙에서 조금 떨어진 곳에 스폰
        if (attempts >= maxAttempts) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 200 + Math.random() * 100;
            x = this.canvas.width / 2 + Math.cos(angle) * distance;
            y = this.canvas.height / 2 + Math.sin(angle) * distance;
        }
        
        // 랜덤하게 다른 종류의 적 생성
        const enemyType = Math.random();
        if (enemyType < 0.6) {
            this.enemies.push(new BasicEnemy(x, y));
        } else if (enemyType < 0.8) {
            this.enemies.push(new FastEnemy(x, y));
        } else if (enemyType < 0.95) {
            this.enemies.push(new TankEnemy(x, y));
        } else {
            this.enemies.push(new BossEnemy(x, y));
        }
    }
    
    isPositionBlocked(x, y, width, height) {
        const testEntity = { x, y, width, height };
        
        return this.terrain.some(obstacle => {
            if (obstacle.blocksEnemies && obstacle.collidesWith(testEntity)) {
                return true;
            }
            return false;
        });
    }
    
    handleCollisions() {
        // 플레이어와 적 충돌
        this.enemies.forEach(enemy => {
            if (this.player.collidesWith(enemy)) {
                this.player.takeDamage(enemy.damage);
            }
        });
        
        // 발사체와 적 충돌
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (projectile.collidesWith(enemy)) {
                    enemy.takeDamage(projectile.damage);
                    this.projectiles.splice(pIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, enemy.expValue));
                        this.enemies.splice(eIndex, 1);
                        this.gameStats.enemiesKilled++;
                    }
                }
            });
        });
        
        // 플레이어와 경험치 구슬 충돌
        this.experienceOrbs.forEach((orb, index) => {
            if (this.player.collidesWith(orb)) {
                this.player.gainExperience(orb.value);
                this.experienceOrbs.splice(index, 1);
            }
        });
    }
    
    handleTerrainCollisions() {
        // 플레이어와 지형 충돌
        this.terrain.forEach(obstacle => {
            if (obstacle.blocksPlayer && obstacle.collidesWith(this.player)) {
                this.resolveCollision(this.player, obstacle);
            }
        });
        
        // 적과 지형 충돌
        this.enemies.forEach(enemy => {
            this.terrain.forEach(obstacle => {
                if (obstacle.blocksEnemies && obstacle.collidesWith(enemy)) {
                    this.resolveCollision(enemy, obstacle);
                }
            });
        });
        
        // 투사체와 지형 충돌
        this.projectiles.forEach((projectile, index) => {
            this.terrain.forEach(obstacle => {
                if (obstacle.blocksProjectiles && obstacle.collidesWith(projectile)) {
                    this.projectiles.splice(index, 1);
                }
            });
        });
    }
    
    resolveCollision(entity, obstacle) {
        // 충돌한 객체를 장애물에서 밀어내기
        const entityCenterX = entity.x + entity.width / 2;
        const entityCenterY = entity.y + entity.height / 2;
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;
        
        const overlapX = (entity.width + obstacle.width) / 2 - Math.abs(entityCenterX - obstacleCenterX);
        const overlapY = (entity.height + obstacle.height) / 2 - Math.abs(entityCenterY - obstacleCenterY);
        
        if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
                // 수평으로 밀어내기
                if (entityCenterX < obstacleCenterX) {
                    entity.x = obstacle.x - entity.width;
                } else {
                    entity.x = obstacle.x + obstacle.width;
                }
            } else {
                // 수직으로 밀어내기
                if (entityCenterY < obstacleCenterY) {
                    entity.y = obstacle.y - entity.height;
                } else {
                    entity.y = obstacle.y + obstacle.height;
                }
            }
        }
    }
    
    cleanupObjects() {
        this.projectiles = this.projectiles.filter(p => !p.shouldRemove);
        this.enemies = this.enemies.filter(e => e.health > 0);
        this.experienceOrbs = this.experienceOrbs.filter(o => !o.collected);
    }
    
    updateUI() {
        document.getElementById('level').textContent = `레벨: ${this.player.level}`;
        document.getElementById('exp').textContent = `경험치: ${this.player.experience}/${this.player.experienceToNext}`;
        document.getElementById('health').textContent = `체력: ${this.player.health}/${this.player.maxHealth}`;
        
        const minutes = Math.floor(this.gameTime / 60000);
        const seconds = Math.floor((this.gameTime % 60000) / 1000);
        document.getElementById('timer').textContent = `시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // 무기 리스트 업데이트
        const weaponNames = this.player.weapons.map(weapon => {
            if (weapon.constructor.name === 'BasicWeapon') return '기본총';
            if (weapon.constructor.name === 'ShotgunWeapon') return '샷건';
            if (weapon.constructor.name === 'LaserWeapon') return '레이저';
            if (weapon.constructor.name === 'BombWeapon') return '폭탄';
            return '알 수 없음';
        });
        document.getElementById('weaponList').textContent = weaponNames.join(', ');
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.terrain.forEach(obstacle => obstacle.render(this.ctx));
        this.player.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        this.experienceOrbs.forEach(orb => orb.render(this.ctx));
    }
    
    gameOver() {
        this.isGameOver = true;
        this.isPaused = true;
        
        // 게임 오버 화면 표시
        document.getElementById('gameOverPanel').style.display = 'block';
        
        // 최종 통계 업데이트
        const minutes = Math.floor(this.gameStats.survivalTime / 60000);
        const seconds = Math.floor((this.gameStats.survivalTime % 60000) / 1000);
        
        document.getElementById('finalLevel').textContent = this.player.level;
        document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('finalKills').textContent = this.gameStats.enemiesKilled;
        
        const weaponNames = this.player.weapons.map(weapon => {
            if (weapon.constructor.name === 'BasicWeapon') return '기본총';
            if (weapon.constructor.name === 'ShotgunWeapon') return '샷건';
            if (weapon.constructor.name === 'LaserWeapon') return '레이저';
            if (weapon.constructor.name === 'BombWeapon') return '폭탄';
            return '알 수 없음';
        }).join(', ');
        document.getElementById('finalWeapons').textContent = weaponNames;
    }
    
    restart() {
        // 게임 상태 초기화
        this.gameTime = 0;
        this.lastTime = performance.now();
        this.isGameOver = false;
        this.isPaused = false;
        this.gameStats = {
            enemiesKilled: 0,
            survivalTime: 0
        };
        
        // 플레이어 초기화
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        // 배열들 초기화
        this.enemies = [];
        this.projectiles = [];
        this.experienceOrbs = [];
        this.terrain = [];
        
        // 지형 재생성
        this.generateTerrain();
        
        // 적 스폰 타이머 초기화
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 1000;
        
        // UI 초기화
        document.getElementById('gameOverPanel').style.display = 'none';
        document.getElementById('levelUpPanel').style.display = 'none';
    }
    
    generateTerrain() {
        this.terrain = [];
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 맵 외곽에 부분적인 경계 벽 생성 (적 스폰을 위한 간격 유지)
        const borderGap = 80; // 적 스폰을 위한 간격
        
        // 상단 - 중간중간 간격을 둠
        for (let x = borderGap; x < width - borderGap; x += 120) {
            const wallWidth = Math.min(60, width - borderGap - x);
            if (wallWidth > 0) {
                this.terrain.push(new Wall(x, 0, wallWidth, 20));
            }
        }
        
        // 하단 - 중간중간 간격을 둠
        for (let x = borderGap; x < width - borderGap; x += 120) {
            const wallWidth = Math.min(60, width - borderGap - x);
            if (wallWidth > 0) {
                this.terrain.push(new Wall(x, height - 20, wallWidth, 20));
            }
        }
        
        // 왼쪽 - 중간중간 간격을 둠
        for (let y = borderGap; y < height - borderGap; y += 120) {
            const wallHeight = Math.min(60, height - borderGap - y);
            if (wallHeight > 0) {
                this.terrain.push(new Wall(0, y, 20, wallHeight));
            }
        }
        
        // 오른쪽 - 중간중간 간격을 둠
        for (let y = borderGap; y < height - borderGap; y += 120) {
            const wallHeight = Math.min(60, height - borderGap - y);
            if (wallHeight > 0) {
                this.terrain.push(new Wall(width - 20, y, 20, wallHeight));
            }
        }
        
        // 모서리 코너에 작은 벽 추가 (완전히 열린 공간 방지)
        this.terrain.push(new Wall(0, 0, 40, 40)); // 왼쪽 상단
        this.terrain.push(new Wall(width - 40, 0, 40, 40)); // 오른쪽 상단
        this.terrain.push(new Wall(0, height - 40, 40, 40)); // 왼쪽 하단
        this.terrain.push(new Wall(width - 40, height - 40, 40, 40)); // 오른쪽 하단
        
        // 맵 중앙에 다양한 장애물들 랜덤 배치
        const centerX = width / 2;
        const centerY = height / 2;
        const minDistance = 100; // 플레이어 스폰 지점에서 최소 거리
        
        // 벽 (모두 막음)
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = 60 + Math.random() * (width - 120);
                y = 60 + Math.random() * (height - 120);
            } while (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < minDistance);
            
            const w = 40 + Math.random() * 40;
            const h = 40 + Math.random() * 40;
            this.terrain.push(new Wall(x, y, w, h));
        }
        
        // 바리케이드 (투사체만 막음)
        for (let i = 0; i < 12; i++) {
            let x, y;
            do {
                x = 60 + Math.random() * (width - 120);
                y = 60 + Math.random() * (height - 120);
            } while (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < minDistance);
            
            const w = 30 + Math.random() * 30;
            const h = 30 + Math.random() * 30;
            this.terrain.push(new Barricade(x, y, w, h));
        }
        
        // 함정 (플레이어만 막음)
        for (let i = 0; i < 6; i++) {
            let x, y;
            do {
                x = 80 + Math.random() * (width - 160);
                y = 80 + Math.random() * (height - 160);
            } while (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < minDistance);
            
            const size = 50 + Math.random() * 30;
            this.terrain.push(new Trap(x, y, size, size));
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 200;
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 10;
        
        this.weapons = [new BasicWeapon()];
    }
    
    update(keys, deltaTime) {
        const dt = deltaTime / 1000;
        
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.y -= this.speed * dt;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            this.y += this.speed * dt;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.x -= this.speed * dt;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.x += this.speed * dt;
        }
        
        this.x = Math.max(10, Math.min(window.innerWidth - 10, this.x));
        this.y = Math.max(10, Math.min(window.innerHeight - 10, this.y));
    }
    
    updateWeapons(deltaTime, enemies, projectiles) {
        this.weapons.forEach(weapon => {
            weapon.update(deltaTime, this, enemies, projectiles);
        });
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }
    
    gainExperience(exp) {
        this.experience += exp;
        if (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNext;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
        
        this.generateUpgradeOptions();
        game.isPaused = true;
        document.getElementById('levelUpPanel').style.display = 'block';
    }
    
    generateUpgradeOptions() {
        const allUpgrades = [
            { type: 'speed', name: '이동 속도 증가', desc: '+50 이동 속도' },
            { type: 'damage', name: '공격력 증가', desc: '모든 무기 +30% 데미지' },
            { type: 'health', name: '최대 체력 증가', desc: '+25 최대 체력 & 체력 회복' },
            { type: 'attackSpeed', name: '공격 속도 증가', desc: '모든 무기 공격 속도 증가' }
        ];
        
        const weaponUpgrades = [];
        
        // 무기별로 중복 체크
        const hasBasic = this.weapons.some(w => w.constructor.name === 'BasicWeapon');
        const hasShotgun = this.weapons.some(w => w.constructor.name === 'ShotgunWeapon');
        const hasLaser = this.weapons.some(w => w.constructor.name === 'LaserWeapon');
        const hasBomb = this.weapons.some(w => w.constructor.name === 'BombWeapon');
        
        if (!hasShotgun) {
            weaponUpgrades.push({ type: 'shotgun', name: '🔫 샷건 획득', desc: '산탄 발사로 광역 공격' });
        }
        if (!hasLaser) {
            weaponUpgrades.push({ type: 'laser', name: '⚡ 레이저 획득', desc: '관통 레이저로 강력한 공격' });
        }
        if (!hasBomb) {
            weaponUpgrades.push({ type: 'bomb', name: '💣 폭탄 획득', desc: '폭발로 광역 데미지' });
        }
        
        // 모든 옵션 합치기
        const availableUpgrades = [...allUpgrades, ...weaponUpgrades];
        
        // 랜덤하게 3개 선택
        const selectedUpgrades = [];
        const upgradeCopy = [...availableUpgrades];
        
        for (let i = 0; i < Math.min(3, upgradeCopy.length); i++) {
            const randomIndex = Math.floor(Math.random() * upgradeCopy.length);
            selectedUpgrades.push(upgradeCopy.splice(randomIndex, 1)[0]);
        }
        
        // HTML 생성
        const optionsContainer = document.getElementById('upgradeOptions');
        optionsContainer.innerHTML = '';
        
        selectedUpgrades.forEach(upgrade => {
            const button = document.createElement('button');
            button.className = 'upgrade-option';
            button.onclick = () => selectUpgrade(upgrade.type);
            button.innerHTML = `
                <div style="font-weight: bold;">${upgrade.name}</div>
                <div style="font-size: 12px; color: #ccc;">${upgrade.desc}</div>
            `;
            optionsContainer.appendChild(button);
        });
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // 체력바
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 10, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 10, barWidth * healthPercent, barHeight);
    }
}

class BasicEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.speed = 50 + Math.random() * 30;
        this.health = 30;
        this.maxHealth = 30;
        this.expValue = 1;
        this.damage = 10;
        this.color = '#FF6B6B';
    }
    
    update(player, deltaTime) {
        const dt = deltaTime / 1000;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed * dt;
            this.y += (dy / distance) * this.speed * dt;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // 체력바
        const barWidth = 20;
        const barHeight = 3;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 8, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 8, barWidth * healthPercent, barHeight);
    }
}

class FastEnemy extends BasicEnemy {
    constructor(x, y) {
        super(x, y);
        this.width = 12;
        this.height = 12;
        this.speed = 120 + Math.random() * 40;
        this.health = 15;
        this.maxHealth = 15;
        this.expValue = 2;
        this.damage = 8;
        this.color = '#FF9F43';
    }
    
    render(ctx) {
        // 삼각형으로 그리기
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height/2);
        ctx.lineTo(this.x - this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // 체력바
        const barWidth = 15;
        const barHeight = 2;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 6, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 6, barWidth * healthPercent, barHeight);
    }
}

class TankEnemy extends BasicEnemy {
    constructor(x, y) {
        super(x, y);
        this.width = 25;
        this.height = 25;
        this.speed = 25 + Math.random() * 15;
        this.health = 100;
        this.maxHealth = 100;
        this.expValue = 5;
        this.damage = 20;
        this.color = '#8B4513';
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // 장갑 표시
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(this.x - this.width/2 + 2, this.y - this.height/2 + 2, this.width - 4, this.height - 4);
        
        // 체력바
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 10, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 10, barWidth * healthPercent, barHeight);
    }
}

class BossEnemy extends BasicEnemy {
    constructor(x, y) {
        super(x, y);
        this.width = 35;
        this.height = 35;
        this.speed = 40 + Math.random() * 20;
        this.health = 200;
        this.maxHealth = 200;
        this.expValue = 15;
        this.damage = 30;
        this.color = '#8E44AD';
        this.pulseTimer = 0;
    }
    
    update(player, deltaTime) {
        super.update(player, deltaTime);
        this.pulseTimer += deltaTime;
    }
    
    render(ctx) {
        // 펄스 효과
        const pulseScale = 1 + Math.sin(this.pulseTimer / 200) * 0.1;
        const width = this.width * pulseScale;
        const height = this.height * pulseScale;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - width/2, this.y - height/2, width, height);
        
        // 보스 표시 (다이아몬드)
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 8);
        ctx.lineTo(this.x + 6, this.y);
        ctx.lineTo(this.x, this.y + 8);
        ctx.lineTo(this.x - 6, this.y);
        ctx.closePath();
        ctx.fill();
        
        // 체력바
        const barWidth = 40;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - barWidth/2, this.y - height/2 - 12, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x - barWidth/2, this.y - height/2 - 12, barWidth * healthPercent, barHeight);
    }
}

class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = 'wall';
        this.blocksPlayer = true;
        this.blocksEnemies = true;
        this.blocksProjectiles = true;
    }
    
    render(ctx) {
        // 돌벽 스타일
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 테두리
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 돌 질감 효과
        ctx.fillStyle = '#555555';
        for (let i = 0; i < 3; i++) {
            const rectX = this.x + Math.random() * (this.width - 8);
            const rectY = this.y + Math.random() * (this.height - 8);
            ctx.fillRect(rectX, rectY, 4, 4);
        }
    }
    
    collidesWith(other) {
        return other.x < this.x + this.width &&
               other.x + other.width > this.x &&
               other.y < this.y + this.height &&
               other.y + other.height > this.y;
    }
}

class Barricade {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = 'barricade';
        this.blocksPlayer = false;
        this.blocksEnemies = false;
        this.blocksProjectiles = true;
    }
    
    render(ctx) {
        // 나무 바리케이드 스타일
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 나무 질감
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < Math.floor(this.width / 8); i++) {
            const lineX = this.x + i * 8 + 2;
            ctx.fillRect(lineX, this.y, 2, this.height);
        }
        
        // 테두리
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 투명도 효과 (통과 가능함을 표시)
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
        ctx.globalAlpha = 1.0;
    }
    
    collidesWith(other) {
        return other.x < this.x + this.width &&
               other.x + other.width > this.x &&
               other.y < this.y + this.height &&
               other.y + other.height > this.y;
    }
}

class Trap {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = 'trap';
        this.blocksPlayer = true;
        this.blocksEnemies = false;
        this.blocksProjectiles = false;
        this.pulseTimer = 0;
    }
    
    update(deltaTime) {
        this.pulseTimer += deltaTime;
    }
    
    render(ctx) {
        // 함정 구역 - 펄스 효과
        const pulse = Math.sin(this.pulseTimer / 200) * 0.3 + 0.7;
        
        // 위험 구역 표시
        ctx.fillStyle = `rgba(255, 100, 100, ${pulse * 0.3})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 경고 패턴
        ctx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.setLineDash([]);
        
        // 중앙에 위험 표시
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠', centerX, centerY);
    }
    
    collidesWith(other) {
        return other.x < this.x + this.width &&
               other.x + other.width > this.x &&
               other.y < this.y + this.height &&
               other.y + other.height > this.y;
    }
}

class BasicWeapon {
    constructor() {
        this.damage = 25;
        this.fireRate = 800; // ms - 더 빠른 공격
        this.lastFired = 0;
        this.range = 300; // 더 긴 사거리
        this.name = "기본총";
    }
    
    update(deltaTime, player, enemies, projectiles) {
        this.lastFired += deltaTime;
        
        if (this.lastFired >= this.fireRate && enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy(player, enemies);
            if (nearestEnemy) {
                this.fire(player, nearestEnemy, projectiles);
                this.lastFired = 0;
                console.log('발사! 적까지 거리:', Math.sqrt((nearestEnemy.x - player.x) ** 2 + (nearestEnemy.y - player.y) ** 2));
            }
        }
    }
    
    findNearestEnemy(player, enemies) {
        let nearest = null;
        let nearestDistance = this.range;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if (distance < nearestDistance) {
                nearest = enemy;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    fire(player, target, projectiles) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        projectiles.push(new Projectile(
            player.x,
            player.y,
            dx / distance,
            dy / distance,
            this.damage
        ));
    }
}

class ShotgunWeapon {
    constructor() {
        this.damage = 15;
        this.fireRate = 1200;
        this.lastFired = 0;
        this.range = 250;
        this.projectileCount = 5;
        this.spread = Math.PI / 6;
        this.name = "샷건";
    }
    
    update(deltaTime, player, enemies, projectiles) {
        this.lastFired += deltaTime;
        
        if (this.lastFired >= this.fireRate && enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy(player, enemies);
            if (nearestEnemy) {
                this.fire(player, nearestEnemy, projectiles);
                this.lastFired = 0;
            }
        }
    }
    
    findNearestEnemy(player, enemies) {
        let nearest = null;
        let nearestDistance = this.range;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if (distance < nearestDistance) {
                nearest = enemy;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    fire(player, target, projectiles) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const baseAngle = Math.atan2(dy, dx);
        
        for (let i = 0; i < this.projectileCount; i++) {
            const angleOffset = (i - (this.projectileCount - 1) / 2) * (this.spread / this.projectileCount);
            const angle = baseAngle + angleOffset;
            
            projectiles.push(new Projectile(
                player.x,
                player.y,
                Math.cos(angle),
                Math.sin(angle),
                this.damage,
                '#FF4444'
            ));
        }
    }
}

class LaserWeapon {
    constructor() {
        this.damage = 40;
        this.fireRate = 1500;
        this.lastFired = 0;
        this.range = 400;
        this.name = "레이저";
    }
    
    update(deltaTime, player, enemies, projectiles) {
        this.lastFired += deltaTime;
        
        if (this.lastFired >= this.fireRate && enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy(player, enemies);
            if (nearestEnemy) {
                this.fire(player, nearestEnemy, projectiles);
                this.lastFired = 0;
            }
        }
    }
    
    findNearestEnemy(player, enemies) {
        let nearest = null;
        let nearestDistance = this.range;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if (distance < nearestDistance) {
                nearest = enemy;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    fire(player, target, projectiles) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        projectiles.push(new LaserProjectile(
            player.x,
            player.y,
            dx / distance,
            dy / distance,
            this.damage
        ));
    }
}

class BombWeapon {
    constructor() {
        this.damage = 60;
        this.fireRate = 2000;
        this.lastFired = 0;
        this.range = 300;
        this.name = "폭탄";
    }
    
    update(deltaTime, player, enemies, projectiles) {
        this.lastFired += deltaTime;
        
        if (this.lastFired >= this.fireRate && enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy(player, enemies);
            if (nearestEnemy) {
                this.fire(player, nearestEnemy, projectiles);
                this.lastFired = 0;
            }
        }
    }
    
    findNearestEnemy(player, enemies) {
        let nearest = null;
        let nearestDistance = this.range;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if (distance < nearestDistance) {
                nearest = enemy;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    fire(player, target, projectiles) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        projectiles.push(new BombProjectile(
            player.x,
            player.y,
            dx / distance,
            dy / distance,
            this.damage
        ));
    }
}

class Projectile {
    constructor(x, y, dirX, dirY, damage, color = '#FFD700') {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = 400;
        this.damage = damage;
        this.width = 5;
        this.height = 5;
        this.lifeTime = 1000;
        this.age = 0;
        this.shouldRemove = false;
        this.color = color;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000;
        this.x += this.dirX * this.speed * dt;
        this.y += this.dirY * this.speed * dt;
        
        this.age += deltaTime;
        if (this.age >= this.lifeTime) {
            this.shouldRemove = true;
        }
        
        if (this.x < 0 || this.x > window.innerWidth || 
            this.y < 0 || this.y > window.innerHeight) {
            this.shouldRemove = true;
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}

class LaserProjectile extends Projectile {
    constructor(x, y, dirX, dirY, damage) {
        super(x, y, dirX, dirY, damage, '#00FFFF');
        this.speed = 600;
        this.width = 3;
        this.height = 15;
        this.lifeTime = 1200;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        const angle = Math.atan2(this.dirY, this.dirX);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.fillRect(-this.height/2, -this.width/2, this.height, this.width);
        ctx.restore();
        
        // 발광 효과
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = '#FFFFFF';
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.fillRect(-this.height/2, -this.width/4, this.height, this.width/2);
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class BombProjectile extends Projectile {
    constructor(x, y, dirX, dirY, damage) {
        super(x, y, dirX, dirY, damage, '#FF6600');
        this.speed = 200;
        this.width = 10;
        this.height = 10;
        this.lifeTime = 2000;
        this.explosionRadius = 50;
        this.hasExploded = false;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // 수명이 다하면 폭발
        if (this.age >= this.lifeTime && !this.hasExploded) {
            this.explode();
        }
    }
    
    explode() {
        this.hasExploded = true;
        this.shouldRemove = true;
        
        // 폭발 범위 내 적들에게 데미지
        game.enemies.forEach((enemy, index) => {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance <= this.explosionRadius) {
                enemy.takeDamage(this.damage);
                if (enemy.health <= 0) {
                    game.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, enemy.expValue));
                    game.gameStats.enemiesKilled++;
                }
            }
        });
    }
    
    collidesWith(other) {
        const result = super.collidesWith(other);
        if (result && !this.hasExploded) {
            this.explode();
        }
        return result;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 심지 효과
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height/2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ExperienceOrb {
    constructor(x, y, value = 1) {
        this.x = x;
        this.y = y;
        this.width = Math.max(8, value * 2);
        this.height = Math.max(8, value * 2);
        this.value = value;
        this.collected = false;
        this.attractSpeed = 100;
        this.attractRange = 50;
        this.color = value > 5 ? '#FFD700' : value > 2 ? '#00FF7F' : '#00BFFF';
    }
    
    update(player, deltaTime) {
        const dt = deltaTime / 1000;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.attractRange) {
            this.x += (dx / distance) * this.attractSpeed * dt;
            this.y += (dy / distance) * this.attractSpeed * dt;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function selectUpgrade(type) {
    const player = game.player;
    
    switch(type) {
        case 'speed':
            player.speed += 50;
            break;
        case 'damage':
            player.weapons.forEach(weapon => {
                weapon.damage += Math.floor(weapon.damage * 0.3);
            });
            break;
        case 'health':
            player.maxHealth += 25;
            player.health = Math.min(player.health + 25, player.maxHealth);
            break;
        case 'attackSpeed':
            player.weapons.forEach(weapon => {
                weapon.fireRate = Math.max(200, weapon.fireRate - 100);
            });
            break;
        case 'shotgun':
            player.weapons.push(new ShotgunWeapon());
            break;
        case 'laser':
            player.weapons.push(new LaserWeapon());
            break;
        case 'bomb':
            player.weapons.push(new BombWeapon());
            break;
    }
    
    document.getElementById('levelUpPanel').style.display = 'none';
    game.isPaused = false;
}

function restartGame() {
    game.restart();
}

let game;
window.addEventListener('load', () => {
    game = new Game();
});