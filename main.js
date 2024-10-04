function resizeCanvas() {
    const canvas = document.getElementById('game-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Load images
const birdImg = document.getElementById('bird-img');
const pipeImg = document.getElementById('pipe-img');
const backgroundImg = document.getElementById('background-img');

// Game variables
let bird, pipes, score, animationId, pipeIntervalId;
const gravity = 0.3, jumpStrength = -7, pipeGap = 200, pipeInterval = 2000;

// Simplified Bird and Pipe classes
class Bird {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.velocity = 0;
        this.width = 34;
        this.height = 24;
    }

    draw() {
        ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
    }

    update() {
        this.velocity += gravity;
        this.y += this.velocity;
    }

    jump() {
        this.velocity = jumpStrength;
    }
}

class Pipe {
    constructor() {
        this.x = canvas.width;
        this.width = 52;
        this.topHeight = Math.random() * (canvas.height - pipeGap - 200) + 50;
        this.bottomY = this.topHeight + pipeGap;
    }

    draw() {
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(pipeImg, this.x, -this.topHeight, this.width, this.topHeight);
        ctx.restore();
        ctx.drawImage(pipeImg, this.x, this.bottomY, this.width, canvas.height - this.bottomY);
    }

    update() {
        this.x -= 1.5;
    }
}

// Simplified game functions
const startGame = () => {
    bird = new Bird();
    pipes = [];
    score = 0;
    [startScreen, gameOverScreen].forEach(screen => screen.style.display = 'none');
    canvas.style.display = 'block';
    scoreElement.textContent = 'Score: 0';
    clearInterval(pipeIntervalId);
    gameLoop();
    pipeIntervalId = setInterval(() => pipes.push(new Pipe()), pipeInterval);
};

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    
    bird.update();
    bird.draw();

    pipes.forEach((pipe, index) => {
        pipe.update();
        pipe.draw();

        if (checkCollision(bird, pipe)) return gameOver();

        if (pipe.x + pipe.width < bird.x && !pipe.passed) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            pipe.passed = true;
        }

        if (pipe.x + pipe.width < 0) pipes.splice(index, 1);
    });

    if (bird.y + bird.height > canvas.height || bird.y < -10) return gameOver();

    animationId = requestAnimationFrame(gameLoop);
};

const checkCollision = (bird, pipe) => 
    bird.x < pipe.x + pipe.width - 5 &&
    bird.x + bird.width > pipe.x + 5 &&
    (bird.y < pipe.topHeight - 5 || bird.y + bird.height > pipe.bottomY + 5);

const gameOver = () => {
    cancelAnimationFrame(animationId);
    clearInterval(pipeIntervalId);
    gameOverScreen.style.display = 'block';
    canvas.style.display = 'none';
};

const restartGame = () => {
    startGame();
};

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
document.addEventListener('keydown', ({ code }) => code === 'Space' && bird.jump());

// Initial setup
canvas.style.display = 'none';
startScreen.style.display = 'block';
gameOverScreen.style.display = 'none';

// Ensure images are loaded before starting the game
window.addEventListener('load', () => {
    startButton.disabled = false;
});

