const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Defina o tamanho do canvas
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
    ctx.fillStyle = 'white';

    // Desenha um triângulo
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height); // Vértice inferior esquerdo
    ctx.lineTo(player.x + player.width / 2, player.y); // Vértice superior
    ctx.lineTo(player.x + player.width, player.y + player.height); // Vértice inferior direito
    ctx.closePath();
    ctx.fill();
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
let enemySpeed = 3

function spawnEnemy() {
    const size = 50;
    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: 0,
        width: size,
        height: size,
        color: 'green',
        speed: enemySpeed,
    });
}

function increaseEnemySpeed() {
    if (score % 100 === 0 && score > 0) {
        enemySpeed += 0.01;
        console.log(enemies)
    }
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1); // Remove inimigos fora da tela
        }
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Spawna inimigos a cada segundo
setInterval(spawnEnemy, 1000);

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

    handlePlayerMovement();
    handleShooting();
    drawPlayer();
    drawBullets();
    drawEnemies();
    detectCollisions();
    detectPlayerEnemyCollision();
    drawScore();
    increaseEnemySpeed();

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
