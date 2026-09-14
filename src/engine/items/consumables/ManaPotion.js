import { Item } from '../Item.js';

export class ManaPotion extends Item {
    constructor() { super("Mana Potion", "consumivel", "Restores 30 mana"); this.restauraMana = 30; }
    async usar(usuario) {
        const manaAntes = usuario.mana;
        usuario.recuperarMana(this.restauraMana);
        const manaRecuperada = usuario.mana - manaAntes;
        usuario.removerItem(this);
        return { mensagem: `${usuario.nome} used ${this.nome} and recovered ${manaRecuperada} mana!`, manaRecuperada };
    }
}
