import * as THREE from 'three';

export class Platform {
    constructor(scene) {
        this.scene = scene;
        this.platform = null;
        this.rotationSpeed = 0.1;
        this.isRotating = true;

        this.create();
    }

    create() {
        // Hexagonal platform
        const shape = new THREE.Shape();
        const radius = 2.5;
        const sides = 6;

        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }
        shape.closePath();

        const extrudeSettings = {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 3
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0x003333,
            emissiveIntensity: 0.2
        });

        this.platform = new THREE.Mesh(geometry, material);
        this.platform.rotation.x = -Math.PI / 2;
        this.platform.position.y = 0.15;
        this.platform.castShadow = true;
        this.platform.receiveShadow = true;
        this.scene.add(this.platform);

        // Underglow effect
        const underglowGeometry = new THREE.RingGeometry(2.3, 2.6, 32);
        const underglowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        const underglow = new THREE.Mesh(underglowGeometry, underglowMaterial);
        underglow.rotation.x = -Math.PI / 2;
        underglow.position.y = 0.05;
        this.scene.add(underglow);

        // Add point light for underglow
        const underglowLight = new THREE.PointLight(0x00ffff, 10, 5);
        underglowLight.position.set(0, 0.2, 0);
        this.scene.add(underglowLight);
    }

    update(delta) {
        if (this.isRotating && this.platform) {
            this.platform.rotation.z += this.rotationSpeed * delta;
        }
    }

    pauseRotation() {
        this.isRotating = false;
    }

    resumeRotation() {
        this.isRotating = true;
    }

    getPosition() {
        return this.platform ? this.platform.position : new THREE.Vector3(0, 0, 0);
    }
}
