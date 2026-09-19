export class Item {
    constructor(nome, tipo = "consumivel", descricao = "") {
        this.nome = nome;
        this.tipo = tipo;
        this.descricao = descricao;

        // Posição do item dentro da grade do inventário.
        // null = o inventário ainda precisa encontrar uma posição.
        this.posicaoInventario = null;

        // Tamanho ocupado na grade [largura, altura].
        this.size = [1, 1];
    }

    async usar(usuario) {
        return {
            mensagem: `${usuario.nome} usou ${this.nome}.`
        };
    }
}