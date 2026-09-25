// src/engine/items/utilities/BasementKey.js

import { Item } from '../Item.js';

import icon from '../../../assets/items/chave/chave_porao.png';


export class BasementKey extends Item {

    constructor() {

        super(
            'Chave do porão',
            'chave',
            'Uma chave antiga. Provavelmente abre o porão da casa do músico.'
        );

        this.icon =
            icon;

        this.itemId =
            'basement_key';
    }
}