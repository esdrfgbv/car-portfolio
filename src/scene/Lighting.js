import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.createLights();
    }

    createLights() {
        // Warm ambient light for vintage garage (golden hour feel)
        const ambient = new THREE.AmbientLight(0xffcc99, 0.8);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Dramatic hero spotlight on BMW (warm white)
        const carSpotlight = new THREE.SpotLight(0xffffee, 300);
        carSpotlight.position.set(0, 7, 0);
        carSpotlight.angle = Math.PI / 5;
        carSpotlight.penumbra = 0.4;
        carSpotlight.decay = 2;
        carSpotlight.distance = 20;
        carSpotlight.castShadow = true;
        carSpotlight.shadow.mapSize.width = 1024;
        carSpotlight.shadow.mapSize.height = 1024;
        carSpotlight.shadow.camera.near = 1;
        carSpotlight.shadow.camera.far = 20;
        this.scene.add(carSpotlight);
        this.scene.add(carSpotlight.target);
        carSpotlight.target.position.set(0, 0, 0);
        this.lights.push(carSpotlight);

        // Warm tungsten pendant lights (industrial vintage style)
        const pendantPositions = [
            [-12, 7, -12],
            [12, 7, -12],
            [-12, 7, 12],
            [12, 7, 12],
            [0, 7, -12],
            [0, 7, 12]
        ];

        pendantPositions.forEach(pos => {
            // Warm tungsten point light
            const pendantLight = new THREE.PointLight(0xffaa66, 60, 20, 2);
            pendantLight.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(pendantLight);
            this.lights.push(pendantLight);

            // Visual pendant lamp fixture
            const lampShade = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 0.4, 8),
                new THREE.MeshBasicMaterial({
                    color: 0x2a2a2a,
                    side: THREE.DoubleSide
                })
            );
            lampShade.position.set(pos[0], pos[1] + 0.3, pos[2]);
            lampShade.rotation.x = Math.PI;
            this.scene.add(lampShade);

            // Glowing bulb
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffaa66,
                    fog: false
                })
            );
            bulb.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(bulb);
        });

        // Warm hemisphere light for natural fill (golden hour)
        const hemiLight = new THREE.HemisphereLight(0xffddaa, 0x8b7355, 1.5);
        hemiLight.position.set(0, 8, 0);
        this.scene.add(hemiLight);
        this.lights.push(hemiLight);

        // Warm directional light simulating window light (god rays source)
        const windowLight = new THREE.DirectionalLight(0xffeedd, 2.0);
        windowLight.position.set(15, 10, 0);
        windowLight.castShadow = false; // No shadows for atmospheric light
        this.scene.add(windowLight);
        this.lights.push(windowLight);
    }

    update(delta) {
        // Optional: Add subtle light flickering for industrial feel
        // Not implemented to maintain performance
    }

    getSpotlights() {
        // Return all spotlights for volumetric lighting enhancement
        return this.lights.filter(light => light.isSpotLight);
    }
}
