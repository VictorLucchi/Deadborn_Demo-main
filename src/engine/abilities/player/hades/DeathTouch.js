import { AttackAbility } from '../../AttackAbility.js';

export class DeathTouch extends AttackAbility {
    constructor() {
        super("Death Touch", 8, "vigor", 0, 0);
        this.chanceCritico = 0.05;
    }

    executar(usuario, alvo) {
        const danoBase = 60 + (usuario.vigor * 5);
        const critico = Math.random() < this.chanceCritico;
        let danoFinal = critico ? Math.floor(danoBase * 1.5) : danoBase;

        if (usuario.chamasVermelhasAtivas) danoFinal = Math.floor(danoFinal * 2);

        const danoReal = alvo.receberDano(danoFinal);
        const resultado = { dano: danoReal, critico };

        if (critico) {
            const cura = Math.floor(danoReal / 2);
            usuario.curar(cura);
            resultado.dreno = cura;
        }

        if (usuario.acumularChamasVermelhas) usuario.acumularChamasVermelhas(danoReal);

        return resultado;
    }
}
