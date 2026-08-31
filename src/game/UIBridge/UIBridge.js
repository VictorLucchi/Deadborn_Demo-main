import { HUDRenderer } from '../HUDRender/HUDRender.js';

export class UIBridge {

    constructor() {

        this._showCoords = false;
        this._hud = new HUDRenderer();

        window.addEventListener('keydown', (e) => {

            if (e.key === 'F4') {
                e.preventDefault();
                this._showCoords = !this._showCoords;
            }

        });
    }

    draw(ctx, mousePos, jogador) {

        // ========================================
        // DEBUG — COORDENADAS
        // ========================================

        if (this._showCoords && mousePos) {

            ctx.save();

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(8, 8, 200, 24);

            ctx.fillStyle = '#0f0';
            ctx.font = '13px monospace';

            ctx.fillText(
                `x: ${mousePos.x}  y: ${mousePos.y}`,
                16,
                25
            );

            ctx.restore();
        }

        // ========================================
        // HUD
        // ========================================

        if (jogador) {
            this._hud.draw(jogador);
        }
    }
}