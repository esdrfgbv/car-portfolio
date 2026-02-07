import * as THREE from 'three';
import { gsap } from 'gsap';

export class CinematicIntro {
    constructor(camera, onComplete) {
        this.camera = camera;
        this.onComplete = onComplete;
        this.isPlaying = false;
        this.isComplete = false;

        // Store initial camera position
        this.startPosition = new THREE.Vector3(5, 2, 10);
        this.endPosition = new THREE.Vector3(-5, 2.5, 8);
        this.lookAtTarget = new THREE.Vector3(0, 1, 0);

        this.setupKeyListener();
    }

    start() {
        this.isPlaying = true;

        // Set initial camera position
        this.camera.position.copy(this.startPosition);
        this.camera.lookAt(this.lookAtTarget);

        // Animate camera pan
        gsap.to(this.camera.position, {
            x: this.endPosition.x,
            y: this.endPosition.y,
            z: this.endPosition.z,
            duration: 5,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(this.lookAtTarget);
            },
            onComplete: () => {
                this.isPlaying = false;
            }
        });
    }

    setupKeyListener() {
        this.keyHandler = (event) => {
            if (event.key === 'Enter' && !this.isComplete) {
                this.complete();
            }
        };

        window.addEventListener('keydown', this.keyHandler);
    }

    complete() {
        if (this.isComplete) return;

        this.isComplete = true;
        this.isPlaying = false;

        // Remove key listener
        window.removeEventListener('keydown', this.keyHandler);

        // Transition camera to first-person position
        gsap.to(this.camera.position, {
            x: 0,
            y: 1.6,
            z: 8,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        });
    }

    update(delta) {
        if (this.isPlaying) {
            // Camera animation is handled by GSAP
            this.camera.lookAt(this.lookAtTarget);
        }
    }
}
