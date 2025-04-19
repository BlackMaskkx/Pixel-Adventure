// Game Data (JSON)
const gameData = {
    player: {
        spriteSheet: "assets/sprites/player.png",
        animations: {
            idle: { frames: 4, speed: 0.2 },
            run: { frames: 6, speed: 0.15 },
            jump: { frames: 2, speed: 0.1 },
            attack: { frames: 5, speed: 0.1 }
        },
        stats: {
            health: 100,
            speed: 5,
            jumpForce: 15,
            attackDamage: 20
        }
    },
    enemies: {
        slime: {
            spriteSheet: "assets/sprites/slime.png",
            animations: {
                move: { frames: 4, speed: 0.2 },
                die: { frames: 3, speed: 0.15 }
            },
            stats: {
                health: 30,
                speed: 2,
                damage: 10
            }
        },
        skeleton: {
            spriteSheet: "assets/sprites/skeleton.png",
            animations: {
                move: { frames: 4, speed: 0.2 },
                attack: { frames: 5, speed: 0.15 },
                die: { frames: 4, speed: 0.15 }
            },
            stats: {
                health: 50,
                speed: 3,
                damage: 15
            }
        }
    },
    levels: [
        {
            id: 1,
            name: "Forest",
            background: "assets/backgrounds/forest.png",
            music: "assets/music/forest-theme.mp3",
            enemies: [
                { type: "slime", count: 5, spawnPoints: [100, 300, 500, 700, 900] },
                { type: "bat", count: 3, spawnPoints: [200, 400, 600] }
            ],
            boss: {
                type: "giant-slime",
                spawnPoint: 1200,
                stats: {
                    health: 200,
                    damage: 20,
                    speed: 1.5
                }
            },
            items: [
                { type: "health", positions: [250, 550, 850] },
                { type: "chest", positions: [400, 800] }
            ]
        },
        {
            id: 2,
            name: "Dungeon",
            background: "assets/backgrounds/dungeon.png",
            music: "assets/music/dungeon-theme.mp3",
            enemies: [
                { type: "skeleton", count: 8, spawnPoints: [150, 300, 450, 600, 750, 900, 1050, 1200] },
                { type: "ghost", count: 4, spawnPoints: [200, 500, 800, 1100] }
            ],
            boss: {
                type: "dragon",
                spawnPoint: 1500,
                stats: {
                    health: 300,
                    damage: 25,
                    speed: 2
                }
            },
            items: [
                { type: "health", positions: [350, 700, 1050] },
                { type: "chest", positions: [500, 1000] },
                { type: "key", positions: [750] }
            ]
        }
    ],
    items: {
        health: {
            sprite: "assets/sprites/health.png",
            effect: { health: 25 }
        },
        chest: {
            sprite: "assets/sprites/chest.png",
            contents: ["sword", "armor", "coins"]
        }
    }
};

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameData;
}
