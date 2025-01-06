const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: true,
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
    this.load.image('obstacle', '/static/images/obstacle.png');
    this.load.image('question-mark', '/static/images/question-mark.png');

}
function create() {
    // Background
    this.add.rectangle(400, 200, 800, 400, 0x87ceeb); // Sky-blue background

// Ground (visual representation using Graphics)
const groundGraphics = this.add.graphics();
groundGraphics.lineStyle(4, 0x8B4513); // Brown color for the line
groundGraphics.beginPath();
groundGraphics.moveTo(0, 390); // Starting point (x, y)
groundGraphics.lineTo(800, 390); // Ending point (x, y)
groundGraphics.strokePath();
groundGraphics.fillStyle(0x8B4513, 1); // Brown color to fill the ground
groundGraphics.fillRect(0, 380, 800, 20); // Draw a filled rectangle for the ground

    // Physics-enabled ground (using a static rectangle for collision detection)
    ground = this.physics.add.staticGroup();
    ground.create(400, 385, null).setSize(800, 10); // Set size as a rectangle for collision detection

    // Player (Hello Kitty)
    player = this.physics.add.sprite(50, 120, 'hello-kitty').setScale(0.3);

    // Set a smaller hitbox, making it more forgiving
    player.body.setSize(50, 120); // Adjust the width and height as needed
    player.body.setOffset(10, 10); // Offset the hitbox to center it properly
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
    // this.time.addEvent({
    //     delay: 10000,
    //     callback: increaseSpeed,
    //     callbackScope: this,
    //     loop: true,
    // });

    // Game Over Text
    gameOverText = this.add.text(400, 200, '', { fontSize: '24px', fill: '#f00' }).setOrigin(0.5);
}
function update() {
    if (questionActive) return; // Pause everything during questions

    // Player jump
    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
    }

    // Move obstacles to the left
    obstacles.getChildren().forEach((obstacle) => {
        obstacle.x -= speed * 0.01;
        if (obstacle.x < -50) obstacle.destroy(); // Remove off-screen obstacles
    });

    // Update score
    score += 0.01; // Increment score
    scoreText.setText(`Score: ${Math.floor(score)}`);
}

function update() {
    if (questionActive) return; // Pause movement during questions

    // Player jump
    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
    }

    // Move obstacles to the left
    obstacles.getChildren().forEach((obstacle) => {
        obstacle.x -= speed * 0.01;
        if (obstacle.x < -50) obstacle.destroy(); // Remove off-screen obstacles
    });

    // Update score
    score += 0.01; // Increment score
    scoreText.setText(`Score: ${Math.floor(score)}`);
}
function spawnObstacle() {
    const obstacleType = Phaser.Math.Between(0, 1); // 0 = normal, 1 = question mark
    const x = 800;
    const y = 350; // Ground level

    let obstacle;
    if (obstacleType === 0) {
        obstacle = obstacles.create(x, y, 'obstacle').setScale(0.05);
    } else {
        obstacle = obstacles.create(x, y, 'question-mark').setScale(0.05);
    }

    obstacle.setVelocityX(-speed); // Move obstacle to the left
    obstacle.body.setAllowGravity(false); // Disable gravity effect on obstacles
    obstacle.setImmovable(true); // Ensure obstacle doesn't fall or get affected by physics

    // Optional: Set it to a fixed position in Y to avoid vertical movement
    obstacle.setY(350);
}




function handleCollision(player, obstacle) {
    if (obstacle.texture.key === 'question-mark') {
        questionActive = true;
        obstacle.destroy();

        // Pause game physics to stop movement
        this.physics.world.pause();

        // Fetch question
        fetch('/get-question')
            .then((response) => response.json())
            .then((data) => {
                showQuestion(data);
            });
    } else {
        endGame('Game Over! You hit an obstacle.');
    }
}

function showQuestion(data) {
    const questionDiv = document.createElement('div');
    questionDiv.id = 'question-popup';
    questionDiv.style.position = 'absolute';
    questionDiv.style.top = '50%';
    questionDiv.style.left = '50%';
    questionDiv.style.transform = 'translate(-50%, -50%)';
    questionDiv.style.padding = '20px';
    questionDiv.style.backgroundColor = 'white';  // White background for visibility
    questionDiv.style.border = '2px solid #000';  // Black border for distinction
    questionDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'; // Optional shadow

    questionDiv.innerHTML = `
        <p>${data.question}</p>
        ${data.options
            .map((option) => `
                <button onclick="checkAnswer.call(game.scene.keys.default, '${option}', '${data.answer}')">${option}</button>
            `)
            .join('')}
    `;
    document.body.appendChild(questionDiv);
}


function checkAnswer(selected, correct) {
    const popup = document.getElementById('question-popup');
    if (selected === correct) {
        popup.remove();
        questionActive = false;

        // Resume physics after answering
        this.physics.world.resume();
    } else {
        endGame('Wrong answer! Game Over.');
    }
}

function endGame(message) {
    gameOverText.setText(message);
    this.physics.pause();
    player.setTint(0xff0000);
    setTimeout(() => location.reload(), 3000); // Reload after 3 seconds
}

function increaseSpeed() {
    speed += 20; // Increase game speed every 10 seconds
}
