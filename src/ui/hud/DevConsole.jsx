import React, { useState, useEffect, useRef } from 'react';

export function DevConsole({ onCommand, onToggle }) {
    const [isOpen, setIsOpen] = useState(false);
    const [command, setCommand] = useState('');
    const [feedback, setFeedback] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "'") {
                e.preventDefault();
                setIsOpen(prev => {
                    const next = !prev;
                    if (!next) setFeedback('');
                    onToggle?.(next);
                    return next;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (command.trim()) {
            const result = onCommand(command.trim());
            setCommand('');
            if (result) {
                setFeedback(result);
                return; // mantém aberto para mostrar o feedback
            }
        }
        setFeedback('');
        setIsOpen(false);
        onToggle?.(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #444',
            padding: '10px',
            zIndex: 1000,
            borderRadius: '4px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Digite um comando..."
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#0f0',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                />
            </form>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '5px', fontFamily: 'monospace' }}>
                /spawn [name] | /kill [all] [name] | /give [item]
            </div>
            {feedback && (
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px', fontFamily: 'monospace' }}>
                    {feedback}
                </div>
            )}
        </div>
    );
}
