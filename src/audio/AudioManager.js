export class AudioManager {
    constructor() {
        this.sounds = {};
        this.ambientSound = null;
        this.isLoaded = false;
    }

    async load() {
        // For now, we'll skip actual audio loading
        // In production, you would load audio files here
        this.isLoaded = true;
        return Promise.resolve();
    }

    playAmbient() {
        // Play ambient garage sounds
        // Not implemented to avoid audio file dependencies
        console.log('Ambient audio would play here');
    }

    playPanelSlide() {
        // Play panel sliding sound
        console.log('Panel slide sound would play here');
    }

    stopAmbient() {
        if (this.ambientSound) {
            this.ambientSound.pause();
        }
    }
}
