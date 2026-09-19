export class Camera {
    constructor(mapW, mapH, viewW, viewH) {
        this.x = 0;
        this.y = 0;
        this.mapW = mapW;
        this.mapH = mapH;
        this.viewW = viewW;
        this.viewH = viewH;
    }

    follow(target) {
        this.x = target.x - this.viewW / 2;
        this.y = target.y - this.viewH / 2;

        // limita nos bordos do mapa
        this.x = Math.max(0, Math.min(this.x, this.mapW - this.viewW));
        this.y = Math.max(0, Math.min(this.y, this.mapH - this.viewH));
    }

    resize(viewW, viewH) {
        this.viewW = viewW;
        this.viewH = viewH;
    }
}
