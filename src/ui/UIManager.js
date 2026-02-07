export class UIManager {
    constructor() {
        this.introOverlay = document.getElementById('intro-overlay');
        this.interactionPrompt = document.getElementById('interaction-prompt');
        this.controlsGuide = document.getElementById('controls-guide');
        this.contentPanel = document.getElementById('content-panel');
        this.panelContent = document.getElementById('panel-content');

        this.currentStation = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // ESC key to close panel
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !this.contentPanel.classList.contains('hidden')) {
                this.hideContentPanel();
            }
        });
    }

    showIntro() {
        this.introOverlay.classList.remove('hidden');
    }

    hideIntro() {
        this.introOverlay.classList.add('hidden');
    }

    showInteractionPrompt() {
        this.interactionPrompt.classList.remove('hidden');
    }

    hideInteractionPrompt() {
        this.interactionPrompt.classList.add('hidden');
    }

    showControlsGuide() {
        this.controlsGuide.classList.remove('hidden');
    }

    hideControlsGuide() {
        this.controlsGuide.classList.add('hidden');
    }

    showContentPanel(content, stationName) {
        this.currentStation = stationName;
        this.panelContent.innerHTML = content;
        this.contentPanel.classList.remove('hidden');
    }

    hideContentPanel() {
        this.contentPanel.classList.add('hidden');
        this.currentStation = null;
    }

    isPanelOpen() {
        return !this.contentPanel.classList.contains('hidden');
    }
}
