import { Hunter } from '../entities/Hunter.js';

export class EntityManager {
    constructor() {
        this.enemies = [];
        this.player = null;
    }

    init(player, initialEnemies = []) {
        this.player = player;
        this.enemies = initialEnemies;
    }

    spawnHunter(sprites, offsetX = 100) {
        const hunter = new Hunter(
            {
                idle:      sprites.idleHunter,
                walkRight: sprites.walkRightHunter,
                walkLeft:  sprites.walkLeftHunter,
                run:       sprites.runHunter,
            },
            this.player.x + offsetX,
            this.player.y
        );
        this.enemies.push(hunter);
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

    update(delta, checkCollision) {
        this.enemies.forEach(e => e.update(delta, this.player, checkCollision));
    }

    draw(ctx, camera) {
        this.enemies.forEach(e => e.draw(ctx, camera));
    }
}
