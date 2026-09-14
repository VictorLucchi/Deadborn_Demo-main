import { InputManager }  from './input/InputManager.js';
import { EntityManager } from './entityManager/EntityManager.js';
import { Renderer }      from './render/Renderer.js';
import { UIBridge }      from './UIBridge/UIBridge.js';
import { AudioManager }  from './audio/AudioManager.js';
import { createWorld }   from './world/World.js';
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

export class Game {
    constructor(canvas, onCombatTrigger) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.rafId   = null;
        this.paused  = false;
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
    }

    async start() {
        this._setupResize();
        this.input.init(this.canvas, { current: null, set: (cam) => { this.camera = cam; } });

        const { map, camera, player, crow, initialEnemies, hunterSprites } = await createWorld(
            this.canvas.width,
            this.canvas.height
        );

        this.map     = map;
        this.camera  = camera;
        this.player  = player;
        this.sprites = hunterSprites;
        this.crow    = crow;

        this.crowDialogue = new CrowDialogue(crow);
        this.crowDialogue.onDialogue     = (data) => this.onCrowDialogue?.(data);
        this.crowDialogue.onPromptChange = (v)    => this.onCrowPrompt?.(v);

        // atualiza a referência da câmera no InputManager
        this.input._cameraGetter = () => this.camera;

        this.em.init(player, initialEnemies, crow, this.crowDialogue);
        this.renderer = new Renderer(this.canvas);

        let lastTime = 0;
        const loop = (timestamp) => {
            try {
                const delta = timestamp - lastTime;
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
                }

                this.renderer.draw(this.ctx, this.map, this.player, this.em, this.camera, this.ui, this.input.mousePos, this.jogadorEngine, { hasLantern: this.crowDialogue?.hasLantern, showPrompt: this.crowDialogue?.showPrompt, crow: this.crow?.visible ? this.crow : null });
            } catch (err) {
                console.error('[Game loop error]', err);
            }
            this.rafId = requestAnimationFrame(loop);
        };

        this.rafId = requestAnimationFrame(loop);
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
        cancelAnimationFrame(this.rafId);
        this.audio.stop();
        this.input.destroy(this.canvas);
        window.removeEventListener('resize', this._resizeHandler);
    }

    playMusic() {
        this.audio.playBackgroundMusic();
    }

    playIntro(callbacks) {
        this.audio.playIntro(callbacks);
    }

    skipIntro() {
        this.audio.skipIntro();
    }

    executeCommand(cmd) {
        const args   = cmd.trim().split(' ');
        const action = args[0].toLowerCase();

        if (action === '/spawn' && args[1]?.toLowerCase() === 'hunter') {
            this.em.spawnHunter(this.sprites);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'all' && args[2]?.toLowerCase() === 'hunter') {
            this.em.killHunters(true);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'hunter') {
            this.em.killHunters(false);
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
