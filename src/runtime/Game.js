import { InputManager }  from './input/InputManager.js';
import { EntityManager } from './entityManager/EntityManager.js';
import { Renderer }      from './render/Renderer.js';
import { UIBridge }      from './UIBridge/UIBridge.js';
import { AudioManager }  from './audio/AudioManager.js';
import { loadMap, getSharedImages } from './world/World.js';
import { Player }        from './entities/Player.js';
import { Crow }          from './entities/Crow.js';
import { CrowDialogue }  from './crow/CrowDialogue.js';
import { Lantern }       from '../engine/items/weapons/Lantern.js';
import { HealthPotion }  from '../engine/items/consumables/HealthPotion.js';
import { ManaPotion }    from '../engine/items/consumables/ManaPotion.js';
import { AbyssalBlood }  from '../engine/items/drops/AbyssalBlood.js';
import { MutatedCore }   from '../engine/items/drops/MutatedCore.js';
import { IronSword }     from '../engine/items/weapons/IronSword.js';
import { SteelSword }    from '../engine/items/weapons/SteelSword.js';

const ITEM_REGISTRY = {
    'health potion': () => new HealthPotion(),
    'mana potion':   () => new ManaPotion(),
    'abyssal blood': () => new AbyssalBlood(),
    'mutated core':  () => new MutatedCore(),
    'iron sword':    () => new IronSword(),
    'steel sword':   () => new SteelSword(),
};

const DOOR_INTERACT_DIST = 80;
const FADE_DURATION = 400; // ms

export class Game {
    constructor(canvas, onCombatTrigger) {
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

        this.em.onCombatTrigger = onCombatTrigger || null;

        this.map      = null;
        this.camera   = null;
        this.player   = null;
        this.renderer = null;
        this.sprites  = {};

        this.currentMapName = 'entrada-cidade-cinerea';

        // fade
        this._fadeAlpha    = 0;
        this._fadeDir      = 0; // 1 = escurecer, -1 = clarear
        this._fadeCallback = null;

        // porta próxima
        this._nearDoor     = null;
        this._doorPrompt   = null;
        this._doorInteractions = [];
    }

    start() {
        if (this._startPromise) return this._startPromise;

        this._startPromise = this._initialize();
        return this._startPromise;
    }

    async _initialize() {
        this._setupResize();
        this.input.init(this.canvas, { current: null, set: (cam) => { this.camera = cam; } });

        const imgs = await getSharedImages();
        if (this._stopped) return;

        const { map, camera } = await loadMap('entrada-cidade-cinerea', this.canvas.width, this.canvas.height);
        if (this._stopped) return;

        this.map    = map;
        this.camera = camera;
        this._cacheDoorInteractions();

        const playerSpawn = map.getSpawn('Player_Start');
        const crowSpawn   = map.getSpawn('Crow_Start');

        this.player = new Player(
            { idle: imgs.idle, walkRight: imgs.walkRight, walkLeft: imgs.walkLeft },
            playerSpawn ? playerSpawn.x : map.width / 2,
            playerSpawn ? playerSpawn.y : map.height / 2
        );
        this.crow = new Crow(
            imgs.corvImg,
            crowSpawn ? crowSpawn.x : map.width / 2 - 200,
            crowSpawn ? crowSpawn.y : map.height / 2 + 200
        );
        this.sprites = {
            idle: imgs.idleHunter, walkRight: imgs.walkRightHunter,
            walkLeft: imgs.walkLeftHunter, run: imgs.runHunter,
            idleWalker: imgs.idleWalker, walkLeftWalker: imgs.walkLeftWalker,
            walkRightWalker: imgs.walkRightWalker,
        };

        this._initWorld();
        if (this._stopped) return;
        this._startLoop();
    }

    _initWorld() {
        this.crowDialogue = new CrowDialogue(this.crow);
        this.crowDialogue.onDialogue     = (data) => this.onCrowDialogue?.(data);
        this.crowDialogue.onPromptChange = (v)    => this.onCrowPrompt?.(v);

        this.input._cameraGetter = () => this.camera;
        this.em.init(this.player, [], this.crow, this.crowDialogue);
        this.renderer = this.renderer ?? new Renderer(this.canvas);
    }

    _startLoop() {
        if (this._stopped || this.rafId !== null) return;

        let lastTime = 0;
        const loop = (timestamp) => {
            if (this._stopped) return;

            try {
                const delta = Math.min(timestamp - lastTime, 100);
                lastTime = timestamp;

                if (!this.paused) {
                    this.input.flush();
                    this.player.update(
                        this.input.keys,
                        delta,
                        (x, y, w, h) => this.map.checkCollision(x, y, w, h)
                    );
                    this.em.update(delta, (x, y, w, h) => this.map.checkCollision(x, y, w, h));
                    this.camera.follow(this.player);
                    this._updateDoorDetection();
                    this._updateFade(delta);
                }

                this.renderer.draw(
                    this.ctx, this.map, this.player, this.em, this.camera,
                    this.ui, this.input.mousePos, this.jogadorEngine,
                    {
                        hasLantern: this.crowDialogue?.hasLantern,
                        showPrompt: this.crowDialogue?.showPrompt,
                        crow: this.crow?.visible ? this.crow : null,
                        doorPrompt: this._doorPrompt,
                        fadeAlpha:  this._fadeAlpha,
                        indoors: [
                            'Musician_house',
                            'basement_musician_house',
                            'stairsUp_musician_house',
                        ].includes(this.currentMapName),
                    }
                );
            } catch (err) {
                console.error('[Game loop error]', err);
            }
            if (this._stopped) return;
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }

    _updateDoorDetection() {
        this._nearDoor   = null;
        this._doorPrompt = null;

        for (const door of this._doorInteractions) {
            const { obj, props } = door;

            const cx = obj.x + obj.width  / 2;
            const cy = obj.y + obj.height / 2;
            const dx = this.player.x - cx;
            const dy = this.player.y - cy;

            if (Math.sqrt(dx * dx + dy * dy) < DOOR_INTERACT_DIST) {
                this._nearDoor   = door;
                this._doorPrompt = props.prompt ?? '[E] Entrar';

                if (this.input.keys['e'] || this.input.keys['E']) {
                    this.input.keys['e'] = false;
                    this.input.keys['E'] = false;
                    this._triggerDoorTransition(props);
                }
                break;
            }
        }
    }

    _cacheDoorInteractions() {
        this._doorInteractions = [];

        for (const obj of this.map.getInteractions()) {
            const props = {};

            for (const property of obj.properties ?? []) {
                props[property.name] = property.value;
            }

            const type = String((props.InteractionType ?? props.interactionType ?? obj.type ?? '')).toLowerCase();
            const hasTargetMap = typeof props.targetMap === 'string' && props.targetMap.trim().length > 0;
            const isTransition = hasTargetMap && (type === 'door' || type === 'transition' || !!props.targetMap);

            if (isTransition) {
                this._doorInteractions.push({ obj, props });
            }
        }
    }

    _triggerDoorTransition(props) {
        if (this._fadeDir !== 0) return;
        this._fadeDir = 1;
        this._fadeCallback = async () => {
            const targetMap   = props.targetMap;
            const targetSpawn = props.targetSpawn;

            if (!targetMap) {
                this._fadeDir = 0;
                this._fadeAlpha = 0;
                return;
            }

            const { map, camera } = await loadMap(targetMap, this.canvas.width, this.canvas.height);

            this.map    = map;
            this.camera = camera;
            this.currentMapName = targetMap;
            this._cacheDoorInteractions();

            const spawn = map.getSpawn(targetSpawn);
            if (spawn) {
                this.player.x = spawn.x;
                this.player.y = spawn.y;
            }

            this.input._cameraGetter = () => this.camera;
            this.em.init(this.player, [], this.crow, this.crowDialogue);
            this.camera.follow(this.player);
        };
    }

    _updateFade(delta) {
        if (this._fadeDir === 0) return;
        const step = delta / FADE_DURATION;

        if (this._fadeDir === 1) {
            this._fadeAlpha = Math.min(1, this._fadeAlpha + step);
            if (this._fadeAlpha >= 1 && this._fadeCallback) {
                const cb = this._fadeCallback;
                this._fadeCallback = null;
                this._fadeDir = 0;
                cb().then(() => {
                    this._fadeDir = -1;
                }).catch(err => {
                    console.error('[Fade transition error]', err);
                    this._fadeDir = -1;
                });
            }
        } else {
            this._fadeAlpha = Math.max(0, this._fadeAlpha - step);
            if (this._fadeAlpha <= 0) this._fadeDir = 0;
        }
    }

    setJogador(jogador) {
        this.jogadorEngine = jogador;
    }

    setCrowCallbacks({ onDialogue, onPrompt }) {
        this.onCrowDialogue = onDialogue;
        this.onCrowPrompt   = onPrompt;
        if (this.crowDialogue) {
            this.crowDialogue.onDialogue     = (data) => onDialogue?.(data);
            this.crowDialogue.onPromptChange = (v)    => onPrompt?.(v);
        }
    }

    crowInteract() {
        this.crowDialogue?.triggerInteract();
    }

    crowPickupLantern() {
        this.crowDialogue?.pickupLantern();
        if (this.crow) this.crow.visible = false;
        if (this.jogadorEngine) {
            const lantern = new Lantern();
            this.jogadorEngine.adicionarItem?.(lantern);
            this.jogadorEngine.armaEquipada = lantern;
        }
    }

    crowUnlockDialogue() {
        this.crowDialogue?.setDialogueLock(false);
    }

    pause(value) {
        this.paused = value;
        this.input.clearKeys();
    }

    stop() {
        this._stopped = true;
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.audio.stop();
        this.input.destroy(this.canvas);
        this.ui.destroy();
        window.removeEventListener('resize', this._resizeHandler);
    }

    playMusic() {
        this.audio.playBackgroundMusic();
    }

    playIntro(callbacks) {
        this.audio.playIntro(callbacks);
    }

    playDiaryWriting() {
        this.audio.playDiaryWriting();
    }

    skipIntro() {
        this.audio.skipIntro();
    }

    executeCommand(cmd) {
        const args   = cmd.trim().split(' ');
        const action = args[0].toLowerCase();

        if (action === '/spawn' && args[1]?.toLowerCase() === 'hunter') {
            this.em.spawnHunter(this.sprites);
        } else if (action === '/spawn' && args[1]?.toLowerCase() === 'walker') {
            this.em.spawnBroodhostWalker(this.sprites);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'all' && args[2]?.toLowerCase() === 'hunter') {
            this.em.killHunters(true);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'hunter') {
            this.em.killHunters(false);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'all' && args[2]?.toLowerCase() === 'walker') {
            this.em.killBroodhostWalkers(true);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'walker') {
            this.em.killBroodhostWalkers(false);
        } else if (action === '/give') {
            const nomeBruto = args.slice(1).join(' ').toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const factory = ITEM_REGISTRY[nomeBruto];
            if (!factory) return `Item "${args.slice(1).join(' ')}" não encontrado.`;
            if (!this.jogadorEngine) return 'Nenhum jogador ativo.';
            this.jogadorEngine.adicionarItem(factory());
            return `${factory().nome} adicionado ao inventário.`;
        }
    }

    _setupResize() {
        this._resizeHandler = () => {
            this.canvas.width  = window.innerWidth;
            this.canvas.height = window.innerHeight;
            if (this.camera) this.camera.resize(this.canvas.width, this.canvas.height);
        };
        this._resizeHandler();
        window.addEventListener('resize', this._resizeHandler);
    }
}
