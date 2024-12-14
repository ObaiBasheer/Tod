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
}


const speed = 1000;
const radius = 69;
const BULLET_SPEED = 300000;
const BULLET_RADIUS = 22;
const BULLET_LIFETIME = 5.0;
const TUTORIAL_POPUP_SPEED = 2.0;


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
        this.playerPos = new V2(radius + 10, radius + 10);
        this.mousePos = new V2(0,0);
        this.keyPressed = new Set();
        this.tutorial = new Tutorial();
        this.playerLearntHowToMove = false;
        this.bullets =  [];
    }

    update(dt) {
        let vel = new V2(0,0);
        let moved = false;
        for(let key of this.keyPressed){
            console.log(key);
            if(key in directionMap) {
                console.log(true);

                vel =vel.add( directionMap[key].scale(speed));
                moved = true;
            }
        }

        if(moved) {
            this.tutorial.playerMoved();
        }


        this.playerPos = this.playerPos.add(vel.scale(dt));
        this.tutorial.update(dt);

        for(let bullet of this.bullets){
            bullet.update(dt);
        }

        this.bullets = this.bullets.filter(bullet => bullet.lifeTime > 0.0);

    }
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.clearRect(0, 0, width, height);


        fillCircle(ctx, this.playerPos, radius, 'red');

        this.tutorial.render(ctx);

        for(let bullet of this.bullets){
            bullet.render(ctx);
        }


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

class Bullet {
    constructor(pos, vel){
        this.pos = pos;
        this.vel = vel;
        this.lifeTime = BULLET_LIFETIME;
    }

    render(ctx) {
        fillCircle(ctx, this.pos, BULLET_RADIUS, 'green');

    }

    update(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.lifeTime -= dt;
    }
}


function fillCircle(ctx,center, radius, color= 'green') {
    ctx.beginPath();

    ctx.arc(center.x , center.y , radius, 0, 2 * Math.PI, false);
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


