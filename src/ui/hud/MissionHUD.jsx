import './MissionHUD.css';

export function MissionHUD({ mission }) {
    if (!mission) return null;

    return (
        <section className="mission-hud" aria-label="Missão principal">
            <div className="mission-hud-heading">
                <span className="mission-hud-marker" aria-hidden="true" />
                <span>MISSÃO PRINCIPAL</span>
            </div>
            <p className="mission-hud-title">{mission.title}</p>
        </section>
    );
}