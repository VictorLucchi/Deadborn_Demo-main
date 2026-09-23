export class Camera {
    constructor(mapW, mapH, viewW, viewH, zoom = 1) {
        this.x = 0;
        this.y = 0;
        this.mapW = mapW;
        this.mapH = mapH;
        this.zoom = zoom;
        this.viewW = viewW / zoom;
        this.viewH = viewH / zoom;
    }

    follow(target) {
    this.x = target.x - this.viewW / 2;
    this.y = target.y - this.viewH / 2;

    const maxX = this.mapW - this.viewW;
    const maxY = this.mapH - this.viewH;

    this.x = maxX < 0 ? 0 : Math.max(0, Math.min(this.x, maxX));
    this.y = maxY < 0 ? 0 : Math.max(0, Math.min(this.y, maxY));
}

    resize(viewW, viewH) {
        this.viewW = viewW / this.zoom;
        this.viewH = viewH / this.zoom;
    }
}
