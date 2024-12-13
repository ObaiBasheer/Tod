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
}


const speed = 1000;
const radius = 50;

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
    }

    update(dt) {
    this.alpha += this.dalpha * dt;

        if (this.dalpha < 0.0 && this.alpha <= 0.0) {
            this.delta = 0.0;
            this.alpha = 0.0;
        } else if (this.alpha > 0.0 && this.alpha >= 1.0) {
            this.delta = 0.0;
            this.alpha = 1.0;
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
        this.dalpha = 1.0;
    }
    fadeOut() {
        this.dalpha = -1.0;
    }
}


class Game {
    constructor(){
        this.pos = new V2(radius + 10, radius + 10);
        this.keyPressed = new Set();
        this.popup = new TutorialPopup("WASD to move around");
        this.popup.fadeIn()
        this.player_learned_how_to_move = false;
    }

    update(dt) {
        let vel = new V2(0,0);

        for(let key of this.keyPressed){
            console.log(key);
            if(key in directionMap) {
                console.log(true);

                vel =vel.add( directionMap[key].scale(speed));
            }
        }

        if(!this.player_learned_how_to_move && vel.length() > 0.0){
            this.player_learned_how_to_move = true;
            this.popup.fadeOut();
        }
        this.pos = this.pos.add(vel.scale(dt));
        this.popup.update(dt);



    }
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.clearRect(0, 0, width, height);


        fillCircle(ctx, this.pos, radius, 'red');

        this.popup.render(ctx);



    }
    keyDown(e) {
        this.keyPressed.add(e.key);

    }
    keyUp(e) {
        this.keyPressed.delete(e.key);

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


})()


