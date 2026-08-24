import { AttackAbility } from '../../AttackAbility.js';

export class HellFlame extends AttackAbility {
    constructor() {
        super("Hell Flame", 6, "controle", 0, 0);
        this.chanceCritico = 0.12;
    }

    executar(usuario, alvo) {
        const danoImediato = Math.floor(alvo.vida * 0.10);
        const turnos = Math.floor(Math.random() * 6) + 1;
        const danoVenenoTurno = Math.max(1, Math.floor(alvo.vidaMax * 0.01));

        alvo.receberDano(danoImediato);
        alvo.envenenar(danoVenenoTurno);
        alvo.turnosQueimadura = turnos;
        alvo.queimaduraHellFlame = true;
        alvo.aplicarStatus('envenenado');

        if (usuario.acumularChamasVermelhas) usuario.acumularChamasVermelhas(danoImediato);

        const resultado = { dano: danoImediato, critico: false, envenenou: true, turnosQueimadura: turnos };

        if (usuario.chamasVermelhasAtivas) {
            const bonus = Math.floor(danoImediato * 1.0);
            alvo.receberDano(bonus);
            resultado.dano += bonus;
            resultado.amplificado = true;
        }

        return resultado;
    }
}
