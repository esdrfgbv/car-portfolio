import * as THREE from 'three';

export class SkillsStation {
  constructor(scene, position, name) {
    this.scene = scene;
    this.position = position;
    this.name = name;
    this.mesh = null;
  }

  async create() {
    const group = new THREE.Group();

    const plateGeometry = new THREE.BoxGeometry(3, 1.5, 0.1);
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.4,
      metalness: 0.8
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    group.add(plate);

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.9
    });

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 0.05), frameMaterial);
    frameTop.position.y = 0.75;
    group.add(frameTop);

    const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 0.05), frameMaterial);
    frameBottom.position.y = -0.75;
    group.add(frameBottom);

    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.05), frameMaterial);
    frameLeft.position.x = -1.6;
    group.add(frameLeft);

    const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.05), frameMaterial);
    frameRight.position.x = 1.6;
    group.add(frameRight);

    // Add visible text label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SKILLS', 256, 128);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true
    });

    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 1.25),
      textMaterial
    );
    textPlane.position.z = 0.06;
    group.add(textPlane);

    if (this.position.x < 0) {
      group.rotation.y = Math.PI / 2;
    } else if (this.position.x > 0) {
      group.rotation.y = -Math.PI / 2;
    }

    group.position.copy(this.position);
    this.scene.add(group);
    this.mesh = group;
  }

  getContent() {
    return `
      <div class="skills-category">
        <h3 class="category-title">Languages</h3>
        <div class="skills-list">
          <span class="skill-badge">Python</span>
          <span class="skill-badge">C</span>
          <span class="skill-badge">JavaScript</span>
          <span class="skill-badge">HTML5</span>
          <span class="skill-badge">CSS3</span>
        </div>
      </div>
      
      <div class="skills-category">
        <h3 class="category-title">Achievements & Experience</h3>
        <div class="skills-list">
          <span class="skill-badge">🏆 SIH Internal Round Selected (Oct 2025)</span>
          <span class="skill-badge">💻 300+ LeetCode Problems Solved</span>
          <span class="skill-badge">💼 AWS Club DevOps Member (Oct 2025)</span>
        </div>
      </div>
      
      <div class="skills-category">
        <h3 class="category-title">Technologies</h3>
        <div class="skills-list">
          <span class="skill-badge">React</span>
          <span class="skill-badge">Node.js</span>
          <span class="skill-badge">Express</span>
          <span class="skill-badge">TypeScript</span>
          <span class="skill-badge">Git</span>
        </div>
      </div>
    `;
  }
}
