


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
    const radius = 50;
    const context = canvas.getContext('2d');
    const speed = 1000;


    let start;
    let pos = new V2(radius + 10, radius + 10);

    let directionMap = {
        's': new V2(0,speed),
        'w': new V2(0,-speed),
        'a': new V2(-speed,0),
        'd': new V2(speed,0),
    }

    let keyPressed = new Set();


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


        let vel = new V2(0,0);

        for(let key of keyPressed){
            console.log(key);
            if(key in directionMap) {
                console.log(true);

                vel =vel.add( directionMap[key]);
            }
        }





        pos = pos.add(vel.scale(elapsedTime));




        context.clearRect(0, 0, width, height);
        fillCircle(context, pos, radius, 'red');

        window.requestAnimationFrame(step);


    }

    document.addEventListener('keydown', (event) => {

        keyPressed.add(event.key);

    });



    document.addEventListener('keyup', (event) => {
        keyPressed.delete(event.key);

        }
    );

    window.requestAnimationFrame(step);








})()


