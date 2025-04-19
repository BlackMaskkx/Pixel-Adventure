// Game Variables
let canvas, ctx;
let gameRunning = false;
let currentLevel = 0;
let player = {
    x: 50,
    y: 0,
    width: 32,
    height: 64,
    velocityY: 0,
    isJumping: false,
    health: 100,
    score: 0,
    state: 'idle',
    frame: 0,
    animationTimer: 0
};
let enemies = [];
let items = [];
let keys = {};

// Initialize Game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Event Listeners
    document.getElementById('download-btn').addEventListener('click', startDownload);
    document.getElementById('play-btn').addEventListener('click', startGame);
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    document.getElementById('back-btn').addEventListener('click', hideSettings);
    document.getElementById('credits-btn').addEventListener('click', showCredits);
    
    // Keyboard controls
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        
        // Space to jump
        if (e.key === ' ' && gameRunning && !player.isJumping) {
            player.velocityY = -gameData.player.stats.jumpForce;
            player.isJumping = true;
            document.getElementById('jump-sound').play();
        }
        
        // Enter to attack
        if (e.key === 'Enter' && gameRunning) {
            player.state = 'attack';
            player.frame = 0;
            player.animationTimer = 0;
            document.getElementById('attack-sound').play();
            checkAttack();
        }
    });
    
    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    // Show loading screen first
    document.getElementById('loading-screen').style.display = 'flex';
}

// Start Download Simulation
function startDownload() {
    const btn = document.getElementById('download-btn');
    const bar = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    
    btn.disabled = true;
    text.textContent = "Downloading game assets...";
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(showMainMenu, 500);
        }
        bar.style.width = `${progress}%`;
    }, 200);
}

// Show Main Menu
function showMainMenu() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('main-theme').volume = 0.5;
    document.getElementById('main-theme').play();
}

// Show Settings
function showSettings() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('settings-menu').style.display = 'flex';
}

// Hide Settings
function hideSettings() {
    document.getElementById('settings-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

// Show Credits
function showCredits() {
    alert("Pixel Adventure Game\nCreated by [Your Name]\n© 2023");
}

// Start Game
function startGame() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    loadLevel(0);
    gameRunning = true;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Load Level
function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    const level = gameData.levels[levelIndex];
    
    // Reset player
    player.x = 50;
    player.y = canvas.height - player.height - 50;
    player.health = gameData.player.stats.health;
    player.state = 'idle';
    player.frame = 0;
    player.animationTimer = 0;
    
    // Update HUD
    document.getElementById('level-display').textContent = levelIndex + 1;
    document.getElementById('score-display').textContent = player.score;
    document.getElementById('player-health').style.width = '100%';
    
    // Load level background
    document.getElementById('game-screen').style.background = `url('${level.background}')`;
    
    // Load level music
    const bgMusic = document.getElementById('main-theme');
    bgMusic.src = level.music;
    bgMusic.play();
    
    // Spawn enemies
    enemies = [];
    level.enemies.forEach(enemyType => {
        for (let i = 0; i < enemyType.count; i++) {
            enemies.push({
                type: enemyType.type,
                x: enemyType.spawnPoints[i],
                y: canvas.height - 50,
                width: 32,
                height: 32,
                health: gameData.enemies[enemyType.type].stats.health,
                state: 'move',
                frame: 0,
                animationTimer: 0
            });
        }
    });
    
    // Spawn items
    items = [];
    level.items.forEach(itemType => {
        itemType.positions.forEach(pos => {
            items.push({
                type: itemType.type,
                x: pos,
                y: canvas.height - 50,
                width: 16,
                height: 16
            });
        });
    });
}

// Game Loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player
    updatePlayer();
    
    // Update enemies
    updateEnemies();
    
    // Update items
    updateItems();
    
    // Draw everything
    drawPlayer();
    drawEnemies();
    drawItems();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Update Player
function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a']) {
        player.x -= gameData.player.stats.speed;
        player.state = 'run';
    } else if (keys['ArrowRight'] || keys['d']) {
        player.x += gameData.player.stats.speed;
        player.state = 'run';
    } else if (player.state !== 'attack') {
        player.state = 'idle';
    }
    
    // Vertical movement (jumping/falling)
    player.y += player.velocityY;
    player.velocityY += 0.5; // Gravity
    
    // Ground collision
    const groundLevel = canvas.height - player.height - 50;
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Update animation
    const anim = gameData.player.animations[player.state];
    player.animationTimer += 0.1;
    if (player.animationTimer >= anim.speed) {
        player.animationTimer = 0;
        player.frame = (player.frame + 1) % anim.frames;
    }
}

// Update Enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        // Simple AI: move toward player
        if (enemy.x < player.x) {
            enemy.x += gameData.enemies[enemy.type].stats.speed;
        } else {
            enemy.x -= gameData.enemies[enemy.type].stats.speed;
        }
        
        // Update animation
        const anim = gameData.enemies[enemy.type].animations[enemy.state];
        enemy.animationTimer += 0.1;
        if (enemy.animationTimer >= anim.speed) {
            enemy.animationTimer = 0;
            enemy.frame = (enemy.frame + 1) % anim.frames;
        }
    });
}

// Update Items
function updateItems() {
    // Check collision with player
    items = items.filter(item => {
        if (isColliding(player, item)) {
            collectItem(item);
            return false;
        }
        return true;
    });
}

// Check Attack
function checkAttack() {
    enemies.forEach(enemy => {
        if (isColliding(player, enemy)) {
            enemy.health -= gameData.player.stats.attackDamage;
            if (enemy.health <= 0) {
                enemy.state = 'die';
                player.score += 100;
                document.getElementById('score-display').textContent = player.score;
            }
        }
    });
}

// Check Collision
function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Collect Item
function collectItem(item) {
    const itemData = gameData.items[item.type];
    
    if (item.type === 'health') {
        player.health = Math.min(player.health + itemData.effect.health, gameData.player.stats.health);
        document.getElementById('player-health').style.width = `${player.health}%`;
    }
    
    // Add sound effect and visual feedback
}

// Draw Player
function drawPlayer() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // In a real game, you would draw the sprite animation here
}

// Draw Enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Draw Items
function drawItems() {
    items.forEach(item => {
        if (item.type === 'health') {
            ctx.fillStyle = '#2ecc71';
        } else {
            ctx.fillStyle = '#f39c12';
        }
        ctx.fillRect(item.x, item.y, item.width, item.height);
    });
}

// Window resize handler
window.addEventListener('resize', function() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// ======================
// SPRITES (ASCII ART)
// ======================
const asciiSprites = {
  player: [
    '  O  ',
    ' /|\\ ',
    ' / \\ '
  ],
  slime: [
    ' ~~~ ',
    '~~~~~',
    ' ~~~ '
  ],
  skeleton: [
    '  X  ',
    ' /|\\ ',
    ' / \\ '
  ],
  health: [
    ' ❤❤❤ ',
    '❤❤❤❤',
    ' ❤❤❤ '
  ]
};

// ======================
// SONIDOS SINTÉTICOS (Web Audio API)
// ======================
function playJumpSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 800;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

function playAttackSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 200;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

// ======================
// DIBUJAR SPRITES ASCII
// ======================
function drawAsciiSprite(x, y, sprite) {
  const tileSize = 16; // Tamaño de cada "píxel" ASCII
  ctx.font = `${tileSize}px monospace`;
  ctx.fillStyle = '#FFFFFF';
  
  sprite.forEach((line, i) => {
    ctx.fillText(line, x, y + (i * tileSize));
  });
}

// Modificar las funciones de dibujo originales:
function drawPlayer() {
  drawAsciiSprite(player.x, player.y, asciiSprites.player);
}

function drawEnemies() {
  enemies.forEach(enemy => {
    drawAsciiSprite(enemy.x, enemy.y, asciiSprites[enemy.type]);
  });
}

function drawItems() {
  items.forEach(item => {
    drawAsciiSprite(item.x, item.y, asciiSprites.health);
  });
}

// Reemplazar los sonidos antiguos:
// En lugar de:
// document.getElementById('jump-sound').play();
// Usar:
playJumpSound();

// Initialize game when page loads
window.onload = init;
