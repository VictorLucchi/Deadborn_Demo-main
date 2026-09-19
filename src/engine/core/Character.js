export class Character {
    constructor(
        nome,
        vidaMax,
        manaMax = 0,
        forca = 0,
        agilidade = 0,
        vigor = 0,
        controle = 0,
        genero = 'male'
    ) {
        this.nome = nome;
        this.genero = genero;

        this.vidaMax = vigor * 5 + 30;
        this.vida = this.vidaMax;

        this.manaMax = controle * 2 + 15;
        this.mana = this.manaMax;

        this.forca = forca;
        this.agilidade = agilidade;
        this.vigor = vigor;
        this.controle = controle;

        this.status = {
            marcado: false,
            atordoado: false,
            defendendo: false,
            envenenado: false,
            sangrando: false,
            queimado: false,
            congelado: false,
            agarrado: false
        };

        this.turnosDefesa = 0;
        this.danoVeneno = 0;
        this.quantidadeMarcas = 0;

        this.habilidades = [];

        // =========================
        // EQUIPAMENTOS
        // =========================

        this.armaEquipada = null;

        this.armaduraEquipada = {
            cabeca: null,
            peito: null,
            luvas: null,
            pernas: null
        };

        // =========================
        // INVENTÁRIO
        // =========================

        this.inventario = [];
    }

    // =========================================================
    // VIDA / STATUS
    // =========================================================

    estaVivo() {
        return this.vida > 0;
    }

    ativarDefesa(turnos = 1) {
        this.status.defendendo = true;
        this.turnosDefesa = turnos;
    }

    receberDano(dano) {
        dano = Math.max(dano - this.vigor, 0);

        if (this.status.defendendo) {
            dano = Math.floor(dano / 2);
        }

        if (this.status.marcado) {
            dano = dano - 5 + (this.quantidadeMarcas * 5);

            if (dano < 0) {
                dano = 0;
            }
        }

        this.vida -= dano;

        if (this.vida < 0) {
            this.vida = 0;
        }

        return dano;
    }

    curar(valor) {
        this.vida = Math.min(
            this.vida + valor,
            this.vidaMax
        );
    }

    recuperarMana(valor) {
        this.mana = Math.min(
            this.mana + valor,
            this.manaMax
        );
    }

    aplicarStatus(tipo) {
        this.status[tipo] = true;
    }

    removerStatus(tipo) {
        this.status[tipo] = false;
    }

    aplicarMarcas(quantidade = 1) {
        this.status.marcado = true;
        this.quantidadeMarcas += quantidade;
    }

    removerMarcas() {
        this.status.marcado = false;
        this.quantidadeMarcas = 0;
    }

    estaAtordoado() {
        return this.status.atordoado === true;
    }

    atordoar() {
        this.aplicarStatus('atordoado');
    }

    envenenar(dano) {
        this.status.envenenado = true;
        this.danoVeneno = dano;
    }

    processarTurno() {
        const efeitos = [];

        if (this.status.envenenado) {
            this.vida -= this.danoVeneno;

            if (this.vida < 0) {
                this.vida = 0;
            }

            efeitos.push({
                tipo: 'veneno',
                dano: this.danoVeneno
            });
        }

        if (this.status.defendendo && this.turnosDefesa > 0) {
            this.turnosDefesa--;

            if (this.turnosDefesa === 0) {
                this.status.defendendo = false;

                efeitos.push({
                    tipo: 'defesa__expirou'
                });
            }
        }

        if (this.status.marcado) {
            this.quantidadeMarcas--;

            efeitos.push({
                tipo: 'marca_decaiu'
            });

            if (this.quantidadeMarcas <= 0) {
                this.removerMarcas();

                efeitos.push({
                    tipo: 'marcas_expiraram'
                });
            }
        }

        return efeitos;
    }

    // =========================================================
    // HABILIDADES
    // =========================================================

    usarHabilidade(index, alvo) {
        const habilidade = this.habilidades[index];

        if (!habilidade) {
            return {
                erro: "Habilidade inválida."
            };
        }

        if (!habilidade.podeUsar(this)) {
            return {
                erro: "Mana insuficiente"
            };
        }

        if (habilidade.custoMana > 0) {
            this.mana -= habilidade.custoMana;
        }

        return habilidade.executar(this, alvo);
    }

    // =========================================================
    // INVENTÁRIO
    // =========================================================

    adicionarItem(item) {
        if (!item) return false;

        // Se o item ainda não possui posição,
        // encontramos automaticamente um espaço.
        if (item.posicaoInventario === null) {
            item.posicaoInventario = this.encontrarPosicaoLivre(item);
        }

        this.inventario.push(item);

        return true;
    }

    removerItem(item) {
        const index = this.inventario.indexOf(item);

        if (index === -1) {
            return false;
        }

        this.inventario.splice(index, 1);

        return true;
    }

    // =========================================================
    // EQUIPAMENTOS
    // =========================================================

    equiparEquipamento(item) {
        if (!item) {
            return false;
        }

        if (item.tipo !== 'equipamento') {
            return false;
        }

        const slot = item.slot;

        // -----------------------------------------
        // ARMA
        // -----------------------------------------

        if (slot === 'arma') {
            if (this.armaEquipada) {
                this.adicionarItem(this.armaEquipada);
            }

            this.removerItem(item);

            item.posicaoInventario = null;

            this.armaEquipada = item;

            return true;
        }

        // -----------------------------------------
        // ARMADURA
        // -----------------------------------------

        if (
            Object.prototype.hasOwnProperty.call(
                this.armaduraEquipada,
                slot
            )
        ) {
            const equipamentoAnterior =
                this.armaduraEquipada[slot];

            if (equipamentoAnterior) {
                this.adicionarItem(equipamentoAnterior);
            }

            this.removerItem(item);

            item.posicaoInventario = null;

            this.armaduraEquipada[slot] = item;

            return true;
        }

        return false;
    }

    // Mantemos esse método porque outras partes do jogo
    // já utilizam equiparArma().
    equiparArma(arma) {
        return this.equiparEquipamento(arma);
    }

    desequiparEquipamento(slot) {

        // -----------------------------------------
        // ARMA
        // -----------------------------------------

        if (slot === 'arma') {
            if (!this.armaEquipada) {
                return false;
            }

            const equipamento = this.armaEquipada;

            equipamento.posicaoInventario = null;

            this.armaEquipada = null;

            this.adicionarItem(equipamento);

            return true;
        }

        // -----------------------------------------
        // ARMADURA
        // -----------------------------------------

        if (
            !Object.prototype.hasOwnProperty.call(
                this.armaduraEquipada,
                slot
            )
        ) {
            return false;
        }

        const equipamento =
            this.armaduraEquipada[slot];

        if (!equipamento) {
            return false;
        }

        equipamento.posicaoInventario = null;

        this.armaduraEquipada[slot] = null;

        this.adicionarItem(equipamento);

        return true;
    }

    getDanoArma() {
        return this.armaEquipada
            ? this.armaEquipada.danoAtaque
            : 0;
    }

    getBonusDefesa() {
        return Object.values(this.armaduraEquipada)
            .filter(Boolean)
            .reduce(
                (total, equipamento) =>
                    total + (equipamento.bonusDefesa || 0),
                0
            );
    }

    // =========================================================
    // POSIÇÃO DOS ITENS NA GRADE
    // =========================================================

    encontrarPosicaoLivre(item, inventarioAtual = this.inventario) {
        const GRID_COLS = 4;
        const GRID_ROWS = 5;
        const TOTAL_SLOTS = GRID_COLS * GRID_ROWS;

        const w = item.size?.[0] ?? 1;
        const h = item.size?.[1] ?? 1;

        const ocupado = new Set();

        for (const outro of inventarioAtual) {
            if (outro === item) continue;

            if (outro.posicaoInventario === null) continue;

            const ox = outro.posicaoInventario % GRID_COLS;
            const oy = Math.floor(
                outro.posicaoInventario / GRID_COLS
            );

            const ow = outro.size?.[0] ?? 1;
            const oh = outro.size?.[1] ?? 1;

            for (let y = 0; y < oh; y++) {
                for (let x = 0; x < ow; x++) {
                    const index =
                        (oy + y) * GRID_COLS +
                        (ox + x);

                    ocupado.add(index);
                }
            }
        }

        for (let origin = 0; origin < TOTAL_SLOTS; origin++) {
            const x = origin % GRID_COLS;
            const y = Math.floor(origin / GRID_COLS);

            if (x + w > GRID_COLS) {
                continue;
            }

            if (y + h > GRID_ROWS) {
                continue;
            }

            let livre = true;

            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    const index =
                        (y + dy) * GRID_COLS +
                        (x + dx);

                    if (ocupado.has(index)) {
                        livre = false;
                    }
                }
            }

            if (livre) {
                return origin;
            }
        }

        return null;
    }

    moverItem(item, novaPosicao) {
        if (!item) {
            return false;
        }

        if (!this.inventario.includes(item)) {
            return false;
        }

        const posicaoAnterior =
            item.posicaoInventario;

        item.posicaoInventario = null;

        const posicaoValida =
            this.encontrarPosicaoLivre(item);

        if (
            novaPosicao === null ||
            novaPosicao === undefined
        ) {
            item.posicaoInventario =
                posicaoAnterior;

            return false;
        }

        // Verifica manualmente se a posição escolhida
        // comporta o item.
        const GRID_COLS = 4;
        const GRID_ROWS = 5;

        const w = item.size?.[0] ?? 1;
        const h = item.size?.[1] ?? 1;

        const x = novaPosicao % GRID_COLS;
        const y = Math.floor(
            novaPosicao / GRID_COLS
        );

        if (
            x + w > GRID_COLS ||
            y + h > GRID_ROWS
        ) {
            item.posicaoInventario =
                posicaoAnterior;

            return false;
        }

        // Testamos ocupação sem o próprio item.
        const ocupada = new Set();

        for (const outro of this.inventario) {
            if (outro === item) continue;

            if (outro.posicaoInventario === null) {
                continue;
            }

            const ox =
                outro.posicaoInventario % GRID_COLS;

            const oy =
                Math.floor(
                    outro.posicaoInventario /
                    GRID_COLS
                );

            const ow = outro.size?.[0] ?? 1;
            const oh = outro.size?.[1] ?? 1;

            for (let dy = 0; dy < oh; dy++) {
                for (let dx = 0; dx < ow; dx++) {
                    ocupada.add(
                        (oy + dy) * GRID_COLS +
                        (ox + dx)
                    );
                }
            }
        }

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const index =
                    (y + dy) * GRID_COLS +
                    (x + dx);

                if (ocupada.has(index)) {
                    item.posicaoInventario =
                        posicaoAnterior;

                    return false;
                }
            }
        }

        item.posicaoInventario = novaPosicao;

        return true;
    }
}