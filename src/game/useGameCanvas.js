import { useEffect, useRef } from 'react';
import { Game } from './Game.js';

export function useGameCanvas(isPaused, onCombatTrigger) {
    const canvasRef = useRef(null);
    const gameRef   = useRef(null);
    const onCombatRef = useRef(onCombatTrigger);
    onCombatRef.current = onCombatTrigger;

    useEffect(() => {
        if (gameRef.current) gameRef.current.pause(isPaused);
    }, [isPaused]);

    useEffect(() => {
        const game = new Game(canvasRef.current, (enemy) => onCombatRef.current?.(enemy));
        gameRef.current = game;
        game.start().then(() => game.pause(isPaused));

        return () => game.stop();
    }, []);

    const executeCommand = (cmd) => gameRef.current?.executeCommand(cmd);
    const playMusic      = ()    => gameRef.current?.playMusic();
    const removeEnemy    = (e)   => gameRef.current?.em.removeEnemy(e);
    const setJogador     = (j)   => gameRef.current?.setJogador(j);

    return { canvasRef, executeCommand, playMusic, removeEnemy, setJogador };
}