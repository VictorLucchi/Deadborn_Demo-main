import { InputManager }  from './input/InputManager.js';
import { EntityManager } from './entityManager/EntityManager.js';
import { Renderer }      from './render/Renderer.js';
import { UIBridge }      from './UIBridge/UIBridge.js';
import { AudioManager }  from './audio/AudioManager.js';
import { loadMap, getSharedImages } from './world/World.js';
import { Player }        from './entities/Player.js';
import { Crow }          from './entities/Crow.js';
import { CrowDialogue }  from './crow/CrowDialogue.js';
import { createItem }    from '../engine/items/ItemRegistry.js';


const DOOR_INTERACT_DIST = 80;
const INTERACTION_DIST   = 120;
const FADE_DURATION      = 400; // ms


export class Game {

    constructor(canvas, onCombatTrigger, onMissionEvent) {

        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');

        this.rafId   = null;
        this.paused  = false;

        this._startPromise = null;
        this._stopped = false;

        this.jogadorEngine = null;

        this.input   = new InputManager();
        this.em      = new EntityManager();
        this.ui      = new UIBridge();
        this.audio   = new AudioManager();

        this.em.onCombatTrigger =
            onCombatTrigger || null;

        this.onMissionEvent =
            onMissionEvent || null;


        // =========================================================
        // MUNDO
        // =========================================================

        this.map      = null;
        this.camera   = null;
        this.player   = null;
        this.renderer = null;

        this.sprites = {};

        this.currentMapName =
            'entrada-cidade-cinerea';


        // =========================================================
        // FADE
        // =========================================================

        this._fadeAlpha    = 0;
        this._fadeDir      = 0;
        this._fadeCallback = null;


        // =========================================================
        // PORTAS
        // =========================================================

        this._nearDoor =
            null;

        this._doorPrompt =
            null;

        this._doorInteractions =
            [];


        // =========================================================
        // INTERAÇÕES DE MISSÃO
        // =========================================================

        this._missionInteractions =
            [];

        this._usedMissionInteractions =
            new Set();


        // =========================================================
        // CHAVE DO PORÃO
        // =========================================================

        this._basementKeyReleased =
            false;

        this._basementKeyCollected =
            false;


        // =========================================================
        // CORVO
        // =========================================================

        this.crow =
            null;

        this.crowDialogue =
            null;

        this.onCrowDialogue =
            null;

        this.onCrowPrompt =
            null;
    }


    // =============================================================
    // START
    // =============================================================

    start() {

        if (this._startPromise) {
            return this._startPromise;
        }

        this._startPromise =
            this._initialize();

        return this._startPromise;
    }


    // =============================================================
    // INICIALIZAÇÃO
    // =============================================================

    async _initialize() {

        this._setupResize();

        this.input.init(
            this.canvas,
            {
                current: null,
                set: (cam) => {
                    this.camera = cam;
                }
            }
        );


        const imgs =
            await getSharedImages();

        if (this._stopped) {
            return;
        }


        const {
            map,
            camera
        } =
            await loadMap(
                'entrada-cidade-cinerea',
                this.canvas.width,
                this.canvas.height
            );


        if (this._stopped) {
            return;
        }


        this.map =
            map;

        this.camera =
            camera;


        this._cacheDoorInteractions();
        this._cacheMissionInteractions();


        // =========================================================
        // PLAYER
        // =========================================================

        const playerSpawn =
            map.getSpawn(
                'Player_Start'
            );

        const crowSpawn =
            map.getSpawn(
                'Crow_Start'
            );


        this.player =
            new Player(
                {
                    idle:
                        imgs.idle,

                    walkRight:
                        imgs.walkRight,

                    walkLeft:
                        imgs.walkLeft
                },

                playerSpawn
                    ? playerSpawn.x
                    : map.width / 2,

                playerSpawn
                    ? playerSpawn.y
                    : map.height / 2
            );


        this.player.scale =
            this._getPlayerScale();


        // =========================================================
        // CORVO
        // =========================================================

        this.crow =
            new Crow(
                imgs.corvImg,

                crowSpawn
                    ? crowSpawn.x
                    : map.width / 2 - 200,

                crowSpawn
                    ? crowSpawn.y
                    : map.height / 2 + 200
            );


        this.sprites = {

            idle:
                imgs.idleHunter,

            walkRight:
                imgs.walkRightHunter,

            walkLeft:
                imgs.walkLeftHunter,

            run:
                imgs.runHunter,

            idleWalker:
                imgs.idleWalker,

            walkLeftWalker:
                imgs.walkLeftWalker,

            walkRightWalker:
                imgs.walkRightWalker,
        };


        this._initWorld();


        if (this._stopped) {
            return;
        }


        this._startLoop();
    }


    // =============================================================
    // WORLD
    // =============================================================

    _initWorld() {

        this.crowDialogue =
            new CrowDialogue(
                this.crow
            );


        this.crowDialogue.onDialogue =
            (data) => {
                this.onCrowDialogue?.(
                    data
                );
            };


        this.crowDialogue.onPromptChange =
            (value) => {
                this.onCrowPrompt?.(
                    value
                );
            };


        this.input._cameraGetter =
            () => this.camera;


        this.em.init(
            this.player,
            [],
            this.crow,
            this.crowDialogue
        );


        this.renderer =
            this.renderer ??
            new Renderer(
                this.canvas
            );
    }


    // =============================================================
    // GAME LOOP
    // =============================================================

    _startLoop() {

        if (
            this._stopped ||
            this.rafId !== null
        ) {
            return;
        }


        let lastTime = 0;


        const loop =
            (timestamp) => {

                if (this._stopped) {
                    return;
                }


                try {

                    const delta =
                        Math.min(
                            timestamp -
                                lastTime,
                            100
                        );


                    lastTime =
                        timestamp;


                    if (!this.paused) {

                        this.input.flush();


                        this.player.update(
                            this.input.keys,
                            delta,
                            (
                                x,
                                y,
                                w,
                                h
                            ) =>
                                this.map.checkCollision(
                                    x,
                                    y,
                                    w,
                                    h
                                )
                        );


                        this.em.update(
                            delta,
                            (
                                x,
                                y,
                                w,
                                h
                            ) =>
                                this.map.checkCollision(
                                    x,
                                    y,
                                    w,
                                    h
                                )
                        );


                        this.camera.follow(
                            this.player
                        );


                        this._updateMissionInteractions();

                        this._updateDoorDetection();

                        this._updateFade(
                            delta
                        );
                    }


                    this.renderer.draw(
                        this.ctx,
                        this.map,
                        this.player,
                        this.em,
                        this.camera,
                        this.ui,
                        this.input.mousePos,
                        this.jogadorEngine,
                        {

                            hasLantern:
                                this.crowDialogue
                                    ?.hasLantern,

                            showPrompt:
                                this.crowDialogue
                                    ?.showPrompt,

                            crow:
                                this.crow?.visible
                                    ? this.crow
                                    : null,


                            // =================================================
                            // CHAVE DO PORÃO
                            // =================================================

                            basementKeyVisible:
                                this._basementKeyReleased &&
                                !this._basementKeyCollected,


                            doorPrompt:
                                this._doorPrompt,


                            fadeAlpha:
                                this._fadeAlpha,


                            indoors:
                                [
                                    'Musician_house',
                                    'basement_musician_house',
                                    'stairsUp_musician_house',
                                ].includes(
                                    this.currentMapName
                                ),
                        }
                    );

                } catch (err) {

                    console.error(
                        '[Game loop error]',
                        err
                    );
                }


                if (this._stopped) {
                    return;
                }


                this.rafId =
                    requestAnimationFrame(
                        loop
                    );
            };


        this.rafId =
            requestAnimationFrame(
                loop
            );
    }


    // =============================================================
    // EVENTO DE MISSÃO
    // =============================================================

    _emitMissionEvent(
        eventId,
        data = {}
    ) {

        this.onMissionEvent?.({
            id: eventId,
            ...data,
        });
    }


    // =============================================================
    // INVENTÁRIO
    // =============================================================

    _hasInventoryItem(
        itemId
    ) {

        if (
            !this.jogadorEngine?.inventario
        ) {
            return false;
        }


        const normalized =
            String(
                itemId ?? ''
            )
                .trim()
                .toLowerCase();


        return this.jogadorEngine.inventario.some(
            (item) => {

                if (!item) {
                    return false;
                }


                const itemNome =
                    String(
                        item.nome ?? ''
                    )
                        .trim()
                        .toLowerCase();


                const itemIdValue =
                    String(
                        item.id ??
                        item.itemId ??
                        ''
                    )
                        .trim()
                        .toLowerCase();


                return (
                    itemNome === normalized ||
                    itemIdValue === normalized
                );
            }
        );
    }


    // =============================================================
    // INTERAÇÕES DE MISSÃO
    // =============================================================

    _cacheMissionInteractions() {

        this._missionInteractions =
            [];


        if (!this.map) {
            return;
        }


        for (
            const obj
            of this.map.getInteractions()
        ) {

            const props = {};


            for (
                const property
                of obj.properties ?? []
            ) {

                props[property.name] =
                    property.value;
            }


            const interactionId =
                props.interactionId;

            const eventId =
                props.eventId;

            const itemId =
                props.itemId;


            if (
                !interactionId &&
                !eventId &&
                itemId !== 'basement_key'
            ) {
                continue;
            }


            this._missionInteractions.push({
                obj,
                props
            });
        }


        // =========================================================
        // CHAVE DO PORÃO
        // =========================================================

        const basementKeyInteraction =
            this.map.getBasementKeyInteraction?.();


        if (basementKeyInteraction) {

            this._missionInteractions.push({

                obj:
                    basementKeyInteraction,

                props: {

                    itemId:
                        'basement_key',

                    interactionId:
                        'basement_key',

                    prompt:
                        '[E] Pegar chave'
                }
            });
        }
    }


    // =============================================================
    // DETECÇÃO DAS INTERAÇÕES DE MISSÃO
    // =============================================================

    _updateMissionInteractions() {

        if (
            !this.player ||
            !this.map
        ) {
            return;
        }


        let closest =
            null;

        let closestDistance =
            Infinity;


        for (
            const interaction
            of this._missionInteractions
        ) {

            const props =
                interaction.props ?? {};


            const interactionId =
                props.interactionId;


            if (
                interactionId &&
                this._usedMissionInteractions.has(
                    interactionId
                )
            ) {
                continue;
            }


            const obj =
                interaction.obj;


            const x =
                obj.x +
                (obj.width ?? 0) / 2;


            const y =
                obj.y +
                (obj.height ?? 0) / 2;


            const dx =
                this.player.x - x;


            const dy =
                this.player.y - y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <= INTERACTION_DIST &&
                distance < closestDistance
            ) {

                closest =
                    interaction;

                closestDistance =
                    distance;
            }
        }


        if (!closest) {
            return;
        }


        if (
            this.input.keys['e'] ||
            this.input.keys['E']
        ) {

            this.input.keys['e'] =
                false;

            this.input.keys['E'] =
                false;


            this._triggerMissionInteraction(
                closest
            );
        }
    }


    // =============================================================
    // PROCESSAMENTO DAS INTERAÇÕES
    // =============================================================

    _triggerMissionInteraction(
        interaction
    ) {

        const props =
            interaction.props ?? {};


        const interactionId =
            props.interactionId;


        const eventId =
            props.eventId;


        // =========================================================
        // CHAVE DO PORÃO
        // =========================================================

        if (
            props.itemId ===
            'basement_key'
        ) {

            if (
                !this._basementKeyReleased ||
                this._basementKeyCollected
            ) {
                return;
            }


            if (!this.jogadorEngine) {
                return;
            }


            const key =
                createItem(
                    'basement_key'
                );


            if (!key) {

                console.warn(
                    '[Game] Não foi possível criar a chave do porão.'
                );

                return;
            }


            this.jogadorEngine.adicionarItem(
                key
            );


            this._basementKeyCollected =
                true;


            this._usedMissionInteractions.add(
                'basement_key'
            );


            this._emitMissionEvent(
                'basement_key_collected'
            );


            this._doorPrompt =
                null;


            return;
        }


        // =========================================================
        // PIANO DA CASA
        // =========================================================

        if (
            interactionId ===
                'musician_piano' &&
            eventId ===
                'piano_release'
        ) {

            this._emitMissionEvent(
                'piano_played'
            );


            return;
        }


        // =========================================================
        // PARTITURAS
        // =========================================================

        const scoreInteractions = {

            musician_score_01:
                'musician_score_01_played',

            musician_score_02:
                'musician_score_02_played',

            musician_score_03:
                'musician_score_03_played',
        };


        const scoreEvent =
            scoreInteractions[
                interactionId
            ];


        if (scoreEvent) {

            if (
                this._usedMissionInteractions.has(
                    interactionId
                )
            ) {
                return;
            }


            this._usedMissionInteractions.add(
                interactionId
            );


            this._emitMissionEvent(
                scoreEvent
            );


            const playedScores =
                Object.keys(
                    scoreInteractions
                ).filter(
                    id =>
                        this._usedMissionInteractions.has(
                            id
                        )
                );


            // =====================================================
            // AS 3 PARTITURAS FORAM TOCADAS
            // =====================================================

            if (
                playedScores.length >= 3
            ) {

                this._basementKeyReleased =
                    true;


                this._emitMissionEvent(
                    'musician_piano_puzzle_complete'
                );
            }


            return;
        }


        // =========================================================
        // EVENTOS GENÉRICOS
        // =========================================================

        if (eventId) {

            this._emitMissionEvent(
                eventId
            );
        }
    }


    // =============================================================
    // PORTAS
    // =============================================================

    _updateDoorDetection() {

        this._nearDoor =
            null;

        this._doorPrompt =
            null;


        if (!this.player || !this.map) {
            return;
        }


        for (
            const door
            of this._doorInteractions
        ) {

            const {
                obj,
                props
            } = door;


            const cx =
                obj.x +
                obj.width / 2;


            const cy =
                obj.y +
                obj.height / 2;


            const dx =
                this.player.x -
                cx;


            const dy =
                this.player.y -
                cy;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                DOOR_INTERACT_DIST
            ) {

                this._nearDoor =
                    door;


                this._doorPrompt =
                    props.prompt ??
                    '[E] Entrar';


                if (
                    this.input.keys['e'] ||
                    this.input.keys['E']
                ) {

                    this.input.keys['e'] =
                        false;

                    this.input.keys['E'] =
                        false;


                    this._triggerDoorTransition(
                        props
                    );
                }


                break;
            }
        }
    }


    // =============================================================
    // CACHE DAS PORTAS
    // =============================================================

    _cacheDoorInteractions() {

        this._doorInteractions =
            [];


        if (!this.map) {
            return;
        }


        for (
            const obj
            of this.map.getInteractions()
        ) {

            const props = {};


            for (
                const property
                of obj.properties ?? []
            ) {

                props[property.name] =
                    property.value;
            }


            const type =
                String(
                    (
                        props.InteractionType ??
                        props.interactionType ??
                        obj.type ??
                        ''
                    )
                ).toLowerCase();


            const hasTargetMap =
                typeof props.targetMap ===
                    'string' &&
                props.targetMap
                    .trim()
                    .length > 0;


            const isTransition =
                hasTargetMap &&
                (
                    type === 'door' ||
                    type === 'transition' ||
                    !!props.targetMap
                );


            if (isTransition) {

                this._doorInteractions.push({
                    obj,
                    props
                });
            }
        }
    }


    // =============================================================
    // ESCALA DO PLAYER
    // =============================================================

    _getPlayerScale() {

        return [

            'Musician_house',

            'basement_musician_house',

            'stairsUp_musician_house',

        ].includes(
            this.currentMapName
        )

            ? 0.17

            : 0.20;
    }


    // =============================================================
    // TRANSIÇÃO DE PORTA
    // =============================================================

    _triggerDoorTransition(
        props
    ) {

        if (
            this._fadeDir !== 0
        ) {
            return;
        }


        // =========================================================
        // PORTA COM ITEM NECESSÁRIO
        // =========================================================

        const requiredItem =
            props.requiredItem;


        if (
            requiredItem &&
            !this._hasInventoryItem(
                requiredItem
            )
        ) {

            console.log(
                '[Door] Porta trancada. Item necessário:',
                requiredItem
            );


            this._doorPrompt =
                props.lockedPrompt ??
                '[E] Porta trancada';


            return;
        }


        this._fadeDir =
            1;


        this._fadeCallback =
            async () => {

                const targetMap =
                    props.targetMap;


                const targetSpawn =
                    props.targetSpawn;


                if (!targetMap) {

                    this._fadeDir =
                        0;

                    this._fadeAlpha =
                        0;

                    return;
                }


                const {
                    map,
                    camera
                } =
                    await loadMap(
                        targetMap,
                        this.canvas.width,
                        this.canvas.height
                    );


                if (this._stopped) {
                    return;
                }


                this.map =
                    map;


                this.camera =
                    camera;


                this.currentMapName =
                    targetMap;


                this._cacheDoorInteractions();

                this._cacheMissionInteractions();


                // =================================================
                // EVENTO: ENTROU NA CASA DO MÚSICO
                // =================================================

                if (
                    targetMap ===
                    'Musician_house'
                ) {

                    this._emitMissionEvent(
                        'entered_musician_house'
                    );
                }


                // =================================================
                // EVENTO: ENTROU NO SEGUNDO ANDAR
                // =================================================

                if (
                    targetMap ===
                    'stairsUp_musician_house'
                ) {

                    this._emitMissionEvent(
                        'entered_musician_second_floor'
                    );
                }


                const spawn =
                    map.getSpawn(
                        targetSpawn
                    );


                if (spawn) {

                    this.player.x =
                        spawn.x;

                    this.player.y =
                        spawn.y;
                }


                this.player.scale =
                    this._getPlayerScale();


                this.input._cameraGetter =
                    () => this.camera;


                this.em.init(
                    this.player,
                    [],
                    this.crow,
                    this.crowDialogue
                );


                this.camera.follow(
                    this.player
                );
            };
    }


    // =============================================================
    // FADE
    // =============================================================

    _updateFade(
        delta
    ) {

        if (
            this._fadeDir === 0
        ) {
            return;
        }


        const step =
            delta /
            FADE_DURATION;


        // =========================================================
        // ESCURECENDO
        // =========================================================

        if (
            this._fadeDir === 1
        ) {

            this._fadeAlpha =
                Math.min(
                    1,
                    this._fadeAlpha +
                    step
                );


            if (
                this._fadeAlpha >= 1 &&
                this._fadeCallback
            ) {

                const cb =
                    this._fadeCallback;


                this._fadeCallback =
                    null;


                this._fadeDir =
                    0;


                cb()
                    .then(() => {

                        this._fadeDir =
                            -1;

                    })
                    .catch(
                        err => {

                            console.error(
                                '[Fade transition error]',
                                err
                            );


                            this._fadeDir =
                                -1;
                        }
                    );
            }


        } else {

            // =====================================================
            // CLAREANDO
            // =====================================================

            this._fadeAlpha =
                Math.max(
                    0,
                    this._fadeAlpha -
                    step
                );


            if (
                this._fadeAlpha <= 0
            ) {

                this._fadeDir =
                    0;
            }
        }
    }


    // =============================================================
    // PLAYER
    // =============================================================

    setJogador(
        jogador
    ) {

        this.jogadorEngine =
            jogador;
    }


    // =============================================================
    // CORVO
    // =============================================================

    setCrowCallbacks({
        onDialogue,
        onPrompt
    }) {

        this.onCrowDialogue =
            onDialogue;

        this.onCrowPrompt =
            onPrompt;


        if (this.crowDialogue) {

            this.crowDialogue.onDialogue =
                (data) =>
                    onDialogue?.(
                        data
                    );


            this.crowDialogue.onPromptChange =
                (value) =>
                    onPrompt?.(
                        value
                    );
        }
    }


    crowInteract() {

        this.crowDialogue
            ?.triggerInteract();
    }


    crowPickupLantern() {

        this.crowDialogue
            ?.pickupLantern();


        if (this.crow) {

            this.crow.visible =
                false;
        }


        if (this.jogadorEngine) {

            const lantern =
                createItem(
                    'lantern'
                );


            if (lantern) {

                this.jogadorEngine.adicionarItem(
                    lantern
                );


                this.jogadorEngine.equiparEquipamento(
                    lantern
                );
            }
        }
    }


    crowUnlockDialogue() {

        this.crowDialogue
            ?.setDialogueLock(
                false
            );
    }


    // =============================================================
    // COMANDOS
    // =============================================================

    executeCommand(
        cmd
    ) {

        const args =
            cmd
                .trim()
                .split(' ');


        const action =
            args[0]?.toLowerCase();


        // =========================================================
        // SPAWN HUNTER
        // =========================================================

        if (
            action === '/spawn' &&
            args[1]?.toLowerCase() ===
                'hunter'
        ) {

            this.em.spawnHunter(
                this.sprites
            );


        // =========================================================
        // SPAWN WALKER
        // =========================================================

        } else if (
            action === '/spawn' &&
            args[1]?.toLowerCase() ===
                'walker'
        ) {

            this.em.spawnBroodhostWalkerAt(
                this.sprites,
                this.player.x + 100,
                this.player.y
            );


        // =========================================================
        // KILL HUNTER
        // =========================================================

        } else if (
            action === '/kill' &&
            args[1]?.toLowerCase() ===
                'all' &&
            args[2]?.toLowerCase() ===
                'hunter'
        ) {

            this.em.killHunters(
                true
            );


        } else if (
            action === '/kill' &&
            args[1]?.toLowerCase() ===
                'hunter'
        ) {

            this.em.killHunters(
                false
            );


        // =========================================================
        // KILL WALKER
        // =========================================================

        } else if (
            action === '/kill' &&
            args[1]?.toLowerCase() ===
                'all' &&
            args[2]?.toLowerCase() ===
                'walker'
        ) {

            this.em.killBroodhostWalkers(
                true
            );


        } else if (
            action === '/kill' &&
            args[1]?.toLowerCase() ===
                'walker'
        ) {

            this.em.killBroodhostWalkers(
                false
            );


        // =========================================================
        // GIVE ITEM
        // =========================================================

        } else if (
            action === '/give'
        ) {

            const nomeBruto =
                args
                    .slice(1)
                    .join(' ')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(
                        /[\u0300-\u036f]/g,
                        ''
                    );


            if (!this.jogadorEngine) {

                return (
                    'Nenhum jogador ativo.'
                );
            }


            try {

                const item =
                    createItem(
                        nomeBruto
                    );


                if (!item) {

                    return (
                        `Item "${args.slice(1).join(' ')}" não encontrado.`
                    );
                }


                this.jogadorEngine.adicionarItem(
                    item
                );


                return (
                    `${item.nome} adicionado ao inventário.`
                );

            } catch {

                return (
                    `Item "${args.slice(1).join(' ')}" não encontrado.`
                );
            }
        }
    }


    // =============================================================
    // ÁUDIO / INTRO
    // =============================================================

    playMusic() {

        this.audio
            .playBackgroundMusic();
    }


    playIntro(
        callbacks
    ) {

        this.audio
            .playIntro(
                callbacks
            );
    }


    playDiaryWriting() {

        this.audio
            .playDiaryWriting();
    }


    skipIntro() {

        this.audio
            .skipIntro();
    }


    // =============================================================
    // PAUSE
    // =============================================================

    pause(
        value
    ) {

        this.paused =
            value;

        this.input.clearKeys();
    }


    // =============================================================
    // REMOVER INIMIGO
    // =============================================================

    removeEnemy(
        enemy
    ) {

        this.em?.removeEnemy(
            enemy
        );
    }


    // =============================================================
    // STOP
    // =============================================================

    stop() {

        this._stopped =
            true;


        cancelAnimationFrame(
            this.rafId
        );


        this.rafId =
            null;


        this.audio.stop();


        this.input.destroy(
            this.canvas
        );


        this.ui.destroy();


        window.removeEventListener(
            'resize',
            this._resizeHandler
        );
    }


    // =============================================================
    // RESIZE
    // =============================================================

    _setupResize() {

        this._resizeHandler =
            () => {

                this.canvas.width =
                    window.innerWidth;

                this.canvas.height =
                    window.innerHeight;


                if (this.camera) {

                    this.camera.resize(
                        this.canvas.width,
                        this.canvas.height
                    );
                }
            };


        this._resizeHandler();


        window.addEventListener(
            'resize',
            this._resizeHandler
        );
    }
}