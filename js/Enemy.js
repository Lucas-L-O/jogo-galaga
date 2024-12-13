import { Bullet } from './Bullet.js';

export class Enemy {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.speed = speed;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.horizontalSpeed = Math.random() > 0.5 ? 2 : 0;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.canShoot = true;
        this.bulletColor = 'yellow';
    }

    update(canvasWidth) {
        this.y += this.speed;

        if (this.horizontalSpeed) {
            this.x += this.horizontalSpeed * this.direction;
            if (this.x <= 0 || this.x + this.width >= canvasWidth) {
                this.direction *= -1;
            }
        }
    }

    shoot() {
        // Lógica para criar uma nova bala
        return new Bullet(
            this.x + this.width / 2 - 2.5, 
            this.y + this.height, 
            5, 
            10, 
            this.bulletColor, 
            4,
            'enemy'
        );
    }
    

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
