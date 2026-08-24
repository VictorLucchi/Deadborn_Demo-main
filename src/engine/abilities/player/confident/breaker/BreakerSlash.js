import { AttackAbility } from '../../../AttackAbility.js';

export class BreakerSlash extends AttackAbility {
    constructor() { super("Breaker Slash", 6, "forca", 5, 15); this.chanceCritico = 0.2; }
    executar(usuario, alvo) {
        const resultado = this.rolarDano(usuario);
        alvo.receberDano(resultado.dano);
        if (resultado.critico) { usuario.aplicarMarcas(3); resultado.marcadoUsuario = true; }
        return resultado;
    }
}
