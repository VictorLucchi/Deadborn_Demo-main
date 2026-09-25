import { useState, useEffect } from 'react';
import { useGameCanvas } from '../../runtime/useGameCanvas.js';
import { DevConsole } from './DevConsole.jsx';
import '../../runtime/HUD/HUD.css';

export function GameCanvas({
    isPaused,
    onReady,
    onCombatTrigger,
    onMissionEvent,
    onConsoleToggle
}) {
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    const handleConsoleToggle = (val) => {
        setIsConsoleOpen(val);
        onConsoleToggle?.(val);
    };

    const {
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
    } = useGameCanvas(
        isPaused || isConsoleOpen,
        onCombatTrigger,
        onMissionEvent
    );

    /*
     * O useGameCanvas já mantém acesso ao objeto
     * CrowDialogue através de getCrowState().
     *
     * Criamos essas duas funções aqui para que o App
     * consiga continuar a sequência pós-lanterna sem
     * precisar alterar o funcionamento do Corvo.
     */
    const crowHasPendingDialogue = () => {
        return getCrowState()?.hasPendingDialogue?.() ?? false;
    };

    const crowContinueDialogue = () => {
        return getCrowState()?.continueDialogue?.() ?? false;
    };

    useEffect(() => {
        onReady?.({
            playMusic,
            playIntro,
            playDiaryWriting,
            skipIntro,
            removeEnemy,
            setJogador,
            setCrowCallbacks,

            // Corvo
            crowInteract,
            crowPickup,
            crowUnlock,
            crowHasPendingDialogue,
            crowContinueDialogue
        });
    }, [
        crowInteract,
        crowPickup,
        crowUnlock,
        getCrowState,
        onReady,
        playDiaryWriting,
        playIntro,
        playMusic,
        removeEnemy,
        setCrowCallbacks,
        setJogador,
        skipIntro
    ]);

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
                        <img
                            id="hud-avatar-image"
                            src={null}
                            alt=""
                        />
                    </div>

                    <div className="hud-rune hud-rune-top"></div>
                    <div className="hud-rune hud-rune-bottom"></div>
                </div>

                <div className="hud-info">

                    <div className="hud-name">
                        <span id="hud-name">
                            HADES
                        </span>
                    </div>

                    <div className="hud-stat hud-health">
                        <div className="hud-stat-line">
                            <div
                                id="hud-health-fill"
                                className="hud-stat-fill"
                            ></div>
                        </div>

                        <span
                            id="hud-health-text"
                            className="hud-stat-text"
                        >
                            VIDA 110/110
                        </span>
                    </div>

                    <div className="hud-stat hud-mana">
                        <div className="hud-stat-line">
                            <div
                                id="hud-mana-fill"
                                className="hud-stat-fill"
                            ></div>
                        </div>

                        <span
                            id="hud-mana-text"
                            className="hud-stat-text"
                        >
                            MANA 43/43
                        </span>
                    </div>

                </div>

                <div className="hud-equipment">

                    {/* ARMA */}

                    <div className="hud-equipment-slot">

                        <div className="hud-equipment-frame">
                            <span id="hud-weapon-icon">
                                ⚔
                            </span>
                        </div>

                        <span className="hud-equipment-label">
                            ARMA
                        </span>

                    </div>

                    {/* UTILIDADE */}

                    <div className="hud-equipment-slot">

                        <div className="hud-equipment-frame">
                            <span id="hud-utility-icon">
                                ✦
                            </span>
                        </div>

                        <span className="hud-equipment-label">
                            UTIL
                        </span>

                    </div>

                </div>

            </div>

            <DevConsole
                onCommand={executeCommand}
                onToggle={handleConsoleToggle}
            />
        </>
    );
}