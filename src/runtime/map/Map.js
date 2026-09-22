const TILE_SIZE = 32;

export class GameMap {
    constructor(mapData, tilesetImages) {
        this.tilesets = mapData.tilesets.map((ts, i) => ({
            firstgid: ts.firstgid,
            lastgid: i + 1 < mapData.tilesets.length
                ? mapData.tilesets[i + 1].firstgid - 1
                : Infinity,
            image:   tilesetImages[i].image,
            columns: tilesetImages[i].columns,
            scale:   tilesetImages[i].scale ?? 1,
        }));

        this.layers = mapData.layers;
        this.mapW = mapData.width;
        this.mapH = mapData.height;
        this.width = mapData.width * TILE_SIZE;
        this.height = mapData.height * TILE_SIZE;

        this.collisionData = mapData.layers.find(l => l.name === 'collision')?.data ?? [];

        // pré-computa sortY por tiles das camadas objects e objects_front
        this._objectSortY = this._buildSortYMap('objects');
        this._objectFrontSortY = this._buildSortYMap('objects_front');
    }

    // para cada tile da camada objects, calcula o sortY como o Y do tile
    // mais baixo do grupo contíguo vertical ao qual pertence
    _buildSortYMap(layerName) {
        const layer = this.layers.find(l => l.name === layerName);
        if (!layer) return {};

        const map = {};
        for (let col = 0; col < this.mapW; col++) {
            let groupStart = -1;
            let groupEnd   = -1;

            const flush = () => {
                if (groupStart === -1) return;
                const sortY = (groupEnd + 1) * TILE_SIZE;
                for (let r = groupStart; r <= groupEnd; r++) {
                    map[`${r}_${col}`] = sortY;
                }
                groupStart = -1;
            };

            for (let row = 0; row < this.mapH; row++) {
                if (layer.data[row * this.mapW + col]) {
                    if (groupStart === -1) groupStart = row;
                    groupEnd = row;
                } else {
                    flush();
                }
            }
            flush();
        }
        return map;
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

                const sc = ts.scale ?? 1;
                const dw = TILE_SIZE * sc;
                const dh = TILE_SIZE * sc;
                const dx = col * TILE_SIZE - camera.x - (dw - TILE_SIZE) / 2;
                const dy = row * TILE_SIZE - camera.y - (dh - TILE_SIZE);

                if (flipH || flipV || flipD) {
                    ctx.save();
                    ctx.translate(dx + dw / 2, dy + dh / 2);

                    if      ( flipD && !flipH && !flipV) { ctx.rotate( Math.PI / 2); ctx.scale(1, -1); }
                    else if ( flipD &&  flipH && !flipV) { ctx.rotate( Math.PI / 2); }
                    else if ( flipD && !flipH &&  flipV) { ctx.rotate(-Math.PI / 2); }
                    else if ( flipD &&  flipH &&  flipV) { ctx.rotate(-Math.PI / 2); ctx.scale(1, -1); }
                    else if (!flipD &&  flipH && !flipV) { ctx.scale(-1,  1); }
                    else if (!flipD && !flipH &&  flipV) { ctx.scale( 1, -1); }
                    else if (!flipD &&  flipH &&  flipV) { ctx.rotate( Math.PI); }

                    ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, -dw / 2, -dh / 2, dw, dh);
                    ctx.restore();
                } else {
                    ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, dw, dh);
                }
            }
        }
    }

    drawBelow(ctx, camera) {
        this.drawLayer(ctx, camera, 'ground');
        this.drawLayer(ctx, camera, 'ground_details');
        this.drawLayer(ctx, camera, 'objects_back');
    }

    _getTilesFromLayer(camera, layerName, sortYMap) {
        const layer = this.layers.find(l => l.name === layerName);
        if (!layer) return [];

        const startCol = Math.floor(camera.x / TILE_SIZE);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.viewW / TILE_SIZE) + 1, this.mapW);
        const endRow = Math.min(startRow + Math.ceil(camera.viewH / TILE_SIZE) + 1, this.mapH);

        const tiles = [];
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
                const sc = ts.scale ?? 1;
                const dw = TILE_SIZE * sc;
                const dh = TILE_SIZE * sc;
                const dx = col * TILE_SIZE - camera.x - (dw - TILE_SIZE) / 2;
                const dy = row * TILE_SIZE - camera.y - (dh - TILE_SIZE);
                const sortY = sortYMap[`${row}_${col}`] ?? (row + 1) * TILE_SIZE;

                tiles.push({
                    sortY,
                    draw: (ctx) => {
                        if (flipH || flipV || flipD) {
                            ctx.save();
                            ctx.translate(dx + dw / 2, dy + dh / 2);
                            if      ( flipD && !flipH && !flipV) { ctx.rotate( Math.PI / 2); ctx.scale(1, -1); }
                            else if ( flipD &&  flipH && !flipV) { ctx.rotate( Math.PI / 2); }
                            else if ( flipD && !flipH &&  flipV) { ctx.rotate(-Math.PI / 2); }
                            else if ( flipD &&  flipH &&  flipV) { ctx.rotate(-Math.PI / 2); ctx.scale(1, -1); }
                            else if (!flipD &&  flipH && !flipV) { ctx.scale(-1,  1); }
                            else if (!flipD && !flipH &&  flipV) { ctx.scale( 1, -1); }
                            else if (!flipD &&  flipH &&  flipV) { ctx.rotate( Math.PI); }
                            ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, -dw / 2, -dh / 2, dw, dh);
                            ctx.restore();
                        } else {
                            ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, dw, dh);
                        }
                    }
                });
            }
        }
        return tiles;
    }

    getObjectTiles(camera) {
        return [
            ...this._getTilesFromLayer(camera, 'objects', this._objectSortY),
            ...this._getTilesFromLayer(camera, 'objects_front', this._objectFrontSortY),
        ];
    }

    getInteractions() {
        const layer = this.layers.find(l =>
            l.type === 'objectgroup' &&
            l.name.toLowerCase() === 'interactions'
        );
        return layer?.objects ?? [];
    }

    checkCollision(x, y, width, height) {
        if (!this.collisionData.length) return false;

        const startCol = Math.max(0, Math.floor(x / TILE_SIZE));
        const endCol = Math.min(this.mapW - 1, Math.floor((x + width - 1) / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(y / TILE_SIZE));
        const endRow = Math.min(this.mapH - 1, Math.floor((y + height - 1) / TILE_SIZE));

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (this.collisionData[row * this.mapW + col]) return true;
            }
        }

        return false;
    }

    getSpawn(name) {
    const expectedName = String(name ?? '').toLowerCase();
    const objects = this.layers
        .filter(layer => layer.type === 'objectgroup')
        .flatMap(layer => layer.objects ?? []);

    const obj = objects.find(object => {
        const objectName = String(object.name ?? '').toLowerCase();
        const spawnId = object.properties?.find(
            property => property.name.toLowerCase() === 'spawnid'
        )?.value;

        return objectName === expectedName || String(spawnId ?? '').toLowerCase() === expectedName;
    });

    if (!obj) return null;

    return {
        x: obj.x + (obj.width ?? 0) / 2,
        y: obj.y + (obj.height ?? 0) / 2,
        name: obj.name,
        type: obj.type,
        class: obj.class,
        properties: obj.properties ?? []
    };
    }
}
