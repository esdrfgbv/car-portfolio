import * as THREE from 'three';

export class ContactStation {
  constructor(scene, position, name) {
    this.scene = scene;
    this.position = position;
    this.name = name;
    this.mesh = null;
    this.screenLight = null;
    this.time = 0;
  }

  async create() {
    const group = new THREE.Group();

    // ===== TERMINAL HOUSING =====
    // Main aluminum panel (60cm W × 45cm H × 15cm D)
    const housingGeometry = new THREE.BoxGeometry(0.6, 0.45, 0.15);
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: 0xb0b0b0, // Brushed aluminum
      roughness: 0.3,
      metalness: 0.6
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.position.z = -0.075;
    group.add(housing);

    // ===== CRT SCREEN BEZEL =====
    // Thick black plastic bezel around screen
    const bezelGeometry = new THREE.BoxGeometry(0.52, 0.37, 0.05);
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.6,
      metalness: 0.1
    });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.position.z = 0.025;
    group.add(bezel);

    // ===== CRT GLASS (CONVEX) =====
    // Slightly convex glass surface to simulate CRT bulge
    const glassGeometry = new THREE.SphereGeometry(0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    glassGeometry.scale(0.8, 0.6, 0.15);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0a,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.1,
      thickness: 0.5,
      reflectivity: 0.5
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = 0.05;
    glass.rotation.x = Math.PI;
    group.add(glass);

    // ===== CRT SCREEN DISPLAY =====
    // Create phosphor green terminal screen with scanlines
    const screenCanvas = this.createCRTScreen();
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.NearestFilter; // Pixelated look

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
      emissive: 0x40ff40,
      emissiveIntensity: 2.5,
      emissiveMap: screenTexture,
      toneMapped: false
    });

    const screenGeometry = new THREE.PlaneGeometry(0.45, 0.30);
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.051;
    group.add(screen);
    this.screenMesh = screen;

    // ===== SCREEN GLOW LIGHT =====
    // Phosphor green point light to illuminate surrounding area
    const screenLight = new THREE.PointLight(0x40ff40, 150, 1.5, 2);
    screenLight.position.set(0, 0, 0.1);
    group.add(screenLight);
    this.screenLight = screenLight;

    // ===== PHYSICAL CONTROLS =====
    // Power LED indicator
    const ledGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    const ledMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.5
    });
    const powerLED = new THREE.Mesh(ledGeometry, ledMaterial);
    powerLED.position.set(-0.25, -0.18, 0.05);
    group.add(powerLED);

    // Brightness knob
    const knobGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 16);
    const knobMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.4,
      metalness: 0.3
    });
    const brightnessKnob = new THREE.Mesh(knobGeometry, knobMaterial);
    brightnessKnob.position.set(-0.22, -0.18, 0.05);
    brightnessKnob.rotation.x = Math.PI / 2;
    group.add(brightnessKnob);

    // Contrast knob
    const contrastKnob = brightnessKnob.clone();
    contrastKnob.position.set(-0.18, -0.18, 0.05);
    group.add(contrastKnob);

    // Function buttons (F1, F2, F3)
    const buttonGeometry = new THREE.BoxGeometry(0.025, 0.015, 0.008);
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.5,
      metalness: 0.2
    });

    for (let i = 0; i < 3; i++) {
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(0.15 + i * 0.035, -0.18, 0.05);
      group.add(button);
    }

    // ===== MANUFACTURER PLATE =====
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256;
    plateCanvas.height = 64;
    const plateCtx = plateCanvas.getContext('2d');
    plateCtx.fillStyle = '#c0c0c0';
    plateCtx.fillRect(0, 0, 256, 64);
    plateCtx.fillStyle = '#1a1a1a';
    plateCtx.font = 'bold 14px monospace';
    plateCtx.textAlign = 'center';
    plateCtx.fillText('BOSCH DIAGNOSTICS', 128, 25);
    plateCtx.font = '10px monospace';
    plateCtx.fillText('WCT-1990 REV 2.3', 128, 45);

    const plateTexture = new THREE.CanvasTexture(plateCanvas);
    const plateMaterial = new THREE.MeshBasicMaterial({ map: plateTexture });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.03), plateMaterial);
    plate.position.set(0, 0.19, 0.05);
    group.add(plate);

    // ===== VENTILATION GRILLES =====
    const grilleGeometry = new THREE.PlaneGeometry(0.08, 0.35);
    const grilleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.2
    });

    const leftGrille = new THREE.Mesh(grilleGeometry, grilleMaterial);
    leftGrille.position.set(-0.29, 0, 0.05);
    group.add(leftGrille);

    const rightGrille = leftGrille.clone();
    rightGrille.position.set(0.29, 0, 0.05);
    group.add(rightGrille);

    // ===== MOUNTING BRACKET =====
    const bracketGeometry = new THREE.BoxGeometry(0.65, 0.05, 0.02);
    const bracketMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.6,
      metalness: 0.5
    });
    const bracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
    bracket.position.z = -0.16;
    group.add(bracket);

    // Mounting bolts (4 corners)
    const boltGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.015, 6);
    const boltMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a6a6a,
      roughness: 0.4,
      metalness: 0.7
    });

    const boltPositions = [
      [-0.28, 0.21, 0.05],
      [0.28, 0.21, 0.05],
      [-0.28, -0.21, 0.05],
      [0.28, -0.21, 0.05]
    ];

    boltPositions.forEach(pos => {
      const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
      bolt.position.set(pos[0], pos[1], pos[2]);
      bolt.rotation.x = Math.PI / 2;
      group.add(bolt);
    });

    // ===== WEATHERING: Small dent =====
    const dentGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const dentMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a8a8a,
      roughness: 0.5,
      metalness: 0.4
    });
    const dent = new THREE.Mesh(dentGeometry, dentMaterial);
    dent.position.set(0.25, -0.15, 0.04);
    dent.scale.z = 0.3;
    group.add(dent);

    // Position and rotate terminal on wall
    if (this.position.x < 0) {
      group.rotation.y = Math.PI / 2;
    } else if (this.position.x > 0) {
      group.rotation.y = -Math.PI / 2;
    }

    group.position.copy(this.position);
    this.scene.add(group);
    this.mesh = group;
  }

  createCRTScreen() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 342; // 3:2 aspect ratio for CRT
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 342);

    // Phosphor green text
    ctx.fillStyle = '#40ff40';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';

    // Terminal header with box drawing characters
    ctx.fillText('╔════════════════════════════════════════╗', 20, 30);
    ctx.fillText('║  WORKSHOP COMMUNICATION TERMINAL       ║', 20, 50);
    ctx.fillText('║  MODEL: WCT-1990 REV 2.3              ║', 20, 70);
    ctx.fillText('╚════════════════════════════════════════╝', 20, 90);

    // System status
    ctx.fillText('>> SYSTEM READY', 20, 120);
    ctx.fillText('>> Send a message directly to the mechanic.', 20, 140);

    // Contact information
    ctx.fillText('', 20, 170);
    ctx.fillText('> EMAIL:', 20, 190);
    ctx.fillText('  subrahmanyamkolipakula@gmail.com', 20, 210);

    ctx.fillText('> PHONE:', 20, 240);
    ctx.fillText('  7670815170', 20, 260);

    ctx.fillText('> GITHUB:', 20, 290);
    ctx.fillText('  github.com/esdrfgbv', 20, 310);

    // Add scanlines effect
    ctx.globalAlpha = 0.15;
    for (let y = 0; y < 342; y += 2) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, y, 512, 1);
    }

    // Add subtle noise/grain
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 342;
      ctx.fillStyle = Math.random() > 0.5 ? '#40ff40' : '#000000';
      ctx.fillRect(x, y, 1, 1);
    }

    return canvas;
  }

  update(delta) {
    // CRT flicker effect (subtle)
    if (this.screenLight) {
      this.time += delta;
      const flicker = 0.95 + Math.sin(this.time * 59.94) * 0.05; // 59.94Hz CRT refresh
      this.screenLight.intensity = 150 * flicker;

      if (this.screenMesh) {
        this.screenMesh.material.emissiveIntensity = 2.5 * flicker;
      }
    }
  }

  getContent() {
    return `
      <div class="contact-terminal">
        <div class="terminal-header">
          &gt; CONTACT_INTERFACE_v2.0 | STATUS: ONLINE
        </div>
        
        <div class="contact-item">
          <span class="contact-label">&gt; EMAIL:</span>
          <a href="mailto:subrahmanyamkolipakula@gmail.com" class="contact-link contact-value">subrahmanyamkolipakula@gmail.com</a>
        </div>
        
        <div class="contact-item">
          <span class="contact-label">&gt; PHONE:</span>
          <a href="tel:7670815170" class="contact-link contact-value">7670815170</a>
        </div>
        
        <div class="contact-item">
          <span class="contact-label">&gt; GITHUB:</span>
          <a href="https://github.com/esdrfgbv" target="_blank" class="contact-link contact-value">github.com/esdrfgbv</a>
        </div>
        
        <div class="contact-item">
          <span class="contact-label">&gt; LINKEDIN:</span>
          <a href="https://www.linkedin.com/in/kolipakula-janakiram-30a520341" target="_blank" class="contact-link contact-value">linkedin.com/in/kolipakula-janakiram</a>
        </div>
        
        <div class="contact-item" style="margin-top: 20px;">
          <span class="contact-label">&gt; MESSAGE:</span>
          <span class="contact-value">Feel free to reach out for collaborations or opportunities!</span>
        </div>
      </div>
    `;
  }
}
