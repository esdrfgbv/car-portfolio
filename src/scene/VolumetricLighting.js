import * as THREE from 'three';

export class VolumetricLighting {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.godRays = [];
        this.volumetricSpotlights = [];
        this.time = 0;
    }

    createWindowGodRays() {
        // Late afternoon sun streaming through windows
        // Position: High windows on the right wall (east-facing)

        const godRayPositions = [
            { pos: new THREE.Vector3(18, 5, 5), target: new THREE.Vector3(0, 0, 5) },
            { pos: new THREE.Vector3(18, 5, 0), target: new THREE.Vector3(0, 0, 0) },
            { pos: new THREE.Vector3(18, 5, -5), target: new THREE.Vector3(0, 0, -5) }
        ];

        godRayPositions.forEach((config, index) => {
            // Main directional light for god ray
            const godRayLight = new THREE.SpotLight(
                0xffcc88, // Warm late afternoon color (3800K)
                150,      // Intensity
                25,       // Distance
                Math.PI / 6, // Angle (30 degrees)
                0.3,      // Penumbra (soft edges)
                1.5       // Decay
            );

            godRayLight.position.copy(config.pos);
            godRayLight.target.position.copy(config.target);
            godRayLight.castShadow = true;
            godRayLight.shadow.mapSize.width = 1024;
            godRayLight.shadow.mapSize.height = 1024;
            godRayLight.shadow.camera.near = 0.5;
            godRayLight.shadow.camera.far = 30;

            this.scene.add(godRayLight);
            this.scene.add(godRayLight.target);
            this.godRays.push(godRayLight);

            // Volumetric light beam (visible cone)
            this.createVolumetricCone(config.pos, config.target, index);
        });

        console.log('Window god rays created');
    }

    createVolumetricCone(position, target, index) {
        // Create a cone geometry to represent the visible light beam
        const direction = new THREE.Vector3().subVectors(target, position).normalize();
        const distance = position.distanceTo(target);

        // Cone parameters
        const angle = Math.PI / 6; // 30 degrees
        const radius = Math.tan(angle) * distance;

        const coneGeometry = new THREE.ConeGeometry(radius, distance, 32, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc88,
            transparent: true,
            opacity: 0.08, // Very subtle
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const cone = new THREE.Mesh(coneGeometry, coneMaterial);

        // Position and orient the cone
        cone.position.copy(position);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(
            new THREE.Vector3(0, -1, 0),
            direction
        );
        cone.quaternion.copy(quaternion);
        cone.position.add(direction.multiplyScalar(distance / 2));

        this.scene.add(cone);
        this.volumetricSpotlights.push({ mesh: cone, baseOpacity: 0.08 });
    }

    createAtmosphericFog() {
        // Exponential fog for depth and atmosphere
        this.scene.fog = new THREE.FogExp2(0x1a1a1a, 0.015); // Density: 0.015

        console.log('Atmospheric fog created');
    }

    createVolumetricDustInLightBeams() {
        // Enhanced dust particles that are more visible in light beams
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            // Concentrate particles in the god ray areas
            const inGodRay = Math.random() > 0.6;

            if (inGodRay) {
                // Particles in god ray zones (right side of garage)
                positions.push(
                    Math.random() * 18 + 5,  // X: 5 to 23 (right side)
                    Math.random() * 6,       // Y: 0 to 6
                    (Math.random() - 0.5) * 20 // Z: -10 to 10
                );
                // Warmer color for particles in light
                colors.push(1.0, 0.95, 0.8);
            } else {
                // General particles throughout garage
                positions.push(
                    (Math.random() - 0.5) * 35,
                    Math.random() * 7,
                    (Math.random() - 0.5) * 35
                );
                // Neutral color
                colors.push(0.9, 0.9, 0.9);
            }

            sizes.push(Math.random() * 0.05 + 0.02);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.04,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.lightBeamDust = new THREE.Points(geometry, material);
        this.scene.add(this.lightBeamDust);

        console.log('Volumetric dust particles created');
    }

    enhanceSpotlights(existingSpotlights) {
        // Add volumetric cones to existing pendant lights
        existingSpotlights.forEach((spotlight, index) => {
            if (spotlight.isSpotLight) {
                const position = spotlight.position.clone();
                const target = spotlight.target.position.clone();

                // Create subtle volumetric cone for each spotlight
                const direction = new THREE.Vector3().subVectors(target, position).normalize();
                const distance = position.distanceTo(target);
                const angle = spotlight.angle;
                const radius = Math.tan(angle) * distance;

                const coneGeometry = new THREE.ConeGeometry(radius, distance, 16, 1, true);
                const coneMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffeecc,
                    transparent: true,
                    opacity: 0.05,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                });

                const cone = new THREE.Mesh(coneGeometry, coneMaterial);
                cone.position.copy(position);

                const quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors(
                    new THREE.Vector3(0, -1, 0),
                    direction
                );
                cone.quaternion.copy(quaternion);
                cone.position.add(direction.multiplyScalar(distance / 2));

                this.scene.add(cone);
                this.volumetricSpotlights.push({ mesh: cone, baseOpacity: 0.05 });
            }
        });

        console.log('Enhanced spotlights with volumetric effects');
    }

    createHeroSpotlight() {
        // Dramatic spotlight focused on the BMW M5
        const heroLight = new THREE.SpotLight(
            0xffffff,
            200,          // High intensity
            20,           // Distance
            Math.PI / 5,  // Wider angle
            0.4,          // Soft penumbra
            1.8           // Decay
        );

        heroLight.position.set(0, 6.5, 8); // Above and in front of car
        heroLight.target.position.set(0, 1, 0); // Aimed at car center
        heroLight.castShadow = true;
        heroLight.shadow.mapSize.width = 2048;
        heroLight.shadow.mapSize.height = 2048;
        heroLight.shadow.camera.near = 1;
        heroLight.shadow.camera.far = 25;

        this.scene.add(heroLight);
        this.scene.add(heroLight.target);

        // Volumetric cone for hero light
        const direction = new THREE.Vector3().subVectors(
            heroLight.target.position,
            heroLight.position
        ).normalize();
        const distance = heroLight.position.distanceTo(heroLight.target.position);
        const radius = Math.tan(heroLight.angle) * distance;

        const coneGeometry = new THREE.ConeGeometry(radius, distance, 32, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.copy(heroLight.position);

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(
            new THREE.Vector3(0, -1, 0),
            direction
        );
        cone.quaternion.copy(quaternion);
        cone.position.add(direction.multiplyScalar(distance / 2));

        this.scene.add(cone);
        this.volumetricSpotlights.push({ mesh: cone, baseOpacity: 0.12 });
        this.heroLight = heroLight;

        console.log('Hero spotlight created');
    }

    update(delta) {
        this.time += delta;

        // Subtle pulsing of volumetric light beams (breathing effect)
        this.volumetricSpotlights.forEach((spotlight, index) => {
            const pulse = Math.sin(this.time * 0.5 + index * 0.5) * 0.02;
            spotlight.mesh.material.opacity = spotlight.baseOpacity + pulse;
        });

        // Animate god rays (subtle intensity variation - sun through clouds)
        this.godRays.forEach((godRay, index) => {
            const flicker = Math.sin(this.time * 0.3 + index) * 0.1;
            godRay.intensity = 150 + flicker * 20;
        });

        // Slow rotation of light beam dust
        if (this.lightBeamDust) {
            this.lightBeamDust.rotation.y += delta * 0.05;
        }
    }

    initialize(existingSpotlights = []) {
        this.createWindowGodRays();
        this.createAtmosphericFog();
        this.createVolumetricDustInLightBeams();
        this.createHeroSpotlight();

        if (existingSpotlights.length > 0) {
            this.enhanceSpotlights(existingSpotlights);
        }

        console.log('Volumetric lighting system initialized');
    }
}
