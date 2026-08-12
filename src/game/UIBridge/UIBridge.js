export class UIBridge {
    drawMouseHUD(ctx, mousePos) {
        if (!mousePos) return;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(8, 8, 200, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`x: ${mousePos.x}  y: ${mousePos.y}`, 16, 25);
    }
}
