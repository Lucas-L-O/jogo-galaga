export class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 2 + 1;
    }

    update(canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight) this.y = 0;
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
