import { Player } from '../Player.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { HellFlame } from '../../../abilities/player/hades/HellFlame.js';
import { DeathTouch } from '../../../abilities/player/hades/DeathTouch.js';
import { GlimpseOfHell } from '../../../abilities/player/hades/GlimpseOfHell.js';
import { HealthPotion } from '../../../items/consumables/HealthPotion.js';
import { ManaPotion } from '../../../items/consumables/ManaPotion.js';

export class Successor extends Player {
    constructor(nome, genero = 'male') {
        super(nome, 0, 10, 8, 16, 14, genero);
        this.habilidades = [
            new BasicAttack(),
            new HellFlame(),
            new DeathTouch(),
            new GlimpseOfHell(),
        ];

        this.chamasAzuis = 0;
        this.chamasVermelhas = 0;
        this.chamasAzuisAtivas = false;
        this.chamasVermelhasAtivas = false;
        this.marcaDemoniaca = false;

        this.adicionarItem(new HealthPotion());
        this.adicionarItem(new HealthPotion());
        this.adicionarItem(new ManaPotion());
        this.adicionarItem(new ManaPotion());
    }

    acumularChamasAzuis(quantidade) {
        this.chamasAzuis += quantidade;
        if (!this.chamasAzuisAtivas && this.chamasAzuis > this.manaMax)
            this.chamasAzuisAtivas = true;
    }

    acumularChamasVermelhas(quantidade) {
        this.chamasVermelhas += quantidade;
        if (!this.chamasVermelhasAtivas && this.chamasVermelhas > this.vidaMax)
            this.chamasVermelhasAtivas = true;
    }

    receberDano(dano) {
        const danoReal = super.receberDano(dano);
        if (danoReal > 0) this.acumularChamasAzuis(danoReal);

        if (this.vida <= 0 && !this.marcaDemoniaca) {
            const condicaoAtiva = this.chamasAzuisAtivas || this.chamasVermelhasAtivas;
            if (condicaoAtiva && Math.random() < 0.10)
                this._ativarMarcaDemoniaca();
        }

        return danoReal;
    }

    processarTurno() {
        const efeitos = super.processarTurno();
        if (this.chamasAzuisAtivas) {
            const manaRegen = Math.floor(this.vidaMax * 0.10);
            this.recuperarMana(manaRegen);
            efeitos.push({ tipo: 'regen_mana_chamas', valor: manaRegen });
        }
        return efeitos;
    }

    _ativarMarcaDemoniaca() {
        this.marcaDemoniaca = true;
        this.vidaMax += Math.floor(this.vidaMax * 0.25);
        this.manaMax = this.manaMax * 2;
        this.vida = 1;
        this.mana = this.manaMax;
        this.chamasAzuis = 0;
        this.chamasVermelhas = 0;
        this.chamasAzuisAtivas = false;
        this.chamasVermelhasAtivas = false;
    }

    usarHabilidade(index, alvo) {
        const resultado = super.usarHabilidade(index, alvo);
        if (!resultado || resultado.erro) return resultado;

        if (this.marcaDemoniaca && resultado.dano) {
            const bonus = Math.floor(resultado.dano * 0.50);
            alvo.receberDano(bonus);
            resultado.dano += bonus;
            resultado.marcaDemoniacaAtiva = true;
            this.acumularChamasVermelhas(bonus);
        }

        return resultado;
    }
}
