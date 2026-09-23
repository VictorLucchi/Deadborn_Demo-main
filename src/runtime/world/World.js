import { Player }  from '../entities/Player.js';
import { Hunter }  from '../entities/Hunter.js';
import { Crow }    from '../entities/Crow.js';
import { Camera }  from '../Camera.js';
import { GameMap } from '../map/Map.js';

// ============================================================
// MAPAS
// ============================================================

import entradaCidadeData   from '../../assets/map/entrada-cidade-cinerea.json';
import cinereaWellData     from '../../assets/map/cinerea_well.json';
import musicianHouseData   from '../../assets/map/Musician_house.json';
import basementHouseData   from '../../assets/map/basement_musician_house.json';
import stairsHouseData     from '../../assets/map/stairsUp_musician_house.json';

// ============================================================
// TILESETS
// ============================================================

// -----------------------------
// Tilesets antigos
// -----------------------------

import floor1Url      from '../../assets/map/floor1.jpeg';
import arcadia1Url    from '../../assets/map/arcadia1.png';
import solo2Url       from '../../assets/map/Solo2.jpeg';
import arcadia2Url    from '../../assets/map/arcadia2.png';
import solo3Url       from '../../assets/map/solo3.jpeg';
import casaTesteUrl   from '../../assets/map/casa Teste.png';
import woodFloorUrl   from '../../assets/map/woodfloor.jpg';
import darkwoodplaceUrl from '../../assets/map/darkwoodplace.jpg';
import conjuntoAleatorioUrl from '../../assets/map/conjunto aleatorio.jpg';
import floorRandomUrl  from '../../assets/map/floor_ramdom.jpg';
import forniture2Url   from '../../assets/map/forniture2.png';
import forniture3Url   from '../../assets/map/forniture3.png';
import fetoNoPoteUrl   from '../../assets/map/feto no pote.png';
import mesaImportanteUrl from '../../assets/map/mesaimportante.png';
import assetsPinterestUrl from '../../assets/map/assets_pinterest.jpg';
// -----------------------------
// Tilesets exclusivos do vilarejo
// -----------------------------

// solo.tsx -> floor1.jpeg
import soloUrl          from '../../assets/map/floor1.jpeg';

// casa1.tsx -> arcadia1.png
import casa1TsUrl       from '../../assets/map/arcadia1.png';

import telhadinhosUrl   from '../../assets/map/telhadinhos.png';
import frontsUrl        from '../../assets/map/fronts.png';
import fachada2Url      from '../../assets/map/fachada2.png';
import detailsGroundUrl from '../../assets/map/details_ground.png';
import casasLateraisUrl from '../../assets/map/casas laterais.png';
import casa1Url         from '../../assets/map/casa1.png';
import tree1Url         from '../../assets/map/tree1.png';
import trees3Url        from '../../assets/map/trees3.png';
import matoUrl          from '../../assets/map/mato.png';
import muretasUrl       from '../../assets/map/muretas.png';

// -----------------------------
// Tilesets do poço
// -----------------------------

import assetsGeraisUrl  from '../../assets/map/assets gerais.png';
import pocoUrl          from '../../assets/map/poço.png';
import doorsUrl         from '../../assets/map/doors.png';
import fornitureUrl     from '../../assets/map/forniture.png';
import pianoUrl         from '../../assets/map/piano.png';
import mesaUrl          from '../../assets/map/mesa.png';
import cervoUrl         from '../../assets/map/cervo.png';
import paginasUrl       from '../../assets/map/paginas.png';

// ============================================================
// SPRITES
// ============================================================

import corvoUrl
    from '../../assets/sprites/sprite-corvo/anfitrião(corvo).png';

import idleUrl
    from '../../assets/sprites/Hades/idle hades.png';

import walkRightUrl
    from '../../assets/sprites/Hades/hades walking direita.png';

import walkLeftUrl
    from '../../assets/sprites/Hades/hades walking esquerda.png';

import idleHunterUrl
    from '../../assets/sprites/Hunter/idle hunter.png';

import walkRightHunterUrl
    from '../../assets/sprites/Hunter/hunter walking direita.png';

import walkLeftHunterUrl
    from '../../assets/sprites/Hunter/hunter walking esquerda.png';

import runHunterUrl
    from '../../assets/sprites/Hunter/hunter run.png';


// ============================================================
// CARREGAMENTO DE IMAGENS
// ============================================================
import idleWalkerUrl      from '../../assets/sprites/BroodhostWalker/Idle.png';
import walkLeftWalkerUrl  from '../../assets/sprites/BroodhostWalker/walking-left.png';
import walkRightWalkerUrl from '../../assets/sprites/BroodhostWalker/walking-right.png';

function loadImage(src) {
    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () => {
            reject(
                new Error(
                    `Não foi possível carregar a imagem: ${src}`
                )
            );
        };

        img.src = src;
    });
}


// ============================================================
// IMAGENS COMPARTILHADAS
// ============================================================

let _sharedImages = null;

async function getSharedImages() {
    if (_sharedImages) {
        return _sharedImages;
    }

    const [
        // -------------------------
        // Tiles antigos
        // -------------------------

        floor1,
        arcadia1,
        solo2,
        arcadia2,
        solo3,
        casaTeste,
        woodFloor,
        darkwoodplace,
        conjuntoAleatorio,
        floorRandom,
        forniture2,
        forniture3,
        fetoNoPote,
        mesaImportante,
        assetsPinterest,

        // -------------------------
        // Tiles do vilarejo
        // -------------------------

        solo,
        casa1Ts,
        telhadinhos,
        fronts,
        fachada2,
        detailsGround,
        casasLaterais,
        casa1,
        tree1,
        trees3,
        mato,
        muretas,

        // -------------------------
        // Tiles do poço
        // -------------------------

        assetsGerais,
        poco,
        doors,
        forniture,
        piano,
        mesa,
        cervo,
        paginas,

        // -------------------------
        // Sprites
        // -------------------------

        idle,
        walkRight,
        walkLeft,

        idleHunter,
        walkRightHunter,
        walkLeftHunter,
        runHunter,

        idleWalker,
        walkLeftWalker,
        walkRightWalker,

        corvImg

    ] = await Promise.all([

        // ====================================================
        // Tiles antigos
        // ====================================================

        loadImage(floor1Url),
        loadImage(arcadia1Url),
        loadImage(solo2Url),
        loadImage(arcadia2Url),
        loadImage(solo3Url),
        loadImage(casaTesteUrl),
        loadImage(woodFloorUrl),
        loadImage(darkwoodplaceUrl),
        loadImage(conjuntoAleatorioUrl),
        loadImage(floorRandomUrl),
        loadImage(forniture2Url),
        loadImage(forniture3Url),
        loadImage(fetoNoPoteUrl),
        loadImage(mesaImportanteUrl),
        loadImage(assetsPinterestUrl),

        // ====================================================
        // Vilarejo
        // ====================================================

        loadImage(soloUrl),
        loadImage(casa1TsUrl),
        loadImage(telhadinhosUrl),
        loadImage(frontsUrl),
        loadImage(fachada2Url),
        loadImage(detailsGroundUrl),
        loadImage(casasLateraisUrl),
        loadImage(casa1Url),
        loadImage(tree1Url),
        loadImage(trees3Url),
        loadImage(matoUrl),
        loadImage(muretasUrl),

        // ====================================================
        // Poço
        // ====================================================

        loadImage(assetsGeraisUrl),
        loadImage(pocoUrl),
        loadImage(doorsUrl),
        loadImage(fornitureUrl),
        loadImage(pianoUrl),
        loadImage(mesaUrl),
        loadImage(cervoUrl),
        loadImage(paginasUrl),

        // ====================================================
        // Sprites
        // ====================================================

        loadImage(idleUrl),
        loadImage(walkRightUrl),
        loadImage(walkLeftUrl),

        loadImage(idleHunterUrl),
        loadImage(walkRightHunterUrl),
        loadImage(walkLeftHunterUrl),
        loadImage(runHunterUrl),

        loadImage(idleWalkerUrl),
        loadImage(walkLeftWalkerUrl),
        loadImage(walkRightWalkerUrl),

        loadImage(corvoUrl),
    ]);


    _sharedImages = {

        // Tiles antigos
        floor1,
        arcadia1,
        solo2,
        arcadia2,
        solo3,
        casaTeste,
        woodFloor,
        darkwoodplace,
        conjuntoAleatorio,
        floorRandom,
        forniture2,
        forniture3,
        fetoNoPote,
        mesaImportante,
        assetsPinterest,

        // Vilarejo
        solo,
        casa1Ts,
        telhadinhos,
        fronts,
        fachada2,
        detailsGround,
        casasLaterais,
        casa1,
        tree1,
        trees3,
        mato,
        muretas,

        // Poço
        assetsGerais,
        poco,
        doors,
        forniture,
        piano,
        mesa,
        cervo,
        paginas,

        // Sprites
        idle,
        walkRight,
        walkLeft,
        idleHunter,
        walkRightHunter,
        walkLeftHunter,
        runHunter,
        idleWalker,
        walkLeftWalker,
        walkRightWalker,
        corvImg,
    };
    return _sharedImages;
}


// ============================================================
// CONFIGURAÇÃO DOS MAPAS
// ============================================================

const MAP_CONFIGS = {

    // ========================================================
    // ENTRADA DA CIDADE DE CINÉREA
    // ========================================================

    'entrada-cidade-cinerea': {

        data: entradaCidadeData,

        tilesets: (imgs) => [

            // =================================================
            // firstgid: 1
            // solo.tsx -> floor1.jpeg
            // =================================================

            {
                image: imgs.solo,
                columns: 16
            },

            // =================================================
            // firstgid: 257
            // casa1.tsx -> arcadia1.png
            // =================================================

            {
                image: imgs.casa1Ts,
                columns: 48
            },

            // =================================================
            // firstgid: 1793
            // Solo2.tsx
            // =================================================

            {
                image: imgs.solo2,
                columns: 39
            },

            // =================================================
            // firstgid: 3314
            // arcadia2.tsx
            // =================================================

            {
                image: imgs.arcadia2,
                columns: 48
            },

            // =================================================
            // firstgid: 4850
            // solo3.tsx
            // =================================================

            {
                image: imgs.solo3,
                columns: 39
            },

            // =================================================
            // firstgid: 6371
            // Casa teste.tsx
            // =================================================

            {
                image: imgs.casaTeste,
                columns: 48,
                scale: 1.7
            },

            // =================================================
            // firstgid: 7907
            // telhadinhos.png
            // =================================================

            {
                image: imgs.telhadinhos,
                columns: 48
            },

            // =================================================
            // firstgid: 9443
            // fronts.png
            // =================================================

            {
                image: imgs.fronts,
                columns: 48
            },

            // =================================================
            // firstgid: 10979
            // fachada2.png
            // =================================================

            {
                image: imgs.fachada2,
                columns: 48
            },

            // =================================================
            // firstgid: 12515
            // details_ground.png
            // =================================================

            {
                image: imgs.detailsGround,
                columns: 48
            },

            // =================================================
            // firstgid: 14051
            // casas laterais.png
            // =================================================

            {
                image: imgs.casasLaterais,
                columns: 48
            },

            // =================================================
            // firstgid: 15587
            // casa1.png
            // =================================================

            {
                image: imgs.casa1,
                columns: 9
            },

            // =================================================
            // firstgid: 15668
            // tree1.png
            // =================================================

            {
                image: imgs.tree1,
                columns: 5
            },

            // =================================================
            // firstgid: 15703
            // trees3.png
            // =================================================

            {
                image: imgs.trees3,
                columns: 13
            },

            // =================================================
            // firstgid: 15924
            // mato.png
            // =================================================

            {
                image: imgs.mato,
                columns: 48
            },

            // =================================================
            // firstgid: 17460
            // muretas.png
            // =================================================

            {
                image: imgs.muretas,
                columns: 48
            },

        ],
    },


    // ========================================================
    // POÇO DE CINÉREA
    // ========================================================

    cinerea_well: {

        data: cinereaWellData,

        tilesets: (imgs) => [

            // =================================================
            // firstgid: 1
            // solo3.tsx
            // =================================================

            {
                image: imgs.solo3,
                columns: 39
            },

            // =================================================
            // firstgid: 1522
            // mato.png
            // =================================================

            {
                image: imgs.mato,
                columns: 48
            },

            // =================================================
            // firstgid: 3058
            // assets gerais.png
            // =================================================

            {
                image: imgs.assetsGerais,
                columns: 40
            },

            // =================================================
            // firstgid: 4538
            // poço.png
            // =================================================

            {
                image: imgs.poco,
                columns: 48
            },

            // =================================================
            // firstgid: 6074
            // Casa teste.tsx
            // =================================================

            {
                image: imgs.casaTeste,
                columns: 48,
                scale: 1.7
            },

        ],
    },

    // ========================================================
    // CASA DO MÚSICO
    // ========================================================

    Musician_house: {

        data: musicianHouseData,

        tilesets: (imgs) => [
            { image: imgs.woodFloor, columns: 24 },
            { image: imgs.darkwoodplace, columns: 16 },
            { image: imgs.conjuntoAleatorio, columns: 12 },
            { image: imgs.floorRandom, columns: 8 },
            { image: imgs.piano, columns: 13 },
            { image: imgs.mesa, columns: 4 },
            { image: imgs.cervo, columns: 5 },
            { image: imgs.paginas, columns: 48 },
            { image: imgs.detailsGround, columns: 48 },
            { image: imgs.doors, columns: 48 },
            { image: imgs.forniture, columns: 22 },
        ],
    },

    // ========================================================
    // PORÃO DA CASA DO MÚSICO
    // ========================================================

    basement_musician_house: {

        data: basementHouseData,

        tilesets: (imgs) => [
            { image: imgs.conjuntoAleatorio, columns: 12 },
            { image: imgs.forniture3, columns: 41 },
            { image: imgs.forniture, columns: 22 },
            { image: imgs.mesa, columns: 4 },
            { image: imgs.fetoNoPote, columns: 23 },
            { image: imgs.casaTeste, columns: 48, scale: 1.7 },
        ],
    },

    // ========================================================
    // SEGUNDO ANDAR DA CASA DO MÚSICO
    // ========================================================

    stairsUp_musician_house: {

        data: stairsHouseData,

        tilesets: (imgs) => [
            { image: imgs.woodFloor, columns: 24 },
            { image: imgs.floorRandom, columns: 8 },
            { image: imgs.floorRandom, columns: 8 },
            { image: imgs.conjuntoAleatorio, columns: 12 },
            { image: imgs.assetsPinterest, columns: 14 },
            { image: imgs.doors, columns: 48 },
            { image: imgs.forniture, columns: 22 },
            { image: imgs.forniture2, columns: 12 },
            { image: imgs.forniture3, columns: 41 },
            { image: imgs.mesaImportante, columns: 4 },
        ],
    },

};


// ============================================================
// EXPORTA IMAGENS COMPARTILHADAS
// ============================================================

export { getSharedImages };


// ============================================================
// CARREGAMENTO DE MAPA
// ============================================================

export async function loadMap(
    mapName,
    canvasWidth,
    canvasHeight
) {

    const imgs = await getSharedImages();

    const config = MAP_CONFIGS[mapName];

    if (!config) {
        throw new Error(
            `Mapa desconhecido: ${mapName}`
        );
    }

    const map = new GameMap(
        config.data,
        config.tilesets(imgs)
    );

   const zoom = mapName === 'cinerea_well'
    ? 2
    : [
        'Musician_house',
        'basement_musician_house',
        'stairsUp_musician_house',
    ].includes(mapName)
        ? 1.5
        : 1.25;

const camera = new Camera(
    map.width,
    map.height,
    canvasWidth,
    canvasHeight,
    zoom
);

    return {
        map,
        camera
    };
}