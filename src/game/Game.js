import { InputManager }  from './input/InputManager.js';
import { EntityManager } from './entityManager/EntityManager.js';
import { Renderer }      from './render/Renderer.js';
import { UIBridge }      from './UIBridge/UIBridge.js';
import { AudioManager }  from './audio/AudioManager.js';
import { createWorld }   from './world/World.js';

export class Game {
    constructor(canvas, onCombatTrigger) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.rafId   = null;
        this.paused  = false;

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

        const { map, camera, player, initialEnemies, hunterSprites } = await createWorld(
            this.canvas.width,
            this.canvas.height
        );

        this.map     = map;
        this.camera  = camera;
        this.player  = player;
        this.sprites = hunterSprites;

        // atualiza a referência da câmera no InputManager
        this.input._cameraGetter = () => this.camera;

        this.em.init(player, initialEnemies);
        this.renderer = new Renderer(this.canvas);

        let lastTime = 0;
        const loop = (timestamp) => {
            const delta = timestamp - lastTime;
            lastTime = timestamp;

            if (!this.paused) {
                this.player.update(
                    this.input.keys,
                    delta,
                    (x, y, w, h) => this.map.checkCollision(x, y, w, h)
                );
                this.em.update(delta, (x, y, w, h) => this.map.checkCollision(x, y, w, h));
                this.camera.follow(this.player);
            }

            this.renderer.draw(this.ctx, this.map, this.player, this.em, this.camera, this.ui, this.input.mousePos);
            this.rafId = requestAnimationFrame(loop);
        };

        this.rafId = requestAnimationFrame(loop);
    }

    pause(value) {
        this.paused = value;
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

    executeCommand(cmd) {
        const args   = cmd.trim().split(' ');
        const action = args[0].toLowerCase();

        if (action === '/spawn' && args[1]?.toLowerCase() === 'hunter') {
            this.em.spawnHunter(this.sprites);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'all' && args[2]?.toLowerCase() === 'hunter') {
            this.em.killHunters(true);
        } else if (action === '/kill' && args[1]?.toLowerCase() === 'hunter') {
            this.em.killHunters(false);
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
