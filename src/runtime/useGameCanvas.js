import { useEffect, useRef } from 'react';
import { Game } from './Game.js';

const activeGames = new WeakMap();

export function useGameCanvas(
    isPaused,
    onCombatTrigger,
    onMissionEvent
) {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    const isPausedRef = useRef(isPaused);
    const onCombatRef = useRef(onCombatTrigger);
    const onMissionRef = useRef(onMissionEvent);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        onCombatRef.current = onCombatTrigger;
    }, [onCombatTrigger]);

    useEffect(() => {
        onMissionRef.current = onMissionEvent;
    }, [onMissionEvent]);

    useEffect(() => {
        const game = gameRef.current;

        if (game) {
            game.pause(isPaused);
        }
    }, [isPaused]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const previousGame = activeGames.get(canvas);

        if (previousGame) {
            previousGame.stop();
        }

        const game = new Game(
            canvas,
            (enemy) => {
                onCombatRef.current?.(enemy);
            },
            (event) => {
                onMissionRef.current?.(event);
            }
        );

        activeGames.set(canvas, game);
        gameRef.current = game;

        game.start().catch((error) => {
    console.error('[Game] Falha ao iniciar:', error);
});

        return () => {
            game.stop();

            if (activeGames.get(canvas) === game) {
                activeGames.delete(canvas);
            }

            if (gameRef.current === game) {
                gameRef.current = null;
            }
        };
    }, []);

    const executeCommand = (command) => {
        gameRef.current?.executeCommand(command);
        gameRef.current?.input?.clearKeys?.();
    };

    const playMusic = () => {
        gameRef.current?.playMusic();
    };

    const playIntro = (callback) => {
        gameRef.current?.playIntro(callback);
    };

    const playDiaryWriting = () => {
        gameRef.current?.playDiaryWriting();
    };

    const skipIntro = () => {
        gameRef.current?.skipIntro();
    };

    const removeEnemy = (enemy) => {
        gameRef.current?.removeEnemy(enemy);
    };

    const setJogador = (jogador) => {
        gameRef.current?.setJogador(jogador);
    };

    const setCrowCallbacks = (callbacks) => {
        gameRef.current?.setCrowCallbacks(callbacks);
    };

    const crowInteract = () => {
        gameRef.current?.crowInteract();
    };

    const crowPickup = () => {
        gameRef.current?.crowPickupLantern();
    };

    const crowUnlock = () => {
        gameRef.current?.crowUnlockDialogue();
    };

    const getCrowState = () => {
        return gameRef.current?.crowDialogue ?? null;
    };

    return {
        canvasRef,
        executeCommand,
        playMusic,
        playIntro,
        playDiaryWriting,
        skipIntro,
        removeEnemy,
        setJogador,
        setCrowCallbacks,
        crowInteract,
        crowPickup,
        crowUnlock,
        getCrowState
    };
}