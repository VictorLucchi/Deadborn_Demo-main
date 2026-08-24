import { Item } from '../Item.js';

export class AbyssalBlood extends Item {
    constructor() {
        super("Abyssal Blood", "consumivel", "Restaura 20 de vida e fortalece uma habilidade");
        this.cura = 20;
    }
    async usar(usuario) {
        const vidaAntes = usuario.vida;
        usuario.curar(this.cura);
        const vidaCurada = usuario.vida - vidaAntes;
        usuario.removerItem(this);
        return { mensagem: `${usuario.nome} bebeu ${this.nome}! Recuperou ${vidaCurada} de vida.`, cura: vidaCurada };
    }
}
