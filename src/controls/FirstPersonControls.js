import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class FirstPersonControls {
    constructor(camera, domElement, scene) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;

        // Movement (5x faster for quick navigation)
        this.moveSpeed = 175.0;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Key states
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Pointer lock controls
        this.controls = new PointerLockControls(camera, domElement);

        // Collision detection
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 2);
        this.collisionDistance = 1.0;

        this.setupEventListeners();
        this.lockPointer();
    }

    setupEventListeners() {
        // Keyboard controls
        this.onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        };

        this.onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);

        // Re-lock pointer on click if unlocked
        this.domElement.addEventListener('click', () => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            }
        });
    }

    lockPointer() {
        this.controls.lock();
    }

    update(delta) {
        if (!this.controls.isLocked) return;

        // Deceleration
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        // Movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        // Apply movement
        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.moveSpeed * delta;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.moveSpeed * delta;
        }

        // Store current position before moving
        const previousPosition = this.camera.position.clone();

        // Apply movement
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);

        // Check car collision
        if (this.carObject) {
            const carPosition = new THREE.Vector3(0, 0.5, 0); // Car center position
            const carRadius = 2.5; // Collision radius around car
            const playerDistance = this.camera.position.distanceTo(carPosition);

            // If too close to car, revert movement
            if (playerDistance < carRadius) {
                this.camera.position.copy(previousPosition);
            }
        }

        // Simple boundary collision (garage walls)
        if (this.camera.position.x > 18) this.camera.position.x = 18;
        if (this.camera.position.x < -18) this.camera.position.x = -18;
        if (this.camera.position.z > 18) this.camera.position.z = 18;
        if (this.camera.position.z < -18) this.camera.position.z = -18;

        // Keep camera at eye level
        this.camera.position.y = 1.6;
    }

    // Method to set the car object for collision detection
    setCarObject(carObject) {
        this.carObject = carObject;
    }

    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.controls.dispose();
    }
}
