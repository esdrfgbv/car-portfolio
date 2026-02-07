import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.character = null;
        this.loader = new GLTFLoader();
    }

    async load() {
        // Try to load a character model, fallback to placeholder
        return this.createPlaceholderCharacter();

        // UNCOMMENT THIS when you have a Mahesh Babu model:
        // return this.loadCharacterModel();
    }

    // Load real character model (for when you have Mahesh Babu GLB)
    loadCharacterModel() {
        return new Promise((resolve, reject) => {
            const modelPath = '/models/mahesh_babu.glb'; // Place your model here

            this.loader.load(
                modelPath,
                (gltf) => {
                    this.character = gltf.scene;

                    // Scale character appropriately
                    this.character.scale.set(1.0, 1.0, 1.0);

                    // Position character
                    this.character.position.set(0, 0, 5);

                    // Enable shadows
                    this.character.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.scene.add(this.character);
                    console.log('Character model loaded');
                    resolve();
                },
                (xhr) => {
                    console.log(`Character loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
                },
                (error) => {
                    console.error('Error loading character:', error);
                    // Fallback to placeholder
                    this.createPlaceholderCharacter().then(resolve);
                }
            );
        });
    }

    // Placeholder character (simple human-like shape)
    createPlaceholderCharacter() {
        return new Promise((resolve) => {
            this.character = new THREE.Group();

            // Materials
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a4d6e, // Blue shirt
                roughness: 0.7,
                metalness: 0.1
            });

            const skinMaterial = new THREE.MeshStandardMaterial({
                color: 0xffdbac, // Skin tone
                roughness: 0.8,
                metalness: 0.0
            });

            const pantsMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a, // Black pants
                roughness: 0.8,
                metalness: 0.1
            });

            const hairMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a, // Black hair
                roughness: 0.6,
                metalness: 0.2
            });

            // Head
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const head = new THREE.Mesh(headGeometry, skinMaterial);
            head.position.y = 1.65;
            head.castShadow = true;
            this.character.add(head);

            // Hair
            const hairGeometry = new THREE.SphereGeometry(0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.y = 1.75;
            hair.castShadow = true;
            this.character.add(hair);

            // Torso
            const torsoGeometry = new THREE.CylinderGeometry(0.25, 0.28, 0.8, 16);
            const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
            torso.position.y = 1.1;
            torso.castShadow = true;
            this.character.add(torso);

            // Arms
            const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);

            const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
            leftArm.position.set(-0.35, 1.1, 0);
            leftArm.rotation.z = 0.2;
            leftArm.castShadow = true;
            this.character.add(leftArm);

            const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
            rightArm.position.set(0.35, 1.1, 0);
            rightArm.rotation.z = -0.2;
            rightArm.castShadow = true;
            this.character.add(rightArm);

            // Hands
            const handGeometry = new THREE.SphereGeometry(0.09, 8, 8);

            const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
            leftHand.position.set(-0.42, 0.7, 0);
            leftHand.castShadow = true;
            this.character.add(leftHand);

            const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
            rightHand.position.set(0.42, 0.7, 0);
            rightHand.castShadow = true;
            this.character.add(rightHand);

            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 8);

            const leftLeg = new THREE.Mesh(legGeometry, pantsMaterial);
            leftLeg.position.set(-0.15, 0.25, 0);
            leftLeg.castShadow = true;
            this.character.add(leftLeg);

            const rightLeg = new THREE.Mesh(legGeometry, pantsMaterial);
            rightLeg.position.set(0.15, 0.25, 0);
            rightLeg.castShadow = true;
            this.character.add(rightLeg);

            // Shoes
            const shoeGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.25);
            const shoeMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.7,
                metalness: 0.2
            });

            const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
            leftShoe.position.set(-0.15, -0.15, 0.05);
            leftShoe.castShadow = true;
            this.character.add(leftShoe);

            const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
            rightShoe.position.set(0.15, -0.15, 0.05);
            rightShoe.castShadow = true;
            this.character.add(rightShoe);

            // Position character in scene
            this.character.position.set(0, 0, 5);

            this.scene.add(this.character);
            console.log('Placeholder character created');
            resolve();
        });
    }

    getCharacter() {
        return this.character;
    }

    update(delta) {
        // Animation updates can go here
        // For example, walking animation when moving
    }
}
