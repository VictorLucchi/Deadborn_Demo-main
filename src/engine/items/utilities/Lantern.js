import { Equipment } from '../Equipment.js';
import lampUrl from '../../../assets/items/equipaveis/lampiao-Hades.png';

export class Lantern extends Equipment {
    constructor() {
        super('Lampião', 'Um lampão antigo. Ilumina o caminho nas trevas.', 'utilidade', 0, 0);

        this.visionRadius = 200;
        this.iconUrl   = lampUrl;
    }
}
