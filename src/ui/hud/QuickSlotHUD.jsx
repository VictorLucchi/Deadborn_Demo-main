import './QuickSlotHUD.css';

export function QuickSlotHUD({ quickSlots }) {
    return (
        <div className="qhud-container">
            {quickSlots.map((item, i) => (
                <div key={i} className="qhud-slot">
                    <div className={`qhud-diamond ${item ? 'filled' : ''}`}>
                        {item?.icon
                            ? <img src={item.icon} alt={item.nome} />
                            : <span className="qhud-empty">—</span>
                        }
                    </div>
                    <span className="qhud-key">{i + 1}</span>
                </div>
            ))}
        </div>
    );
}
