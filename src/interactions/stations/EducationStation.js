import * as THREE from 'three';

export class EducationStation {
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
    ctx.fillText('EDUCATION', 256, 128);

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
      <div class="education-timeline">
        <div class="education-item">
          <p class="education-year">2024 - Present</p>
          <h3 class="education-institution">GITAM University Visakhapatnam</h3>
          <p class="education-degree">Bachelor of Science in Computer Science</p>
          <p class="education-gpa">CGPA: 8.9</p>
        </div>
        
        <div class="education-item">
          <p class="education-year">2022 - 2024</p>
          <h3 class="education-institution">Pandiit Jr.Clg Visakhapatnam</h3>
          <p class="education-degree">12th Grade</p>
          <p class="education-gpa">Percentage: 91%</p>
        </div>
        
        <div class="education-item">
          <p class="education-year">2022</p>
          <h3 class="education-institution">Sri Sathya Sai Vidhya Vihar Visakhapatnam</h3>
          <p class="education-degree">10th Grade</p>
          <p class="education-gpa">Percentage: 84%</p>
        </div>
      </div>
    `;
  }
}
