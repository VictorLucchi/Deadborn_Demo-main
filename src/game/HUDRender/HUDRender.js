export class HUDRenderer {

    constructor() {
        this._ready = false;
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

        this._name.textContent =
            jogador.nome?.toUpperCase() ?? 'HADES';
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


        // Preenchimento da barra

        this._healthFill.style.width =
            `${pct * 100}%`;


        // Texto

        this._healthText.textContent =
            `VIDA ${Math.floor(current)}/${Math.floor(max)}`;


        // Estado visual

        this._hud.classList.toggle(
            'hud-health-empty',
            current <= 0
        );

        this._hud.classList.toggle(
            'hud-health-critical',
            pct > 0 && pct <= 0.25
        );
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


        // Preenchimento

        this._manaFill.style.width =
            `${pct * 100}%`;


        // Texto

        this._manaText.textContent =
            `MANA ${Math.floor(current)}/${Math.floor(max)}`;
    }


    // ========================================
    // ARMA EQUIPADA
    // ========================================

    _updateWeapon(jogador) {

        if (!this._weaponIcon) {
            return;
        }

        /*
         * Por enquanto usamos o símbolo.
         *
         * Depois podemos trocar isso por:
         *
         * - imagem da arma
         * - sprite
         * - ícone específico
         * - classe CSS
         */

        if (jogador.armaEquipada) {

            this._weaponIcon.textContent = '⚔';

        } else {

            this._weaponIcon.textContent = '—';
        }
    }
}