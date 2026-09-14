import { Player }  from '../entities/Player.js';
import { Hunter }  from '../entities/Hunter.js';
import { Crow }    from '../entities/Crow.js';
import { Camera }  from '../Camera.js';
import { GameMap } from '../map/Map.js';

import casaTeste1Data from '../../assets/map/casaTeste1.json';
import casa01Data     from '../../assets/map/Casa01.json';
import floor1Url      from '../../assets/map/floor1.jpeg';
import arcadia1Url    from '../../assets/map/arcadia1.png';
import solo2Url       from '../../assets/map/Solo2.jpeg';
import arcadia2Url    from '../../assets/map/arcadia2.png';
import solo3Url       from '../../assets/map/solo3.jpeg';
import casaTesteUrl   from '../../assets/map/casa Teste.png';
import woodFloorUrl   from '../../assets/map/woodfloor.jpg';
import corvoUrl       from '../../assets/sprite-corvo/anfitrião(corvo).png';
import idleUrl        from '../../assets/sprites/idle hades.png';
import walkRightUrl   from '../../assets/sprites/hades walking direita.png';
import walkLeftUrl    from '../../assets/sprites/hades walking esquerda.png';
import idleHunterUrl      from '../../assets/sprites/idle hunter.png';
import walkRightHunterUrl from '../../assets/sprites/hunter walking direita.png';
import walkLeftHunterUrl  from '../../assets/sprites/hunter walking esquerda.png';
import runHunterUrl       from '../../assets/sprites/hunter run.png';

function loadImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}

// Tilesets partilhados entre mapas
let _sharedImages = null;
async function getSharedImages() {
    if (_sharedImages) return _sharedImages;
    const [floor1, arcadia1, solo2, arcadia2, solo3, casaTeste, woodFloor,
           idle, walkRight, walkLeft, idleHunter, walkRightHunter, walkLeftHunter, runHunter, corvImg] =
        await Promise.all([
            loadImage(floor1Url), loadImage(arcadia1Url), loadImage(solo2Url),
            loadImage(arcadia2Url), loadImage(solo3Url), loadImage(casaTesteUrl),
            loadImage(woodFloorUrl),
            loadImage(idleUrl), loadImage(walkRightUrl), loadImage(walkLeftUrl),
            loadImage(idleHunterUrl), loadImage(walkRightHunterUrl),
            loadImage(walkLeftHunterUrl), loadImage(runHunterUrl), loadImage(corvoUrl),
        ]);
    _sharedImages = { floor1, arcadia1, solo2, arcadia2, solo3, casaTeste, woodFloor,
                      idle, walkRight, walkLeft, idleHunter, walkRightHunter,
                      walkLeftHunter, runHunter, corvImg };
    return _sharedImages;
}

// Configuração de cada mapa: dados JSON + tilesets na ordem correta
const MAP_CONFIGS = {
    casaTeste1: {
        data: casaTeste1Data,
        tilesets: (imgs) => [
            { image: imgs.floor1,    columns: 16 },
            { image: imgs.arcadia1,  columns: 48 },
            { image: imgs.solo2,     columns: 39 },
            { image: imgs.arcadia2,  columns: 48 },
            { image: imgs.solo3,     columns: 39 },
            { image: imgs.casaTeste, columns: 48, scale: 1.7 },
        ],
    },
    mapa_teste: {
        data: casa01Data,
        tilesets: (imgs) => [
            { image: imgs.woodFloor, columns: 24 },
            { image: imgs.casaTeste, columns: 48, scale: 1.7 },
            { image: imgs.arcadia1,  columns: 48 },
        ],
    },
};

export { getSharedImages };

export async function loadMap(mapName, canvasWidth, canvasHeight) {
    const imgs   = await getSharedImages();
    const config = MAP_CONFIGS[mapName];
    if (!config) throw new Error(`Mapa desconhecido: ${mapName}`);

    const map    = new GameMap(config.data, config.tilesets(imgs));
    const camera = new Camera(map.width, map.height, canvasWidth, canvasHeight);

    return { map, camera };
}
