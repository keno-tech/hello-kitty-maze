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
