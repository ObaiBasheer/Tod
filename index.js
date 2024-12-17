class V2{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    add(that) {
        return new V2(this.x + that.x, this.y + that.y);
    }

    sub(that) {
        return new V2(this.x - that.x, this.y - that.y);
    }

    scale(s) {
        return new V2(this.x * s, this.y * s);
    }

    length() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const len = this.length();
        return new V2(this.x / len, this.y / len);
    }

    dist(that) {
        return this.sub(that).length();
    }
}

function polarV2(mag,dir) {
    return new V2(Math.cos(dir) * mag,Math.sin(dir) * mag);
}

const PLAYER_COLOR = '#f43841' ;
const PLAYER_SPEED = 1500;
const PLAYER_RADIUS = 40;
const BULLET_SPEED = 300000;
const BULLET_RADIUS = 15;
const BULLET_LIFETIME = 5.0;
const TUTORIAL_POPUP_SPEED = 2.0;
const ENEMY_SPEED = BULLET_SPEED / 4;
const ENEMY_RADIUS = 15;
const ENEMY_COLOR = '#9e95c7';
const PARTICLE_RADIUS = 5;
const PARTICLE_COLOR = ENEMY_COLOR;
const PARTICLE_COUNT = 10;
const PARTICLE_MAG = BULLET_SPEED;
const PARTICLE_LIFETIME = 1.0;


const directionMap = {
    's': new V2(0,1.0),
    'w': new V2(0,-1.0),
    'a': new V2(-1.0,0),
    'd': new V2(1.0,0),
}

class TutorialPopup{
    constructor(text){
        this.dalpha = 0.0;
        this.alpha = 0.0;
        this.text = text;
        this.onFadedIn = undefined;
        this.onFadedOut = undefined;
    }

    update(dt) {
        this.alpha += this.dalpha * dt;

        if (this.dalpha < 0.0 && this.alpha <= 0.0) {
            this.delta = 0.0;
            this.alpha = 0.0;

            if(this.onFadedOut !== undefined) {
                this.onFadedOut();
            }
        } else if (this.alpha > 0.0 && this.alpha >= 1.0) {
            this.delta = 0.0;
            this.alpha = 1.0;

            if(this.onFadedIn !== undefined) {
                this.onFadedIn();
            }
        }
    }
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.font = '30px LexendMega';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, width / 2,height / 2);
    }

    fadeIn() {
        this.dalpha = TUTORIAL_POPUP_SPEED;
    }
    fadeOut() {
        this.dalpha = -TUTORIAL_POPUP_SPEED;
    }
}


const tutorialState = Object.freeze( {
    "LearningMovement":0,
    "LearningShooting":1,
    "Finished":2
});


const tutorialMessages = Object.freeze( [
 "WASD To Move",
"Left Mouse Click to shoot",
""
]);

class Tutorial {
    constructor() {
    this.state = tutorialState.LearningMovement;
    this.popup = new TutorialPopup(tutorialMessages[this.state]);
    this.popup.fadeIn();

        this.popup.onFadedOut = () => {

            this.popup.text = tutorialMessages[this.state];
            this.popup.fadeIn();
        }
    }

    update(dt) {
        this.popup.update(dt);

    }
    render(ctx) {
        this.popup.render(ctx);
    }

    playerMoved(){
        if(this.state === tutorialState.LearningMovement){
            this.popup.fadeOut();
            this.state += 1;

        }
    }

    playerShot(){
        if(this.state === tutorialState.LearningShooting){
            this.state += 1;
            this.popup.text =  tutorialMessages[this.state];
        }
    }
}




class Game {
    constructor(){
        this.playerPos = new V2(PLAYER_RADIUS + 10, PLAYER_RADIUS + 10);
        this.mousePos = new V2(0,0);
        this.keyPressed = new Set();
        this.tutorial = new Tutorial();
        this.playerLearntHowToMove = false;
        this.bullets =  [];
        this.enemies =  [];
        this.particles = [];

        this.enemies.push (new Enemy(new V2(800,600)));


    }

    update(dt) {
        let vel = new V2(0,0);
        let moved = false;
        for(let key of this.keyPressed){
          //  console.log(key);
            if(key in directionMap) {
                console.log(true);

                vel =vel.add( directionMap[key].scale(PLAYER_SPEED));
                moved = true;
            }
        }

        if(moved) {
            this.tutorial.playerMoved();
        }


        this.playerPos = this.playerPos.add(vel.scale(dt));
        this.tutorial.update(dt);

        for(let enemy of this.enemies){
            for(let bullet of this.bullets) {
                if(enemy.pos.dist(bullet.pos) <= BULLET_RADIUS + ENEMY_RADIUS){
                    enemy.ded = true;
                    bullet.lifeTime = 0.0;
                }
            }

        }

        for(let bullet of this.bullets){
            bullet.update(dt);
        }


        this.bullets = this.bullets.filter(bullet => bullet.lifeTime > 0.0);


        for(let particle of this.particles){
            particle.update(dt);
        }


        this.particles = this.particles.filter(particle => particle.lifeTime > 0.0);



        for(let enemy of this.enemies){
            enemy.update(dt, this.playerPos);
        }

        this.enemies = this.enemies.filter(enemy => !enemy.ded );
    }
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.clearRect(0, 0, width, height);


        fillCircle(ctx, this.playerPos, PLAYER_RADIUS, PLAYER_COLOR);


        for(let bullet of this.bullets){
            bullet.render(ctx);
        }

        for(let particle of this.particles){
            particle.render(ctx);
        }

        for(let enemy of this.enemies){

            enemy.render(ctx);
        }

        this.tutorial.render(ctx);



    }
    keyDown(e) {

        this.keyPressed.add(e.key);

    }
    keyUp(e) {

        this.keyPressed.delete(e.key);

    }

    mouseMove(e) {
    }
    mouseDown(e) {
        this.tutorial.playerShot();
        const mousePos = new V2(e.offsetX, e.offsetY);

       const bulletVel = mousePos.sub(this.playerPos)
            .normalize()
            .scale(BULLET_SPEED);

      this.bullets.push( new Bullet(this.playerPos, bulletVel));

    }
}

class Particle {
    constructor(pos,vel,lifeTime, radius) {
        this.pos = pos;
        this.vel = vel;
        this.lifeTime = lifeTime;
        this.radius = radius;
    }

    render(ctx){
        fillCircle(ctx, this.pos, this.radius, PARTICLE_COLOR);

    }
    update(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.lifeTime -= dt;
    }
}

function particleBurst(particles, center){
    for(let i = 0; i < Math.random() *  PARTICLE_COUNT; ++i){
        particles.push(
            new Particle(center,
                polarV2(Math.random() * PARTICLE_MAG, Math.random() * 2 * Math.PI),
                Math.random() * PARTICLE_LIFETIME,
                Math.random() * PARTICLE_RADIUS));

    }
}

class Enemy {
    constructor(pos) {
        this.pos = pos;
        this.ded = false;
    }

    update(dt,followPos) {
        let vel = followPos.sub(this.pos)
            .normalize()
            .scale(ENEMY_SPEED * dt);

        this.pos = this.pos.add(vel);
    }
    render(ctx){
        fillCircle(ctx, this.pos, ENEMY_RADIUS, ENEMY_COLOR);

    }
}

class Bullet {
    constructor(pos, vel){
        this.pos = pos;
        this.vel = vel;
        this.lifeTime = BULLET_LIFETIME;
    }

    render(ctx) {
        fillCircle(ctx, this.pos, BULLET_RADIUS, PLAYER_COLOR);

    }

    update(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.lifeTime -= dt;
    }
}


function fillCircle(ctx,center, PLAYER_RADIUS, color= 'green') {
    ctx.beginPath();

    ctx.arc(center.x , center.y , PLAYER_RADIUS, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}



(() => {
    'use strict';
    console.log('Happy developing ✨')

    const canvas = document.querySelector('#game');
    const context = canvas.getContext('2d');
    const game = new Game();

    let start;


    function step(timestamp) {
        if(start === undefined) {
            start = timestamp;
        }

        const dt = (timestamp - start) * 0.001;
        start = timestamp;

        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        game.update(dt);
        game.render(context);

        window.requestAnimationFrame(step);

    }
    window.requestAnimationFrame(step);

    document.addEventListener('keydown', (event) => {
        game.keyDown(event);
    });



    document.addEventListener('keyup', (event) => {
        game.keyUp(event);
    });

    document.addEventListener('mousemove', (event) => {
        //console.log(event);

        game.mouseMove(event);
    })
    document.addEventListener('mousedown', (event) => {
        //console.log(event);

        game.mouseDown(event);
    })

})()


