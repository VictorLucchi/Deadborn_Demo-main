const TILE_SIZE = 32;

export class GameMap {
    constructor(mapData, tilesetImages) {
        const columns = [16, 48, 39, 48, 39]; // solo, casa1, Solo2, arcadia2, solo3
        this.tilesets = mapData.tilesets.map((ts, i) => ({
            firstgid: ts.firstgid,
            lastgid: i + 1 < mapData.tilesets.length
                ? mapData.tilesets[i + 1].firstgid - 1
                : Infinity,
            image: tilesetImages[i],
            columns: columns[i],
        }));

        this.layers = mapData.layers;
        this.mapW = mapData.width;
        this.mapH = mapData.height;
        this.width = mapData.width * TILE_SIZE;
        this.height = mapData.height * TILE_SIZE;

        this.collisionData = mapData.layers.find(l => l.name === 'collision')?.data ?? [];
    }

    getTileset(gid) {
        return this.tilesets.find(ts => gid >= ts.firstgid && gid <= ts.lastgid);
    }

    drawLayer(ctx, camera, layerName) {
        const layer = this.layers.find(l => l.name === layerName);
        if (!layer) return;

        const startCol = Math.floor(camera.x / TILE_SIZE);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.viewW / TILE_SIZE) + 1, this.mapW);
        const endRow = Math.min(startRow + Math.ceil(camera.viewH / TILE_SIZE) + 1, this.mapH);

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const rawGid = layer.data[row * this.mapW + col];
                if (!rawGid) continue;

                const flipH = (rawGid & 0x80000000) >>> 0 ? true : false;
                const flipV = (rawGid & 0x40000000) >>> 0 ? true : false;
                const flipD = (rawGid & 0x20000000) >>> 0 ? true : false;
                const gid   = (rawGid & 0x1FFFFFFF) >>> 0;
                const ts = this.getTileset(gid);
                if (!ts) continue;

                const localId = gid - ts.firstgid;
                const sx = (localId % ts.columns) * TILE_SIZE;
                const sy = Math.floor(localId / ts.columns) * TILE_SIZE;

                const dx = col * TILE_SIZE - camera.x;
                const dy = row * TILE_SIZE - camera.y;

                if (flipH || flipV || flipD) {
                    ctx.save();
                    ctx.translate(dx + TILE_SIZE / 2, dy + TILE_SIZE / 2);

                    if      ( flipD && !flipH && !flipV) { ctx.rotate( Math.PI / 2); ctx.scale(1, -1); }
                    else if ( flipD &&  flipH && !flipV) { ctx.rotate( Math.PI / 2); }
                    else if ( flipD && !flipH &&  flipV) { ctx.rotate(-Math.PI / 2); }
                    else if ( flipD &&  flipH &&  flipV) { ctx.rotate(-Math.PI / 2); ctx.scale(1, -1); }
                    else if (!flipD &&  flipH && !flipV) { ctx.scale(-1,  1); }
                    else if (!flipD && !flipH &&  flipV) { ctx.scale( 1, -1); }
                    else if (!flipD &&  flipH &&  flipV) { ctx.rotate( Math.PI); }

                    ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
                    ctx.restore();
                } else {
                    ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    drawBelow(ctx, camera) {
        this.drawLayer(ctx, camera, 'ground');
        this.drawLayer(ctx, camera, 'ground_details');
    }

    drawAbove(ctx, camera) {
        this.drawLayer(ctx, camera, 'objects');
    }

    checkCollision(x, y, w, h) {
        const left   = Math.floor(x / TILE_SIZE);
        const right  = Math.floor((x + w - 1) / TILE_SIZE);
        const top    = Math.floor(y / TILE_SIZE);
        const bottom = Math.floor((y + h - 1) / TILE_SIZE);

        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                if (row < 0 || col < 0 || row >= this.mapH || col >= this.mapW) return true;
                if (this.collisionData[row * this.mapW + col]) return true;
            }
        }
        return false;
    }
}
