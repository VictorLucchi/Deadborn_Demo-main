const FRAME_COUNT = 6;
const FRAME_W     = 1308 / FRAME_COUNT; // 218
const FRAME_H     = 370;
const SCALE       = 0.11; // metade do tamanho anterior
const FPS         = 8;

export class Crow {
    constructor(img, x, y) {
        this.img      = img;
        this.x        = x;
        this.y        = y;
        this._frame   = 0;
        this._elapsed = 0;
        this.visible  = true;
    }

    get drawW() { return FRAME_W * SCALE; }
    get drawH() { return FRAME_H * SCALE; }

    update(delta) {
        this._elapsed += delta;
        if (this._elapsed >= 1000 / FPS) {
            this._elapsed = 0;
            this._frame   = (this._frame + 1) % FRAME_COUNT;
        }
    }

    get sortY() { return this.y; }

    draw(ctx, camera) {
        if (!this.visible) return;
        const sx = this.x - camera.x - this.drawW / 2;
        const sy = this.y - camera.y - this.drawH;

        if (this.img) {
            ctx.drawImage(
                this.img,
                this._frame * FRAME_W, 0,
                FRAME_W, FRAME_H,
                sx, sy,
                this.drawW, this.drawH
            );
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(sx, sy, this.drawW, this.drawH);
            ctx.fillStyle = '#aaa';
            ctx.font = '24px serif';
            ctx.fillText('🐦', sx + 8, sy + 32);
        }
    }
}
