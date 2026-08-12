import introMusic from "../../assets/audio/music/Theme-default-opening.mp3";
import ambientMusic from "../../assets/audio/music/Theme-default-looping.mp3";

export class AudioManager {

    constructor() {

        this.currentMusic = null;

        this.introMusic = new Audio(introMusic);
        this.ambientMusic = new Audio(ambientMusic);

        this.ambientMusic.loop = true;

        // Quando a intro terminar...
        this.introMusic.addEventListener("ended", () => {

           if (this.currentMusic !== this.ambientMusic){
            this.currentMusic = this.ambientMusic;
            this.currentMusic.currentTime = 0;
            this.currentMusic.play();

           }
        });

    }

    playBackgroundMusic() {

        this.stop();

        this.currentMusic = this.introMusic;
        this.currentMusic.currentTime = 0;
        this.currentMusic.play();

    }

    stop() {

        if (!this.currentMusic) return;

        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;

    }

}