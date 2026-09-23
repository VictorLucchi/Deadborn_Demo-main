import { Equipment } from '../Equipment.js';

export class Hood extends Equipment {
    constructor() {
        super(
            "Capuz do Peregrino",
            "Um capuz velho que ainda conserva alguma proteção contra o frio.",
            "cabeca",
            0,
            5
        );
    }
}