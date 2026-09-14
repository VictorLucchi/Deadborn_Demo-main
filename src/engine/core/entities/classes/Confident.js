import { Player } from '../Player.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { BreakerSlash } from '../../../abilities/player/confident/breaker/BreakerSlash.js';
import { BreakerFinisher } from '../../../abilities/player/confident/breaker/BreakerFinisher.js';
import { Rest } from '../../../abilities/support/Rest.js';
export class Confident extends Player {
    constructor(nome, genero = 'male') {
        super(nome, 100, 14, 7, 14, 5, genero);
        this.habilidades = [new BasicAttack(), new BreakerSlash(), new BreakerFinisher(), new Rest()];
    }
}
