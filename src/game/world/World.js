import { Player }  from '../entities/Player.js';
import { Hunter }  from '../entities/Hunter.js';
import { Camera }  from '../Camera.js';
import { GameMap } from '../map/Map.js';

import mapData        from '../../assets/map/mapateste.json';
import floor1Url      from '../../assets/map/floor1.jpeg';
import arcadia1Url    from '../../assets/map/arcadia1.png';
import solo2Url       from '../../assets/map/Solo2.jpeg';
import arcadia2Url    from '../../assets/map/arcadia2.png';
import solo3Url       from '../../assets/map/solo3.jpeg';
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

export async function createWorld(canvasWidth, canvasHeight) {
    const [
        floor1, arcadia1, solo2, arcadia2, solo3,
        idle, walkRight, walkLeft,
        idleHunter, walkRightHunter, walkLeftHunter, runHunter,
    ] = await Promise.all([
        loadImage(floor1Url),
        loadImage(arcadia1Url),
        loadImage(solo2Url),
        loadImage(arcadia2Url),
        loadImage(solo3Url),
        loadImage(idleUrl),
        loadImage(walkRightUrl),
        loadImage(walkLeftUrl),
        loadImage(idleHunterUrl),
        loadImage(walkRightHunterUrl),
        loadImage(walkLeftHunterUrl),
        loadImage(runHunterUrl),
    ]);

    const map    = new GameMap(mapData, [floor1, arcadia1, solo2, arcadia2, solo3]);
    const camera = new Camera(map.width, map.height, canvasWidth, canvasHeight);
    const player = new Player({ idle, walkRight, walkLeft }, map.width / 2, map.height / 2);

    const hunterSprites = { idle: idleHunter, walkRight: walkRightHunter, walkLeft: walkLeftHunter, run: runHunter };
    const initialHunter = new Hunter(hunterSprites, map.width / 2 + 200, map.height / 2);

    return { map, camera, player, initialEnemies: [initialHunter], hunterSprites };
}
