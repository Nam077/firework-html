import { webRandom } from './random_utils.js';
import { canvas, ctx } from './canvas.js';

class Particle {
    constructor(x, y, vx, vy, hue, type, generation = 0, isRecursive = false, delay = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hue = hue;
        this.type = type;
        this.lifespan = 1;
        this.gravity = 0.08;
        this.friction = 0.98;
        this.size = webRandom.randomFloat(1.5, 3.5);
        this.groundLevel = canvas.height;
        this.generation = generation;
        this.hasExploded = false;
        this.childParticles = [];
        this.isRecursive = isRecursive;
        this.delay = delay;
        this.active = delay === 0;
        this.brightness = webRandom.randomFloat(40, 60);
    }

    update() {
        if (!this.active) {
            this.delay -= 0.016;
            if (this.delay <= 0) {
                this.active = true;
            }
            return true;
        }

        this.childParticles = this.childParticles.filter(particle => particle.update());

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.lifespan -= 0.01;

        if (this.isRecursive && !this.hasExploded && this.generation < 2 && this.lifespan < 0.7) {
            if (webRandom.randomFloat(0, 1) < 0.2) {
                this.explodeParticle();
            }
            this.hasExploded = true;
        }

        return this.lifespan > 0 || this.childParticles.length > 0;
    }

    explodeParticle() {
        if (this.generation >= 2) return;

        const numParticles = 5;
        const angleStep = (Math.PI * 2) / numParticles;
        
        for (let i = 0; i < numParticles; i++) {
            const angle = angleStep * i + webRandom.randomFloat(-0.2, 0.2);
            const velocity = webRandom.randomFloat(1, 4);
            const newHue = (this.hue + webRandom.randomFloat(-20, 20)) % 360;
            
            this.childParticles.push(
                new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    newHue,
                    'circle',
                    this.generation + 1,
                    this.isRecursive
                )
            );
        }
    }

    draw() {
        if (!this.active) return;

        this.childParticles.forEach(particle => particle.draw());

        ctx.save();
        ctx.beginPath();
        
        switch(this.type) {
            case 'heart':
                this.drawHeart();
                break;
            case 'star':
                this.drawStar();
                break;
            default:
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }

        const saturation = 100 - (this.generation * 15);
        const lightness = this.brightness + (this.generation * 10);
        ctx.fillStyle = `hsla(${this.hue}, ${saturation}%, ${lightness}%, ${this.lifespan})`;
        ctx.fill();
        
        if (this.lifespan > 0.5) {
            ctx.strokeStyle = `hsla(${this.hue}, 100%, 75%, ${this.lifespan * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawHeart() {
        const size = this.size * 2;
        ctx.moveTo(this.x, this.y);
        ctx.bezierCurveTo(
            this.x - size, this.y - size,
            this.x - size, this.y + size/3,
            this.x, this.y + size
        );
        ctx.bezierCurveTo(
            this.x + size, this.y + size/3,
            this.x + size, this.y - size,
            this.x, this.y
        );
    }

    drawStar() {
        const spikes = 5;
        const outerRadius = this.size * 2;
        const innerRadius = this.size;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(this.x, this.y - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(
                this.x + Math.cos(rot) * outerRadius,
                this.y + Math.sin(rot) * outerRadius
            );
            rot += step;

            ctx.lineTo(
                this.x + Math.cos(rot) * innerRadius,
                this.y + Math.sin(rot) * innerRadius
            );
            rot += step;
        }
        ctx.lineTo(this.x, this.y - outerRadius);
    }
}

export default Particle;
