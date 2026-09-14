import { Item } from '../Item.js';
import icon from '../../../assets/items/consumiveis/mutated core.png';

export class MutatedCore extends Item {
    constructor() { super("Mutated Core", "material", "Mutant core. Permanently evolves an ability"); this.icon = icon; }
    async usar(usuario) {
        usuario.removerItem(this);
        return { mensagem: `The core pulses with strange energy.` };
    }
}
