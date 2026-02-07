import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.meshes = [];
    }

    async load() {
        this.createFloor();
        this.createWalls();
        this.createCeiling();
        this.createProps();
    }

    createFloor() {
        // Classic checkered racing flag pattern floor
        const floorGeometry = new THREE.PlaneGeometry(40, 40);

        // Create checkered pattern texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Checkered pattern (black and white squares)
        const squareSize = 128; // 8x8 grid
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                // Checkerboard pattern
                const isBlack = (x + y) % 2 === 0;
                ctx.fillStyle = isBlack ? '#1a1a1a' : '#e8e8e8';
                ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
            }
        }

        // Add weathering and oil stains
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const size = Math.random() * 60 + 20;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, '#2a2a2a');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }

        // Add tire marks
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 8;
        for (let i = 0; i < 5; i++) {
            const startX = Math.random() * 1024;
            const startY = Math.random() * 1024;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(
                startX + Math.random() * 200 - 100,
                startY + Math.random() * 200 - 100,
                startX + Math.random() * 300 - 150,
                startY + Math.random() * 300 - 150
            );
            ctx.stroke();
        }

        const floorTexture = new THREE.CanvasTexture(canvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(2, 2);

        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.4,
            metalness: 0.1,
            envMapIntensity: 0.3
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.meshes.push(floor);
    }

    createWalls() {
        // Create exposed brick texture
        const createBrickTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Base brick color (terracotta/brown)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(0, 0, 512, 512);

            // Draw individual bricks
            const brickWidth = 64;
            const brickHeight = 32;
            const mortarSize = 3;

            for (let y = 0; y < 512; y += brickHeight) {
                for (let x = 0; x < 512; x += brickWidth) {
                    // Offset every other row for brick pattern
                    const offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                    const brickX = (x + offsetX) % 512;

                    // Random brick color variation
                    const colorVar = Math.random() * 30 - 15;
                    const r = Math.min(255, Math.max(0, 139 + colorVar));
                    const g = Math.min(255, Math.max(0, 69 + colorVar));
                    const b = Math.min(255, Math.max(0, 19 + colorVar));
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

                    ctx.fillRect(
                        brickX + mortarSize,
                        y + mortarSize,
                        brickWidth - mortarSize * 2,
                        brickHeight - mortarSize * 2
                    );
                }
            }

            // Add aging and weathering
            ctx.globalAlpha = 0.2;
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const size = Math.random() * 10 + 2;
                ctx.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#d4a574';
                ctx.fillRect(x, y, size, size);
            }

            return new THREE.CanvasTexture(canvas);
        };

        const brickTexture = createBrickTexture();
        brickTexture.wrapS = THREE.RepeatWrapping;
        brickTexture.wrapT = THREE.RepeatWrapping;

        const wallMaterial = new THREE.MeshStandardMaterial({
            map: brickTexture,
            roughness: 0.9,
            metalness: 0.05
        });

        // Back wall
        brickTexture.repeat.set(8, 2);
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(40, 8, 0.5),
            wallMaterial
        );
        backWall.position.set(0, 4, -20);
        backWall.receiveShadow = true;
        backWall.castShadow = true;
        this.scene.add(backWall);
        this.meshes.push(backWall);

        // Left wall
        const leftWallTexture = createBrickTexture();
        leftWallTexture.wrapS = THREE.RepeatWrapping;
        leftWallTexture.wrapT = THREE.RepeatWrapping;
        leftWallTexture.repeat.set(8, 2);
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 8, 40),
            new THREE.MeshStandardMaterial({
                map: leftWallTexture,
                roughness: 0.9,
                metalness: 0.05
            })
        );
        leftWall.position.set(-20, 4, 0);
        leftWall.receiveShadow = true;
        leftWall.castShadow = true;
        this.scene.add(leftWall);
        this.meshes.push(leftWall);

        // Right wall
        const rightWallTexture = createBrickTexture();
        rightWallTexture.wrapS = THREE.RepeatWrapping;
        rightWallTexture.wrapT = THREE.RepeatWrapping;
        rightWallTexture.repeat.set(8, 2);
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 8, 40),
            new THREE.MeshStandardMaterial({
                map: rightWallTexture,
                roughness: 0.9,
                metalness: 0.05
            })
        );
        rightWall.position.set(20, 4, 0);
        rightWall.receiveShadow = true;
        rightWall.castShadow = true;
        this.scene.add(rightWall);
        this.meshes.push(rightWall);

        // Front wall sections
        const frontWallTexture1 = createBrickTexture();
        frontWallTexture1.wrapS = THREE.RepeatWrapping;
        frontWallTexture1.wrapT = THREE.RepeatWrapping;
        frontWallTexture1.repeat.set(3, 2);
        const frontWallLeft = new THREE.Mesh(
            new THREE.BoxGeometry(15, 8, 0.5),
            new THREE.MeshStandardMaterial({
                map: frontWallTexture1,
                roughness: 0.9,
                metalness: 0.05
            })
        );
        frontWallLeft.position.set(-12.5, 4, 20);
        frontWallLeft.receiveShadow = true;
        frontWallLeft.castShadow = true;
        this.scene.add(frontWallLeft);
        this.meshes.push(frontWallLeft);

        const frontWallTexture2 = createBrickTexture();
        frontWallTexture2.wrapS = THREE.RepeatWrapping;
        frontWallTexture2.wrapT = THREE.RepeatWrapping;
        frontWallTexture2.repeat.set(3, 2);
        const frontWallRight = new THREE.Mesh(
            new THREE.BoxGeometry(15, 8, 0.5),
            new THREE.MeshStandardMaterial({
                map: frontWallTexture2,
                roughness: 0.9,
                metalness: 0.05
            })
        );
        frontWallRight.position.set(12.5, 4, 20);
        frontWallRight.receiveShadow = true;
        frontWallRight.castShadow = true;
        this.scene.add(frontWallRight);
        this.meshes.push(frontWallRight);

        // Metal/aged pillars (industrial look)
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.7,
            metalness: 0.4
        });

        const pillarPositions = [
            [-12, 4, -12],
            [12, 4, -12],
            [-12, 4, 12],
            [12, 4, 12]
        ];

        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 8, 12),
                pillarMaterial
            );
            pillar.position.set(pos[0], pos[1], pos[2]);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
            this.meshes.push(pillar);
        });
    }

    createCeiling() {
        // Exposed wooden beams ceiling (rustic workshop)
        const ceilingGeometry = new THREE.PlaneGeometry(40, 40);

        // Create dark wood texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base dark wood color
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(0, 0, 512, 512);

        // Add wood grain
        for (let i = 0; i < 100; i++) {
            const y = Math.random() * 512;
            ctx.strokeStyle = `rgba(${Math.random() * 30 + 30}, ${Math.random() * 20 + 20}, ${Math.random() * 10 + 10}, 0.3)`;
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        // Add beam structure lines
        ctx.strokeStyle = '#2a1a0a';
        ctx.lineWidth = 4;
        for (let i = 0; i <= 4; i++) {
            const x = i * 128;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }

        const ceilingTexture = new THREE.CanvasTexture(canvas);
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.repeat.set(3, 3);

        const ceilingMaterial = new THREE.MeshStandardMaterial({
            map: ceilingTexture,
            roughness: 0.9,
            metalness: 0.05,
            color: 0x4a3a2a
        });

        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 8;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
        this.meshes.push(ceiling);
    }

    createProps() {
        // Vintage red tool chest (Snap-on style)
        const toolChestMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000, // Deep burgundy red
            roughness: 0.3,
            metalness: 0.7
        });

        const toolChest = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2.5, 1.8),
            toolChestMaterial
        );
        toolChest.position.set(-15, 1.25, -15);
        toolChest.castShadow = true;
        toolChest.receiveShadow = true;
        this.scene.add(toolChest);
        this.meshes.push(toolChest);

        // Add drawer details
        for (let i = 0; i < 4; i++) {
            const drawer = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 0.5, 0.1),
                new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
            );
            drawer.position.set(-15, 0.3 + i * 0.6, -14);
            this.scene.add(drawer);
        }

        // Stacked racing tires with vintage logos
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.05
        });

        for (let i = 0; i < 4; i++) {
            const tire = new THREE.Mesh(
                new THREE.TorusGeometry(0.5, 0.2, 8, 16),
                tireMaterial
            );
            tire.position.set(15, 0.2 + i * 0.4, -15);
            tire.rotation.x = Math.PI / 2;
            this.scene.add(tire);
            this.meshes.push(tire);
        }

        // Wooden workbench (vintage style)
        const benchMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321, // Aged leather brown
            roughness: 0.9,
            metalness: 0.05
        });

        const workbench = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.15, 2),
            benchMaterial
        );
        workbench.position.set(-17, 1.2, 10);
        workbench.receiveShadow = true;
        workbench.castShadow = true;
        this.scene.add(workbench);
        this.meshes.push(workbench);

        // Workbench legs (metal)
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.5,
            metalness: 0.6
        });

        const legPositions = [
            [-19.2, 0.6, 9],
            [-19.2, 0.6, 11],
            [-14.8, 0.6, 9],
            [-14.8, 0.6, 11]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8),
                legMaterial
            );
            leg.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(leg);
            this.meshes.push(leg);
        });

        // Vintage oil cans (Castrol style)
        const oilCanMaterial = new THREE.MeshStandardMaterial({
            color: 0xb8860b, // Warm brass
            roughness: 0.4,
            metalness: 0.6
        });

        for (let i = 0; i < 3; i++) {
            const oilCan = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.18, 0.6, 12),
                oilCanMaterial
            );
            oilCan.position.set(-17 + i * 0.5, 1.5, 10);
            this.scene.add(oilCan);
            this.meshes.push(oilCan);
        }

        // Additional red tool chest on right side
        const toolChest2 = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 2, 1.5),
            toolChestMaterial
        );
        toolChest2.position.set(16, 1, 15);
        toolChest2.castShadow = true;
        toolChest2.receiveShadow = true;
        this.scene.add(toolChest2);
        this.meshes.push(toolChest2);
    }

    getCollisionMeshes() {
        return this.meshes;
    }
}
