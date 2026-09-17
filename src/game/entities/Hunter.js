import { SpriteAnimator } from './SpriteAnimator.js';
 
// ===============================
// CONFIGURAÇÕES
// ===============================
 
const DETECTION_RADIUS = 550;
const COMBAT_TRIGGER_DIST = 32;
 
const ORBIT_RADIUS = 120;
 
// Velocidade
const MIN_SPEED = 1.0;
const MAX_SPEED = 6.5;
 
// Salto
const FRAME_W_RUN = 4856 / 8; // 607
const FRAME_H_RUN = 504;
 
const AIR_FRAMES = [5, 6];
const LAND_FRAME = 7;
 
// Aura
const AURA_FADE_SPEED = 0.015;
 
// ===============================
// HUNTER
// ===============================
 
export class Hunter {
 
    constructor(sprites, x, y) {
 
        this.x = x;
        this.y = y;
 
        // ===============================
        // ESTADO
        // ===============================
 
        this.currentAnim = 'idle';
 
        this.marked = false;
        this.combatTriggered = false;
 
        this.onCombatTrigger = null;
 
        // ===============================
        // SALTO
        // ===============================
 
        this.jumping = false;
        this.landingPause = false;
        this.landTimer = 0;
 
        this.jumpDirX = 0;
        this.jumpDirY = 0;
 
        // ===============================
        // AURA
        // ===============================
 
        // A aura começa acesa enquanto o Hunter
        // ainda não percebeu Hades.
 
        this.auraActive = true;
        this.auraAlpha = 1;
 
        // Pequena variação da aura
        this.auraPulse = Math.random() * Math.PI * 2;
 
        // ===============================
        // ANIMAÇÕES
        // ===============================
 
        this.animators = {
 
            idle: new SpriteAnimator(
                sprites.idle,
                542,
                521,
                6
            ),
 
            walkRight: new SpriteAnimator(
                sprites.walkRight,
                559,
                522,
                11
            ),
 
            walkLeft: new SpriteAnimator(
                sprites.walkLeft,
                559,
                522,
                11
            ),
 
            run: new SpriteAnimator(
                sprites.run,
                FRAME_W_RUN,
                FRAME_H_RUN,
                8
            ),
        };
 
        this.animators.idle.addAnimation(
            'idle',
            0,
            6
        );
 
        this.animators.walkRight.addAnimation(
            'walkRight',
            0,
            6
        );
 
        this.animators.walkLeft.addAnimation(
            'walkLeft',
            0,
            6
        );
 
        this.animators.run.addAnimation(
            'run',
            0,
            8
        );
 
        this.animators.idle.play('idle');
 
        // ===============================
        // PATRULHA
        // ===============================
 
        this.patrolDir = 0;
 
        this.patrolTimer = 0;
        this.patrolDuration = this._rand(
            1000,
            4000
        );
 
        // ===============================
        // ÓRBITA
        // ===============================
 
        this.orbitAngle =
            Math.random() * Math.PI * 2;
 
        this.orbitSpeed =
            (Math.random() < 0.5 ? 1 : -1) *
            0.008;
 
        this.speed = MIN_SPEED;
 
        this.speedTimer = 0;
 
        this.speedDuration = this._rand(
            500,
            2500
        );
 
        // ===============================
        // MOVIMENTO IMPREVISÍVEL
        // ===============================
 
        this.jitterTimer = 0;
 
        this.jitterDuration = this._rand(
            300,
            1200
        );
 
        this.jitter = {
            x: 0,
            y: 0
        };
 
        // Intensidade de desvio
        this.strafe = 0;
 
        // ===============================
        // COMPORTAMENTO
        // ===============================
 
        this.behavior = 'patrol';
 
        this.behaviorTimer = 0;
 
        this.behaviorDuration = this._rand(
            700,
            2200
        );
    }
 
    // ===============================
    // UTILIDADES
    // ===============================
 
    _rand(min, max) {
        return min + Math.random() * (max - min);
    }
 
    get animator() {
        return this.animators[this.currentAnim];
    }
 
    setAnim(name) {
 
        if (this.currentAnim === name)
            return;
 
        this.currentAnim = name;
 
        const anim = this.animators[name];
 
        anim.current = name;
        anim.frame = 0;
        anim.elapsed = 0;
    }
 
    _distTo(player) {
 
        const dx = player.x - this.x;
        const dy = player.y - this.y;
 
        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }
 
    // ===============================
    // AURA
    // ===============================
 
    _updateAura(delta) {
 
        if (this.auraActive) {
 
            this.auraAlpha +=
                AURA_FADE_SPEED * delta / 16.67;
 
            if (this.auraAlpha > 1)
                this.auraAlpha = 1;
 
        } else {
 
            this.auraAlpha -=
                AURA_FADE_SPEED * delta / 16.67;
 
            if (this.auraAlpha < 0)
                this.auraAlpha = 0;
        }
 
        this.auraPulse +=
            delta * 0.003;
    }
 
    // ===============================
    // PATRULHA
    // ===============================
 
    _updatePatrol(delta, checkCollision) {
 
        this.patrolTimer += delta;
 
        if (
            this.patrolTimer >=
            this.patrolDuration
        ) {
 
            this.patrolTimer = 0;
 
            this.patrolDuration =
                this._rand(1000, 4000);
 
            /*
             * Às vezes ele para.
             * Às vezes muda completamente
             * de direção.
             */
 
            const decision =
                Math.random();
 
            if (decision < 0.25) {
 
                this.patrolDir = 0;
 
            } else {
 
                this.patrolDir =
                    Math.random() < 0.5
                        ? -1
                        : 1;
            }
        }
 
        if (this.patrolDir !== 0) {
 
            const pw = 40;
            const ph = 40;
 
            const dx =
                this.patrolDir * 1.5;
 
            if (
                !checkCollision(
                    this.x + dx - pw / 2,
                    this.y - ph / 2,
                    pw,
                    ph
                )
            ) {
 
                this.x += dx;
 
            } else {
 
                this.patrolDir *= -1;
            }
        }
 
        if (this.patrolDir === -1)
            this.setAnim('walkLeft');
 
        else if (this.patrolDir === 1)
            this.setAnim('walkRight');
 
        else
            this.setAnim('idle');
    }
 
    // ===============================
    // COMPORTAMENTO DE PERSEGUIÇÃO
    // ===============================
 
    _updateOrbit(delta, player, checkCollision) {
 
        // --------------------------------
        // Mudança de velocidade
        // --------------------------------
 
        this.speedTimer += delta;
 
        if (
            this.speedTimer >=
            this.speedDuration
        ) {
 
            this.speedTimer = 0;
 
            this.speedDuration =
                this._rand(400, 1800);
 
            this.speed =
                this._rand(
                    MIN_SPEED,
                    MAX_SPEED
                );
        }
 
        // --------------------------------
        // Chance de salto
        // --------------------------------
 
        if (
            this.speed >= 4 &&
            !this.jumping &&
            !this.landingPause
        ) {
 
            // Nem sempre pula imediatamente.
            if (Math.random() < 0.025) {
 
                this._startJump(player);
 
                return;
            }
        }
 
        // --------------------------------
        // Jitter
        // --------------------------------
 
        this.jitterTimer += delta;
 
        if (
            this.jitterTimer >=
            this.jitterDuration
        ) {
 
            this.jitterTimer = 0;
 
            this.jitterDuration =
                this._rand(250, 900);
 
            this.orbitSpeed =
                (
                    Math.random() < 0.5
                        ? 1
                        : -1
                ) *
                this._rand(
                    0.005,
                    0.025
                );
 
            this.jitter = {
 
                x:
                    (Math.random() - 0.5)
                    * 70,
 
                y:
                    (Math.random() - 0.5)
                    * 70
            };
 
            // Movimento lateral imprevisível
 
            this.strafe =
                (Math.random() - 0.5) *
                2;
        }
 
        // --------------------------------
        // Órbita
        // --------------------------------
 
        this.orbitAngle +=
            this.orbitSpeed *
            this.speed;
 
        const targetX =
            player.x +
            Math.cos(this.orbitAngle) *
            ORBIT_RADIUS +
            this.jitter.x;
 
        const targetY =
            player.y +
            Math.sin(this.orbitAngle) *
            ORBIT_RADIUS +
            this.jitter.y;
 
        const dx =
            targetX - this.x;
 
        const dy =
            targetY - this.y;
 
        const dist =
            Math.sqrt(
                dx * dx +
                dy * dy
            );
 
        if (dist > 2) {
 
            const pw = 40;
            const ph = 40;
 
            let moveX =
                (dx / dist) *
                this.speed;
 
            let moveY =
                (dy / dist) *
                this.speed;
 
            // --------------------------------
            // Movimento lateral
            // --------------------------------
 
            const sideX = -moveY;
            const sideY = moveX;
 
            moveX +=
                sideX *
                this.strafe;
 
            moveY +=
                sideY *
                this.strafe;
 
            // --------------------------------
            // Colisão X
            // --------------------------------
 
            if (
                !checkCollision(
                    this.x +
                    moveX -
                    pw / 2,
 
                    this.y -
                    ph / 2,
 
                    pw,
                    ph
                )
            ) {
 
                this.x += moveX;
            }
 
            // --------------------------------
            // Colisão Y
            // --------------------------------
 
            if (
                !checkCollision(
                    this.x -
                    pw / 2,
 
                    this.y +
                    moveY -
                    ph / 2,
 
                    pw,
                    ph
                )
            ) {
 
                this.y += moveY;
            }
        }
 
        // --------------------------------
        // Direção visual
        // --------------------------------
 
        if (dx < 0)
            this.setAnim('walkLeft');
 
        else
            this.setAnim('walkRight');
    }
    // ===============================
    // INÍCIO DO SALTO
    // ===============================
 
    _startJump(player) {
 
        this.jumping = true;
 
        const dx =
            player.x - this.x;
 
        const dy =
            player.y - this.y;
 
        const dist =
            Math.sqrt(
                dx * dx +
                dy * dy
            );
 
        if (dist === 0)
            return;
 
        this.jumpDirX =
            dx / dist;
 
        this.jumpDirY =
            dy / dist;
 
        const runAnim =
            this.animators.run;
 
        runAnim.frame = 0;
        runAnim.elapsed = 0;
        runAnim.current = 'run';
 
        this.currentAnim = 'run';
    }
 
    // ===============================
    // SALTO
    // ===============================
 
    _updateJump(delta, player, checkCollision) {
 
        const runAnim =
            this.animators.run;
 
        const frame =
            runAnim.frame;
 
        const inAir =
            AIR_FRAMES.includes(frame);
 
        const speed =
            inAir
                ? this.speed * 1.5 + 6
                : this.speed + 6;
 
        const pw = 40;
        const ph = 40;
 
        // --------------------------------
        // Direção continua sendo corrigida
        // --------------------------------
 
        const dx =
            player.x - this.x;
 
        const dy =
            player.y - this.y;
 
        const dist =
            Math.sqrt(
                dx * dx +
                dy * dy
            );
 
        if (dist > 0) {
 
            this.jumpDirX =
                dx / dist;
 
            this.jumpDirY =
                dy / dist;
        }
 
        // --------------------------------
        // Movimento
        // --------------------------------
 
        const moveX =
            this.jumpDirX *
            speed;
 
        const moveY =
            this.jumpDirY *
            speed;
 
        if (
            !checkCollision(
                this.x +
                moveX -
                pw / 2,
 
                this.y -
                ph / 2,
 
                pw,
                ph
            )
        ) {
 
            this.x += moveX;
        }
 
        if (
            !checkCollision(
                this.x -
                pw / 2,
 
                this.y +
                moveY -
                ph / 2,
 
                pw,
                ph
            )
        ) {
 
            this.y += moveY;
        }
 
        // --------------------------------
        // Loop dos frames aéreos
        // --------------------------------
 
        if (
            frame >= LAND_FRAME
        ) {
 
            runAnim.frame =
                AIR_FRAMES[0];
        }
 
        runAnim.update(delta);
    }
 
    // ===============================
    // ATERRISSAGEM
    // ===============================
 
    _startLanding() {
 
        this.landingPause = true;
        this.jumping = false;
 
        this.landTimer = 0;
 
        this.speed = MIN_SPEED;
 
        this.currentAnim = 'run';
 
        this.animators.run.frame =
            LAND_FRAME;
    }
 
    _updateLandingPause(delta) {
 
        this.landTimer += delta;
 
        if (
            this.landTimer >= 500
        ) {
 
            this.landingPause = false;
 
            this.setAnim('idle');
        }
    }
 
    // ===============================
    // UPDATE
    // ===============================
 
    update(
        delta,
        player,
        checkCollision
    ) {
 
        const dist =
            this._distTo(player);
 
        //--------------------------------
        // Percepção
        // --------------------------------
 
        if (dist <= DETECTION_RADIUS) {
 
            // A criatura percebeu Hades.
            // A aura desaparece.
 
            this.auraActive = false;
 
            this.marked = true;
 
        } else {
 
            // Hades está fora do alcance.
 
            this.auraActive = true;
 
            this.marked = false;
        }
 
        // --------------------------------
        // Combate
        // --------------------------------
 
        if (
            !this.combatTriggered &&
            dist <= COMBAT_TRIGGER_DIST &&
            this.onCombatTrigger
        ) {
 
            this.combatTriggered = true;
 
            this.onCombatTrigger(this);
 
            return;
        }
 
        // --------------------------------
        // Máquina de estados
        // --------------------------------
 
        if (this.jumping) {
 
            this._updateJump(
                delta,
                player,
                checkCollision
            );
 
        }
 
        else if (this.landingPause) {
 
            this._updateLandingPause(
                delta
            );
 
        }
 
        else if (
            dist <= DETECTION_RADIUS
        ) {
 
            this._updateOrbit(
                delta,
                player,
                checkCollision
            );
 
        }
 
        else {
 
            this._updatePatrol(
                delta,
                checkCollision
            );
        }
 
        // --------------------------------
        // Aura
        // --------------------------------
 
        this._updateAura(delta);
 
        // --------------------------------
        // Animação
        // --------------------------------
 
        if (!this.jumping) {
 
            this.animator.update(delta);
        }
    }
 
    // ===============================
    // Y SORTING
    // ===============================
 
    get sortY() {
 
        return this.y;
    }
 
    // ===============================
    // DRAW
    // ===============================
 
    draw(
        ctx,
        camera,
        scale = 0.3
    ) {
 
        const w =
            this.animator.frameW *
            scale;
 
        const screenX =
            this.x -
            camera.x -
            w / 2;
 
        const screenY =
            this.y -
            camera.y;
 
        // --------------------------------
        // AURA
        // --------------------------------
 
        if (this.auraAlpha > 0.01) {
 
            const pulse =
                Math.sin(
                    this.auraPulse
                ) * 0.08;
 
            const radius =
                35 + pulse * 20;
 
            const cx =
                this.x -
                camera.x;
 
            const cy =
                this.y -
                camera.y -
                35;
 
            const gradient =
                ctx.createRadialGradient(
                    cx,
                    cy,
                    5,
 
                    cx,
                    cy,
                    radius
                );
 
            gradient.addColorStop(
                0,
                `rgba(80, 255, 110, ${
                    0.22 *
                    this.auraAlpha
                })`
            );
 
            gradient.addColorStop(
                0.45,
                `rgba(50, 220, 80, ${
                    0.10 *
                    this.auraAlpha
                })`
            );
 
            gradient.addColorStop(
                1,
                `rgba(0, 255, 60, 0)`
            );
 
            ctx.save();
 
            ctx.globalCompositeOperation =
                'lighter';
 
            ctx.fillStyle =
                gradient;
 
            ctx.beginPath();
 
            ctx.arc(
                cx,
                cy,
                radius,
                0,
                Math.PI * 2
            );
 
            ctx.fill();
 
            ctx.restore();
        }
 
        // --------------------------------
        // SPRITE
        // --------------------------------
 
        this.animator.draw(
            ctx,
            screenX,
            screenY,
            scale
        );
    }
}