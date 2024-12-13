


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
    const radius = 69;
    const context = canvas.getContext('2d');
    const speed = 1000;


    let start;
    let pos = new V2(radius + 10, radius + 10);
    let vel = new V2(0,0);

    let directionMap = {
        's': new V2(0,speed),
        'w': new V2(0,-speed),
        'a': new V2(-speed,0),
        'd': new V2(speed,0),
    }


    function step(timestamp) {
        if(start === undefined) {
            start = timestamp;
        }
        const elapsedTime = (timestamp - start) * 0.001;
        start = timestamp;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;







        pos = pos.add(vel.scale(elapsedTime));


        context.clearRect(0, 0, width, height);
        fillCircle(context, pos, radius, 'red');

        window.requestAnimationFrame(step);


    }

    document.addEventListener('keydown', (event) => {
        console.log(event.key);

        if(event.key in directionMap) {
            vel =vel.add( directionMap[event.key]);
        }
    });



    document.addEventListener('keyup', (event) => {
        if(event.key in directionMap) {
            vel =vel.sub( directionMap[event.key]);
        }
        }
    );

    window.requestAnimationFrame(step);








})()


