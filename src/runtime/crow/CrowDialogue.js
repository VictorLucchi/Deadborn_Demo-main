// 1 "metro" ≈ 16px
const METERS = 16;

const INTERACTION_DISTANCE = 4 * METERS;

const STEPS = [
    {
        distance: 30 * METERS,
        speaker: 'corvo',
        lines: [
            'Você demorou...',
            'Sempre imaginei que esse dia chegaria, uma hora ou outra.',
            'Ainda assim... você demorou.',
        ],
    },

    {
        distance: 15 * METERS,
        speaker: 'corvo',
        lines: [
            'Você nao tem medo do escuro?',
            'Você não vai encontrar o caminho assim.',
        ],
    },

    {
        distance: 10 * METERS,
        speaker: 'hades',
        lines: [
            'Não vou?',
        ],
    },

    {
        distance: 7 * METERS,
        speaker: 'corvo',
        lines: [
            'Não sem a luz.',
            'Pegue.',
            'Tome como um presente.',
        ],
    },

    {
        distance: 4 * METERS,
        speaker: 'hades',
        lines: [
            '[Pegar lanterna]',
        ],
        options: ['Equipar'],
    },
];

const AFTER_LANTERN_DIALOGUE = [
    {
        speaker: 'corvo',
        lines: [
            'Agora você pode enxergar.',
        ],
    },

    {
        speaker: 'hades',
        lines: [
            'E você?',
        ],
    },

    {
        speaker: 'corvo',
        lines: [
            'Eu sempre pude.',
            'E para quem confia em seus olhos, deveria confiar menos em seus ouvidos.',
            'Eles sempre enganam.',
        ],
    },

    {
        speaker: 'hades',
        lines: [
            'Como assim?',
        ],
    },

    {
        speaker: 'corvo',
        lines: [
            'Você esta ficando sem tempo.',
            'Ela esta te esperando.',
            'Ela ainda anseia por te escutar tocar.',
            'Fiquei sabendo que tem um piano na casa do músico.',
        ],
    },
];

export class CrowDialogue {
    constructor(crow) {
        this.crow = crow;

        this.stepIndex = 0;

        this.lanternPickedUp = false;
        this.hasLantern = false;

        this._showPrompt = false;
        this._dialogueLock = false;

        // Fila usada pelos diálogos posteriores à lanterna.
        this._dialogueQueue = [];

        this.onDialogue = null;
        this.onPromptChange = null;
    }

    // --------------------------------------------------
    // Estado público
    // --------------------------------------------------

    get showPrompt() {
        return this._showPrompt;
    }

    get finished() {
        return this.lanternPickedUp;
    }

    // --------------------------------------------------
    // Distância
    // --------------------------------------------------

    distTo(player) {
        if (!player || !this.crow) return Infinity;

        const dx = player.x - this.crow.x;
        const dy = player.y - this.crow.y;

        return Math.hypot(dx, dy);
    }

    isCloseEnough(player) {
        return this.distTo(player) <= INTERACTION_DISTANCE;
    }

    // --------------------------------------------------
    // Prompt
    // --------------------------------------------------

    setPrompt(visible) {
        if (this._showPrompt === visible) return;

        this._showPrompt = visible;
        this.onPromptChange?.(visible);
    }

    // --------------------------------------------------
    // Lock
    // --------------------------------------------------

    setDialogueLock(locked) {
        this._dialogueLock = locked;

        if (locked) {
            this.setPrompt(false);
        }
    }

    // --------------------------------------------------
    // Atualização
    // --------------------------------------------------

    update(player) {
        if (!player) return;

        // Depois que a lanterna foi pega, a sequência é
        // controlada pela fila de diálogos.
        if (this.lanternPickedUp) return;

        // Enquanto uma caixa de diálogo estiver aberta,
        // não dispara outra etapa.
        if (this._dialogueLock) return;

        const distance = this.distTo(player);

        if (this.stepIndex < STEPS.length) {
            this._checkNextStep(distance);
            return;
        }

        // Todas as etapas terminaram.
        this.setPrompt(distance <= INTERACTION_DISTANCE);
    }

    _checkNextStep(distance) {
        const step = STEPS[this.stepIndex];

        if (!step) return;

        // Ainda não chegou à distância necessária.
        if (distance > step.distance) {
            this.setPrompt(false);
            return;
        }

        // Avança o índice ANTES de abrir o diálogo.
        // Isso impede que o mesmo diálogo seja disparado
        // novamente caso o jogador continue pressionando
        // a tecla de movimento.
        this.stepIndex += 1;

        this._dialogueLock = true;
        this.setPrompt(false);

        this.onDialogue?.({
            speaker: step.speaker,
            lines: [...step.lines],
            options: step.options ? [...step.options] : undefined,
        });
    }

    // --------------------------------------------------
    // Interação manual
    // --------------------------------------------------

    triggerInteract(player) {
        if (!player) return;
        if (this.lanternPickedUp) return;
        if (this._dialogueLock) return;

        if (!this.isCloseEnough(player)) {
            this.setPrompt(false);
            return;
        }

        /*
         * A cena do Corvo é disparada automaticamente
         * pelas distâncias definidas em STEPS.
         *
         * Não iniciamos outro diálogo aqui para evitar
         * duplicar a sequência da lanterna.
         */
        return;
    }

    // --------------------------------------------------
    // Lanterna
    // --------------------------------------------------

    pickupLantern() {
        if (this.lanternPickedUp) return;

        this.lanternPickedUp = true;
        this.hasLantern = true;

        this.setPrompt(false);

        // Inicia a sequência posterior à escolha da lanterna.
        this._dialogueQueue = AFTER_LANTERN_DIALOGUE.map(dialogue => ({
            speaker: dialogue.speaker,
            lines: [...dialogue.lines],
            options: dialogue.options
                ? [...dialogue.options]
                : undefined,
        }));

        this._dialogueLock = true;
    }

    // --------------------------------------------------
    // Fila
    // --------------------------------------------------

    hasPendingDialogue() {
        return this._dialogueQueue.length > 0;
    }

    continueDialogue() {
        if (!this.lanternPickedUp) {
            return false;
        }

        if (this._dialogueQueue.length === 0) {
            this._dialogueLock = false;
            return false;
        }

        const nextDialogue = this._dialogueQueue.shift();

        this._dialogueLock = true;

        this.onDialogue?.(nextDialogue);

        return true;
    }

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------

    reset() {
        this.stepIndex = 0;

        this.lanternPickedUp = false;
        this.hasLantern = false;

        this._showPrompt = false;
        this._dialogueLock = false;

        this._dialogueQueue = [];

        this.onPromptChange?.(false);
    }
}