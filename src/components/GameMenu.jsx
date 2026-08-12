import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ITEMS = [
    { label: 'Continuar',      action: 'resume' },
    { label: 'Inventário',     action: null },
    { label: 'Mapa',           action: null },
    { label: 'Diário',         action: 'diary' },
    { label: 'Configurações',  action: null },
    { label: 'Salvar',         action: null },
    { label: 'Menu Principal', action: 'quit' },
    { label: 'Sair do Jogo',   action: null },
];

export function GameMenu({ onResume, onQuit, onOpenDiary }) {
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        const handle = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected(prev => (prev - 1 + ITEMS.length) % ITEMS.length);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected(prev => (prev + 1) % ITEMS.length);
            } else if (e.key === 'Enter') {
                const item = ITEMS[selected];
                if (item.action === 'resume') onResume?.();
                else if (item.action === 'quit') onQuit?.();
                else if (item.action === 'diary') onOpenDiary?.();
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [selected, onResume, onQuit]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div style={{
                width: '420px',
                background: '#0a0a0a',
                border: '2px solid #2a2a2a',
                borderRadius: '8px',
                padding: '40px 20px',
                boxShadow: '0 0 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)',
                textAlign: 'center',
                fontFamily: "'Georgia', serif",
            }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ color: '#666', fontSize: '24px', marginBottom: '5px' }}>🐺</div>
                    <h2 style={{
                        color: '#a0a0a0',
                        fontSize: '48px',
                        letterSpacing: '0.2em',
                        margin: '0',
                        fontWeight: '300',
                        textTransform: 'uppercase'
                    }}>Cinérea</h2>
                    <div style={{
                        color: '#555',
                        fontSize: '12px',
                        letterSpacing: '0.1em',
                        marginTop: '10px',
                        textTransform: 'uppercase'
                    }}>
                        Habitantes:<br />
                        <span style={{ fontSize: '18px', color: '#888' }}>2</span>
                    </div>
                    <div style={{ width: '100px', height: '1px', background: '#333', margin: '20px auto' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {ITEMS.map((item, i) => (
                        <MenuButton
                            key={item.label}
                            label={item.label}
                            isSelected={i === selected}
                            onClick={() => {
                                setSelected(i);
                                if (item.action === 'resume') onResume?.();
                                else if (item.action === 'quit') onQuit?.();
                                else if (item.action === 'diary') onOpenDiary?.();
                            }}
                        />
                    ))}
                </div>

                <div style={{ marginTop: '40px', color: '#333', fontSize: '10px', letterSpacing: '0.2em' }}>
                    v 0.4.2
                </div>
            </div>
        </motion.div>
    );
}

function MenuButton({ label, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: 'none',
                color: isSelected ? '#ccc' : '#555',
                fontSize: '16px',
                padding: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                width: '100%',
                position: 'relative',
            }}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
        >
            <span style={{ fontSize: '8px', opacity: isSelected ? 1 : 0.3 }}>◈</span>
            {label}
            <span style={{ fontSize: '8px', opacity: isSelected ? 1 : 0.3 }}>◈</span>
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #222, transparent)'
            }} />
        </button>
    );
}
