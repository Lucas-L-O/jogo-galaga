const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Atualize o canvas ao redimensionar
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let score = 0;

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    color: 'white',
    speed: 10,
};

function drawPlayer() {
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    gradient.addColorStop(0, 'blue');
    gradient.addColorStop(1, 'purple');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
}

const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 2 + 1,
}));

function drawStars() {
    stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

const pressedKeys = {};

document.addEventListener('keydown', (e) => {
    pressedKeys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    pressedKeys[e.key] = false;
});

function handlePlayerMovement() {
    if (pressedKeys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (pressedKeys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

let canShoot = true;
const shootDelay = 200;

function handleShooting() {
    if (pressedKeys[' '] && canShoot) {
        shoot();
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, shootDelay);
    }
}

const bullets = [];

function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 5,
        y: player.y,
        width: 5,
        height: 5,
        color: 'red',
        speed: 5,
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        shoot();
    }
});

function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

const enemies = [];
const meteors = [];
let enemySpeed = 3;
const enemyBullets = [];
let enemyBulletsSpeed = 4;

function spawnEnemy() {
    const size = 50;
    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: 0,
        width: size,
        height: size,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        speed: enemySpeed,
        horizontalSpeed: Math.random() > 0.5 ? 2 : 0,
        direction: Math.random() > 0.5 ? 1 : -1,
        canShoot: true,
    });
}

function spawnMeteor() {
    const size = 50;
    const horizontalSpeed = Math.random() * 2 - 1;
    meteors.push({
        x: Math.random() * (canvas.width - size),
        y: 0,
        width: size,
        height: size,
        color: 'grey',
        speed: enemySpeed,
        horizontalSpeed: horizontalSpeed,
    });
}

function spawnEnemiesAndMeteors() {
    const enemyCount = Math.max(5, Math.floor(score / 10000));
    const meteorCount = Math.max(3, Math.floor(enemyCount / 3));

    for (let i = 0; i < enemyCount; i++) {
        setInterval(spawnEnemy, 1000);
    }
    for (let i = 0; i < meteorCount; i++) {
        setInterval(spawnMeteor, 1000);
    }
}

const enemyShootDelay = 1000;
let lastEnemyShootTime = 0;

function handleEnemyShooting() {
    const currentTime = Date.now();
    if (currentTime - lastEnemyShootTime >= enemyShootDelay) {
        enemies.forEach(enemy => {
            if (enemy.canShoot) {
                enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2.5,
                    y: enemy.y + enemy.height,
                    width: 5,
                    height: 10,
                    color: 'yellow',
                    speed: enemyBulletsSpeed,
                });
            }
        });
        lastEnemyShootTime = currentTime;
    }
}

function moveMeteors() {
    meteors.forEach((meteor, index) => {
        meteor.y += meteor.speed;
        meteor.x += meteor.horizontalSpeed;
        if (meteor.x < 0 || meteor.x + meteor.width > canvas.width || meteor.y > canvas.height) {
            meteors.splice(index, 1);
        }
    });
}

function drawEnemiesBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function detectMeteorsCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        meteors.forEach((meteor, meteorIndex) => {
            if (
                bullet.x < meteor.x + meteor.width &&
                bullet.x + bullet.width > meteor.x &&
                bullet.y < meteor.y + meteor.height &&
                bullet.y + bullet.height > meteor.y
            ) {
                bullets.splice(bulletIndex, 1);
                meteors.splice(meteorIndex, 1);
                score += 5;
            }
        });
    });
}

function detectEnemyBulletCollisions() {
    enemyBullets.forEach((bullet, index) => {
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            gameOver();
        }
    });
}

// Detecta colisão de disparos entre inimigos e players
function detectBulletEnemyAndPlayerCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemyBullets.forEach((enemyBullet, enemyBulletIndex) => {
            if (
                bullet.x < enemyBullet.x + enemyBullet.width &&
                bullet.x + bullet.width > enemyBullet.x &&
                bullet.y < enemyBullet.y + enemyBullet.height &&
                bullet.y + bullet.height > enemyBullet.y
            ) {
                bullets.splice(bulletIndex, 1);
                enemyBullets.splice(enemyBulletIndex, 1);
            }
        });
    });
}

function increaseEnemyBulletSpeed() {
    if (score % 100 === 0 && score > 0) {
        enemyBulletsSpeed += 0.01;
    }
}

function increaseEnemySpeed() {
    if (score % 100 === 0 && score > 0) {
        enemySpeed += 0.01;
    }
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        if (enemy.horizontalSpeed) {
            enemy.x += enemy.horizontalSpeed * enemy.direction;
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                enemy.direction *= -1;
            }
        }

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawMeteors() {
    meteors.forEach((meteor) => {
        ctx.fillStyle = meteor.color;
        ctx.beginPath();
        ctx.moveTo(meteor.x + meteor.width / 2, meteor.y);
        ctx.lineTo(meteor.x, meteor.y + meteor.height);
        ctx.lineTo(meteor.x + meteor.width, meteor.y + meteor.height);
        ctx.closePath();
        ctx.fill();
    });
}

// Spawna inimigos a cada segundo
setInterval(spawnEnemy, 1000);
setInterval(spawnMeteor, 1000);

function detectCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1); // Remove o tiro
                enemies.splice(enemyIndex, 1); // Remove o inimigo
                score += 10;
            }
        });
    });
}

function detectPlayerEnemyCollision() {
    enemies.forEach((enemy) => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver();
        }
    });
}

function detectPlayerMeteorCollision() {
    meteors.forEach((meteor) => {
        if (
            player.x < meteor.x + meteor.width &&
            player.x + player.width > meteor.x &&
            player.y < meteor.y + meteor.height &&
            player.y + player.height > meteor.y
        ) {
            gameOver();
        }
    });
}

let gameRunning = true;

function gameOver() {
    gameRunning = false;

    saveHighScore(score); // Passando a pontuação para a função

    ctx.fillStyle = 'red';
    ctx.font = '48px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2);

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Pontuação: ${score}. Pressione Enter para reiniciar`, canvas.width / 2 - 150, canvas.height / 2 + 50);

    setTimeout(() => {
        drawHighScores();
    });
}

function saveHighScore(score) {
    // Verifica se o score é um número válido
    if (typeof score !== 'number' || isNaN(score) || score <= 0) {
        return; // Se não for um número válido, não salva
    }

    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    if (highScores.length < 5 || score > highScores[highScores.length - 1].score) {
        const playerName = prompt('Parabéns! Você entrou para o ranking! Digite seu nome:');
    
        // Verifica se o nome é válido
        if (playerName && playerName.trim() !== '') {
            let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
            
            // Adiciona o nome e a pontuação no ranking
            highScores.push({ name: playerName, score });
    
            // Ordena as pontuações de maior para menor e mantém apenas as 5 melhores
            highScores.sort((a, b) => b.score - a.score);
            highScores = highScores.slice(0, 5);
    
            // Salva o novo ranking no localStorage
            localStorage.setItem('highScores', JSON.stringify(highScores));
        }
    }
}


function drawHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    
    // Filtra os scores válidos
    const validScores = highScores.filter(score => score.name && typeof score.score === 'number' && !isNaN(score.score));
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Top 5 Pontuações:', canvas.width / 2 - 100, 50);

    validScores.forEach((score, index) => {
        ctx.fillText(`${index + 1}. ${score.name}: ${score.score}`, canvas.width / 2 - 100, 80 + index * 50);
    });
}


function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function restartGame() {
    score = 0;
    enemies.length = 0; // Limpa os inimigos
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 10;

    gameRunning = true; // Reativa o jogo
    gameLoop(); // Reinicia o loop do jogo
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualizando o jogo
    handlePlayerMovement();
    handleShooting();
    handleEnemyShooting();
    moveMeteors();

    // Chamando a função que spawn novos inimigos e meteoros
    // spawnEnemiesAndMeteors();
    // spawnEnemy();
    // spawnMeteor();

    // Desenha os elementos na tela
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawMeteors();
    drawEnemiesBullets();
    drawStars();
    drawScore();

    // Detecta colisões
    detectCollisions();
    detectBulletEnemyAndPlayerCollisions();
    detectEnemyBulletCollisions();
    detectPlayerEnemyCollision();
    detectMeteorsCollisions();
    detectPlayerMeteorCollision();

    // Aumenta a dificuldade
    increaseEnemySpeed();
    increaseEnemyBulletSpeed();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !gameRunning) {
        restartGame(); // Reinicia o jogo ao pressionar Enter
    }

    pressedKeys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    pressedKeys[e.key] = false;
});

spawnEnemy();
gameLoop();