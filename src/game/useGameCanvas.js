import { useEffect, useRef } from 'react';
import { Game } from './Game.js';

export function useGameCanvas(isPaused) {
    const canvasRef = useRef(null);
    const gameRef   = useRef(null);

    useEffect(() => {
        if (gameRef.current) gameRef.current.pause(isPaused);
    }, [isPaused]);

    useEffect(() => {
        const game = new Game(canvasRef.current);
        gameRef.current = game;
        game.start();

        return () => game.stop();
    }, []);

    const executeCommand = (cmd) => gameRef.current?.executeCommand(cmd);
    const playMusic      = ()    => gameRef.current?.playMusic();

    return { canvasRef, executeCommand, playMusic };
}