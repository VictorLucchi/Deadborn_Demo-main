export class Renderer {

    constructor(canvas) {

        this.canvas = canvas;

        this.rain = Array.from(
            { length: 200 },
            () => ({
                x:
                    Math.random() *
                    canvas.width,

                y:
                    Math.random() *
                    canvas.height,

                len:
                    Math.random() * 14 + 8,

                speed:
                    Math.random() * 6 + 14,

                wind:
                    Math.random() * 1.5 + 0.5,
            })
        );


        this._fogCanvas =
            document.createElement('canvas');

        this._fogCtx =
            this._fogCanvas.getContext('2d');

        // Reutilizados a cada quadro para evitar pressionar o GC durante
        // a ordenação de profundidade.
        this._renderables = [];
        this._entityRenderables = new WeakMap();
        this._sortByY = (a, b) => a.sortY - b.sortY;
    }


    draw(
        ctx,
        map,
        player,
        entityManager,
        camera,
        uiBridge,
        mousePos,
        jogador,
        crowState
    ) {

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // ===============================
        // MAPA
        // ===============================

        map.drawBelow(
            ctx,
            camera
        );


        // ===============================
        // Y-SORTING
        // ===============================

        const objectTiles =
            map.getObjectTiles(camera);


        const renderables = this._renderables;
        renderables.length = 0;

        this._addEntityRenderable(renderables, player);

        for (const enemy of entityManager.enemies) {
            this._addEntityRenderable(renderables, enemy);
        }

        if (crowState?.crow) {
            this._addEntityRenderable(renderables, crowState.crow);
        }

        for (const tile of objectTiles) {
            renderables.push(tile);
        }

        renderables.sort(this._sortByY);

        for (const renderable of renderables) {
            renderable.draw(ctx, camera);
        }


        // ===============================
        // NEBLINA
        // ===============================

        if (!crowState?.indoors) {

            this._drawFog(
                ctx,
                player,
                camera,
                crowState
            );


            // ===============================
            // LUZ DOS HUNTERS
            // ===============================

            this._drawHunterFogLights(
                ctx,
                entityManager,
                player,
                camera
            );


            // ===============================
            // SILHUETAS DOS HUNTERS
            // ===============================

            this._drawHunterFogGhosts(
                ctx,
                entityManager,
                player,
                camera
            );
        }


        // ===============================
        // CHUVA
        // ===============================

        this._drawRain(ctx);


        // ===============================
        // UI
        // ===============================

        uiBridge.draw(
            ctx,
            mousePos,
            jogador
        );


        if (crowState?.showPrompt) {

            this._drawInteractPrompt(
                ctx,
                player,
                camera
            );
        }


        if (crowState?.doorPrompt) {

            this._drawDoorPrompt(
                ctx,
                player,
                camera,
                crowState.doorPrompt
            );
        }


        // ===============================
        // FADE
        // ===============================

        if (crowState?.fadeAlpha > 0) {

            ctx.save();

            ctx.globalAlpha =
                crowState.fadeAlpha;

            ctx.fillStyle = '#000';

            ctx.fillRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );

            ctx.restore();
        }
    }

    _addEntityRenderable(renderables, entity) {
        let renderable = this._entityRenderables.get(entity);

        if (!renderable) {
            renderable = {
                entity,
                sortY: 0,
                draw(ctx, camera) {
                    this.entity.draw(ctx, camera);
                },
            };
            this._entityRenderables.set(entity, renderable);
        }

        renderable.sortY = entity.sortY;
        renderables.push(renderable);
    }


    // =========================================================
    // LUZ DOS HUNTERS
    // =========================================================

    _drawHunterFogLights(
        ctx,
        entityManager,
        player,
        camera
    ) {

        if (
            !entityManager?.enemies
        ) {
            return;
        }


        entityManager.enemies.forEach(
            enemy => {

                // Só Hunters que possuem
                // o sistema especial.

                if (
                    typeof enemy.drawFogLight !==
                    'function'
                ) {
                    return;
                }


                enemy.drawFogLight(
                    ctx,
                    camera,
                    player
                );
            }
        );
    }


    // =========================================================
    // SILHUETAS DOS HUNTERS
    // =========================================================

    _drawHunterFogGhosts(
        ctx,
        entityManager,
        player,
        camera
    ) {

        if (
            !entityManager?.enemies
        ) {
            return;
        }


        entityManager.enemies.forEach(
            enemy => {

                if (
                    typeof enemy.drawFogGhost !==
                    'function'
                ) {
                    return;
                }


                enemy.drawFogGhost(
                    ctx,
                    camera,
                    player
                );
            }
        );
    }


    // =========================================================
    // FOG
    // =========================================================

    _drawFog(
        ctx,
        player,
        camera,
        crowState
    ) {

        const W =
            this.canvas.width;

        const H =
            this.canvas.height;


        // Sincroniza tamanho
        // do offscreen

        if (
            this._fogCanvas.width !== W ||
            this._fogCanvas.height !== H
        ) {

            this._fogCanvas.width = W;
            this._fogCanvas.height = H;
        }


        const fc =
            this._fogCtx;


        fc.clearRect(
            0,
            0,
            W,
            H
        );


        // ===============================
        // NEBLINA TOTAL
        // ===============================

        fc.fillStyle =
            'rgba(8, 8, 14, 0.97)';

        fc.fillRect(
            0,
            0,
            W,
            H
        );


        // ===============================
        // POSIÇÃO DO PLAYER
        // ===============================

        const px =
            player.x -
            camera.x;

        const py =
            player.y -
            camera.y +
            player.animator.frameH *
            0.25 *
            0.5;


        // ===============================
        // FOV DO PLAYER
        // ===============================

        fc.globalCompositeOperation =
            'destination-out';


        if (crowState?.hasLantern) {

            const hole =
                fc.createRadialGradient(
                    px,
                    py,
                    0,

                    px,
                    py,
                    200
                );


            hole.addColorStop(
                0,
                'rgba(0,0,0,1)'
            );

            hole.addColorStop(
                0.15,
                'rgba(0,0,0,0.98)'
            );

            hole.addColorStop(
                0.3,
                'rgba(0,0,0,0.93)'
            );

            hole.addColorStop(
                0.45,
                'rgba(0,0,0,0.82)'
            );

            hole.addColorStop(
                0.6,
                'rgba(0,0,0,0.62)'
            );

            hole.addColorStop(
                0.75,
                'rgba(0,0,0,0.38)'
            );

            hole.addColorStop(
                0.88,
                'rgba(0,0,0,0.14)'
            );

            hole.addColorStop(
                1,
                'rgba(0,0,0,0)'
            );


            fc.fillStyle =
                hole;

            fc.fillRect(
                0,
                0,
                W,
                H
            );

        } else {

            const hole =
                fc.createRadialGradient(
                    px,
                    py,
                    0,

                    px,
                    py,
                    55
                );


            hole.addColorStop(
                0,
                'rgba(0,0,0,1)'
            );

            hole.addColorStop(
                0.35,
                'rgba(0,0,0,0.85)'
            );

            hole.addColorStop(
                0.65,
                'rgba(0,0,0,0.3)'
            );

            hole.addColorStop(
                1,
                'rgba(0,0,0,0)'
            );


            fc.fillStyle =
                hole;

            fc.fillRect(
                0,
                0,
                W,
                H
            );
        }


        // ===============================
        // FOV DO CORVO
        // ===============================

        if (
            crowState?.crow &&
            !crowState?.hasLantern
        ) {

            const crow =
                crowState.crow;

            const cx =
                crow.x -
                camera.x;

            const cy =
                crow.y -
                camera.y -
                crow.drawH / 2;


            const crowHole =
                fc.createRadialGradient(
                    cx,
                    cy,
                    0,

                    cx,
                    cy,
                    170
                );


            crowHole.addColorStop(
                0,
                'rgba(0,0,0,1)'
            );

            crowHole.addColorStop(
                0.25,
                'rgba(0,0,0,0.98)'
            );

            crowHole.addColorStop(
                0.45,
                'rgba(0,0,0,0.92)'
            );

            crowHole.addColorStop(
                0.62,
                'rgba(0,0,0,0.7)'
            );

            crowHole.addColorStop(
                0.78,
                'rgba(0,0,0,0.4)'
            );

            crowHole.addColorStop(
                0.9,
                'rgba(0,0,0,0.12)'
            );

            crowHole.addColorStop(
                1,
                'rgba(0,0,0,0)'
            );


            fc.fillStyle =
                crowHole;

            fc.fillRect(
                0,
                0,
                W,
                H
            );
        }


        fc.globalCompositeOperation =
            'source-over';


        // ===============================
        // COMPOSIÇÃO DA NEBLINA
        // ===============================

        ctx.drawImage(
            this._fogCanvas,
            0,
            0
        );


        // ===============================
        // TINT AZUL DO PLAYER
        // ===============================

        if (
            crowState?.hasLantern
        ) {

            const tint =
                ctx.createRadialGradient(
                    px,
                    py,
                    0,

                    px,
                    py,
                    200
                );


            tint.addColorStop(
                0,
                'rgba(60, 110, 240, 0.22)'
            );

            tint.addColorStop(
                0.2,
                'rgba(50, 95, 220, 0.16)'
            );

            tint.addColorStop(
                0.45,
                'rgba(40, 80, 200, 0.10)'
            );

            tint.addColorStop(
                0.7,
                'rgba(25, 55, 160, 0.05)'
            );

            tint.addColorStop(
                1,
                'rgba(10, 20, 80, 0)'
            );


            ctx.fillStyle =
                tint;

            ctx.fillRect(
                0,
                0,
                W,
                H
            );
        }


        // ===============================
        // TINT AZUL DO CORVO
        // ===============================

        if (
            crowState?.crow &&
            !crowState?.hasLantern
        ) {

            const crow =
                crowState.crow;

            const cx =
                crow.x -
                camera.x;

            const cy =
                crow.y -
                camera.y -
                crow.drawH / 2;


            const glow =
                ctx.createRadialGradient(
                    cx,
                    cy,
                    0,

                    cx,
                    cy,
                    170
                );


            glow.addColorStop(
                0,
                'rgba(80, 130, 255, 0.28)'
            );

            glow.addColorStop(
                0.2,
                'rgba(60, 110, 240, 0.22)'
            );

            glow.addColorStop(
                0.45,
                'rgba(40, 80, 200, 0.14)'
            );

            glow.addColorStop(
                0.65,
                'rgba(25, 55, 160, 0.07)'
            );

            glow.addColorStop(
                0.85,
                'rgba(15, 30, 100, 0.03)'
            );

            glow.addColorStop(
                1,
                'rgba(10, 20, 80, 0)'
            );


            ctx.fillStyle =
                glow;

            ctx.fillRect(
                0,
                0,
                W,
                H
            );
        }
    }


    // =========================================================
    // PROMPT
    // =========================================================

    _drawInteractPrompt(
        ctx,
        player,
        camera
    ) {

        const px =
            player.x -
            camera.x;

        const py =
            player.y -
            camera.y -
            20;


        ctx.save();

        ctx.font =
            'bold 13px monospace';

        ctx.textAlign =
            'center';


        const text =
            '[E] Interagir';

        const tw =
            ctx.measureText(
                text
            ).width;


        ctx.fillStyle =
            'rgba(0,0,0,0.6)';

        ctx.fillRect(
            px - tw / 2 - 6,
            py - 14,
            tw + 12,
            20
        );


        ctx.fillStyle =
            '#e8e0c8';

        ctx.fillText(
            text,
            px,
            py
        );


        ctx.restore();
    }


    _drawDoorPrompt(
        ctx,
        player,
        camera,
        text
    ) {

        const px =
            player.x -
            camera.x;

        const py =
            player.y -
            camera.y -
            40;


        ctx.save();

        ctx.font =
            'bold 13px monospace';

        ctx.textAlign =
            'center';


        const tw =
            ctx.measureText(
                text
            ).width;


        ctx.fillStyle =
            'rgba(0,0,0,0.6)';

        ctx.fillRect(
            px - tw / 2 - 6,
            py - 14,
            tw + 12,
            20
        );


        ctx.fillStyle =
            '#e8e0c8';

        ctx.fillText(
            text,
            px,
            py
        );


        ctx.restore();
    }


    // =========================================================
    // CHUVA
    // =========================================================

    _drawRain(ctx) {

        ctx.strokeStyle =
            'rgba(180, 190, 210, 0.35)';

        ctx.lineWidth =
            0.8;


        ctx.beginPath();

        for (const drop of this.rain) {

                drop.y +=
                    drop.speed;

                drop.x +=
                    drop.wind;


                if (
                    drop.y >
                    this.canvas.height
                ) {

                    drop.y =
                        -drop.len;

                    drop.x =
                        Math.random() *
                        this.canvas.width;
                }


            ctx.moveTo(
                drop.x,
                drop.y
            );

            ctx.lineTo(
                drop.x +
                drop.wind * 2,

                drop.y +
                drop.len
            );
        }

        ctx.stroke();
    }
}
