import { TurnManager } from './combate/TurnManager.js';
import { LootSystem } from './systems/LootSystem.js';
import { Goblin } from './core/entities/enemies/Goblin.js';
import { HunterEnemy } from './core/entities/enemies/HunterEnemy.js';
import { Confident } from './core/entities/classes/Confident.js';
import { Vanguard } from './core/entities/classes/Vanguard.js';
import { Successor } from './core/entities/classes/Successor.js';

export function criarPersonagem(nome, classeId, genero = 'male') {
    if (classeId === '1') return new Confident(nome, genero);
    if (classeId === '3') return new Successor(nome, genero);
    return new Vanguard(nome, genero);
}

function criarInimigo(tipo = 'hunter') {
    if (tipo === 'goblin') return new Goblin();
    return new HunterEnemy();
}

export class GameEngine {
    constructor(onLog) {
        this.onLog = onLog || (() => {});
        this.turnManager = new TurnManager();
        this.jogadores = [];
        this.inimigo = null;
        this.modo = null;
        this.indiceJogadorAtual = 0;
        this.emAndamento = false;
    }

    log(msg) { this.onLog(msg); }

    iniciarPvE(jogadorPrincipal, tipoInimigo = 'hunter') {
        this.inimigo = criarInimigo(tipoInimigo);
        this.jogadores = [jogadorPrincipal];
        this.modo = 'pve';
        this.emAndamento = true;
        this.indiceJogadorAtual = 0;
        this.log(`Combate iniciado! ${jogadorPrincipal.nome} vs ${this.inimigo.nome}`);
        return this.getEstado();
    }

    getJogadorAtual() { return this.jogadores[this.indiceJogadorAtual]; }
    getAlvoAtual() { return this.inimigo; }

    executarAcaoJogador(tipoAcao, indice = 0) {
        const jogador = this.getJogadorAtual();
        const alvo = this.getAlvoAtual();
        const msgs = [];

        const statusInicio = this.turnManager.iniciarTurno(jogador);
        statusInicio.mensagens.forEach(m => msgs.push(m));

        if (!statusInicio.podeAgir) {
            this._avancarTurno(msgs);
            return { msgs, estado: this.getEstado() };
        }

        if (tipoAcao === 'habilidade') {
            const resultado = jogador.usarHabilidade(indice, alvo);
            this.turnManager.formatarResultado(resultado, jogador, alvo).forEach(m => msgs.push(m));
            if (resultado?.erro) return { msgs, estado: this.getEstado() };
        } else if (tipoAcao === 'item') {
            const consumiveis = this._getConsumiveis(jogador);
            const grupo = consumiveis[indice];
            if (grupo) {
                const item = jogador.inventario.find(i => i.nome === grupo.item.nome);
                if (item) {
                    const resultado = item.usar(jogador);
                    if (resultado?.then) {
                        return resultado.then(r => {
                            if (r.mensagem) msgs.push(r.mensagem);
                            this._avancarTurno(msgs);
                            return { msgs, estado: this.getEstado() };
                        });
                    }
                    if (resultado?.mensagem) msgs.push(resultado.mensagem);
                }
            }
        } else if (tipoAcao === 'fugir') {
            this.emAndamento = false;
            msgs.push('Você fugiu do combate...');
            return { msgs, estado: this.getEstado(), fugiu: true };
        }

        this._avancarTurno(msgs);
        return { msgs, estado: this.getEstado() };
    }

    _avancarTurno(msgs) {
        if (!this._verificarFimCombate(msgs)) {
            this._turnoInimigo(msgs);
            this.turnManager.proximoTurno();
            this._verificarFimCombate(msgs);
        }
    }

    _turnoInimigo(msgs) {
        const statusInimigo = this.turnManager.iniciarTurno(this.inimigo);
        statusInimigo.mensagens.forEach(m => msgs.push(m));
        if (statusInimigo.podeAgir) {
            const alvo = this.inimigo.escolherAlvo(this.jogadores);
            if (alvo) {
                const indiceAcao = this.inimigo.escolherAcao();
                const res = this.inimigo.usarHabilidade(indiceAcao, alvo);
                this.turnManager.formatarResultado(res, this.inimigo, alvo).forEach(m => msgs.push(m));
            }
        }
    }

    _verificarFimCombate(msgs) {
        if (!this.inimigo.estaVivo()) {
            this.emAndamento = false;
            msgs.push(`${this.inimigo.nome} foi derrotado!`);
            this.jogadores.forEach(j => { if (j.estaVivo()) j.ganharXp(this.inimigo.xpReward); });
            const loot = LootSystem.gerarLoot(this.inimigo.lootTable);
            LootSystem.distribuirLoot(loot, this.jogadores);
            if (loot.length > 0) msgs.push(`Itens obtidos: ${loot.map(i => i.nome).join(', ')}`);
            return true;
        }
        if (!this.jogadores.some(j => j.estaVivo())) {
            this.emAndamento = false;
            msgs.push('O grupo foi aniquilado...');
            return true;
        }
        return false;
    }

    _getConsumiveis(jogador) {
        const agrupados = {};
        jogador.inventario
            .filter(i => i.tipo === 'consumivel' || i.tipo === 'material')
            .forEach(item => {
                if (!agrupados[item.nome]) agrupados[item.nome] = { item, quantidade: 0 };
                agrupados[item.nome].quantidade++;
            });
        return Object.values(agrupados);
    }

    getConsumiveis(jogador) { return this._getConsumiveis(jogador); }
    getArmas(jogador) { return jogador.inventario.filter(i => i.slot === 'arma'); }

    getEstado() {
        return {
            emAndamento: this.emAndamento,
            modo: this.modo,
            jogadores: this.jogadores,
            inimigo: this.inimigo,
            jogadorAtual: this.getJogadorAtual(),
            turno: this.turnManager.turnoAtual,
        };
    }
}
