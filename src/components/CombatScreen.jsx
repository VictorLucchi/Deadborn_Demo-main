import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, criarPersonagem } from '../engine/GameEngine.js';
import './CombatScreen.css';

function StatBar({ label, value, max, color }) {
    const pct = Math.max(0, Math.min(value / max, 1));
    return (
        <div className="stat-bar">
            <span className="stat-label">{label}</span>
            <div className="stat-bg">
                <div className="stat-fill" style={{ width: `${pct * 100}%`, background: color }} />
            </div>
            <span className="stat-value">{value}/{max}</span>
        </div>
    );
}

function CharCard({ char, isActive, isEnemy }) {
    const [shake, setShake] = useState(false);
    const prevVida = useRef(char?.vida);

    useEffect(() => {
        if (char && prevVida.current !== undefined && char.vida < prevVida.current) {
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
        prevVida.current = char?.vida;
    }, [char?.vida]);

    if (!char) return null;
    return (
        <div className={`char-card ${isEnemy ? 'enemy' : ''} ${isActive ? 'active' : ''} ${shake ? 'shake' : ''}`}>
            <div className="char-header">
                <span className="char-name">{isEnemy ? '☠ ' : ''}{char.nome}</span>
                {!isEnemy && <span className="char-level">Nv.{char.nivel}</span>}
                {char.status?.envenenado && <span className="status-badge">☣</span>}
                {char.status?.atordoado && <span className="status-badge">💫</span>}
                {char.status?.marcado && <span className="status-badge gold">◈×{char.quantidadeMarcas}</span>}
            </div>
            <StatBar label="HP" value={char.vida} max={char.vidaMax} color="#DC143C" />
            {char.manaMax > 0 && <StatBar label="MP" value={char.mana} max={char.manaMax} color="#4A9EBF" />}
        </div>
    );
}

function BattleLog({ logs }) {
    const scrollRef = useRef(null);
    useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [logs]);

    return (
        <div className="battle-log" ref={scrollRef}>
            {logs.map((msg, i) => {
                const isCrit = msg.includes('CRÍTICO');
                const isHeal = msg.includes('recuperou');
                const isStatus = msg.includes('ENVENENADO') || msg.includes('ATORDOADO') || msg.includes('SANGRANDO');
                const isVictory = msg.includes('derrotado') || msg.includes('aniquilado') || msg.includes('fugiu');
                const cls = isCrit ? 'crit' : isVictory ? 'victory' : isHeal ? 'heal' : isStatus ? 'status' : '';
                return (
                    <p key={i} className={`log-line ${cls} ${i === logs.length - 1 ? 'last' : ''}`}>
                        {i === logs.length - 1 ? '▶ ' : '  '}{msg}
                    </p>
                );
            })}
        </div>
    );
}

export function CombatScreen({ jogador, enemyType = 'hunter', onClose }) {
    const engineRef = useRef(null);
    const [estado, setEstado] = useState(null);
    const [logs, setLogs] = useState([]);
    const [modal, setModal] = useState(null); // 'habilidades' | 'itens' | 'armas'
    const [finalizado, setFinalizado] = useState(false);

    const addLogs = useCallback((msgs) => setLogs(prev => [...prev, ...msgs]), []);

    useEffect(() => {
        const engine = new GameEngine((msg) => addLogs([msg]));
        engineRef.current = engine;
        const novoEstado = engine.iniciarPvE(jogador, enemyType);
        setEstado({ ...novoEstado });
    }, []);

    function executarAcao(tipo, indice = 0) {
        const engine = engineRef.current;
        if (!engine || !engine.emAndamento) return;
        const resultado = engine.executarAcaoJogador(tipo, indice);
        if (resultado?.then) {
            resultado.then(r => {
                addLogs(r.msgs);
                setEstado({ ...engine.getEstado() });
                if (!engine.emAndamento) setFinalizado(true);
            });
        } else {
            addLogs(resultado.msgs);
            setEstado({ ...engine.getEstado() });
            if (!engine.emAndamento) setFinalizado(true);
        }
        setModal(null);
    }

    if (!estado) return null;

    const engine = engineRef.current;
    const jogadorAtual = estado.jogadorAtual;
    const inimigo = estado.inimigo;
    const consumiveis = engine ? engine.getConsumiveis(jogadorAtual) : [];
    const armas = engine ? engine.getArmas(jogadorAtual) : [];

    return (
        <div className="combat-overlay">
            <div className="combat-screen">
                <div className="turn-badge">
                    TURNO {estado.turno} — {jogadorAtual?.nome?.toUpperCase()}
                </div>

                <div className="battlefield">
                    <div className="chars-container">
                        <CharCard char={jogador} isActive={true} isEnemy={false} />
                        <CharCard char={inimigo} isActive={false} isEnemy={true} />
                    </div>
                </div>

                <BattleLog logs={logs} />

                {!finalizado ? (
                    <div className="actions-grid">
                        <button className="action-btn crimson" onClick={() => setModal('habilidades')}>⚔ LUTAR</button>
                        <button className="action-btn cerulean" onClick={() => setModal('itens')}>🎒 ITEM</button>
                        <button className="action-btn gold" onClick={() => setModal('armas')}>🗡 ARMA</button>
                        <button className="action-btn dim" onClick={() => executarAcao('fugir')}>🏃 FUGIR</button>
                    </div>
                ) : (
                    <button className="btn-fim" onClick={onClose}>▶ CONTINUAR</button>
                )}

                {modal === 'habilidades' && (
                    <div className="modal-overlay" onClick={() => setModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <p className="modal-title">— HABILIDADES —</p>
                            {jogadorAtual?.habilidades?.map((h, i) => (
                                <button
                                    key={i}
                                    className={`modal-item ${!h.podeUsar(jogadorAtual) ? 'disabled' : ''}`}
                                    onClick={() => h.podeUsar(jogadorAtual) && executarAcao('habilidade', i)}
                                >
                                    <span>{h.nome}</span>
                                    <span className="modal-cost">{h.custoMana > 0 ? `${h.custoMana} MP` : 'Grátis'}</span>
                                </button>
                            ))}
                            <button className="modal-close" onClick={() => setModal(null)}>← VOLTAR</button>
                        </div>
                    </div>
                )}

                {modal === 'itens' && (
                    <div className="modal-overlay" onClick={() => setModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <p className="modal-title">— CONSUMÍVEIS —</p>
                            {consumiveis.length === 0 && <p className="modal-empty">Nenhum item disponível.</p>}
                            {consumiveis.map((grupo, i) => (
                                <button key={i} className="modal-item" onClick={() => executarAcao('item', i)}>
                                    <span>{grupo.item.nome}</span>
                                    <span className="modal-cost">×{grupo.quantidade}</span>
                                </button>
                            ))}
                            <button className="modal-close" onClick={() => setModal(null)}>← VOLTAR</button>
                        </div>
                    </div>
                )}

                {modal === 'armas' && (
                    <div className="modal-overlay" onClick={() => setModal(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <p className="modal-title">— EQUIPAMENTOS —</p>
                            <p className="modal-equipped">Equipada: {jogadorAtual?.armaEquipada?.nome ?? 'Nenhuma'}</p>
                            {armas.length === 0 && <p className="modal-empty">Nenhuma arma no inventário.</p>}
                            {armas.map((arma, i) => (
                                <button key={i} className="modal-item" onClick={() => {
                                    jogadorAtual.equiparArma(arma);
                                    setEstado({ ...engine.getEstado() });
                                    addLogs([`${arma.nome} equipada!`]);
                                    setModal(null);
                                }}>
                                    <span>{arma.nome}</span>
                                    <span className="modal-cost">+{arma.danoAtaque} ATK</span>
                                </button>
                            ))}
                            <button className="modal-close" onClick={() => setModal(null)}>← VOLTAR</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
