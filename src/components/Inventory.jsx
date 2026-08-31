import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hadesFullbody from '../assets/images/Hades_Fullbody.png';
import './Inventory.css';

const GRID_COLS = 4;
const GRID_ROWS = 5;
const TOTAL_SLOTS = GRID_COLS * GRID_ROWS;

const ARMOR_SLOTS = [
    { id: 'cabeca', label: 'Cabeça', top: '8%',  left: '44%' },
    { id: 'peito',  label: 'Peito',  top: '28%', left: '38%' },
    { id: 'luvas',  label: 'Luvas',  top: '42%', left: '14%' },
    { id: 'pernas', label: 'Pernas', top: '62%', left: '38%' },
];

function getActions(item) {
    if (!item) return [];
    const actions = [];
    if (item.tipo === 'consumivel' || item.tipo === 'material') actions.push({ id: 'usar',    label: 'CONSUMIR'     });
    if (item.tipo === 'equipamento' || item.slot === 'arma')    actions.push({ id: 'equipar', label: 'EQUIPAR'      });
    actions.push({ id: 'rapido', label: 'SAQUE RÁPIDO' });
    actions.push({ id: 'jogar',  label: 'JOGAR FORA'   });
    return actions;
}

function buildGrid(inventario) {
    const grid = Array(TOTAL_SLOTS).fill(null);
    let cursor = 0;
    (inventario ?? []).forEach(item => {
        const w = item.size?.[0] ?? 1;
        const h = item.size?.[1] ?? 1;
        while (cursor < TOTAL_SLOTS) {
            const col = cursor % GRID_COLS;
            if (col + w <= GRID_COLS) {
                for (let r = 0; r < h; r++)
                    for (let c = 0; c < w; c++) {
                        const idx = cursor + r * GRID_COLS + c;
                        if (idx < TOTAL_SLOTS) grid[idx] = { _ref: item, _gridIndex: cursor };
                    }
                cursor += w;
                break;
            }
            cursor++;
        }
    });
    return grid;
}

function ContextMenu({ item, position, selectedAction, onSelect }) {
    const actions = getActions(item);
    return (
        <motion.div
            className="inv-context-menu"
            style={{ top: position.y, left: position.x }}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
        >
            <div className="inv-context-title">{item.nome?.toUpperCase()}</div>
            {item.descricao && <div className="inv-context-desc">{item.descricao}</div>}
            <div className="inv-context-divider" />
            {actions.map((action, i) => (
                <button
                    key={action.id}
                    className={`inv-context-action ${selectedAction === i ? 'selected' : ''}`}
                    onClick={() => onSelect(action)}
                >
                    {selectedAction === i && <span className="inv-context-cursor">▶</span>}
                    {action.label}
                </button>
            ))}
        </motion.div>
    );
}

export function Inventory({ jogador, quickSlots, setQuickSlots, onClose }) {
    const [focusZone, setFocusZone]   = useState('grid');
    const [cursorIdx, setCursorIdx]   = useState(0);
    const [contextItem, setContextItem]     = useState(null);
    const [contextPos, setContextPos]       = useState({ x: 0, y: 0 });
    const [contextAction, setContextAction] = useState(0);

    const grid = buildGrid(jogador?.inventario);

    const armorEquipped = {};
    ARMOR_SLOTS.forEach(s => {
        const found = (jogador?.inventario ?? []).find(i => i.slot === s.id);
        if (found) armorEquipped[s.id] = found;
    });

    const openContext = useCallback((item, slotEl) => {
        if (!item) return;
        const ref = item._ref ?? item;
        const rect = slotEl?.getBoundingClientRect?.() ?? { right: 400, top: 300 };
        setContextItem(ref);
        setContextPos({ x: rect.right + 8, y: rect.top });
        setContextAction(0);
    }, []);

    const closeContext = useCallback(() => {
        setContextItem(null);
        setContextAction(0);
    }, []);

    const executeAction = useCallback(async (action) => {
        if (!action || !contextItem || !jogador) return;
        if (action.id === 'jogar') {
            jogador.removerItem(contextItem);
        } else if (action.id === 'equipar') {
            jogador.equiparArma?.(contextItem);
        } else if (action.id === 'usar') {
            await contextItem.usar(jogador);
        } else if (action.id === 'rapido') {
            const emptyIdx = quickSlots.findIndex(s => s === null);
            if (emptyIdx !== -1) {
                const next = [...quickSlots];
                next[emptyIdx] = contextItem;
                setQuickSlots(next);
            }
        }
        closeContext();
    }, [contextItem, jogador, quickSlots, closeContext]);

    useEffect(() => {
        const handle = (e) => {
            if (contextItem) {
                const actions = getActions(contextItem);
                if (e.key === 'ArrowUp')   { e.preventDefault(); setContextAction(i => (i - 1 + actions.length) % actions.length); }
                if (e.key === 'ArrowDown') { e.preventDefault(); setContextAction(i => (i + 1) % actions.length); }
                if (e.key === 'Enter')     { e.preventDefault(); executeAction(actions[contextAction]); }
                if (e.key === 'Escape')    { e.preventDefault(); closeContext(); }
                return;
            }

            if (focusZone === 'grid') {
                if (e.key === 'ArrowRight') { e.preventDefault(); setCursorIdx(i => Math.min(i + 1, TOTAL_SLOTS - 1)); }
                if (e.key === 'ArrowLeft')  { e.preventDefault(); setCursorIdx(i => Math.max(i - 1, 0)); }
                if (e.key === 'ArrowDown')  { e.preventDefault(); setCursorIdx(i => Math.min(i + GRID_COLS, TOTAL_SLOTS - 1)); }
                if (e.key === 'ArrowUp')    { e.preventDefault(); setCursorIdx(i => Math.max(i - GRID_COLS, 0)); }
                if (e.key === 'Tab')        { e.preventDefault(); setFocusZone('quick'); setCursorIdx(0); }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const item = grid[cursorIdx];
                    const el = document.querySelector(`[data-slot="${cursorIdx}"]`);
                    if (item?._gridIndex === cursorIdx) openContext(item, el);
                }
            }

            if (focusZone === 'quick') {
                if (e.key === 'ArrowUp')   { e.preventDefault(); setCursorIdx(i => Math.max(i - 1, 0)); }
                if (e.key === 'ArrowDown') { e.preventDefault(); setCursorIdx(i => Math.min(i + 1, 3)); }
                if (e.key === 'Tab')       { e.preventDefault(); setFocusZone('grid'); setCursorIdx(0); }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const item = quickSlots[cursorIdx];
                    const el = document.querySelector(`[data-quick="${cursorIdx}"]`);
                    if (item) openContext(item, el);
                }
            }

            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
        };

        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [contextItem, contextAction, focusZone, cursorIdx, grid, quickSlots, executeAction, openContext, closeContext, onClose]);

    return (
        <div className="inv-overlay" onClick={onClose}>
            <motion.div
                className="inv-container"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="inv-title">
                    <span className="inv-title-rune">◆</span>
                    INVENTÁRIO
                    <span className="inv-title-rune">◆</span>
                </div>

                <div className="inv-layout">

                    {/* ── SAQUE RÁPIDO ── */}
                    <div className="inv-quickslots">
                        <span className="inv-section-label">SAQUE RÁPIDO</span>
                        {quickSlots.map((item, i) => {
                            const focused = focusZone === 'quick' && cursorIdx === i;
                            return (
                                <div
                                    key={i}
                                    data-quick={i}
                                    className={`inv-diamond-slot ${focused ? 'focused' : ''}`}
                                    onClick={() => { setFocusZone('quick'); setCursorIdx(i); }}
                                >
                                    <div className={`inv-diamond-frame ${item ? 'filled' : ''} ${focused ? 'cursor' : ''}`}>
                                        {item?.icon
                                            ? <img src={item.icon} alt={item.nome} />
                                            : <span className="inv-slot-empty">{i + 1}</span>
                                        }
                                    </div>
                                    <span className="inv-slot-label">{item ? item.nome : `— ${i + 1} —`}</span>
                                </div>
                            );
                        })}
                        <span className="inv-hint">TAB para alternar</span>
                    </div>

                    {/* ── GRADE ── */}
                    <div className="inv-center">
                        <span className="inv-section-label">BOLSA — {(jogador?.inventario ?? []).length}/{TOTAL_SLOTS}</span>
                        <div className="inv-grid">
                            {grid.map((item, i) => {
                                const isOrigin  = item && item._gridIndex === i;
                                const isCovered = item && item._gridIndex !== i;
                                const focused   = focusZone === 'grid' && cursorIdx === i;
                                const ref       = item?._ref;
                                return (
                                    <div
                                        key={i}
                                        data-slot={i}
                                        className={`inv-grid-slot ${isCovered ? 'covered' : ''} ${focused ? 'cursor' : ''}`}
                                        onClick={() => { setFocusZone('grid'); setCursorIdx(i); }}
                                    >
                                        {isOrigin && (
                                            <div
                                                className="inv-grid-item"
                                                style={{
                                                    width:  `calc(${ref?.size?.[0] ?? 1} * 100% + ${(ref?.size?.[0] ?? 1) - 1} * 4px)`,
                                                    height: `calc(${ref?.size?.[1] ?? 1} * 100% + ${(ref?.size?.[1] ?? 1) - 1} * 4px)`,
                                                }}
                                            >
                                                {ref?.icon
                                                    ? <img src={ref.icon} alt={ref.nome} />
                                                    : <span>{ref?.nome?.slice(0, 4).toUpperCase()}</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── PAPER DOLL ── */}
                    <div className="inv-paper-doll">
                        <span className="inv-section-label">EQUIPAMENTOS</span>
                        <div className="inv-doll-wrap">
                            <img src={hadesFullbody} alt="Hades" className="inv-doll-img" draggable="false" />
                            {ARMOR_SLOTS.map(slot => (
                                <div
                                    key={slot.id}
                                    className="inv-armor-slot"
                                    style={{ top: slot.top, left: slot.left }}
                                    title={slot.label}
                                >
                                    <div className={`inv-diamond-frame ${armorEquipped[slot.id] ? 'filled' : ''}`}>
                                        {armorEquipped[slot.id]?.icon
                                            ? <img src={armorEquipped[slot.id].icon} alt={slot.label} />
                                            : <span className="inv-slot-empty" style={{ fontSize: 6 }}>{slot.label.slice(0, 3).toUpperCase()}</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                        {jogador?.armaEquipada && (
                            <div className="inv-equipped-weapon">
                                <span className="inv-section-label" style={{ marginBottom: 4 }}>ARMA</span>
                                <div className="inv-diamond-frame filled" style={{ width: 40, height: 40 }}>
                                    <span className="inv-slot-empty">⚔</span>
                                </div>
                                <span className="inv-slot-label">{jogador.armaEquipada.nome}</span>
                            </div>
                        )}
                    </div>

                </div>

                <AnimatePresence>
                    {contextItem && (
                        <ContextMenu
                            item={contextItem}
                            position={contextPos}
                            selectedAction={contextAction}
                            onSelect={executeAction}
                        />
                    )}
                </AnimatePresence>

                <button className="inv-close" onClick={onClose}>✕ FECHAR</button>
            </motion.div>
        </div>
    );
}
