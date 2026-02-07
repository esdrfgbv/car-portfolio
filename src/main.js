import '../style.css';
import * as THREE from 'three';
import { Environment } from './scene/Environment.js';
import { Lighting } from './scene/Lighting.js';
import { VolumetricLighting } from './scene/VolumetricLighting.js';
import { Effects } from './scene/Effects.js';
import { CarModel } from './car/CarModel.js';
import { Platform } from './car/Platform.js';
import { CinematicIntro } from './controls/CinematicIntro.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { WallStationManager } from './interactions/WallStationManager.js';
import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './audio/AudioManager.js';

class GaragePortfolio {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.loadingProgress = 0;
    this.isIntroComplete = false;
    this.isExploring = false;

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    // No fog for bright garage aesthetic

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 8);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2, // Only use antialiasing on low DPI screens
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Faster than PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Clock for animations
    this.clock = new THREE.Clock();

    // Initialize systems
    this.initSystems();

    // Start loading
    this.loadAssets();

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start render loop
    this.animate();
  }

  initSystems() {
    // Environment
    this.environment = new Environment(this.scene);

    // Lighting
    this.lighting = new Lighting(this.scene);

    // Volumetric Lighting (DISABLED per user request)
    // this.volumetricLighting = new VolumetricLighting(this.scene, this.camera, this.renderer);

    // Effects
    this.effects = new Effects(this.scene, this.camera, this.renderer);

    // Car and platform
    this.platform = new Platform(this.scene);
    this.car = new CarModel(this.scene, this.platform);

    // UI Manager
    this.uiManager = new UIManager();

    // Audio Manager
    this.audioManager = new AudioManager();

    // Controls (will be activated after intro)
    this.cinematicIntro = new CinematicIntro(this.camera, () => {
      this.startExploration();
    });

    // Wall stations
    this.wallStations = new WallStationManager(this.scene, this.camera, this.uiManager);
  }

  async loadAssets() {
    try {
      // Simulate loading progress
      this.updateLoadingProgress(20);

      // Load environment
      await this.environment.load();
      this.updateLoadingProgress(40);

      // Load car model
      await this.car.load();
      this.updateLoadingProgress(60);

      // Load wall stations
      await this.wallStations.load();
      this.updateLoadingProgress(80);

      // Initialize volumetric lighting (DISABLED)
      // const spotlights = this.lighting.getSpotlights();
      // this.volumetricLighting.initialize(spotlights);
      this.updateLoadingProgress(80);

      // Load audio
      await this.audioManager.load();
      this.updateLoadingProgress(100);

      // Hide loading screen and show intro
      setTimeout(() => {
        this.hideLoadingScreen();
        this.showIntro();
      }, 500);

    } catch (error) {
      console.error('Error loading assets:', error);
      this.updateLoadingProgress(100);
      this.hideLoadingScreen();
      this.showIntro();
    }
  }

  updateLoadingProgress(progress) {
    this.loadingProgress = progress;
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }

  showIntro() {
    this.cinematicIntro.start();
    this.uiManager.showIntro();
  }

  startExploration() {
    this.isIntroComplete = true;
    this.isExploring = true;

    // Hide intro overlay
    this.uiManager.hideIntro();

    // Show controls guide
    this.uiManager.showControlsGuide();
    setTimeout(() => {
      this.uiManager.hideControlsGuide();
    }, 5000);

    // Initialize first person controls
    this.firstPersonControls = new FirstPersonControls(
      this.camera,
      this.renderer.domElement,
      this.scene
    );

    // Enable car collision detection
    if (this.car && this.car.car) {
      this.firstPersonControls.setCarObject(this.car.car);
    }

    // Start ambient audio
    this.audioManager.playAmbient();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    // Update cinematic intro if active
    if (!this.isIntroComplete) {
      this.cinematicIntro.update(delta);
    }

    // Update first person controls if exploring
    if (this.isExploring && this.firstPersonControls) {
      this.firstPersonControls.update(delta);

      // Check for wall station interactions (pass delta for animations)
      this.wallStations.update(this.camera.position, delta);
    }

    // Update platform rotation
    this.platform.update(delta);

    // Update volumetric lighting (DISABLED)
    // this.volumetricLighting.update(delta);

    // Update effects
    this.effects.update(delta);

    // Render scene with post-processing
    this.effects.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.effects.onResize();
  }
}

// Initialize the application
new GaragePortfolio();
