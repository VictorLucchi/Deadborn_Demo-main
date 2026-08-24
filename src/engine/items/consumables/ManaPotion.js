import { Item } from '../Item.js';

export class ManaPotion extends Item {
    constructor() { super("Poção de Mana", "consumivel", "Restaura 30 de mana"); this.restauraMana = 30; }
    async usar(usuario) {
        const manaAntes = usuario.mana;
        usuario.recuperarMana(this.restauraMana);
        const manaRecuperada = usuario.mana - manaAntes;
        usuario.removerItem(this);
        return { mensagem: `${usuario.nome} usou ${this.nome} e recuperou ${manaRecuperada} de mana!`, manaRecuperada };
    }
}
