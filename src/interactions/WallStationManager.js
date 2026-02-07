import * as THREE from 'three';
import { AboutStation } from './stations/AboutStation.js';
import { ProjectsStation } from './stations/ProjectsStation.js';
import { SkillsStation } from './stations/SkillsStation.js';
import { EducationStation } from './stations/EducationStation.js';
import { ContactStation } from './stations/ContactStation.js';

export class WallStationManager {
    constructor(scene, camera, uiManager) {
        this.scene = scene;
        this.camera = camera;
        this.uiManager = uiManager;
        this.stations = [];
        this.activeStation = null;
        this.interactionDistance = 3.5;

        this.setupKeyListener();
    }

    async load() {
        // Create all 5 wall stations
        const stationConfigs = [
            { class: AboutStation, position: new THREE.Vector3(0, 2, -19), name: 'ABOUT ME' },
            { class: ProjectsStation, position: new THREE.Vector3(-15, 2, -10), name: 'PROJECTS' },
            { class: SkillsStation, position: new THREE.Vector3(-19, 2, 5), name: 'SKILLS' },
            { class: EducationStation, position: new THREE.Vector3(15, 2, -10), name: 'EDUCATION' },
            { class: ContactStation, position: new THREE.Vector3(19, 2, 5), name: 'CONTACT' }
        ];

        for (const config of stationConfigs) {
            const station = new config.class(this.scene, config.position, config.name);
            await station.create();
            this.stations.push(station);
        }
    }

    setupKeyListener() {
        this.keyHandler = (event) => {
            if (event.key === 'e' || event.key === 'E') {
                if (this.activeStation && !this.uiManager.isPanelOpen()) {
                    this.openStation(this.activeStation);
                }
            }
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    update(cameraPosition, delta = 0) {
        if (this.uiManager.isPanelOpen()) {
            this.uiManager.hideInteractionPrompt();
            return;
        }

        // Update stations that have update methods (e.g., Contact terminal flicker)
        for (const station of this.stations) {
            if (station.update && typeof station.update === 'function') {
                station.update(delta);
            }
        }

        let nearestStation = null;
        let nearestDistance = Infinity;

        // Check distance to each station
        for (const station of this.stations) {
            const distance = cameraPosition.distanceTo(station.position);

            if (distance < this.interactionDistance && distance < nearestDistance) {
                nearestDistance = distance;
                nearestStation = station;
            }
        }

        // Update active station
        if (nearestStation !== this.activeStation) {
            this.activeStation = nearestStation;

            if (this.activeStation) {
                this.uiManager.showInteractionPrompt();
            } else {
                this.uiManager.hideInteractionPrompt();
            }
        }
    }

    openStation(station) {
        const content = station.getContent();
        this.uiManager.showContentPanel(content, station.name);
    }
}
