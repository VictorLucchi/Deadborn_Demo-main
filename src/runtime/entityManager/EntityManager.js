import { Hunter } from '../entities/Hunter.js';
import { BroodhostWalker } from '../entities/BroodhostWalker.js';

export class EntityManager {
    constructor() {
        this.enemies = [];
        this.player = null;
        this.crow = null;
        this.crowDialogue = null;
        this.onCombatTrigger = null;
    }

    init(player, initialEnemies = [], crow = null, crowDialogue = null) {
        this.player = player;
        this.enemies = initialEnemies;
        this.crow = crow;
        this.crowDialogue = crowDialogue;
        this._bindCombatTrigger();
    }

    _bindCombatTrigger() {
        this.enemies.forEach(e => {
            if (e.onCombatTrigger !== undefined) e.onCombatTrigger = this.onCombatTrigger;
        });
    }

    spawnHunter(sprites, offsetX = 100) {
        const hunter = new Hunter(
            {
                idle:      sprites.idle,
                walkRight: sprites.walkRight,
                walkLeft:  sprites.walkLeft,
                run:       sprites.run,
            },
            this.player.x + offsetX,
            this.player.y
        );
        hunter.onCombatTrigger = this.onCombatTrigger;
        this.enemies.push(hunter);
    }

    spawnBroodhostWalker(sprites, offsetX = 100, offsetY = 0) {
        const groupIndex = this.enemies.filter(enemy => enemy instanceof BroodhostWalker).length;
        const walker = new BroodhostWalker(
            {
                idle: sprites.idleWalker,
                walkLeft: sprites.walkLeftWalker,
                walkRight: sprites.walkRightWalker,
            },
            this.player.x + offsetX,
            this.player.y + offsetY,
            groupIndex
        );
        walker.onCombatTrigger = this.onCombatTrigger;
        this.enemies.push(walker);
    }

    killHunters(all = false, range = 200) {
        this.enemies = this.enemies.filter(enemy => {
            if (!(enemy instanceof Hunter)) return true;
            if (all) return false;
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            return Math.sqrt(dx * dx + dy * dy) > range;
        });
    }

    killBroodhostWalkers(all = false, range = 200) {
        this.enemies = this.enemies.filter(enemy => {
            if (!(enemy instanceof BroodhostWalker)) return true;
            if (all) return false;
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            return Math.hypot(dx, dy) > range;
        });
    }

    removeEnemy(enemy) {
        this.enemies = this.enemies.filter(e => e !== enemy);
    }

    update(delta, checkCollision) {
        this.enemies.forEach(e => e.update(delta, this.player, checkCollision, this.enemies));
        if (this.crow) this.crow.update(delta);
        if (this.crowDialogue) this.crowDialogue.update(this.player);
    }

    draw(ctx, camera) {
        this.enemies.forEach(e => e.draw(ctx, camera));
        if (this.crow) this.crow.draw(ctx, camera);
    }
}
