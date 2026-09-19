import { useState, useEffect, useRef, useCallback } from 'react';
import './CrowDialogueBox.css';

const CHAR_INTERVAL = 38; // ms por caractere

export function CrowDialogueBox({ data, onClose, onOption }) {
    const { lines, speaker, options } = data;

    const [lineIndex, setLineIndex]   = useState(0);
    const [displayed, setDisplayed]   = useState('');
    const [done, setDone]             = useState(false);
    const [allDone, setAllDone]       = useState(false);
    const intervalRef                 = useRef(null);
    const fullText                    = lines[lineIndex] ?? '';

    const startTyping = useCallback((text) => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(intervalRef.current);
                setDone(true);
            }
        }, CHAR_INTERVAL);
    }, []);

    useEffect(() => {
        startTyping(fullText);
        return () => clearInterval(intervalRef.current);
    }, [lineIndex, fullText, startTyping]);

    const advance = useCallback(() => {
        if (!done) {
            // acelera: mostra tudo imediatamente
            clearInterval(intervalRef.current);
            setDisplayed(fullText);
            setDone(true);
            return;
        }
        const next = lineIndex + 1;
        if (next < lines.length) {
            setLineIndex(next);
        } else {
            if (!options) {
                setAllDone(true);
                onClose?.();
            } else {
                setAllDone(true);
            }
        }
    }, [done, lineIndex, lines, fullText, options, onClose]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter') advance();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [advance]);

    const speakerLabel = speaker === 'hades' ? 'Hades' : 'Corvo';

    return (
        <div className="crow-dialogue-overlay">
            <div className="crow-dialogue-box">
                <div className="crow-dialogue-speaker">{speakerLabel}</div>
                <div className="crow-dialogue-text">{displayed}<span className="crow-cursor">▌</span></div>

                {allDone && options && (
                    <div className="crow-dialogue-options">
                        <div className="crow-dialogue-acquired">Você adquiriu luz</div>
                        {options.map((opt, i) => (
                            <button key={i} className="crow-dialogue-option" onClick={() => onOption?.(opt)}>
                                ❯ {opt}
                            </button>
                        ))}
                    </div>
                )}

                {!allDone && done && !options && (
                    <div className="crow-dialogue-hint">[ Enter ]</div>
                )}
                {!allDone && done && options && lineIndex >= lines.length - 1 && (
                    <div className="crow-dialogue-hint">[ Enter ]</div>
                )}
            </div>
        </div>
    );
}
