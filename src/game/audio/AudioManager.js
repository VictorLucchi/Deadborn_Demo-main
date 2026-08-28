import introMusic from "../../assets/audio/music/Theme-default-opening.mp3";
import ambientMusic from "../../assets/audio/music/Theme-default-looping.mp3";
import rainSound from "../../assets/audio/ambient/rain.mp3";

export class AudioManager {

    constructor() {
        this.currentMusic = null;

        this.introMusic = new Audio(introMusic);
        this.ambientMusic = new Audio(ambientMusic);
        this.rain = new Audio(rainSound);

        this.introMusic.volume = 0.7;
        this.ambientMusic.volume = 0.8
        this.ambientMusic.loop = true;
        this.rain.loop = true;
        this.rain.volume = 0.5;

        this.introMusic.addEventListener("ended", () => {
            if (this.currentMusic !== this.ambientMusic) {
                this.currentMusic = this.ambientMusic;
                this.currentMusic.currentTime = 0;
                this.currentMusic.play();
            }
        });
    }

    playBackgroundMusic() {
        if (this.currentMusic && !this.currentMusic.paused) return;

        this.stop();

        this.currentMusic = this.introMusic;
        this.currentMusic.currentTime = 0;
        this.currentMusic.play();

        this.rain.currentTime = 0;
        this.rain.play();
    }

    stop() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        this.rain.pause();
        this.rain.currentTime = 0;
    }

}