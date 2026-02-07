import * as THREE from 'three';

export class ThirdPersonControls {
    constructor(camera, domElement, scene, character) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        this.character = character;

        // Movement settings
        this.moveSpeed = 5.0;
        this.rotationSpeed = 3.0;

        // Camera settings
        this.cameraDistance = 5.0;
        this.cameraHeight = 2.5;
        this.cameraLookAtHeight = 1.5;

        // Current camera angles
        this.cameraAngleH = 0; // Horizontal angle
        this.cameraAngleV = 0.3; // Vertical angle (slight downward)

        // Key states
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Mouse control
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSensitivity = 0.002;

        // Collision
        this.carObject = null;

        this.setupEventListeners();
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

        // Mouse camera control (right-click drag)
        this.onMouseDown = (event) => {
            if (event.button === 2) { // Right mouse button
                this.isMouseDown = true;
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        };

        this.onMouseUp = (event) => {
            if (event.button === 2) {
                this.isMouseDown = false;
            }
        };

        this.onMouseMove = (event) => {
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.mouseX;
                const deltaY = event.clientY - this.mouseY;

                this.cameraAngleH -= deltaX * this.mouseSensitivity;
                this.cameraAngleV -= deltaY * this.mouseSensitivity;

                // Clamp vertical angle
                this.cameraAngleV = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraAngleV));

                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        };

        // Prevent context menu on right-click
        this.onContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('contextmenu', this.onContextMenu);
    }

    update(delta) {
        if (!this.character) return;

        // Calculate movement direction
        const moveDirection = new THREE.Vector3();

        if (this.moveForward) moveDirection.z -= 1;
        if (this.moveBackward) moveDirection.z += 1;
        if (this.moveLeft) moveDirection.x -= 1;
        if (this.moveRight) moveDirection.x += 1;

        // Normalize movement
        if (moveDirection.length() > 0) {
            moveDirection.normalize();

            // Store previous position for collision
            const previousPosition = this.character.position.clone();

            // Move character relative to camera direction
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

            const movement = new THREE.Vector3();
            movement.addScaledVector(cameraDirection, -moveDirection.z);
            movement.addScaledVector(right, moveDirection.x);
            movement.normalize();

            // Apply movement
            this.character.position.x += movement.x * this.moveSpeed * delta;
            this.character.position.z += movement.z * this.moveSpeed * delta;

            // Rotate character to face movement direction
            const targetRotation = Math.atan2(movement.x, movement.z);
            this.character.rotation.y = targetRotation;

            // Check car collision
            if (this.carObject) {
                const carPosition = new THREE.Vector3(0, 0.5, 0);
                const carRadius = 2.5;
                const characterDistance = this.character.position.distanceTo(carPosition);

                if (characterDistance < carRadius) {
                    this.character.position.copy(previousPosition);
                }
            }

            // Boundary collision (garage walls)
            if (this.character.position.x > 18) this.character.position.x = 18;
            if (this.character.position.x < -18) this.character.position.x = -18;
            if (this.character.position.z > 18) this.character.position.z = 18;
            if (this.character.position.z < -18) this.character.position.z = -18;
        }

        // Update camera position to follow character
        this.updateCamera();
    }

    updateCamera() {
        // Calculate camera position based on character position and angles
        const characterPos = this.character.position.clone();
        characterPos.y += this.cameraLookAtHeight;

        // Camera offset based on angles
        const offsetX = this.cameraDistance * Math.sin(this.cameraAngleH) * Math.cos(this.cameraAngleV);
        const offsetY = this.cameraDistance * Math.sin(this.cameraAngleV) + this.cameraHeight;
        const offsetZ = this.cameraDistance * Math.cos(this.cameraAngleH) * Math.cos(this.cameraAngleV);

        // Set camera position
        this.camera.position.x = characterPos.x + offsetX;
        this.camera.position.y = characterPos.y + offsetY;
        this.camera.position.z = characterPos.z + offsetZ;

        // Look at character
        this.camera.lookAt(characterPos);
    }

    setCarObject(carObject) {
        this.carObject = carObject;
    }

    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    }
}
