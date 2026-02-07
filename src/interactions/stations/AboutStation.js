import * as THREE from 'three';

export class AboutStation {
    constructor(scene, position, name) {
        this.scene = scene;
        this.position = position;
        this.name = name;
        this.mesh = null;
    }

    async create() {
        // Create wall-mounted station
        const group = new THREE.Group();

        // Metal plate background
        const plateGeometry = new THREE.BoxGeometry(3, 1.5, 0.1);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.8
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        group.add(plate);

        // Label frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.9
        });

        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 0.05, 0.05),
            frameMaterial
        );
        frameTop.position.y = 0.75;
        group.add(frameTop);

        const frameBottom = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 0.05, 0.05),
            frameMaterial
        );
        frameBottom.position.y = -0.75;
        group.add(frameBottom);

        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1.5, 0.05),
            frameMaterial
        );
        frameLeft.position.x = -1.6;
        group.add(frameLeft);

        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1.5, 0.05),
            frameMaterial
        );
        frameRight.position.x = 1.6;
        group.add(frameRight);

        // Add visible text label
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 512, 256);

        // Text
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ABOUT ME', 256, 128);

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

        group.position.copy(this.position);
        this.scene.add(group);
        this.mesh = group;
    }

    getContent() {
        return `
      <div class="about-content">
        <h1 class="profile-name">Kolipakula JanakiRam</h1>
        <p class="profile-title">Engineering Undergraduate | Problem Solver | Tech Enthusiast</p>
        <p class="profile-bio">
          Motivated B.Tech CSE undergraduate with strong problem-solving skills and hands-on experience in building real-world projects using Python, C, JavaScript, and web technologies. Passionate about system design, logic, and scalable solutions, with proven ability to learn fast, adapt, and execute ideas from concept to implementation.
        </p>
      </div>
    `;
    }
}
