import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './KeybindGuide.css';

const BINDS = [
    { key: 'ESC',   desc: 'Menu' },
    { key: 'I',     desc: 'Inventário' },
    { key: 'TAB',   desc: 'Diário' },
    { key: '1 – 4', desc: 'Saque rápido' },
    { key: "'",     desc: 'Console' },
    { key: 'F4',    desc: 'Coordenadas' },
    { key: 'WASD',  desc: 'Mover' },
];

export function KeybindGuide() {
    const [open, setOpen] = useState(false);

    return (
        <div className="kbg-wrapper">
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="kbg-container"
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                    >
                        <span className="kbg-title">◆ CONTROLES ◆</span>
                        <div className="kbg-divider" />
                        {BINDS.map(({ key, desc }) => (
                            <div key={key} className="kbg-row">
                                <span className="kbg-key">{key}</span>
                                <span className="kbg-sep">—</span>
                                <span className="kbg-desc">{desc}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button className="kbg-toggle" onClick={() => setOpen(o => !o)} title="Controles">
                ?
                <span className="kbg-toggle-hint">dicas</span>
            </button>
        </div>
    );
}
