class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.player = new Player(this.canvas.width / 2 - 25, this.canvas.height - 100);
        this.stars = this.createStars(100);
        this.bullets = [];
        this.enemies = [];
        this.meteors = [];
        this.enemyBullets = [];

        this.pressedKeys = {};
        this.enemySpeed = 3;
        this.enemyBulletsSpeed = 4;

        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        document.addEventListener('keydown', (e) => {
            this.pressedKeys[e.key] = true;
            if (e.key === 'Enter' && !this.gameRunning) {
                this.restartGame();
            }
            if (e.key === ' ') {
                this.player.shoot(this.bullets);
            }
        });

        document.addEventListener('keyup', (e) => {
            this.pressedKeys[e.key] = false;
        });
    }

    createStars(count) {
        return Array.from({ length: count }, () => new Star(
            Math.random() * this.canvas.width, 
            Math.random() * this.canvas.height
        ));
    }

    handlePlayerMovement() {
        if (this.pressedKeys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.pressedKeys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
    }

    spawnEnemy() {
        const size = 50;
        this.enemies.push(new Enemy(
            Math.random() * (this.canvas.width - size), 
            0, 
            size, 
            this.enemySpeed
        ));
    }

    spawnMeteor() {
        const size = 50;
        const horizontalSpeed = Math.random() * 2 - 1;
        this.meteors.push(new Meteor(
            Math.random() * (this.canvas.width - size), 
            0, 
            size, 
            this.enemySpeed, 
            horizontalSpeed
        ));
    }

    handleEnemyShooting() {
        this.enemies.forEach(enemy => {
            if (enemy.canShoot) {
                this.enemyBullets.push(enemy.shoot());
            }
        });
    }

    detectCollisions() {
        // Colisão de balas do player com inimigos
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 10;
                }
            });
        });

        // Colisão de balas do player com meteoros
        this.bullets.forEach((bullet, bulletIndex) => {
            this.meteors.forEach((meteor, meteorIndex) => {
                if (this.checkCollision(bullet, meteor)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.meteors.splice(meteorIndex, 1);
                    this.score += 5;
                }
            });
        });

        // Colisão de balas inimigas com o player
        this.enemyBullets.forEach((bullet, index) => {
            if (this.checkCollision(bullet, this.player)) {
                this.gameOver();
            }
        });

        // Colisão de inimigos com o player
        this.enemies.forEach(enemy => {
            if (this.checkCollision(enemy, this.player)) {
                this.gameOver();
            }
        });

        // Colisão de meteoros com o player
        this.meteors.forEach(meteor => {
            if (this.checkCollision(meteor, this.player)) {
                this.gameOver();
            }
        });
    }

    checkCollision(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }

    updateGameElements() {
        this.enemies.forEach((enemy, index) => {
            enemy.update(this.canvas.width);
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(index, 1);
            }
        });

        this.meteors.forEach((meteor, index) => {
            meteor.update(this.canvas.width);
            if (meteor.y > this.canvas.height) {
                this.meteors.splice(index, 1);
            }
        });

        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });

        this.enemyBullets.forEach((bullet, index) => {
            bullet.updateEnemy();
            if (bullet.y > this.canvas.height) {
                this.enemyBullets.splice(index, 1);
            }
        });

        this.stars.forEach(star => star.update(this.canvas.height));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => star.draw(this.ctx));
        this.player.draw(this.ctx);
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.meteors.forEach(meteor => meteor.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));

        this.drawScore();
    }

    drawScore() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    gameOver() {
        this.gameRunning = false;
        this.saveHighScore();

        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2 - 150, this.canvas.height / 2);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Pontuação: ${this.score}. Pressione Enter para reiniciar`, this.canvas.width / 2 - 150, this.canvas.height / 2 + 50);

        this.drawHighScores();
    }

    saveHighScore() {
        if (typeof this.score !== 'number' || isNaN(this.score) || this.score <= 0) {
            return;
        }

        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        if (highScores.length < 5 || this.score > highScores[highScores.length - 1].score) {
            const playerName = prompt('Parabéns! Você entrou para o ranking! Digite seu nome:');
        
            if (playerName && playerName.trim() !== '') {
                let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
                
                highScores.push({ name: playerName, score: this.score });
        
                highScores.sort((a, b) => b.score - a.score);
                highScores = highScores.slice(0, 5);
        
                localStorage.setItem('highScores', JSON.stringify(highScores));
            }
        }
    }

    drawHighScores() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        const validScores = highScores.filter(score => score.name && typeof score.score === 'number' && !isNaN(score.score));
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Top 5 Pontuações:', this.canvas.width / 2 - 100, 50);

        validScores.forEach((score, index) => {
            this.ctx.fillText(`${index + 1}. ${score.name}: ${score.score}`, this.canvas.width / 2 - 100, 80 + index * 50);
        });
    }

    restartGame() {
        this.score = 0;
        this.enemies = [];
        this.meteors = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 10;
        this.gameRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.handlePlayerMovement();
        this.handleEnemyShooting();
        this.updateGameElements();
        this.detectCollisions();
        this.draw();

        // Spawnar novos inimigos e meteoros periodicamente
        if (Math.random() < 0.02) this.spawnEnemy();
        if (Math.random() < 0.01) this.spawnMeteor();

        // Aumentar dificuldade gradualmente
        this.enemySpeed += 0.001;
        this.enemyBulletsSpeed += 0.001;

        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 10;
        this.canShoot = true;
        this.shootDelay = 200;
    }

    draw(ctx) {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(1, 'purple');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    shoot(bullets) {
        if (this.canShoot) {
            bullets.push(new Bullet(
                this.x + this.width / 2 - 2.5, 
                this.y, 
                5, 
                5, 
                'red', 
                -5
            ));
            this.canShoot = false;
            setTimeout(() => {
                this.canShoot = true;
            }, this.shootDelay);
        }
    }
}

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 2 + 1;
    }

    update(canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight) this.y = 0;
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, width, height, color, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
    }

    updateEnemy() {
        this.y += Math.abs(this.speed);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.speed = speed;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.horizontalSpeed = Math.random() > 0.5 ? 2 : 0;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.canShoot = true;
    }

    update(canvasWidth) {
        this.y += this.speed;

        if (this.horizontalSpeed) {
            this.x += this.horizontalSpeed * this.direction;
            if (this.x <= 0 || this.x + this.width >= canvasWidth) {
                this.direction *= -1;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    shoot() {
        return new Bullet(
            this.x + this.width / 2 - 2.5, 
            this.y + this.height, 
            5, 
            10, 
            'yellow', 
            4
        );
    }
}

class Meteor {
    constructor(x, y, size, speed, horizontalSpeed) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.speed = speed;
        this.horizontalSpeed = horizontalSpeed;
        this.color = 'grey';
    }

    update(canvasWidth) {
        this.y += this.speed;
        this.x += this.horizontalSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
}
