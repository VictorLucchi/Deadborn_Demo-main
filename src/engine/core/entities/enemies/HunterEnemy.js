import { Enemy } from '../Enemy.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { ExhaleDecay } from '../../../abilities/enemy/ExhaleDecay.js';
import { ParasiticGrasp } from '../../../abilities/enemy/ParasiticGrasp.js';
import { Eviscerate } from '../../../abilities/enemy/Eviscerate.js';
import { HealthPotion } from '../../../items/consumables/HealthPotion.js';
import { ManaPotion } from '../../../items/consumables/ManaPotion.js';

export class HunterEnemy extends Enemy {
    constructor() {
        super("Hunter", 200, 50, 15, 8, 15, 6);
        this.xpReward = 30;
        this.habilidades = [new BasicAttack(), new ExhaleDecay(), new ParasiticGrasp(), new Eviscerate()];
        this.lootTable = [{ item: HealthPotion, chance: 0.7 }, { item: ManaPotion, chance: 0.5 }];
    }
}
