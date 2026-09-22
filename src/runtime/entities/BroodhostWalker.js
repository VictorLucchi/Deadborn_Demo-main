import { SpriteAnimator } from './SpriteAnimator.js';

const DETECTION_RADIUS = 420;
const LOST_SIGHT_RADIUS = 520;
const COMBAT_TRIGGER_DIST = 32;
const GROUP_RADIUS = 105;
const GROUP_SPACING = 38;
const WALK_SPEED = 0.85;
const PATROL_SPEED = 0.35;

export class BroodhostWalker {
    constructor(sprites, x, y, groupIndex = 0) {
        this.x = x;
        this.y = y;
        this.groupIndex = groupIndex;
        this.currentAnim = 'idle';
        this.alerted = false;
        this.combatTriggered = false;
        this.onCombatTrigger = null;
        this.combatType = 'broodhostWalker';
        this.patrolDirection = Math.random() < 0.5 ? -1 : 1;
        this.patrolTimer = 0;

        this.animators = {
            idle: new SpriteAnimator(sprites.idle, 287, 492, 6),
            walkRight: new SpriteAnimator(sprites.walkRight, 396, 368, 8),
            walkLeft: new SpriteAnimator(sprites.walkLeft, 396, 368, 8),
        };

        this.animators.idle.addAnimation('idle', 0, 6);
        this.animators.walkRight.addAnimation('walkRight', 0, 8);
        this.animators.walkLeft.addAnimation('walkLeft', 0, 8);
        this.animators.idle.play('idle');
    }

    get animator() {
        return this.animators[this.currentAnim];
    }

    setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        this.animators[name].play(name);
    }

    _distanceTo(player) {
        return Math.hypot(player.x - this.x, player.y - this.y);
    }

    _moveTowards(targetX, targetY, speed, checkCollision) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 2) return;

        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;
        const size = 40;

        if (!checkCollision(this.x + moveX - size / 2, this.y - size / 2, size, size)) {
            this.x += moveX;
        }

        if (!checkCollision(this.x - size / 2, this.y + moveY - size / 2, size, size)) {
            this.y += moveY;
        }

        this.setAnim(moveX < 0 ? 'walkLeft' : 'walkRight');
    }

    _updatePatrol(delta, checkCollision) {
        this.patrolTimer += delta;

        if (this.patrolTimer >= 1800) {
            this.patrolTimer = 0;
            if (Math.random() < 0.35) this.patrolDirection *= -1;
        }

        this._moveTowards(this.x + this.patrolDirection * 60, this.y, PATROL_SPEED, checkCollision);
    }

    _getGroupTarget(player, allies) {
        const groupSize = Math.max(allies.length, 1);
        const angle = (Math.PI * 2 * this.groupIndex) / groupSize;
        const radius = GROUP_RADIUS + Math.max(0, groupSize - 3) * GROUP_SPACING;

        return {
            x: player.x + Math.cos(angle) * radius,
            y: player.y + Math.sin(angle) * radius,
        };
    }

    update(delta, player, checkCollision, enemies = []) {
        const distance = this._distanceTo(player);

        if (distance <= DETECTION_RADIUS) this.alerted = true;
        if (distance > LOST_SIGHT_RADIUS) this.alerted = false;

        if (!this.combatTriggered && distance <= COMBAT_TRIGGER_DIST && this.onCombatTrigger) {
            this.combatTriggered = true;
            this.onCombatTrigger(this);
            return;
        }

        if (this.alerted) {
            const allies = enemies.filter(enemy => enemy instanceof BroodhostWalker);
            const target = this._getGroupTarget(player, allies);
            this._moveTowards(target.x, target.y, WALK_SPEED, checkCollision);
        } else {
            this._updatePatrol(delta, checkCollision);
        }

        this.animator.update(delta);
    }

    get sortY() {
        return this.y;
    }

    draw(ctx, camera, scale = 0.3) {
        const width = this.animator.frameW * scale;
        this.animator.draw(ctx, this.x - camera.x - width / 2, this.y - camera.y, scale);
    }
}