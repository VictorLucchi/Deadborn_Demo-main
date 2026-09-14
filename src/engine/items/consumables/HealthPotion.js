import { Item } from '../Item.js';
import icon from '../../../assets/items/consumiveis/health potion.png';

export class HealthPotion extends Item {
    constructor() { super("Health Potion", "consumivel", "Restores 50 health"); this.cura = 50; this.icon = icon; }
    async usar(usuario) {
        const vidaAntes = usuario.vida;
        usuario.curar(this.cura);
        const vidaCurada = usuario.vida - vidaAntes;
        usuario.removerItem(this);
        return { mensagem: `${usuario.nome} used ${this.nome} and recovered ${vidaCurada} health!`, cura: vidaCurada };
    }
}
