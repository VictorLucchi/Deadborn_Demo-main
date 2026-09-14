// 1 "metro" ≈ 16px
const STEPS = [
    { dist: 30 * 16, speaker: 'corvo', lines: [
        'Você demorou.',
        'Sempre imaginei que esse dia chegaria, uma hora ou outra.',
        'Ainda assim... você demorou.',
    ]},
    { dist: 15 * 16, speaker: 'corvo', lines: [
        'Você não tem medo do escuro?',
    ]},
    { dist: 10 * 16, speaker: 'corvo', lines: [
        'Eu sei que ele não representa o fim.',
        'Nem mesmo o começo.',
        'Ainda assim, não deixo de imaginar...',
        'O que te move?',
    ]},
    { dist: 7 * 16, speaker: 'corvo', lines: [
        'O que mais me dá medo em você...',
    ]},
    { dist: 4 * 16, speaker: 'corvo', lines: [
        'De alguma forma... a luz te persegue.',
    ]},
];

const INTERACT_DIALOGUE = {
    speaker: 'hades',
    lines: [
        'Embora eu pudesse simplesmente mergulhar no escuro...',
        'eu prefiro enxergar o caminho que escolhi.',
    ],
    options: ['Examinar', 'Equipar'],
};

export class CrowDialogue {
    constructor(crow) {
        this.crow = crow;
        this.stepIndex = 0;
        this.lanternPickedUp = false;
        this.hasLantern = false;
        this._showPrompt = false;
        this._dialogueLock = false; // true enquanto caixa estiver aberta

        this.onDialogue = null;      // ({ lines, speaker, options? }) => void
        this.onPromptChange = null;  // (visible: bool) => void
    }

    get showPrompt() { return this._showPrompt; }

    distTo(player) {
        const dx = player.x - this.crow.x;
        const dy = player.y - this.crow.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    setDialogueLock(locked) {
        this._dialogueLock = locked;
    }

    update(player) {
        if (this.lanternPickedUp) return;
        if (this._dialogueLock) return;

        const dist = this.distTo(player);

        // dispara próximo step de distância
        if (this.stepIndex < STEPS.length && dist <= STEPS[this.stepIndex].dist) {
            const step = STEPS[this.stepIndex];
            this.stepIndex++;
            this._dialogueLock = true;
            this.onDialogue?.({ lines: step.lines, speaker: step.speaker });
            return;
        }

        // prompt E quando todos os steps passaram e está perto
        const nearEnough = dist <= 3 * 16;
        if (this.stepIndex >= STEPS.length && nearEnough !== this._showPrompt) {
            this._showPrompt = nearEnough;
            this.onPromptChange?.(this._showPrompt);
        }
    }

    triggerInteract() {
        if (this.lanternPickedUp) return;
        this._dialogueLock = true;
        this._showPrompt = false;
        this.onPromptChange?.(false);
        this.onDialogue?.(INTERACT_DIALOGUE);
    }

    pickupLantern() {
        this.lanternPickedUp = true;
        this.hasLantern = true;
        this._dialogueLock = false;
    }
}
