import { Player } from '../Player.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { QuickStrike } from '../../../abilities/common/QuickStrike.js';
import { SwiftSlash } from '../../../abilities/common/SwiftSlash.js';
import { BlitzAssault } from '../../../abilities/common/BlitzAssault.js';
import { Momentum } from '../../../abilities/support/Momentum.js';
export class Vanguard extends Player {
    constructor(nome, genero = 'male') {
        super(nome, 100, 12, 14, 6, 8, genero);
        this.habilidades = [new BasicAttack(), new QuickStrike(), new SwiftSlash(), new BlitzAssault(), new Momentum()];
        this.momentum = 0;
        this.agilidadeOriginal = this.agilidade;
        this.temMomentum = true;
    }

    usarHabilidade(index, alvo) {
        const resultado = super.usarHabilidade(index, alvo);
        if (resultado && resultado.critico && this.temMomentum) Momentum.ganharMomentum(this);
        return resultado;
    }

    receberDano(dano) {
        const danoRecebido = super.receberDano(dano);
        if (this.temMomentum && this.momentum > 0) {
            const danoAlto = this.vidaMax * 0.3;
            if (danoRecebido >= danoAlto) Momentum.perderMomentum(this, Math.ceil(danoRecebido / danoAlto));
        }
        return danoRecebido;
    }
}
