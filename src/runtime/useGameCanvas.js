import { useEffect, useRef } from 'react';
import { Game } from './Game.js';

export function useGameCanvas(isPaused, onCombatTrigger) {
    const canvasRef    = useRef(null);
    const gameRef      = useRef(null);
    const readyRef     = useRef(false);
    const isPausedRef  = useRef(isPaused);
    const onCombatRef  = useRef(onCombatTrigger);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        onCombatRef.current = onCombatTrigger;
    }, [onCombatTrigger]);

    useEffect(() => {
        if (readyRef.current) gameRef.current.pause(isPaused);
    }, [isPaused]);

    useEffect(() => {
        let cancelled = false;
        const game = new Game(canvasRef.current, (enemy) => onCombatRef.current?.(enemy));
        gameRef.current = game;
        game.start().then(() => {
            if (cancelled) return;
            readyRef.current = true;
            game.pause(isPausedRef.current);
        });

        return () => {
            cancelled = true;
            readyRef.current = false;
            game.stop();
        };
    }, []);

    const executeCommand   = (cmd) => { gameRef.current?.executeCommand(cmd); gameRef.current?.input.clearKeys(); };
    const playMusic        = ()    => gameRef.current?.playMusic();
    const playIntro        = (cb)  => gameRef.current?.playIntro(cb);
    const playDiaryWriting = ()    => gameRef.current?.playDiaryWriting();
    const skipIntro        = ()    => gameRef.current?.skipIntro();
    const removeEnemy      = (e)   => gameRef.current?.em.removeEnemy(e);
    const setJogador       = (j)   => gameRef.current?.setJogador(j);
    const setCrowCallbacks = (cb)  => gameRef.current?.setCrowCallbacks(cb);
    const crowInteract     = ()    => gameRef.current?.crowInteract();
    const crowPickup       = ()    => gameRef.current?.crowPickupLantern();
    const crowUnlock       = ()    => gameRef.current?.crowUnlockDialogue();
    const getCrowState     = ()    => gameRef.current?.crowDialogue ?? null;

    return { canvasRef, executeCommand, playMusic, playIntro, playDiaryWriting, skipIntro, removeEnemy, setJogador, setCrowCallbacks, crowInteract, crowPickup, crowUnlock, getCrowState };
}