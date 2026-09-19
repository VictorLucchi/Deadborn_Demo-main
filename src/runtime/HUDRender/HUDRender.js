export class HUDRenderer {

    constructor() {
        this._ready = false;
        this._lastName = undefined;
        this._lastHealth = undefined;
        this._lastMana = undefined;
        this._lastWeapon = undefined;
    }

    _init() {
        this._hud         = document.getElementById('game-hud');
        if (!this._hud) return false;

        this._avatar      = document.getElementById('hud-avatar-image');
        this._name        = document.getElementById('hud-name');
        this._healthFill  = document.getElementById('hud-health-fill');
        this._healthText  = document.getElementById('hud-health-text');
        this._manaFill    = document.getElementById('hud-mana-fill');
        this._manaText    = document.getElementById('hud-mana-text');
        this._weaponIcon  = document.getElementById('hud-weapon-icon');

        if (this._avatar) {
            this._avatar.src = new URL(
                '../../assets/images/hades_Avatar.png',
                import.meta.url
            ).href;
        }

        return true;
    }


    // ========================================
    // ATUALIZA HUD
    // ========================================

    draw(jogador) {
        if (!this._ready) this._ready = this._init();
        if (!this._ready || !jogador) return;

        this._updateName(jogador);
        this._updateHealth(jogador);
        this._updateMana(jogador);
        this._updateWeapon(jogador);
    }


    // ========================================
    // NOME
    // ========================================

    _updateName(jogador) {

        if (!this._name) {
            return;
        }

        const name = jogador.nome?.toUpperCase() ?? 'HADES';
        if (name === this._lastName) return;

        this._name.textContent = name;
        this._lastName = name;
    }


    // ========================================
    // VIDA
    // ========================================

    _updateHealth(jogador) {

        if (!this._healthFill || !this._healthText) {
            return;
        }

        const max =
            Math.max(
                1,
                jogador.vidaMax ?? 1
            );

        const current =
            Math.max(
                0,
                jogador.vida ?? 0
            );

        const pct =
            Math.min(
                1,
                current / max
            );


        const healthKey = `${current}/${max}`;
        if (healthKey === this._lastHealth) return;

        this._healthFill.style.width = `${pct * 100}%`;
        this._healthText.textContent = `VIDA ${Math.floor(current)}/${Math.floor(max)}`;
        this._hud.classList.toggle('hud-health-empty', current <= 0);
        this._hud.classList.toggle('hud-health-critical', pct > 0 && pct <= 0.25);
        this._lastHealth = healthKey;
    }


    // ========================================
    // MANA
    // ========================================

    _updateMana(jogador) {

        if (!this._manaFill || !this._manaText) {
            return;
        }

        const max =
            Math.max(
                1,
                jogador.manaMax ?? 1
            );

        const current =
            Math.max(
                0,
                jogador.mana ?? 0
            );

        const pct =
            Math.min(
                1,
                current / max
            );


        const manaKey = `${current}/${max}`;
        if (manaKey === this._lastMana) return;

        this._manaFill.style.width = `${pct * 100}%`;
        this._manaText.textContent = `MANA ${Math.floor(current)}/${Math.floor(max)}`;
        this._lastMana = manaKey;
    }


    // ========================================
    // ARMA EQUIPADA
    // ========================================

    _updateWeapon(jogador) {
        if (!this._weaponIcon) return;

        const frame = this._weaponIcon.closest('.hud-equipment-frame');
        const weapon = jogador.armaEquipada;
        const weaponKey = weapon?.iconUrl ?? weapon?.icon ?? weapon?.nome ?? null;

        if (weaponKey === this._lastWeapon) return;

        if (weapon) {
            const url = weapon.iconUrl;
            if (url) {
                this._weaponIcon.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;" />`;
            } else {
                this._weaponIcon.textContent = '⚔';
            }
            frame?.classList.add('filled');
        } else {
            this._weaponIcon.innerHTML = '';
            this._weaponIcon.textContent = '—';
            frame?.classList.remove('filled');
        }

        this._lastWeapon = weaponKey;
    }
}
