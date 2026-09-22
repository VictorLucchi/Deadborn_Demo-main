import { Enemy } from '../Enemy.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { SporeCloud } from '../../../abilities/enemy/SporeCloud.js';
import { HealthPotion } from '../../../items/consumables/HealthPotion.js';
import { MutatedCore } from '../../../items/drops/MutatedCore.js';

export class BroodhostWalkerEnemy extends Enemy {
    constructor() {
        super('Broodhost Walker', 400, 30, 12, 5, 18, 8);
        this.xpReward = 25;
        this.habilidades = [new BasicAttack(), new SporeCloud()];
        this.lootTable = [
            { item: HealthPotion, chance: 0.6 },
            { item: MutatedCore, chance: 0.20 },
        ];
    }
}