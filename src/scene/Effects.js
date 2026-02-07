import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class Effects {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.particles = [];
        this.time = 0;

        this.createDustParticles();
        this.setupPostProcessing();
    }

    setupPostProcessing() {
        try {
            // Create EffectComposer
            this.composer = new EffectComposer(this.renderer);
            this.composer.setSize(window.innerWidth, window.innerHeight);

            // Render pass
            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            // Bloom pass for lights, chrome, and emissive materials
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,  // Strength
                0.4,  // Radius
                0.85  // Threshold
            );
            this.composer.addPass(bloomPass);

            // Warm vintage color grading shader
            const colorGradingShader = {
                uniforms: {
                    'tDiffuse': { value: null },
                    'temperature': { value: 0.15 }, // Warm shift
                    'tint': { value: new THREE.Vector3(1.05, 1.03, 0.95) }, // Warm tint
                    'saturation': { value: 0.95 }, // Slight desaturation
                    'contrast': { value: 1.1 }, // +10% contrast
                    'brightness': { value: 1.0 },
                    'liftBlacks': { value: 0.15 } // Lifted blacks for film look
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float temperature;
                    uniform vec3 tint;
                    uniform float saturation;
                    uniform float contrast;
                    uniform float brightness;
                    uniform float liftBlacks;
                    varying vec2 vUv;

                    vec3 rgb2hsv(vec3 c) {
                        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                        float d = q.x - min(q.w, q.y);
                        float e = 1.0e-10;
                        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
                    }

                    vec3 hsv2rgb(vec3 c) {
                        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                    }

                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        
                        // Apply warm temperature shift
                        color.r += temperature;
                        color.g += temperature * 0.6;
                        
                        // Apply tint
                        color.rgb *= tint;
                        
                        // Saturation adjustment
                        vec3 hsv = rgb2hsv(color.rgb);
                        hsv.y *= saturation;
                        color.rgb = hsv2rgb(hsv);
                        
                        // Contrast and brightness
                        color.rgb = ((color.rgb - 0.5) * contrast + 0.5) * brightness;
                        
                        // Lift blacks (film look)
                        color.rgb = mix(vec3(liftBlacks), vec3(1.0), color.rgb);
                        
                        gl_FragColor = color;
                    }
                `
            };

            const colorGradingPass = new ShaderPass(colorGradingShader);
            this.composer.addPass(colorGradingPass);

            // Film grain shader (16mm stock emulation)
            const filmGrainShader = {
                uniforms: {
                    'tDiffuse': { value: null },
                    'time': { value: 0.0 },
                    'grainIntensity': { value: 0.18 }, // 15-20% opacity
                    'grainScale': { value: 2.5 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float time;
                    uniform float grainIntensity;
                    uniform float grainScale;
                    varying vec2 vUv;

                    // Pseudo-random noise function
                    float random(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                    }

                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        
                        // Animated grain
                        vec2 grainUv = vUv * grainScale;
                        float grain = random(grainUv + time) * 2.0 - 1.0;
                        
                        // Apply grain
                        color.rgb += grain * grainIntensity;
                        
                        gl_FragColor = color;
                    }
                `
            };

            this.filmGrainPass = new ShaderPass(filmGrainShader);
            this.composer.addPass(filmGrainPass);

            // Vignette shader
            const vignetteShader = {
                uniforms: {
                    'tDiffuse': { value: null },
                    'intensity': { value: 0.15 },
                    'roundness': { value: 0.3 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float intensity;
                    uniform float roundness;
                    varying vec2 vUv;

                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        
                        // Calculate vignette
                        vec2 center = vUv - 0.5;
                        float dist = length(center);
                        float vignette = smoothstep(roundness, roundness - intensity, dist);
                        
                        color.rgb *= vignette;
                        
                        gl_FragColor = color;
                    }
                `
            };

            const vignettePass = new ShaderPass(vignetteShader);
            this.composer.addPass(vignettePass);

            console.log('Post-processing initialized successfully');
        } catch (error) {
            console.error('Error setting up post-processing:', error);
            this.composer = null; // Fallback to direct rendering
        }
    }

    createDustParticles() {
        // Create floating dust particles for atmosphere (increased count)
        const particleCount = 1500; // Increased from 200
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            // Random position within garage bounds
            positions.push(
                (Math.random() - 0.5) * 35,
                Math.random() * 7,
                (Math.random() - 0.5) * 35
            );

            // Brownian motion - slow random drift
            velocities.push(
                (Math.random() - 0.5) * 0.005, // Slower, more realistic
                Math.random() * 0.002 + 0.001, // Slight upward drift
                (Math.random() - 0.5) * 0.005
            );

            // Varied particle sizes (1-3mm)
            sizes.push(Math.random() * 0.002 + 0.001);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        this.particleVelocities = velocities;

        const material = new THREE.PointsMaterial({
            color: 0xe6e6e6, // Neutral gray-white
            size: 0.03,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);
    }

    update(delta) {
        this.time += delta;

        // Update film grain animation
        if (this.filmGrainPass) {
            this.filmGrainPass.uniforms.time.value = this.time;
        }

        // Animate dust particles
        if (this.dustParticles) {
            const positions = this.dustParticles.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                // Update position with Brownian motion
                positions[i] += this.particleVelocities[i] * delta * 60;
                positions[i + 1] += this.particleVelocities[i + 1] * delta * 60;
                positions[i + 2] += this.particleVelocities[i + 2] * delta * 60;

                // Add slight random perturbation for realistic drift
                positions[i] += (Math.random() - 0.5) * 0.001;
                positions[i + 1] += (Math.random() - 0.5) * 0.001;
                positions[i + 2] += (Math.random() - 0.5) * 0.001;

                // Wrap around if out of bounds
                if (positions[i] > 17.5) positions[i] = -17.5;
                if (positions[i] < -17.5) positions[i] = 17.5;
                if (positions[i + 1] > 7) positions[i + 1] = 0;
                if (positions[i + 2] > 17.5) positions[i + 2] = -17.5;
                if (positions[i + 2] < -17.5) positions[i + 2] = 17.5;
            }

            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }
    }

    render() {
        // Use composer if available, otherwise fallback to direct rendering
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onResize() {
        // Update composer size
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

