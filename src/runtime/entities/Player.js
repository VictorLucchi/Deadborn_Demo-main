import { SpriteAnimator } from './SpriteAnimator.js';

const WALK_SPEED = 3;
const RUN_SPEED  = 6;

export class Player {
    constructor(sprites, x, y) {
        this.x = x;
        this.y = y;
        this.direction = 'right';
        this.moving = false;
        this.running = false;

        this.animators = {
            idle:      new SpriteAnimator(sprites.idle,      347, 533, 6),
            walkRight: new SpriteAnimator(sprites.walkRight, 376, 500, 10),
            walkLeft:  new SpriteAnimator(sprites.walkLeft,  376, 500, 10),
        };

        this.animators.idle.addAnimation('idle', 0, 4);
        this.animators.walkRight.addAnimation('walkRight', 0, 6);
        this.animators.walkLeft.addAnimation('walkLeft', 0, 6);

        this.currentAnim = 'idle';
        this.animators.idle.play('idle');
    }

    get animator() {
        return this.animators[this.currentAnim];
    }

    setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        const anim = this.animators[name];
        anim.current = name;
        anim.frame = 0;
        anim.elapsed = 0;
    }

    update(keys, delta, checkCollision) {
        let dx = 0, dy = 0;
        const running = keys['Shift'];
        const speed = running ? RUN_SPEED : WALK_SPEED;
        const up = keys['w'] || keys['ArrowUp'];
        const down = keys['s'] || keys['ArrowDown'];
        const left = keys['a'] || keys['ArrowLeft'];
        const right = keys['d'] || keys['ArrowRight'];

        if (up) dy = -speed;
        if (down) dy = speed;
        if (left) { dx = -speed; this.direction = 'left'; }
        if (right) { dx = speed; this.direction = 'right'; }
        if (up && !down && dx === 0) this.direction = 'up';
        if (down && !up && dx === 0) this.direction = 'down';
        // teclas opostas se cancelam
        if (left && right) dx = 0;
        if (up && down) dy = 0;

        this.moving  = dx !== 0 || dy !== 0;
        this.running = running && this.moving;

        const pw = 24, ph = 8;
        const scale = 0.25;
        const feetOffsetY = this.animator.frameH * scale - ph;

        if (!checkCollision(this.x + dx - pw / 2, this.y + feetOffsetY, pw, ph)) this.x += dx;
        if (!checkCollision(this.x - pw / 2, this.y + dy + feetOffsetY, pw, ph)) this.y += dy;

        if (this.moving && this.direction === 'right') this.setAnim('walkRight');
        else if (this.moving && this.direction === 'left') this.setAnim('walkLeft');
        else this.setAnim('idle');

        // fps mais alto ao correr
        this.animator.fps = this.running ? 18 : 10;

        this.animator.update(delta);
    }

    get sortY() { return this.y + this.animator.frameH * 0.25; }

    draw(ctx, camera, scale = 0.25) {
        const w = this.animator.frameW * scale;
        const screenX = this.x - camera.x - w / 2;
        const screenY = this.y - camera.y;
        this.animator.draw(ctx, screenX, screenY, scale);
    }
}
