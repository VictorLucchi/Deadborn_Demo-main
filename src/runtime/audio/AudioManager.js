import introMusic from "../../assets/audio/music/Theme-default-opening.mp3";
import ambientMusic from "../../assets/audio/music/Theme-default-looping.mp3";
import tensionMusic from "../../assets/audio/music/tensão-interna.mp3";
import lutoMusic from "../../assets/audio/music/luto.mp3";

import rainSound from "../../assets/audio/ambient/rain.mp3";
import hadesVoice from "../../assets/audio/introdução/Hades.mp3";
import ayaVoice from "../../assets/audio/introdução/Aya1.mp3";

import brokenSound from "../../assets/audio/SFX/broken.mp3";
import diaryWritingSound from "../../assets/audio/SFX/escrita.mp3";

export class AudioManager {

    constructor() {
        this.currentMusic = null;

        this._rainFadeInterval = null;
        this._onHadesEnded = null;
        this._onAyaEnded = null;
        this._onIntroComplete = null;

        // Indica que o piano já mudou o estado musical do jogo.
        this._internalTensionActive = false;

        this.introMusic = new Audio(introMusic);
        this.ambientMusic = new Audio(ambientMusic);
        this.tensionMusic = new Audio(tensionMusic);
        this.lutoMusic = new Audio(lutoMusic);

        this.rain = new Audio(rainSound);

        this.hadesAudio = new Audio(hadesVoice);
        this.ayaAudio = new Audio(ayaVoice);

        this.brokenSound = new Audio(brokenSound);
        this.diaryWritingAudio = new Audio(diaryWritingSound);

        // Volumes
        this.hadesAudio.volume = 1.0;
        this.ayaAudio.volume = 0.7;

        this.introMusic.volume = 0.6;
        this.ambientMusic.volume = 0.6;
        this.tensionMusic.volume = 0.4;
        this.lutoMusic.volume = 0.7;

        this.rain.volume = 0.5;

        this.brokenSound.volume = 1.0;
        this.diaryWritingAudio.volume = 0.65;

        // Loops
        this.ambientMusic.loop = true;
        this.tensionMusic.loop = true;
        this.rain.loop = true;

        // Quando a música de abertura terminar,
        // normalmente entra a música ambiente.
        this.introMusic.addEventListener("ended", () => {
            if (this._internalTensionActive) {
                this.currentMusic = this.tensionMusic;
                this.currentMusic.currentTime = 0;
                this.currentMusic.play().catch(() => {});
                return;
            }

            if (this.currentMusic !== this.ambientMusic) {
                this.currentMusic = this.ambientMusic;
                this.currentMusic.currentTime = 0;
                this.currentMusic.play().catch(() => {});
            }
        });
    }

    skipIntro() {
        this._stopRainFade();
        this._clearIntroListeners();

        this.hadesAudio.pause();
        this.hadesAudio.currentTime = 0;

        this.ayaAudio.pause();
        this.ayaAudio.currentTime = 0;

        this.rain.volume = 0;
        this.rain.pause();

        this._onIntroComplete = null;
    }

    playIntro({ onHadesStart, onAyaStart, onComplete } = {}) {
        this._stopRainFade();
        this._clearIntroListeners();

        this._onIntroComplete = onComplete;

        // Chuva alta
        this.rain.volume = 0.9;
        this.rain.currentTime = 0;
        this.rain.play().catch(() => {});

        // Toca Hades
        this.hadesAudio.currentTime = 0;
        this.hadesAudio.play().catch(() => {});
        onHadesStart?.();

        this._onHadesEnded = () => {
            this._onHadesEnded = null;

            // Toca Aya e faz fade da chuva
            this.ayaAudio.currentTime = 0;
            this.ayaAudio.play().catch(() => {});
            onAyaStart?.();

            const fadeDuration = this.ayaAudio.duration || 10;
            const steps = 60;
            const interval = (fadeDuration * 1000) / steps;
            const volumeStep = this.rain.volume / steps;

            this._rainFadeInterval = setInterval(() => {
                if (this.rain.volume > volumeStep) {
                    this.rain.volume = Math.max(
                        0,
                        this.rain.volume - volumeStep
                    );
                } else {
                    this.rain.volume = 0;
                    this._stopRainFade();
                }
            }, interval);

            this._onAyaEnded = () => {
                this._onAyaEnded = null;

                this._stopRainFade();
                this.rain.volume = 0;

                this._onIntroComplete?.();
                this._onIntroComplete = null;
            };

            this.ayaAudio.addEventListener(
                "ended",
                this._onAyaEnded,
                { once: true }
            );
        };

        this.hadesAudio.addEventListener(
            "ended",
            this._onHadesEnded,
            { once: true }
        );
    }

    playBackgroundMusic() {
        /*
         * Se o piano já foi tocado, a música normal
         * não deve voltar.
         */
        if (this._internalTensionActive) {
            if (this.tensionMusic.paused) {
                this.tensionMusic.play().catch(() => {});
            }

            this.currentMusic = this.tensionMusic;
            return;
        }

        if (this.currentMusic && !this.currentMusic.paused) {
            return;
        }

        this.stop();

        this.currentMusic = this.introMusic;
        this.currentMusic.currentTime = 0;
        this.currentMusic.play().catch(() => {});

        this.rain.currentTime = 0;
        this.rain.volume = 0.5;
        this.rain.play().catch(() => {});
    }

    /*
     * Ativa o novo estado musical do jogo.
     *
     * O piano chama esta função.
     *
     * broken.mp3 toca uma vez.
     * A música atual para.
     * tensão-interna.mp3 assume e fica em loop.
     */
    activateInternalTension() {
        if (this._internalTensionActive) {
            return;
        }

        this._internalTensionActive = true;

        // Som do piano
        this.brokenSound.currentTime = 0;
        this.brokenSound.play().catch(() => {});

        // Para a música temática atual.
        // A chuva NÃO é interrompida.
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        // Inicia a música de tensão.
        this.currentMusic = this.tensionMusic;
        this.currentMusic.currentTime = 0;
        this.currentMusic.play().catch(() => {});
    }

    /*
     * Toca o som/música associado às partituras.
     *
     * A música de tensão continua como música principal.
     * luto.mp3 é tratado como uma reprodução independente.
     */
    playLuto() {
        this.lutoMusic.currentTime = 0;
        this.lutoMusic.play().catch(() => {});
    }

    playDiaryWriting() {
        this.diaryWritingAudio.currentTime = 0;
        this.diaryWritingAudio.play().catch(() => {});
    }

    stop() {
        this._stopRainFade();
        this._clearIntroListeners();

        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        this.rain.pause();
        this.rain.currentTime = 0;

        this.hadesAudio.pause();
        this.hadesAudio.currentTime = 0;

        this.ayaAudio.pause();
        this.ayaAudio.currentTime = 0;

        this.brokenSound.pause();
        this.brokenSound.currentTime = 0;

        this.diaryWritingAudio.pause();
        this.diaryWritingAudio.currentTime = 0;

        this.lutoMusic.pause();
        this.lutoMusic.currentTime = 0;
    }

    _stopRainFade() {
        if (this._rainFadeInterval !== null) {
            clearInterval(this._rainFadeInterval);
            this._rainFadeInterval = null;
        }
    }

    _clearIntroListeners() {
        if (this._onHadesEnded) {
            this.hadesAudio.removeEventListener(
                "ended",
                this._onHadesEnded
            );

            this._onHadesEnded = null;
        }

        if (this._onAyaEnded) {
            this.ayaAudio.removeEventListener(
                "ended",
                this._onAyaEnded
            );

            this._onAyaEnded = null;
        }
    }
}