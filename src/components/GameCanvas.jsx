import { useState, useEffect } from 'react';
import { useGameCanvas } from '../game/useGameCanvas.js';
import { DevConsole } from './DevConsole.jsx';

export function GameCanvas({ isPaused, onReady, onCombatTrigger }) {
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const { canvasRef, executeCommand, playMusic, removeEnemy } = useGameCanvas(
        isPaused || isConsoleOpen,
        onCombatTrigger
    );

    useEffect(() => {
        onReady?.({ playMusic, removeEnemy });
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    imageRendering: 'pixelated',
                }}
            />
            <DevConsole onCommand={executeCommand} onToggle={setIsConsoleOpen} />
        </>
    );
}
