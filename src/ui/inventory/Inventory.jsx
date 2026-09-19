import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hadesFullbody from '../../assets/images/Hades_Fullbody.png';
import './Inventory.css';

const GRID_COLS = 4;
const GRID_ROWS = 5;
const TOTAL_SLOTS = GRID_COLS * GRID_ROWS;

const ARMOR_SLOTS = [
    {
        id: 'cabeca',
        label: 'Cabeça',
        top: '8%',
        left: '44%'
    },
    {
        id: 'peito',
        label: 'Peito',
        top: '28%',
        left: '38%'
    },
    {
        id: 'luvas',
        label: 'Luvas',
        top: '42%',
        left: '14%'
    },
    {
        id: 'pernas',
        label: 'Pernas',
        top: '62%',
        left: '38%'
    }
];

// ============================================================
// AÇÕES
// ============================================================

function getActions(item, equipado = false) {
    if (!item) return [];

    const actions = [];

    if (equipado) {
        actions.push({
            id: 'desequipar',
            label: 'DESEQUIPAR'
        });

        return actions;
    }

    if (
        item.tipo === 'consumivel' ||
        item.tipo === 'material'
    ) {
        actions.push({
            id: 'usar',
            label: 'CONSUMIR'
        });
    }

    if (item.tipo === 'equipamento') {
        actions.push({
            id: 'equipar',
            label: 'EQUIPAR'
        });
    }

    actions.push({
        id: 'mover',
        label: 'MOVER'
    });

    actions.push({
        id: 'rapido',
        label: 'SAQUE RÁPIDO'
    });

    actions.push({
        id: 'jogar',
        label: 'JOGAR FORA'
    });

    return actions;
}

// ============================================================
// GRADE
// ============================================================

function buildGrid(inventario) {
    const grid = Array(TOTAL_SLOTS).fill(null);

    const itensSemPosicao = [];

    (inventario ?? []).forEach(item => {
        if (
            item.posicaoInventario !== null &&
            item.posicaoInventario !== undefined
        ) {
            const origin = item.posicaoInventario;

            const w = item.size?.[0] ?? 1;
            const h = item.size?.[1] ?? 1;

            const x = origin % GRID_COLS;
            const y = Math.floor(
                origin / GRID_COLS
            );

            if (
                x + w <= GRID_COLS &&
                y + h <= GRID_ROWS
            ) {
                for (let row = 0; row < h; row++) {
                    for (let col = 0; col < w; col++) {
                        const index =
                            origin +
                            row * GRID_COLS +
                            col;

                        if (
                            index >= 0 &&
                            index < TOTAL_SLOTS &&
                            !grid[index]
                        ) {
                            grid[index] = {
                                _ref: item,
                                _gridIndex: origin
                            };
                        }
                    }
                }

                return;
            }
        }

        itensSemPosicao.push(item);
    });

    // Compatibilidade com itens antigos
    // que ainda não possuem posição.
    for (const item of itensSemPosicao) {
        const w = item.size?.[0] ?? 1;
        const h = item.size?.[1] ?? 1;

        let colocado = false;

        for (
            let origin = 0;
            origin < TOTAL_SLOTS;
            origin++
        ) {
            const x = origin % GRID_COLS;
            const y = Math.floor(
                origin / GRID_COLS
            );

            if (
                x + w > GRID_COLS ||
                y + h > GRID_ROWS
            ) {
                continue;
            }

            let livre = true;

            for (let row = 0; row < h; row++) {
                for (let col = 0; col < w; col++) {
                    const index =
                        origin +
                        row * GRID_COLS +
                        col;

                    if (grid[index]) {
                        livre = false;
                    }
                }
            }

            if (!livre) continue;

            item.posicaoInventario = origin;

            for (let row = 0; row < h; row++) {
                for (let col = 0; col < w; col++) {
                    const index =
                        origin +
                        row * GRID_COLS +
                        col;

                    grid[index] = {
                        _ref: item,
                        _gridIndex: origin
                    };
                }
            }

            colocado = true;
            break;
        }

        if (!colocado) {
            item.posicaoInventario = null;
        }
    }

    return grid;
}

// ============================================================
// MENU
// ============================================================

function ContextMenu({
    item,
    position,
    selectedAction,
    onSelect,
    equipado = false
}) {
    const actions = getActions(
        item,
        equipado
    );

    return (
        <motion.div
            className="inv-context-menu"
            style={{
                top: position.y,
                left: position.x
            }}
            initial={{
                opacity: 0,
                scale: 0.95,
                y: -4
            }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0
            }}
            exit={{
                opacity: 0,
                scale: 0.95,
                y: -4
            }}
            transition={{
                duration: 0.12
            }}
        >
            <div className="inv-context-title">
                {item.nome?.toUpperCase()}
            </div>

            {item.descricao && (
                <div className="inv-context-desc">
                    {item.descricao}
                </div>
            )}

            <div className="inv-context-divider" />

            {actions.map((action, i) => (
                <button
                    key={action.id}
                    className={`inv-context-action ${
                        selectedAction === i
                            ? 'selected'
                            : ''
                    }`}
                    onClick={() =>
                        onSelect(action)
                    }
                >
                    {selectedAction === i && (
                        <span className="inv-context-cursor">
                            ▶
                        </span>
                    )}

                    {action.label}
                </button>
            ))}
        </motion.div>
    );
}

// ============================================================
// INVENTÁRIO
// ============================================================

export function Inventory({
    jogador,
    quickSlots,
    setQuickSlots,
    onClose
}) {
    const [focusZone, setFocusZone] =
        useState('grid');

    const [cursorIdx, setCursorIdx] =
        useState(0);

    const [contextItem, setContextItem] =
        useState(null);

    const [contextPos, setContextPos] =
        useState({
            x: 0,
            y: 0
        });

    const [contextAction, setContextAction] =
        useState(0);

    const [movingItem, setMovingItem] =
        useState(null);

    const grid = buildGrid(
        jogador?.inventario
    );

    // ========================================================
    // EQUIPAMENTOS
    // ========================================================

    const armorEquipped =
        jogador?.armaduraEquipada ?? {};

    // ========================================================
    // ABRIR MENU
    // ========================================================

    const openContext = useCallback(
        (
            item,
            slotEl,
            equipado = false
        ) => {
            if (!item) return;

            const ref =
                item._ref ?? item;

            const rect =
                slotEl?.getBoundingClientRect?.() ??
                {
                    right: 400,
                    top: 300
                };

            setContextItem({
                item: ref,
                equipado
            });

            setContextPos({
                x: rect.right + 8,
                y: rect.top
            });

            setContextAction(0);
        },
        []
    );

    const closeContext =
        useCallback(() => {
            setContextItem(null);
            setContextAction(0);
        }, []);

    // ========================================================
    // EXECUTAR AÇÃO
    // ========================================================

    const executeAction =
        useCallback(
            async action => {
                if (
                    !action ||
                    !contextItem ||
                    !jogador
                ) {
                    return;
                }

                const item =
                    contextItem.item;

                const equipado =
                    contextItem.equipado;

                // --------------------------------------------
                // JOGAR FORA
                // --------------------------------------------

                if (
                    action.id === 'jogar'
                ) {
                    jogador.removerItem(item);
                }

                // --------------------------------------------
                // EQUIPAR
                // --------------------------------------------

                else if (
                    action.id === 'equipar'
                ) {
                    jogador.equiparEquipamento?.(
                        item
                    );
                }

                // --------------------------------------------
                // DESEQUIPAR
                // --------------------------------------------

                else if (
                    action.id === 'desequipar'
                ) {
                    if (
                        item ===
                        jogador.armaEquipada
                    ) {
                        jogador.desequiparEquipamento(
                            'arma'
                        );
                    } else {
                        const slot =
                            item.slot;

                        jogador.desequiparEquipamento(
                            slot
                        );
                    }
                }

                // --------------------------------------------
                // USAR
                // --------------------------------------------

                else if (
                    action.id === 'usar'
                ) {
                    await item.usar(
                        jogador
                    );
                }

                // --------------------------------------------
                // SAQUE RÁPIDO
                // --------------------------------------------

                else if (
                    action.id === 'rapido'
                ) {
                    const emptyIdx =
                        quickSlots.findIndex(
                            slot =>
                                slot === null
                        );

                    if (emptyIdx !== -1) {
                        const next =
                            [...quickSlots];

                        next[emptyIdx] =
                            item;

                        setQuickSlots(
                            next
                        );
                    }
                }

                // --------------------------------------------
                // MOVER
                // --------------------------------------------

                else if (
                    action.id === 'mover'
                ) {
                    setMovingItem(item);
                    closeContext();
                    return;
                }

                closeContext();
            },
            [
                contextItem,
                jogador,
                quickSlots,
                setQuickSlots,
                closeContext
            ]
        );

    // ========================================================
    // TECLADO
    // ========================================================

    useEffect(() => {
        const handle = e => {

            // ------------------------------------------------
            // MENU DE CONTEXTO
            // ------------------------------------------------

            if (contextItem) {
                const actions =
                    getActions(
                        contextItem.item,
                        contextItem.equipado
                    );

                if (
                    e.key === 'ArrowUp'
                ) {
                    e.preventDefault();

                    setContextAction(
                        i =>
                            (
                                i -
                                1 +
                                actions.length
                            ) %
                            actions.length
                    );
                }

                if (
                    e.key === 'ArrowDown'
                ) {
                    e.preventDefault();

                    setContextAction(
                        i =>
                            (
                                i +
                                1
                            ) %
                            actions.length
                    );
                }

                if (
                    e.key === 'Enter'
                ) {
                    e.preventDefault();

                    executeAction(
                        actions[
                            contextAction
                        ]
                    );
                }

                if (
                    e.key === 'Escape'
                ) {
                    e.preventDefault();

                    closeContext();
                }

                return;
            }

            // ------------------------------------------------
            // MOVER ITEM
            // ------------------------------------------------

            if (movingItem) {

                if (
                    e.key === 'Escape'
                ) {
                    e.preventDefault();

                    setMovingItem(null);

                    return;
                }

                if (
                    e.key === 'Enter'
                ) {
                    e.preventDefault();

                    const sucesso =
                        jogador?.moverItem(
                            movingItem,
                            cursorIdx
                        );

                    if (sucesso) {
                        setMovingItem(null);
                    }

                    return;
                }
            }

            // ------------------------------------------------
            // GRADE
            // ------------------------------------------------

            if (
                focusZone === 'grid'
            ) {
                if (
                    e.key ===
                    'ArrowRight'
                ) {
                    e.preventDefault();

                    setCursorIdx(
                        i =>
                            Math.min(
                                i + 1,
                                TOTAL_SLOTS - 1
                            )
                    );
                }

                if (
                    e.key ===
                    'ArrowLeft'
                ) {
                    e.preventDefault();

                    setCursorIdx(
                        i =>
                            Math.max(
                                i - 1,
                                0
                            )
                    );
                }

                if (
                    e.key ===
                    'ArrowDown'
                ) {
                    e.preventDefault();

                    setCursorIdx(
                        i =>
                            Math.min(
                                i + GRID_COLS,
                                TOTAL_SLOTS - 1
                            )
                    );
                }

                if (
                    e.key ===
                    'ArrowUp'
                ) {
                    e.preventDefault();

                    setCursorIdx(
                        i =>
                            Math.max(
                                i - GRID_COLS,
                                0
                            )
                    );
                }

                if (
                    e.key === 'Tab'
                ) {
                    e.preventDefault();

                    setFocusZone(
                        'quick'
                    );

                    setCursorIdx(0);
                }

                if (
                    e.key === 'Enter'
                ) {
                    e.preventDefault();

                    const item =
                        grid[cursorIdx];

                    const el =
                        document.querySelector(
                            `[data-slot="${cursorIdx}"]`
                        );

                    if (
                        item?._gridIndex ===
                        cursorIdx
                    ) {
                        openContext(
                            item,
                            el
                        );
                    }
                }
            }

            // ------------------------------------------------
            // SAQUE RÁPIDO
            // ------------------------------------------------

            if (
                focusZone === 'quick'
            ) {
                if (
                    e.key === 'ArrowUp'
                ) {
                    e.preventDefault();

                    setCursorIdx(
                        i =>
                            Math.max(
                                i - 1,
                                0
                            )
                    );
                }

                if (
                    e.key === 'ArrowDown'
                ) {
                    e.preventDefault();

                    setCursorIdx(
                        i =>
                            Math.min(
                                i + 1,
                                3
                            )
                    );
                }

                if (
                    e.key === 'Tab'
                ) {
                    e.preventDefault();

                    setFocusZone(
                        'grid'
                    );

                    setCursorIdx(0);
                }

                if (
                    e.key === 'Enter'
                ) {
                    e.preventDefault();

                    const item =
                        quickSlots[
                            cursorIdx
                        ];

                    const el =
                        document.querySelector(
                            `[data-quick="${cursorIdx}"]`
                        );

                    if (item) {
                        openContext(
                            item,
                            el
                        );
                    }
                }
            }

            if (
                e.key === 'Escape'
            ) {
                e.preventDefault();

                onClose();
            }
        };

        window.addEventListener(
            'keydown',
            handle
        );

        return () =>
            window.removeEventListener(
                'keydown',
                handle
            );
    }, [
        contextItem,
        contextAction,
        focusZone,
        cursorIdx,
        grid,
        quickSlots,
        executeAction,
        openContext,
        closeContext,
        onClose,
        movingItem,
        jogador
    ]);

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div
            className="inv-overlay"
            onClick={onClose}
        >
            <motion.div
                className="inv-container"
                initial={{
                    opacity: 0,
                    scale: 0.96
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                exit={{
                    opacity: 0,
                    scale: 0.96
                }}
                transition={{
                    duration: 0.2
                }}
                onClick={e =>
                    e.stopPropagation()
                }
            >

                <div className="inv-title">
                    <span className="inv-title-rune">
                        ◆
                    </span>

                    INVENTÁRIO

                    <span className="inv-title-rune">
                        ◆
                    </span>
                </div>

                <div className="inv-layout">

                    {/* ========================================
                        SAQUE RÁPIDO
                    ======================================== */}

                    <div className="inv-quickslots">

                        <span className="inv-section-label">
                            SAQUE RÁPIDO
                        </span>

                        {quickSlots.map(
                            (item, i) => {
                                const focused =
                                    focusZone ===
                                        'quick' &&
                                    cursorIdx === i;

                                return (
                                    <div
                                        key={i}
                                        data-quick={i}
                                        className={`inv-diamond-slot ${
                                            focused
                                                ? 'focused'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setFocusZone(
                                                'quick'
                                            );

                                            setCursorIdx(
                                                i
                                            );
                                        }}
                                    >
                                        <div
                                            className={`inv-diamond-frame ${
                                                item
                                                    ? 'filled'
                                                    : ''
                                            } ${
                                                focused
                                                    ? 'cursor'
                                                    : ''
                                            }`}
                                        >
                                            {item?.iconUrl ||
                                            item?.icon ? (
                                                <img
                                                    src={
                                                        item.iconUrl ??
                                                        item.icon
                                                    }
                                                    alt={
                                                        item.nome
                                                    }
                                                />
                                            ) : (
                                                <span className="inv-slot-empty">
                                                    {i + 1}
                                                </span>
                                            )}
                                        </div>

                                        <span className="inv-slot-label">
                                            {item
                                                ? item.nome
                                                : `— ${
                                                      i + 1
                                                  } —`}
                                        </span>
                                    </div>
                                );
                            }
                        )}

                        <span className="inv-hint">
                            TAB para alternar
                        </span>
                    </div>

                    {/* ========================================
                        GRADE
                    ======================================== */}

                    <div className="inv-center">

                        <span className="inv-section-label">
                            BOLSA —{' '}
                            {
                                (
                                    jogador?.inventario ??
                                    []
                                ).length
                            }
                            /{TOTAL_SLOTS}
                        </span>

                        <div className="inv-grid">

                            {grid.map(
                                (item, i) => {

                                    const isOrigin =
                                        item &&
                                        item._gridIndex ===
                                            i;

                                    const isCovered =
                                        item &&
                                        item._gridIndex !==
                                            i;

                                    const focused =
                                        focusZone ===
                                            'grid' &&
                                        cursorIdx === i;

                                    const ref =
                                        item?._ref;

                                    const isMovingTarget =
                                        movingItem &&
                                        focused;

                                    return (
                                        <div
                                            key={i}
                                            data-slot={i}
                                            className={`inv-grid-slot ${
                                                isCovered
                                                    ? 'covered'
                                                    : ''
                                            } ${
                                                focused
                                                    ? 'cursor'
                                                    : ''
                                            } ${
                                                isMovingTarget
                                                    ? 'moving-target'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                setFocusZone(
                                                    'grid'
                                                );

                                                setCursorIdx(
                                                    i
                                                );
                                            }}
                                        >

                                            {isOrigin && (
                                                <div
                                                    className="inv-grid-item"
                                                    style={{
                                                        width:
                                                            `calc(${
                                                                ref?.size?.[0] ??
                                                                1
                                                            } * 100% + ${
                                                                (
                                                                    ref?.size?.[0] ??
                                                                    1
                                                                ) - 1
                                                            } * 4px)`,

                                                        height:
                                                            `calc(${
                                                                ref?.size?.[1] ??
                                                                1
                                                            } * 100% + ${
                                                                (
                                                                    ref?.size?.[1] ??
                                                                    1
                                                                ) - 1
                                                            } * 4px)`
                                                    }}
                                                >

                                                    {ref?.iconUrl ||
                                                    ref?.icon ? (
                                                        <img
                                                            src={
                                                                ref.iconUrl ??
                                                                ref.icon
                                                            }
                                                            alt={
                                                                ref.nome
                                                            }
                                                        />
                                                    ) : (
                                                        <span>
                                                            {ref?.nome
                                                                ?.slice(
                                                                    0,
                                                                    4
                                                                )
                                                                .toUpperCase()}
                                                        </span>
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>

                        {movingItem && (
                            <div className="inv-hint">
                                MOVER:{' '}
                                {movingItem.nome}
                                {' — '}
                                escolha a posição e pressione ENTER
                            </div>
                        )}

                    </div>

                    {/* ========================================
                        PAPER DOLL
                    ======================================== */}

                    <div className="inv-paper-doll">

                        <span className="inv-section-label">
                            EQUIPAMENTOS
                        </span>

                        <div className="inv-doll-wrap">

                            <img
                                src={hadesFullbody}
                                alt="Hades"
                                className="inv-doll-img"
                                draggable="false"
                            />

                            {ARMOR_SLOTS.map(
                                slot => {

                                    const item =
                                        armorEquipped[
                                            slot.id
                                        ];

                                    const focused =
                                        item ===
                                        contextItem?.item;

                                    return (
                                        <div
                                            key={
                                                slot.id
                                            }
                                            className="inv-armor-slot"
                                            style={{
                                                top:
                                                    slot.top,
                                                left:
                                                    slot.left
                                            }}
                                            title={
                                                slot.label
                                            }
                                            onClick={e => {
                                                if (!item)
                                                    return;

                                                openContext(
                                                    item,
                                                    e.currentTarget,
                                                    true
                                                );
                                            }}
                                        >

                                            <div
                                                className={`inv-diamond-frame ${
                                                    item
                                                        ? 'filled'
                                                        : ''
                                                } ${
                                                    focused
                                                        ? 'cursor'
                                                        : ''
                                                }`}
                                            >

                                                {item?.iconUrl ||
                                                item?.icon ? (
                                                    <img
                                                        src={
                                                            item.iconUrl ??
                                                            item.icon
                                                        }
                                                        alt={
                                                            slot.label
                                                        }
                                                    />
                                                ) : (
                                                    <span
                                                        className="inv-slot-empty"
                                                        style={{
                                                            fontSize: 6
                                                        }}
                                                    >
                                                        {slot.label
                                                            .slice(
                                                                0,
                                                                3
                                                            )
                                                            .toUpperCase()}
                                                    </span>
                                                )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                        {/* ====================================
                            ARMA
                        ==================================== */}

                        {jogador?.armaEquipada && (
                            <div
                                className="inv-equipped-weapon"
                                onClick={e =>
                                    openContext(
                                        jogador.armaEquipada,
                                        e.currentTarget,
                                        true
                                    )
                                }
                            >

                                <span
                                    className="inv-section-label"
                                    style={{
                                        marginBottom: 4
                                    }}
                                >
                                    ARMA
                                </span>

                                <div
                                    className="inv-diamond-frame filled"
                                    style={{
                                        width: 40,
                                        height: 40
                                    }}
                                >

                                    {jogador.armaEquipada.iconUrl ||
                                    jogador.armaEquipada.icon ? (
                                        <img
                                            src={
                                                jogador
                                                    .armaEquipada
                                                    .iconUrl ??
                                                jogador
                                                    .armaEquipada
                                                    .icon
                                            }
                                            alt={
                                                jogador
                                                    .armaEquipada
                                                    .nome
                                            }
                                        />
                                    ) : (
                                        <span className="inv-slot-empty">
                                            ⚔
                                        </span>
                                    )}

                                </div>

                                <span className="inv-slot-label">
                                    {
                                        jogador
                                            .armaEquipada
                                            .nome
                                    }
                                </span>

                            </div>
                        )}

                    </div>

                </div>

                {/* ============================================
                    MENU
                ============================================ */}

                <AnimatePresence>

                    {contextItem && (
                        <ContextMenu
                            item={
                                contextItem.item
                            }
                            position={
                                contextPos
                            }
                            selectedAction={
                                contextAction
                            }
                            onSelect={
                                executeAction
                            }
                            equipado={
                                contextItem.equipado
                            }
                        />
                    )}

                </AnimatePresence>

                <button
                    className="inv-close"
                    onClick={onClose}
                >
                    ✕ FECHAR
                </button>

            </motion.div>
        </div>
    );
}