import * as THREE from 'three';

export class ProjectsStation {
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

    // Rotate to face the correct direction based on position
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
    ctx.fillText('PROJECTS', 256, 128);

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
      <div class="projects-grid">
        <div class="project-card">
          <h3 class="project-title">Sanchari</h3>
          <p class="project-tech">Python • JavaScript • Code Execution</p>
          <p class="project-description">
            Step-by-step interactive coding learning platform with multi-language courses, real code execution, MCQs, progress tracking, and in-browser code visualizer.
          </p>
          <a href="https://sanchariii.vercel.app/" class="project-link" target="_blank">VIEW PROJECT</a>
        </div>
        
        <div class="project-card">
          <h3 class="project-title">Campus Connect</h3>
          <p class="project-tech">React • Node.js • Event Management</p>
          <p class="project-description">
            Smart campus event management platform connecting students, organizers, club leads, and administrators through a unified system.
          </p>
          <a href="https://campus-connect-hub-cyan.vercel.app/" class="project-link" target="_blank">VIEW PROJECT</a>
        </div>
        
        <div class="project-card">
          <h3 class="project-title">Assignment Tracker</h3>
          <p class="project-tech">React • TypeScript • Node.js • Express</p>
          <p class="project-description">
            Full-stack assignment management system with role-based dashboards, file uploads, and real-time status tracking for teachers and students.
          </p>
          <a href="https://campus-connect-omega-two.vercel.app/" class="project-link" target="_blank">VIEW PROJECT</a>
        </div>
        
        <div class="project-card">
          <h3 class="project-title">Dijkstra Graph Visualizer</h3>
          <p class="project-tech">JavaScript • Canvas • Algorithm Visualization</p>
          <p class="project-description">
            Interactive Dijkstra's Algorithm Visualizer with custom graph creation and visual shortest path execution on canvas.
          </p>
          <a href="https://dijkstra-graph-visualizer.vercel.app/" class="project-link" target="_blank">VIEW PROJECT</a>
        </div>
        
        <div class="project-card">
          <h3 class="project-title">Alqua (SIH Website)</h3>
          <p class="project-tech">AI • Marine Biology • Data Visualization</p>
          <p class="project-description">
            AI-driven platform for marine living resources with datasets, interactive visualizations, and research tools for marine biodiversity conservation.
          </p>
          <a href="https://alqua-sih-2025.vercel.app/" class="project-link" target="_blank">VIEW PROJECT</a>
        </div>
        
        <div class="project-card">
          <h3 class="project-title">AcademeX</h3>
          <p class="project-tech">Python • Tkinter • Academic Tools</p>
          <p class="project-description">
            Python GUI application for academic grading and GPA calculation with absolute and relative grading support.
          </p>
          <a href="https://github.com/esdrfgbv/AcadeMex.git" class="project-link" target="_blank">VIEW PROJECT</a>
        </div>
      </div>
    `;
  }
}
