import { Enemy } from '../Enemy.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { Flurry } from '../../../abilities/enemy/Flurry.js';
import { Lunge } from '../../../abilities/enemy/Lunge.js';
import { HealthPotion } from '../../../items/consumables/HealthPotion.js';

export class Goblin extends Enemy {
    constructor() {
        super("Goblin", 150, 20, 8, 12, 8, 4);
        this.xpReward = 10;
        this.habilidades = [new BasicAttack(), new Flurry(), new Lunge()];
        this.lootTable = [{ item: HealthPotion, chance: 0.4 }];
    }
}
