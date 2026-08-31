export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.rain = Array.from({ length: 200 }, () => ({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            len:   Math.random() * 14 + 8,
            speed: Math.random() * 6 + 14,
            wind:  Math.random() * 1.5 + 0.5,
        }));
    }

    draw(ctx, map, player, entityManager, camera, uiBridge, mousePos, jogador) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        map.drawBelow(ctx, camera);
        map.drawAbove(ctx, camera);
        player.draw(ctx, camera);
        entityManager.draw(ctx, camera);

        this._drawFog(ctx, player, camera);
        this._drawRain(ctx);
        uiBridge.draw(ctx, mousePos, jogador);
    }

    _drawFog(ctx, player, camera) {
        const px = player.x - camera.x;
        const py = player.y - camera.y + player.animator.frameH * 0.25 * 0.5;

        ctx.fillStyle = 'rgba(30, 30, 35, 0.45)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const fog = ctx.createRadialGradient(px, py, 20, px, py, 160);
        fog.addColorStop(0,   'rgba(0,0,0,0)');
        fog.addColorStop(0.3, 'rgba(20,20,25,0.6)');
        fog.addColorStop(0.6, 'rgba(15,15,20,0.88)');
        fog.addColorStop(1,   'rgba(10,10,15,0.98)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _drawRain(ctx) {
        ctx.strokeStyle = 'rgba(180, 190, 210, 0.35)';
        ctx.lineWidth = 0.8;
        this.rain.forEach(drop => {
            drop.y += drop.speed;
            drop.x += drop.wind;
            if (drop.y > this.canvas.height) {
                drop.y = -drop.len;
                drop.x = Math.random() * this.canvas.width;
            }
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + drop.wind * 2, drop.y + drop.len);
            ctx.stroke();
        });
    }
}
