const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

let player;
let cursors;
let traps;
let questionActive = false;

function preload() {
    this.load.image('hello-kitty', '/static/images/hello-kitty.png');
    this.load.image('wall', '/static/images/wall.png');
    this.load.image('trap', '/static/images/trap.png');
}

function create() {
    // Maze layout
    this.add.rectangle(400, 300, 800, 600, 0xffffff); // Background
    player = this.physics.add.sprite(50, 50, 'hello-kitty').setScale(0.5);

    // Add traps
    traps = this.physics.add.group();
    traps.create(200, 200, 'trap');
    traps.create(400, 400, 'trap');

    // Add collisions
    this.physics.add.overlap(player, traps, onTrap, null, this);

    // Player movement controls
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (questionActive) return;

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-150);
    } else if (cursors.right.isDown) {
        player.setVelocityX(150);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-150);
    } else if (cursors.down.isDown) {
        player.setVelocityY(150);
    } else {
        player.setVelocityY(0);
    }
}

function onTrap(player, trap) {
    questionActive = true;
    trap.destroy();

    // Fetch question from Flask backend
    fetch('/get-question')
        .then((response) => response.json())
        .then((data) => {
            showQuestion(data);
        });
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
        questionActive = false;
    } else {
        alert('Wrong answer! Restarting...');
        location.reload();
    }
}
