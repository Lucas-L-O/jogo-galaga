export class Meteor {
    constructor(x, y, size, speed, horizontalSpeed) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.speed = speed;
        this.horizontalSpeed = horizontalSpeed;
        this.color = 'grey';
    }

    update(canvasWidth) {
        this.y += this.speed;
        this.x += this.horizontalSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
}