import { Player } from './Player.js';
import { Star } from './Star.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './Enemy.js';
import { Meteor } from './Meteor.js';

export class Game {
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

        this.lastEnemySpawn = 0; // Timestamp do último spawn de inimigos
        this.lastMeteorSpawn = 0; // Timestamp do último spawn de meteoros
        this.spawnInterval = 2000; // Intervalo entre spawns em ms

        this.lastEnemyShootTime = 0;
        this.enemyShootDelay = 1000;

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
            if (e.key === ' ' && !this.pressedKeys[' '] && this.gameRunning) {
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
        const now = Date.now();
        if (now - this.lastEnemySpawn >= this.spawnInterval) {
            const size = 50;
            this.enemies.push(new Enemy(
                Math.random() * (this.canvas.width - size),
                0,
                size,
                this.enemySpeed
            ));
            this.lastEnemySpawn = now;
        }
    }

    spawnMeteor() {
        const now = Date.now();
        if (now - this.lastMeteorSpawn >= this.spawnInterval * 1.5) { // Meteoros spawnam com menos frequência
            const size = 50;
            const horizontalSpeed = Math.random() * 2 - 1;
            this.meteors.push(new Meteor(
                Math.random() * (this.canvas.width - size),
                0,
                size,
                this.enemySpeed,
                horizontalSpeed
            ));
            this.lastMeteorSpawn = now;
        }
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
        const currentTime = Date.now();

        this.enemies.forEach((enemy, index) => {
            enemy.update(this.canvas.width);

            if (this.pressedKeys[' ']) {
                this.player.shoot(this.bullets);
            }
    
            if (currentTime - this.lastEnemyShootTime >= this.enemyShootDelay) {
                if (Math.random() < 0.8) {
                    this.enemyBullets.push(enemy.shoot());
                    this.lastEnemyShootTime = currentTime;
                }
        
                if (enemy.y > this.canvas.height) {
                    this.enemies.splice(index, 1);
                }
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

        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemyBullets.forEach((enemyBullet, enemyBulletIndex) => {
                if (
                    bullet.x < enemyBullet.x + enemyBullet.width &&
                    bullet.x + bullet.width > enemyBullet.x &&
                    bullet.y < enemyBullet.y + enemyBullet.height &&
                    bullet.y + bullet.height > enemyBullet.y
                ) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemyBullets.splice(enemyBulletIndex, 1);
                }
            });
        });
    }
    
    drawScore() {
        this.ctx.fillStyle = 'white';  // Cor do texto
        this.ctx.font = '24px Arial';  // Fonte e tamanho
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);  // Desenha o texto do placar
    }

    gameOver() {
        this.gameRunning = false;

        this.saveHighScore(this.score); // Passando a pontuação para a função
    
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Pontuação: ${this.score}. Pressione Enter para reiniciar`, this.canvas.width / 2 - 150, this.canvas.height / 2 + 50);
    
        setTimeout(() => {
            this.drawHighScores();
        }, 2000);
    }

    saveHighScore(score) {
        // Verifica se o score é um número válido
        if (typeof score !== 'number' || isNaN(score) || score <= 0) {
            return; // Se não for um número válido, não salva
        }

        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        if (highScores.length < 5 || score > highScores[highScores.length - 1].score) {
            const playerName = prompt('Parabéns! Você entrou para o ranking! Digite seu nome:');
        
            // Verifica se o nome é válido
            if (playerName && playerName.trim() !== '') {
                highScores.push({ name: playerName, score });

                // Ordena as pontuações de maior para menor e mantém apenas as 5 melhores
                highScores.sort((a, b) => b.score - a.score);
                highScores = highScores.slice(0, 5);

                // Salva o novo ranking no localStorage
                localStorage.setItem('highScores', JSON.stringify(highScores));
            }
        }
    }

    drawHighScores() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        
        // Filtra os scores válidos
        const validScores = highScores.filter(score => score.name && typeof score.score === 'number' && !isNaN(score.score));
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Top 5 Pontuações:', this.canvas.width / 2 - 100, 50);
    
        validScores.forEach((score, index) => {
            this.ctx.fillText(`${index + 1}. ${score.name}: ${score.score}`, this.canvas.width / 2 - 100, 80 + index * 50);
        });
    }

    increaseEnemySpeed() {
        if (this.score % 100 === 0 && this.score > 0) {
            this.enemyBulletsSpeed += 0.01;
            enemySpeed += 0.01;
        }
    }


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => star.draw(this.ctx));
        this.meteors.forEach(meteor => meteor.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.drawScore();
        this.player.draw(this.ctx);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.handlePlayerMovement();
        this.updateGameElements();
        this.detectCollisions();

        // Controle de spawns
        this.spawnEnemy();
        this.spawnMeteor();

        this.increaseEnemySpeed();

        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }
}
