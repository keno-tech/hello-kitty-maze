const config = {
    type: Phaser.AUTO,
    width: 600, // Reduced width
    height: 400, // Reduced height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
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

let player, cursors, traps, timerText, exit, gameOverText;
let questionActive = false;
let timer = 30;

function preload() {
    this.load.image('hello-kitty', '/static/images/hello-kitty.png'); // Use cleaned-up sprite
    this.load.image('trap', '/static/images/trap.png'); 
    this.load.image('exit', '/static/images/exit.png');
}

function create() {
    // Background
    this.add.rectangle(300, 200, 600, 400, 0xe0e0e0); // Smaller canvas background

    // Player
    player = this.physics.add.sprite(50, 50, 'hello-kitty').setScale(0.3); // Smaller scale for smaller maze

    // Exit point
    exit = this.physics.add.sprite(550, 350, 'exit').setScale(0.4); // Adjust exit size and position

    // Add traps
    traps = this.physics.add.group();
    traps.create(200, 150, 'trap').setScale(0.4); // Adjust scale for smaller maze
    traps.create(400, 200, 'trap').setScale(0.4);

    // Add collisions
    this.physics.add.overlap(player, traps, onTrap, null, this);
    this.physics.add.overlap(player, exit, onExit, null, this);

    // Player controls
    cursors = this.input.keyboard.createCursorKeys();

    // Timer
    timerText = this.add.text(16, 16, `Time: ${timer}`, { fontSize: '18px', fill: '#000' });
    this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true,
    });

    // Game over text (hidden initially)
    gameOverText = this.add.text(300, 200, '', { fontSize: '24px', fill: '#f00' }).setOrigin(0.5);
}

function update() {
    if (questionActive) return;

    // Player movement
    player.setVelocity(0);
    if (cursors.left.isDown) player.setVelocityX(-100);
    else if (cursors.right.isDown) player.setVelocityX(100);

    if (cursors.up.isDown) player.setVelocityY(-100);
    else if (cursors.down.isDown) player.setVelocityY(100);
}

// Other functions (onTrap, onExit, updateTimer, showQuestion, checkAnswer, endGame) remain the same

function updateTimer() {
    if (timer > 0) {
        timer--;
        timerText.setText(`Time: ${timer}`);
    } else {
        endGame('Time is up! You lose.');
    }
}

function onTrap(player, trap) {
    questionActive = true;
    player.setVelocity(0); // Stop player movement immediately
    trap.destroy();

    // Fetch question from Flask backend
    fetch('/get-question')
        .then((response) => response.json())
        .then((data) => {
            showQuestion(data);
        });
}

function onExit() {
    endGame('Congratulations! You escaped!');
}

function showQuestion(data) {
    const questionDiv = document.createElement('div');
    questionDiv.id = 'question-popup';
    questionDiv.innerHTML = `
        <p>${data.question}</p>
        ${data.options
            .map((option) => `<button onclick="checkAnswer('${option}', '${data.answer}')">${option}</button>`)
            .join('')}
    `;
    document.body.appendChild(questionDiv);
}

function checkAnswer(selected, correct) {
    const popup = document.getElementById('question-popup');
    if (selected === correct) {
        popup.remove();
        questionActive = false; // Allow movement again
    } else {
        alert('Wrong answer! Restarting...');
        location.reload();
    }
}

function endGame(message) {
    gameOverText.setText(message);
    this.physics.pause();
    player.setTint(0xff0000);
    setTimeout(() => location.reload(), 3000); // Reload after 3 seconds
}



function update() {
    // Stop player movement if a question is active
    if (questionActive) {
        player.setVelocity(0);
        return;
    }

    // Player movement logic
    player.setVelocity(0);
    if (cursors.left.isDown) player.setVelocityX(-100);
    else if (cursors.right.isDown) player.setVelocityX(100);

    if (cursors.up.isDown) player.setVelocityY(-100);
    else if (cursors.down.isDown) player.setVelocityY(100);
}
