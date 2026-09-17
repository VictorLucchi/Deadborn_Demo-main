import { Equipment } from '../Equipment.js';
import lampUrl from '../../../assets/items/equipaveis/lampiao-Hades.png';

export class Lantern extends Equipment {
    constructor() {
        super('Lampião', 'Um lampão antigo. Ilumina o caminho nas trevas.', 'arma', 0, 0);
        this.isLantern = true;
        this.iconUrl   = lampUrl;
    }
}
