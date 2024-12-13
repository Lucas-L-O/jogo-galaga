import { Bullet } from "./Bullet.js";

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 10;
        this.canShoot = true;
        this.shootDelay = 200;
    }

    draw(ctx) {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(1, 'purple');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    shoot(bullets) {
        if (this.canShoot) {
            bullets.push(new Bullet(
                this.x + this.width / 2 - 2.5, 
                this.y, 
                5, 
                5, 
                'red', 
                -5,
                'player'
            ));
            this.canShoot = false;
            setTimeout(() => {
                this.canShoot = true;
            }, this.shootDelay);
        }
    }
}