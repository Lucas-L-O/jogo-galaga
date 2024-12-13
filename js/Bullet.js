export class Bullet {
    constructor(x, y, width, height, color, speed, owner) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
        this.owner = owner;
    }

    update() {
        this.y += this.speed;
    }

    updateEnemy() {
        this.y += Math.abs(this.speed);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}