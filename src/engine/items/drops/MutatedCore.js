import { Item } from '../Item.js';

export class MutatedCore extends Item {
    constructor() { super("Mutated Core", "material", "Núcleo mutante. Evolui uma habilidade permanentemente"); }
    async usar(usuario) {
        usuario.removerItem(this);
        return { mensagem: `O núcleo pulsa com energia estranha.` };
    }
}
