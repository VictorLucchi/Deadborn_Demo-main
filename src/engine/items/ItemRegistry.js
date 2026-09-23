// src/engine/items/ItemRegistry.js

import { HealthPotion } from './consumables/HealthPotion.js';
import { ManaPotion } from './consumables/ManaPotion.js';

import { AbyssalBlood } from './drops/AbyssalBlood.js';
import { MutatedCore } from './drops/MutatedCore.js';

import { IronSword } from './weapons/IronSword.js';
import { SteelSword } from './weapons/SteelSword.js';

import { Lantern } from './utilities/Lantern.js';

import { Coat } from './armor/Coat.js';
import { Hood } from './armor/Hood.js';


const ITEM_REGISTRY = {

    // Consumíveis
    'health potion': () => new HealthPotion(),
    'mana potion': () => new ManaPotion(),

    // Drops / materiais
    'abyssal blood': () => new AbyssalBlood(),
    'mutated core': () => new MutatedCore(),

    // Armas
    'iron sword': () => new IronSword(),
    'steel sword': () => new SteelSword(),

    // Utilidades
    'lantern': () => new Lantern(),

    // Armaduras
    'coat': () => new Coat(),
    'hood': () => new Hood(),

};


export function createItem(itemId) {

    const normalizedId = String(itemId)
        .trim()
        .toLowerCase();

    const factory = ITEM_REGISTRY[normalizedId];

    if (!factory) {
        throw new Error(
            `Item não registrado: "${itemId}"`
        );
    }

    return factory();
}


export function hasItem(itemId) {

    const normalizedId = String(itemId)
        .trim()
        .toLowerCase();

    return Object.prototype.hasOwnProperty.call(
        ITEM_REGISTRY,
        normalizedId
    );
}


export function getItemIds() {
    return Object.keys(ITEM_REGISTRY);
}