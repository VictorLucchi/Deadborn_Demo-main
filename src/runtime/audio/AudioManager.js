import introMusic  from "../../assets/audio/music/Theme-default-opening.mp3";
import ambientMusic from "../../assets/audio/music/Theme-default-looping.mp3";
import rainSound    from "../../assets/audio/ambient/rain.mp3";
import hadesVoice   from "../../assets/audio/introdução/Hades.mp3";
import ayaVoice     from "../../assets/audio/introdução/Aya1.mp3";

export class AudioManager {

    constructor() {
        this.currentMusic = null;
        this._rainFadeInterval = null;
        this._onHadesEnded = null;
        this._onAyaEnded = null;

        this.introMusic  = new Audio(introMusic);
        this.ambientMusic = new Audio(ambientMusic);
        this.rain        = new Audio(rainSound);
        this.hadesAudio  = new Audio(hadesVoice);
        this.ayaAudio    = new Audio(ayaVoice);
        
        this.hadesAudio.volume   = 1.0;
        this.ayaAudio.volume    = 0.7;
        this.introMusic.volume  = 0.7;
        this.ambientMusic.volume = 0.8;
        this.ambientMusic.loop  = true;
        this.rain.loop          = true;
        this.rain.volume        = 0.5;

        this.introMusic.addEventListener("ended", () => {
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
                    this.rain.volume = Math.max(0, this.rain.volume - volumeStep);
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

            this.ayaAudio.addEventListener("ended", this._onAyaEnded, { once: true });
        };

        this.hadesAudio.addEventListener("ended", this._onHadesEnded, { once: true });
    }

    playBackgroundMusic() {
        if (this.currentMusic && !this.currentMusic.paused) return;

        this.stop();

        this.currentMusic = this.introMusic;
        this.currentMusic.currentTime = 0;
        this.currentMusic.play().catch(() => {});

        this.rain.currentTime = 0;
        this.rain.volume = 0.5;
        this.rain.play().catch(() => {});
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
    }

    _stopRainFade() {
        if (this._rainFadeInterval !== null) {
            clearInterval(this._rainFadeInterval);
            this._rainFadeInterval = null;
        }
    }

    _clearIntroListeners() {
        if (this._onHadesEnded) {
            this.hadesAudio.removeEventListener("ended", this._onHadesEnded);
            this._onHadesEnded = null;
        }

        if (this._onAyaEnded) {
            this.ayaAudio.removeEventListener("ended", this._onAyaEnded);
            this._onAyaEnded = null;
        }
    }

}
