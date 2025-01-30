let wallBounds = [];

function toVector2(pos) {
    return new Phaser.Math.Vector2(pos.x, pos.y);
}

function normClamp(x, roof) {
    return Math.sign(x) * Math.min((Math.abs(x) / roof), 1);
}

function normClampVector2(v, roof) {
    return new Phaser.Math.Vector2(normClamp(v.x, roof), normClamp(v.y, roof));
}

class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    init() {
        // useful variables
        this.canFire = true;
        this.SHOT_VELOCITY_X = 1100;
        this.SHOT_VELOCITY_Y = 1100;
    }

    preload() {
        this.load.path = './src/assets/img/';
        this.load.image('grass', 'grass.jpg');
        this.load.image('cup', 'cup.jpg');
        this.load.image('ball', 'ball.png');
        this.load.image('wall', 'wall.png');
        this.load.image('oneway', 'one_way_wall.png');
    }

    create() {
        // add background grass
        this.grass = this.add.image(0, 0, 'grass').setOrigin(0);
        var graphics = this.add.graphics();
        graphics.lineStyle(1, 0xFF0000, 1);

        // this boilerplate is wild

        // add cup
        this.cup = this.physics.add.sprite(width/2, height/10, 'cup');
        this.cup.body.setCircle(this.cup.width/4);
        this.cup.body.setOffset(this.cup.width/4);
        this.cup.body.setImmovable(true);

        // add ball
        let ballPos = [(width/2), (height - height/10)];
        this.ball = this.physics.add.sprite(ballPos[0], ballPos[1], 'ball');
        this.ball.body.setCircle(this.ball.width/2);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(0.5);
        this.ball.body.setDamping(true).setDrag(0.5);

        // add walls
        let wallA  = this.physics.add.sprite(width/2, height/4, 'wall');
        wallBounds = [(wallA.width/2), (width - wallA.width/2)];
        wallA.setX(Phaser.Math.Between(wallBounds[0], wallBounds[1]));
        wallA.body.setImmovable(true);

        let y    = Phaser.Math.Between(height/2, ((height * 3/4) - (wallA.height * 2)));
        var path = new Phaser.Curves.Line([wallBounds[0], y, wallBounds[1], y]);
        path.draw(graphics, 128);

        this.wallB = this.physics.add.existing(this.add.follower(path, wallBounds[0], y, 'wall'));
        this.wallB.body.setImmovable(true);

        this.wallB.startFollow({
            duration: 4000,
            yoyo: true,
            repeat: -1,
        });

        
        this.oneway = this.physics.add.sprite(width/2, (height * 3/4), 'oneway');
        this.oneway.setX(Phaser.Math.Between(wallBounds[0], wallBounds[1]));
        this.oneway.body.setImmovable(true);
        this.oneway.body.checkCollision.down = false;

        this.walls = this.add.group({
        });
        this.walls.x += 200;

        // Add your walls manually
        this.walls.add(wallA);
        this.walls.add(this.wallB);
        this.walls.add(this.oneway);
        
        // add pointer input
        this.input.on('pointerdown', (pointer) => {
            if (!this.canFire) return;
            this.canFire = false;
            let shotDir = normClampVector2(toVector2(this.ball).subtract(toVector2(pointer)), 150);
            shotDir.x *= this.SHOT_VELOCITY_X;
            shotDir.y *= this.SHOT_VELOCITY_Y;
            this.ball.body.setVelocity(shotDir.x, shotDir.y);
        });


        // collision
        this.physics.add.collider(this.ball, this.cup, (ball, cup) => {
            ball.setVelocity(0);
            ball.setX(ballPos[0]);
            ball.setY(ballPos[1]);
        });

        this.physics.add.collider(this.ball, this.walls);
    }

    update(time, delta) {
        // wallB velocity update (I don't want to use this.sys.game.loop stuff b/c outdated)
        //const velocity = new Phaser.Math.Vector2(this.wallB.pathDelta.x, this.wallB.pathDelta.y);
        //velocity.scale(1000/delta);
        //this.wallB.body.setVelocityX(velocity.x);
        
        if (this.ball.body.velocity.length() <= 25) {
            this.canFire = true;
        }
    }
}
/*
CODE CHALLENGE
Try to implement at least 3/4 of the following features during the remainder of class (hint: each takes roughly 15 or fewer lines of code to implement):
[x] Add ball reset logic on successful shot
[x] Improve shot logic by making pointer’s relative x-position shoot the ball in correct x-direction
[x] Make one obstacle move left/right and bounce against screen edges
[ ] Create and display shot counter, score, and successful shot percentage
*/
