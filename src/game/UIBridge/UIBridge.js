export class UIBridge {
    constructor() {
        this._showCoords = false;
        this._avatarImg = null;
        this._avatarLoaded = false;

        const img = new Image();
        img.onload = () => { this._avatarImg = img; this._avatarLoaded = true; };
        img.src = new URL('../../../assets/images/Hades.jpeg', import.meta.url).href;

        window.addEventListener('keydown', (e) => {
            if (e.key === 'F4') { e.preventDefault(); this._showCoords = !this._showCoords; }
        });
    }

    drawMouseHUD(ctx, mousePos, jogador) {
        if (this._showCoords && mousePos) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(8, 8, 200, 24);
            ctx.fillStyle = '#0f0';
            ctx.font = '13px monospace';
            ctx.fillText(`x: ${mousePos.x}  y: ${mousePos.y}`, 16, 25);
        }

        if (!jogador) return;
        this._drawHUD(ctx, jogador);
    }

    _drawHUD(ctx, jogador) {
        const x = 16, y = 16;
        const avatarR = 32;
        const barW = 140, barH = 12;
        const barX = x + avatarR * 2 + 12;

        // --- fundo geral ---
        ctx.save();
        ctx.fillStyle = 'rgba(5, 5, 10, 0.72)';
        this._roundRect(ctx, x - 8, y - 8, barX + barW - x + 16, avatarR * 2 + 16, 10);
        ctx.fill();

        // borda sutil
        ctx.strokeStyle = 'rgba(120, 80, 40, 0.6)';
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, x - 8, y - 8, barX + barW - x + 16, avatarR * 2 + 16, 10);
        ctx.stroke();

        // --- avatar circular ---
        const cx = x + avatarR, cy = y + avatarR;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
        ctx.clip();
        if (this._avatarLoaded) {
            ctx.drawImage(this._avatarImg, cx - avatarR, cy - avatarR, avatarR * 2, avatarR * 2);
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fill();
        }
        ctx.restore();

        // anel do avatar
        ctx.beginPath();
        ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(180, 120, 50, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // --- nome ---
        ctx.fillStyle = 'rgba(220, 200, 160, 0.95)';
        ctx.font = 'bold 11px serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(jogador.nome?.toUpperCase() ?? 'HADES', barX, y + 11);

        // --- barra de vida ---
        const vidaPct = Math.max(0, jogador.vida / jogador.vidaMax);
        this._drawBar(ctx, barX, y + 18, barW, barH, vidaPct, '#8b0000', '#c0392b', '❤ VIDA', jogador.vida, jogador.vidaMax);

        // --- barra de mana ---
        const manaPct = Math.max(0, jogador.mana / jogador.manaMax);
        this._drawBar(ctx, barX, y + 18 + barH + 8, barW, barH, manaPct, '#00008b', '#2980b9', '✦ MANA', jogador.mana, jogador.manaMax);

        // --- slot de item equipado ---
        const slotY = y + avatarR * 2 + 24;
        this._drawEquipSlot(ctx, x - 8, slotY, jogador.armaEquipada);

        ctx.restore();
    }

    _drawBar(ctx, x, y, w, h, pct, colorBg, colorFill, label, cur, max) {
        // fundo da barra
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this._roundRect(ctx, x, y, w, h, 4);
        ctx.fill();

        // preenchimento
        if (pct > 0) {
            ctx.fillStyle = colorFill;
            this._roundRect(ctx, x, y, Math.max(4, w * pct), h, 4);
            ctx.fill();

            // brilho
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(x + 2, y + 2, (w - 4) * pct, h / 3);
        }

        // borda
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        this._roundRect(ctx, x, y, w, h, 4);
        ctx.stroke();

        // texto
        ctx.fillStyle = 'rgba(230,220,200,0.9)';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${label}  ${Math.floor(cur)}/${Math.floor(max)}`, x + 4, y + h - 2);
    }

    _drawEquipSlot(ctx, x, y) {
        const size = 36;
        // fundo do slot
        ctx.fillStyle = 'rgba(5, 5, 10, 0.8)';
        this._roundRect(ctx, x, y, size, size, 6);
        ctx.fill();

        ctx.strokeStyle = 'rgba(180, 120, 50, 0.7)';
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, x, y, size, size, 6);
        ctx.stroke();

        // ícone de espada (placeholder)
        ctx.fillStyle = 'rgba(180, 160, 100, 0.6)';
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚔', x + size / 2, y + size / 2 + 7);
        ctx.textAlign = 'left';
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}
