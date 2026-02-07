import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class CarModel {
    constructor(scene, platform) {
        this.scene = scene;
        this.platform = platform;
        this.car = null;
        this.loader = new GLTFLoader();
    }

    // Called by main app
    async load() {
        return this.loadRealCarModel();
    }

    // ===== LOAD REAL GLB MODEL =====
    loadRealCarModel() {
        return new Promise((resolve, reject) => {

            // IMPORTANT: file must be inside public/models/
            const modelPath = '/models/bmw_m4_modified_widebody_knitro_builds.glb';

            this.loader.load(
                modelPath,

                // SUCCESS
                (gltf) => {
                    this.car = gltf.scene;

                    // -------------------------
                    // SCALE (you WILL need this)
                    // -------------------------
                    // Adjusted for perfect garage fit
                    this.car.scale.set(0.25, 0.25, 0.25);

                    // Position on platform
                    this.car.position.set(0, 0.5, 0);

                    // Slight cinematic angle
                    this.car.rotation.y = Math.PI / 6;

                    // -------------------------
                    // FIX MATERIALS + SHADOWS
                    // -------------------------
                    this.car.traverse((child) => {

                        if (child.isMesh) {

                            // enable shadows
                            child.castShadow = true;
                            child.receiveShadow = true;

                            // Improve PBR response
                            if (child.material) {

                                // Many GLB models come too dark
                                child.material.envMapIntensity = 1.6;

                                // Prevent over-darkening
                                if (child.material.metalness !== undefined)
                                    child.material.metalness *= 0.95;

                                if (child.material.roughness !== undefined)
                                    child.material.roughness *= 1.05;

                                child.material.needsUpdate = true;
                            }
                        }
                    });

                    // Add to scene
                    this.scene.add(this.car);

                    console.log("BMW GLB model loaded successfully");
                    resolve();
                },

                // PROGRESS (optional log)
                (xhr) => {
                    console.log(`Car Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
                },

                // ERROR
                (error) => {
                    console.error("Error loading car model:", error);
                    reject(error);
                }
            );
        });
    }

    // Keep your rotation logic (VERY IMPORTANT)
    update(delta) {
        if (this.car && this.platform) {
            this.car.rotation.y += this.platform.rotationSpeed * delta;
        }
    }
}
