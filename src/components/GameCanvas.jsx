import { useState, useEffect } from 'react';
import { useGameCanvas } from '../game/useGameCanvas.js';
import { DevConsole } from './DevConsole.jsx';
import '../game/HUD/HUD.css';

export function GameCanvas({ isPaused, onReady, onCombatTrigger, onConsoleToggle }) {
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    const handleConsoleToggle = (val) => {
        setIsConsoleOpen(val);
        onConsoleToggle?.(val);
    };
    const { canvasRef, executeCommand, playMusic, removeEnemy, setJogador } = useGameCanvas(
        isPaused || isConsoleOpen,
        onCombatTrigger
    );

    useEffect(() => {
        onReady?.({ playMusic, removeEnemy, setJogador });
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
            <div id="game-hud" className="hud">
                <div className="hud-avatar">
                    <div className="hud-avatar-frame">
                        <img id="hud-avatar-image" src="" alt="" />
                    </div>
                    <div className="hud-rune hud-rune-top"></div>
                    <div className="hud-rune hud-rune-bottom"></div>
                </div>
                <div className="hud-info">
                    <div className="hud-name">
                        <span id="hud-name">HADES</span>
                    </div>
                    <div className="hud-stat hud-health">
                        <div className="hud-stat-line">
                            <div id="hud-health-fill" className="hud-stat-fill"></div>
                        </div>
                        <span id="hud-health-text" className="hud-stat-text">VIDA 110/110</span>
                    </div>
                    <div className="hud-stat hud-mana">
                        <div className="hud-stat-line">
                            <div id="hud-mana-fill" className="hud-stat-fill"></div>
                        </div>
                        <span id="hud-mana-text" className="hud-stat-text">MANA 43/43</span>
                    </div>
                </div>
                <div className="hud-equipment">
                    <div className="hud-equipment-frame">
                        <span id="hud-weapon-icon">⚔</span>
                    </div>
                </div>
            </div>
            <DevConsole onCommand={executeCommand} onToggle={handleConsoleToggle} />
        </>
    );
}
