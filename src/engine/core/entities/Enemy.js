import { Character } from '../Character.js';

export class Enemy extends Character {
    constructor(nome, vidaMax, manaMax = 0, forca = 10, agilidade = 5, vigor = 10, controle = 5) {
        super(nome, 0, 0, forca, agilidade, vigor, controle);
        this.vidaMax = vidaMax;
        this.vida = vidaMax;
        this.manaMax = manaMax;
        this.mana = manaMax;
        this.xpReward = 0;
        this.habilidades = [];
        this.lootTable = [];
    }

    escolherAcao() {
        for (let i = this.habilidades.length - 1; i >= 0; i--) {
            if (this.habilidades[i].podeUsar(this)) return i;
        }
        return 0;
    }

    escolherAlvo(jogadores) {
        const alvosVivos = jogadores.filter(j => j.estaVivo());
        if (alvosVivos.length === 0) return null;
        return alvosVivos.reduce((alvoMaisFraco, j) => j.vida < alvoMaisFraco.vida ? j : alvoMaisFraco);
    }
}
