import { SpriteAnimator } from './SpriteAnimator.js';

const DETECTION_RADIUS = 350;
const ORBIT_RADIUS     = 120;
const MIN_DIST_PLAYER  = 60;
const FRAME_W_RUN      = 4856 / 8; // 607
const FRAME_H_RUN      = 504;
// frames 6 e 7 (índice) = no ar; frame 7 = aterrissagem
const AIR_FRAMES       = [5, 6]; // 0-indexed
const LAND_FRAME       = 7;

export class Hunter {
    constructor(sprites, x, y) {
        this.x = x;
        this.y = y;
        this.currentAnim = 'idle';
        this.marked = false;

        // estado do salto
        this.jumping      = false;
        this.landingPause = false;
        this.landTimer    = 0;
        this.jumpDirX     = 0;
        this.jumpDirY     = 0;

        this.animators = {
            idle:      new SpriteAnimator(sprites.idle,      542,        521,        6),
            walkRight: new SpriteAnimator(sprites.walkRight, 559,        522,        11),
            walkLeft:  new SpriteAnimator(sprites.walkLeft,  559,        522,        11),
            run:       new SpriteAnimator(sprites.run,       FRAME_W_RUN, FRAME_H_RUN, 8),
        };

        this.animators.idle.addAnimation('idle', 0, 6);
        this.animators.walkRight.addAnimation('walkRight', 0, 6);
        this.animators.walkLeft.addAnimation('walkLeft', 0, 6);
        this.animators.run.addAnimation('run', 0, 8);
        this.animators.idle.play('idle');

        // estado patrulha
        this.patrolDir      = 0;
        this.patrolTimer    = 0;
        this.patrolDuration = this._rand(1000, 4000);

        // estado órbita
        this.orbitAngle    = Math.random() * Math.PI * 2;
        this.orbitSpeed    = (Math.random() < 0.5 ? 1 : -1) * 0.008;
        this.speed         = 1.0;
        this.speedTimer    = 0;
        this.speedDuration = this._rand(500, 2500);

        // imprevisibilidade
        this.jitterTimer    = 0;
        this.jitterDuration = this._rand(300, 1200);
        this.jitter         = { x: 0, y: 0 };
    }

    _rand(min, max) {
        return min + Math.random() * (max - min);
    }

    get animator() {
        return this.animators[this.currentAnim];
    }

    setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        const anim = this.animators[name];
        anim.current = name;
        anim.frame = 0;
        anim.elapsed = 0;
    }

    _distTo(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _updatePatrol(delta, checkCollision) {
        this.patrolTimer += delta;
        if (this.patrolTimer >= this.patrolDuration) {
            this.patrolTimer = 0;
            this.patrolDuration = this._rand(1000, 4000);
            this.patrolDir = this.patrolDir === 0
                ? (Math.random() < 0.5 ? -1 : 1)
                : (Math.random() < 0.3 ? 0 : this.patrolDir);
        }

        if (this.patrolDir !== 0) {
            const pw = 40, ph = 40;
            const dx = this.patrolDir * 1.5;
            if (!checkCollision(this.x + dx - pw / 2, this.y - ph / 2, pw, ph)) {
                this.x += dx;
            } else {
                this.patrolDir *= -1;
            }
        }

        if (this.patrolDir === -1)     this.setAnim('walkLeft');
        else if (this.patrolDir === 1) this.setAnim('walkRight');
        else                           this.setAnim('idle');
    }

    _updateOrbit(delta, player, checkCollision) {
        // alterna velocidade aleatoriamente
        this.speedTimer += delta;
        if (this.speedTimer >= this.speedDuration) {
            this.speedTimer = 0;
            this.speedDuration = this._rand(500, 2500);
            this.speed = this._rand(1.0, 6.5);
        }

        // ativa salto se velocidade >= 4 e nao esta saltando
        if (this.speed >= 4 && !this.jumping && !this.landingPause) {
            this._startJump(player);
            return;
        }

        // jitter
        this.jitterTimer += delta;
        if (this.jitterTimer >= this.jitterDuration) {
            this.jitterTimer = 0;
            this.jitterDuration = this._rand(300, 1200);
            this.orbitSpeed = (Math.random() < 0.5 ? 1 : -1) * this._rand(0.005, 0.02);
            this.jitter = {
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 40,
            };
        }

        this.orbitAngle += this.orbitSpeed * this.speed;

        const targetX = player.x + Math.cos(this.orbitAngle) * ORBIT_RADIUS + this.jitter.x;
        const targetY = player.y + Math.sin(this.orbitAngle) * ORBIT_RADIUS + this.jitter.y;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // distancia minima do player
        const distPlayer = this._distTo(player);
        if (distPlayer < MIN_DIST_PLAYER) return;

        if (dist > 2) {
            const pw = 40, ph = 40;
            const moveX = (dx / dist) * this.speed;
            const moveY = (dy / dist) * this.speed;

            if (!checkCollision(this.x + moveX - pw / 2, this.y - ph / 2, pw, ph))
                this.x += moveX;
            if (!checkCollision(this.x - pw / 2, this.y + moveY - ph / 2, pw, ph))
                this.y += moveY;
        }

        if (dx < 0) this.setAnim('walkLeft');
        else        this.setAnim('walkRight');
    }

    _startJump(player) {
        this.jumping = true;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.jumpDirX = dx / dist;
        this.jumpDirY = dy / dist;
        this.animators.run.frame = 0;
        this.animators.run.elapsed = 0;
        this.animators.run.current = 'run';
        this.currentAnim = 'run';
    }

    _updateJump(delta, player, checkCollision) {
        const runAnim = this.animators.run;
        const frame   = runAnim.frame;
        const inAir   = AIR_FRAMES.includes(frame);

        const speed = inAir ? this.speed * 1.5 + 6 : this.speed + 6;
        const pw = 40, ph = 40;

        const distPlayer = this._distTo(player);

        if (distPlayer <= 90) {
            // chegou perto o suficiente, aterrissa
            this.landingPause = true;
            this.jumping = false;
            this.landTimer = 0;
            this.speed = 1.0;
            this.currentAnim = 'run';
            runAnim.frame = LAND_FRAME;
            return;
        }

        // atualiza direção em tempo real em direção ao player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.jumpDirX = dx / dist;
        this.jumpDirY = dy / dist;

        const moveX = this.jumpDirX * speed;
        const moveY = this.jumpDirY * speed;
        if (!checkCollision(this.x + moveX - pw / 2, this.y - ph / 2, pw, ph))
            this.x += moveX;
        if (!checkCollision(this.x - pw / 2, this.y + moveY - ph / 2, pw, ph))
            this.y += moveY;

        // loop nos frames de ar enquanto nao chegou
        if (frame >= LAND_FRAME) runAnim.frame = AIR_FRAMES[0];

        runAnim.update(delta);
    }

    _updateLandingPause(delta) {
        this.landTimer += delta;
        if (this.landTimer >= 800) {
            this.landingPause = false;
            this.setAnim('idle');
        }
    }

    update(delta, player, checkCollision) {
        const dist = this._distTo(player);

        if (this.jumping) {
            this._updateJump(delta, player, checkCollision);
        } else if (this.landingPause) {
            this._updateLandingPause(delta);
        } else if (dist <= DETECTION_RADIUS) {
            this.marked = true;
            this._updateOrbit(delta, player, checkCollision);
        } else {
            this.marked = false;
            this._updatePatrol(delta, checkCollision);
        }

        if (!this.jumping) this.animator.update(delta);
    }

    draw(ctx, camera, scale = 0.3) {
        const w = this.animator.frameW * scale;
        const screenX = this.x - camera.x - w / 2;
        const screenY = this.y - camera.y;
        this.animator.draw(ctx, screenX, screenY, scale);

        // indicador visual de marca
        if (this.marked) {
            const cx = this.x - camera.x;
            const cy = this.y - camera.y - 10;
            ctx.fillStyle = 'rgba(224, 0, 0, 0.82)';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('◈', cx - 6, cy);
        }
    }
}
