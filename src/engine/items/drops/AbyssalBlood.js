import { Item } from '../Item.js';

export class AbyssalBlood extends Item {
    constructor() {
        super("Abyssal Blood", "consumivel", "Restores 20 health and strengthens an ability");
        this.cura = 20;
    }
    async usar(usuario) {
        const vidaAntes = usuario.vida;
        usuario.curar(this.cura);
        const vidaCurada = usuario.vida - vidaAntes;
        usuario.removerItem(this);
        return { mensagem: `${usuario.nome} drank ${this.nome}! Recovered ${vidaCurada} health.`, cura: vidaCurada };
    }
}
