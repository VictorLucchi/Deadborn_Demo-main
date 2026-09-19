export class SpriteAnimator {
    constructor(image, frameW, frameH, fps = 8) {
        this.image = image;
        this.frameW = frameW;
        this.frameH = frameH;
        this.fps = fps;

        // animations: { name: { row, frames } }
        this.animations = {};
        this.current = null;
        this.frame = 0;
        this.elapsed = 0;
    }

    addAnimation(name, row, frames) {
        this.animations[name] = { row, frames };
    }

    play(name) {
        if (this.current === name) return;
        this.current = name;
        this.frame = 0;
        this.elapsed = 0;
    }

    update(delta) {
        if (!this.current) return;
        this.elapsed += delta;
        const frameDuration = 1000 / this.fps;
        if (this.elapsed >= frameDuration) {
            const anim = this.animations[this.current];
            this.frame = (this.frame + 1) % anim.frames;
            this.elapsed = 0;
        }
    }

    draw(ctx, x, y, scale = 1, offsetX = 0, offsetY = 0) {
        if (!this.current) return;
        const anim = this.animations[this.current];
        const sx = this.frame * this.frameW;
        const sy = anim.row * this.frameH;
        ctx.drawImage(
            this.image,
            sx, sy, this.frameW, this.frameH,
            x + offsetX, y + offsetY, this.frameW * scale, this.frameH * scale
        );
    }
}
