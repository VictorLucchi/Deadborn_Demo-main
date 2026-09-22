import './GameOver.css';

export function GameOver({ deaths, onContinue, onMenu }) {
    return (
        <div className="game-over-overlay" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
            <div className="game-over-panel">
                <p className="game-over-kicker">A escuridão venceu</p>
                <h1 id="game-over-title">GAME OVER</h1>
                <p className="game-over-deaths">Número de mortes: <strong>{deaths}</strong></p>

                <div className="game-over-actions">
                    <button type="button" onClick={onContinue}>continue</button>
                    <button type="button" onClick={onMenu}>Return menu</button>
                </div>
            </div>
        </div>
    );
}