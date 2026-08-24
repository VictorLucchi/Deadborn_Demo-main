import { Ability } from '../../Ability.js';

export class GlimpseOfHell extends Ability {
    constructor() {
        super("Glimpse of Hell", 12);
    }

    executar(usuario, alvo) {
        if (!usuario.marcaDemoniaca) {
            const danoFraco = Math.floor(usuario.vida * 0.10);
            alvo.receberDano(danoFraco);
            if (usuario.acumularChamasVermelhas) usuario.acumularChamasVermelhas(danoFraco);
            return {
                dano: danoFraco,
                critico: false,
                mensagemEspecial: "O inferno ainda não está claro, sinto que o perdi de vista.",
            };
        }

        const danoAlvo = Math.floor(alvo.vida / 2);
        const danoHades = Math.floor(usuario.vida / 2);

        alvo.receberDano(danoAlvo);
        usuario.vida = Math.max(1, usuario.vida - danoHades);

        if (usuario.acumularChamasAzuis) usuario.acumularChamasAzuis(danoHades);
        if (usuario.acumularChamasVermelhas) usuario.acumularChamasVermelhas(danoAlvo);

        return {
            dano: danoAlvo,
            danoSofrido: danoHades,
            critico: false,
            glimpseTotal: true,
        };
    }
}
