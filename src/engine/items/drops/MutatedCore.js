import { Item } from '../Item.js';
import icon from '../../../assets/items/consumiveis/mutated core.png';

export class MutatedCore extends Item {
    constructor() { super("Mutated Core", "material", "Núcleo mutante. Evolui uma habilidade permanentemente"); this.icon = icon; }
    async usar(usuario) {
        usuario.removerItem(this);
        return { mensagem: `O núcleo pulsa com energia estranha.` };
    }
}
