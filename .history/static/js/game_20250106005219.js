const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);

let player, ground, obstacles, cursors, gameOverText, questionActive = false;
let score = 0, scoreText, speed = 200;

function preload() {
    this.load.image('hello-kitty', '/static/images/hello-kitty.png');
    this.load.image('ground', '/static/images/ground.png');
    this.load.image('obstacle', '/static/images/obstacle.png');
    this.load.image('question-mark', '/static/images/question-mark.png');
}

function create() {
    // Background
    this.add.rectangle(400, 200, 800, 400, 0x87ceeb); // Sky-blue background

    // Ground
    ground = this.physics.add.staticGroup();
    ground.create(400, 390, 'ground').setScale(2).refreshBody();

    // Player (Hello Kitty)
    player = this.physics.add.sprite(100, 300, 'hello-kitty').setScale(0.5);
    player.setCollideWorldBounds(true);

    // Obstacles
    obstacles = this.physics.add.group();

    // Collisions
    this.physics.add.collider(player, ground);
    this.physics.add.overlap(player, obstacles, handleCollision, null, this);

    // Controls
    cursors = this.input.keyboard.createCursorKeys();

    // Score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '18px', fill: '#000' });

    // Spawn obstacles
    this.time.addEvent({
        delay: 1500,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true,
    });

    // Speed up the game over time
    this.time.addEvent({
        delay: 10000,
        callback: increaseSpeed,
        callbackScope: this,
        loop: true,
    });

    // Game Over Text
    gameOverText = this.add.text(400, 200, '', { fontSize: '24px', fill: '#f00' }).setOrigin(0.5);
}
