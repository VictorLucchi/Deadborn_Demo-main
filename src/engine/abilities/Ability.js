export class Ability {
    constructor(nome, custoMana = 0) {
        this.nome = nome;
        this.custoMana = custoMana;
    }
    podeUsar(_usuario) { return _usuario.mana >= this.custoMana; }
    executar(_usuario, _alvo) { throw new Error("Metodo executar() deve ser implementado."); }
}
