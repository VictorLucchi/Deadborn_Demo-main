import { Player } from '../Player.js';
import { BasicAttack } from '../../../abilities/common/BasicAttack.js';
import { BreakerSlash } from '../../../abilities/player/confident/breaker/BreakerSlash.js';
import { BreakerFinisher } from '../../../abilities/player/confident/breaker/BreakerFinisher.js';
import { Rest } from '../../../abilities/support/Rest.js';
import { IronSword } from '../../../items/weapons/IronSword.js';
import { SteelSword } from '../../../items/weapons/SteelSword.js';
import { HealthPotion } from '../../../items/consumables/HealthPotion.js';
import { ManaPotion } from '../../../items/consumables/ManaPotion.js';
import { AbyssalBlood } from '../../../items/drops/AbyssalBlood.js';
import { MutatedCore } from '../../../items/drops/MutatedCore.js';

export class Confident extends Player {
    constructor(nome, genero = 'male') {
        super(nome, 100, 14, 7, 14, 5, genero);
        this.habilidades = [new BasicAttack(), new BreakerSlash(), new BreakerFinisher(), new Rest()];
        const espada = new IronSword();
        this.adicionarItem(espada);
        this.equiparArma(espada);
        this.adicionarItem(new SteelSword());
        this.adicionarItem(new HealthPotion());
        this.adicionarItem(new HealthPotion());
        this.adicionarItem(new ManaPotion());
        this.adicionarItem(new AbyssalBlood());
        this.adicionarItem(new MutatedCore());
    }
}
