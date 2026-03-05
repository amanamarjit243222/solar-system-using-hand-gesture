export function createNoiseTexture(width, height, type, color1, color2) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); const w = width; const h = height;
    const grd = ctx.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, color1); grd.addColorStop(1, color2); ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    const noise = (count, alpha, minSize, maxSize, color) => {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w; const y = Math.random() * h; const r = minSize + Math.random() * (maxSize - minSize);
            ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
    };
    if (type === 'terrestrial') {
        ctx.fillStyle = "#001a33"; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * w; const y = Math.random() * h;
            ctx.save(); ctx.translate(x, y); ctx.scale(1.5 + Math.random(), 1); ctx.fillStyle = "#2d5a27"; ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(0, 0, 50 + Math.random() * 120, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        noise(150, 0.6, 20, 60, "#3a7a33"); noise(80, 0.5, 10, 40, "#c2b280"); noise(200, 0.4, 2, 8, "#665544");
        ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.8; ctx.fillRect(0, 0, w, 20); ctx.fillRect(0, h - 20, w, 20);
    } else if (type === 'gas') {
        for (let i = 0; i < 60; i++) {
            const bandH = Math.random() * (h / 10); const y = Math.random() * h;
            const bGrd = ctx.createLinearGradient(0, y, 0, y + bandH);
            bGrd.addColorStop(0, "transparent"); bGrd.addColorStop(0.5, (i % 2 === 0) ? color1 : color2); bGrd.addColorStop(1, "transparent");
            ctx.fillStyle = bGrd; ctx.fillRect(0, y, w, bandH);
        }
        noise(8, 0.15, 20, 50, "#8b4513");
    } else if (type === 'ice_giant') {
        const grd2 = ctx.createLinearGradient(0, 0, 0, h); grd2.addColorStop(0, color1); grd2.addColorStop(0.5, color2); grd2.addColorStop(1, color1); ctx.fillStyle = grd2; ctx.fillRect(0, 0, w, h); noise(20, 0.05, 30, 100, "#ffffff");
    } else if (type === 'clouds') {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.35; ctx.beginPath();
            ctx.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 80, 10 + Math.random() * 20, Math.random() * 0.5, 0, Math.PI * 2); ctx.fill();
        }
    } else if (type === 'moon') {
        noise(500, 0.1, 1, 5, "#000"); noise(20, 0.05, 10, 40, "#444");
    }
    return new THREE.CanvasTexture(canvas);
}

export function addMoons(parentMesh, count, planetSize) {
    const moons = [];
    for (let i = 0; i < count; i++) {
        const size = planetSize * (0.2 + Math.random() * 0.1); const dist = planetSize * (2.5 + i * 1.5);
        const moonGeo = new THREE.SphereGeometry(size, 32, 32); const moonTex = createNoiseTexture(64, 32, 'moon', '#aaa', '#888');
        const moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9, color: 0xcccccc });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        const pivot = new THREE.Object3D(); pivot.add(moon); moon.position.x = dist; pivot.rotation.x = (Math.random() - 0.5) * 0.5;
        parentMesh.add(pivot); moons.push({ pivot: pivot, speed: 0.02 + Math.random() * 0.03, mesh: moon });
    }
    return moons;
}

export function createPlanet(data, scene) {
    const { size, type, color1, color2, distance, name } = data;
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const texture = createNoiseTexture(1024, 512, type, color1, color2);
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.1 });
    if (name === 'EARTH') { material.roughness = 0.6; material.metalness = 0.2; }
    const planetMesh = new THREE.Mesh(geometry, material); planetMesh.castShadow = true; planetMesh.receiveShadow = true;
    if (name === 'EARTH' || name === 'VENUS') {
        const cGeo = new THREE.SphereGeometry(size + 0.03, 64, 64);
        const cMat = new THREE.MeshLambertMaterial({ map: createNoiseTexture(1024, 512, 'clouds', '#fff', '#fff'), transparent: true, opacity: name === 'VENUS' ? 0.9 : 0.6, blending: THREE.AdditiveBlending });
        const clouds = new THREE.Mesh(cGeo, cMat); planetMesh.add(clouds); planetMesh.userData.clouds = clouds;
    }
    const orbitPivot = new THREE.Object3D(); const systemGroup = new THREE.Object3D(); systemGroup.position.x = distance;
    orbitPivot.add(systemGroup); systemGroup.add(planetMesh);
    const moons = addMoons(systemGroup, data.moonCount, size); moons.forEach(m => systemGroup.add(m.pivot));
    planetMesh.rotation.z = 23.5 * (Math.PI / 180); orbitPivot.rotation.x = (Math.random() - 0.5) * 0.05;
    scene.add(orbitPivot);
    return { mesh: planetMesh, pivot: orbitPivot, moons: moons, speed: data.orbitSpeed, rotationSpeed: data.rotSpeed, data: data };
}

export function createAsteroids(scene) {
    const asteroidCount = 800;
    const astGeo = new THREE.DodecahedronGeometry(0.15, 0);
    const astMat = new THREE.MeshStandardMaterial({ color: 0x887766 });
    const astInstanced = new THREE.InstancedMesh(astGeo, astMat, asteroidCount);
    scene.add(astInstanced);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < asteroidCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 45 + Math.random() * 10;
        const y = (Math.random() - 0.5) * 3.0;
        dummy.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.scale.setScalar(0.5 + Math.random());
        dummy.updateMatrix();
        astInstanced.setMatrixAt(i, dummy.matrix);
    }
    return astInstanced;
}

export function createStars(scene) {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 2000;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 1.5, color: 0xffffff, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);
    return stars;
}
