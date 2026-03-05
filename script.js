// --- CONFIG ---
const config = {
    camSmoothness: 0.03,
    baseSpeed: 0.005, 
    stopSpeed: 0.00,  
    zoomDist: 5.0, 
    normalDist: 12.0,
    gestureCooldown: 1200
};

const state = {
    currentPlanetIndex: 2,
    isZoomed: false,
    speedMultiplier: 1,
    lastGestureTime: 0,
    currentGesture: 'NONE',
    showInfo: true,
    cameraRotationAngle: 0,
    time: 0,
    lastLandmarks: null,
    modelLoaded: false,
    gameActive: false,
    gestureHistory: []
};

// --- THREE.JS INIT ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0005); 

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true; 
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1; 
document.body.appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x404040, 2.0); 
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 4000, 0, 1.8); 
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// --- TEXTURE GENERATOR ---
function createNoiseTexture(width, height, type, color1, color2) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); const w = width; const h = height;
    const grd = ctx.createLinearGradient(0,0,0,h); grd.addColorStop(0, color1); grd.addColorStop(1, color2); ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    const noise = (count, alpha, minSize, maxSize, color) => {
        for(let i=0; i<count; i++) {
            const x = Math.random() * w; const y = Math.random() * h; const r = minSize + Math.random() * (maxSize - minSize);
            ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
        }
    };
    if (type === 'terrestrial') {
        ctx.fillStyle = "#001a33"; ctx.fillRect(0,0,w,h);
        for(let i=0; i<25; i++) {
            const x = Math.random() * w; const y = Math.random() * h;
            ctx.save(); ctx.translate(x, y); ctx.scale(1.5 + Math.random(), 1); ctx.fillStyle = "#2d5a27"; ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(0, 0, 50 + Math.random()*120, 0, Math.PI*2); ctx.fill(); ctx.restore();
        }
        noise(150, 0.6, 20, 60, "#3a7a33"); noise(80, 0.5, 10, 40, "#c2b280"); noise(200, 0.4, 2, 8, "#665544"); 
        ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.8; ctx.fillRect(0, 0, w, 20); ctx.fillRect(0, h-20, w, 20); 
    } else if (type === 'gas') {
        for(let i=0; i<60; i++) {
            ctx.fillStyle = (i%2===0) ? color1 : color2; ctx.globalAlpha = 0.1 + Math.random()*0.3;
            const bandH = Math.random() * (h/10); const y = Math.random() * h;
            const bGrd = ctx.createLinearGradient(0, y, 0, y+bandH);
            bGrd.addColorStop(0, "transparent"); bGrd.addColorStop(0.5, (i%2===0) ? color1 : color2); bGrd.addColorStop(1, "transparent");
            ctx.fillStyle = bGrd; ctx.fillRect(0, y, w, bandH);
        }
        noise(8, 0.15, 20, 50, "#8b4513");
    } else if (type === 'ice_giant') {
         const grd2 = ctx.createLinearGradient(0,0,0,h); grd2.addColorStop(0, color1); grd2.addColorStop(0.5, color2); grd2.addColorStop(1, color1); ctx.fillStyle = grd2; ctx.fillRect(0,0,w,h); noise(20, 0.05, 30, 100, "#ffffff"); 
    } else if (type === 'clouds') {
        ctx.clearRect(0,0,w,h);
        for(let i=0; i<200; i++) {
            ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.35; ctx.beginPath();
            ctx.ellipse(Math.random()*w, Math.random()*h, 30+Math.random()*80, 10+Math.random()*20, Math.random()*0.5, 0, Math.PI*2); ctx.fill();
        }
    } else if (type === 'moon') {
         noise(500, 0.1, 1, 5, "#000"); noise(20, 0.05, 10, 40, "#444"); 
    }
    return new THREE.CanvasTexture(canvas);
}

// --- SUN ---
const sunGeo = new THREE.SphereGeometry(4.0, 64, 64);
const sunUniforms = { time: { value: 0 } };
const sunMat = new THREE.ShaderMaterial({ uniforms: sunUniforms, vertexShader: document.getElementById('sun-vertex').textContent, fragmentShader: document.getElementById('sun-fragment').textContent });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const spriteCanvas = document.createElement('canvas'); spriteCanvas.width = 128; spriteCanvas.height = 128;
const sCtx = spriteCanvas.getContext('2d');
const grad = sCtx.createRadialGradient(64,64,0,64,64,64); grad.addColorStop(0, 'rgba(255, 200, 100, 1.0)'); grad.addColorStop(0.2, 'rgba(255, 120, 20, 0.6)'); grad.addColorStop(0.5, 'rgba(255, 60, 0, 0.2)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
sCtx.fillStyle = grad; sCtx.fillRect(0,0,128,128);
const glowTex = new THREE.CanvasTexture(spriteCanvas);
const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending });
const glow = new THREE.Sprite(glowMat);
glow.scale.set(16, 16, 1);
scene.add(glow);

// --- PLANETS ---
function addMoons(parentMesh, count, planetSize) {
    const moons = [];
    for(let i=0; i<count; i++) {
        const size = planetSize * (0.2 + Math.random() * 0.1); const dist = planetSize * (2.5 + i * 1.5);
        const moonGeo = new THREE.SphereGeometry(size, 32, 32); const moonTex = createNoiseTexture(64, 32, 'moon', '#aaa', '#888');
        const moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9, color: 0xcccccc });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        const pivot = new THREE.Object3D(); pivot.add(moon); moon.position.x = dist; pivot.rotation.x = (Math.random()-0.5)*0.5;
        parentMesh.add(pivot); moons.push({ pivot: pivot, speed: 0.02 + Math.random()*0.03, mesh: moon });
    }
    return moons;
}

function createPlanet(data) {
    const { size, type, color1, color2, distance, name } = data;
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const texture = createNoiseTexture(1024, 512, type, color1, color2);
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.1 });
    if (name === 'EARTH') { material.roughness = 0.6; material.metalness = 0.2; }
    const planetMesh = new THREE.Mesh(geometry, material); planetMesh.castShadow = true; planetMesh.receiveShadow = true;
    if (name === 'EARTH' || name === 'VENUS') {
        const cGeo = new THREE.SphereGeometry(size+0.03, 64, 64);
        const cMat = new THREE.MeshLambertMaterial({ map: createNoiseTexture(1024,512,'clouds','#fff','#fff'), transparent: true, opacity: name === 'VENUS' ? 0.9 : 0.6, blending: THREE.AdditiveBlending });
        const clouds = new THREE.Mesh(cGeo, cMat); planetMesh.add(clouds); planetMesh.userData.clouds = clouds;
    }
    const orbitPivot = new THREE.Object3D(); const systemGroup = new THREE.Object3D(); systemGroup.position.x = distance;
    orbitPivot.add(systemGroup); systemGroup.add(planetMesh);
    const moons = addMoons(systemGroup, data.moonCount, size); moons.forEach(m => systemGroup.add(m.pivot));
    planetMesh.rotation.z = 23.5 * (Math.PI/180); orbitPivot.rotation.x = (Math.random() - 0.5) * 0.05; 
    scene.add(orbitPivot);
    return { mesh: planetMesh, pivot: orbitPivot, moons: moons, speed: data.orbitSpeed, rotationSpeed: data.rotSpeed, data: data };
}

const planetsData = [
    { name: "MERCURY", type: "terrestrial", color1: "#A5A5A5", color2: "#5A5A5A", size: 0.4, distance: 12, orbitSpeed: 4.1, rotSpeed: 0.001, moonCount: 0, description: "Smallest planet, closest to the Sun.", day: "176 Earth Days", year: "88 Earth Days", dia: "4,880 km", temp: "167°C" },
    { name: "VENUS", type: "gas", color1: "#E6DBB8", color2: "#D4C393", size: 0.9, distance: 18, orbitSpeed: 1.6, rotSpeed: 0.0005, moonCount: 0, description: "Hottest planet with thick atmosphere.", day: "243 Earth Days", year: "225 Earth Days", dia: "12,104 km", temp: "464°C" },
    { name: "EARTH", type: "terrestrial", color1: "#1C4E85", color2: "#102a4a", size: 1.0, distance: 28, orbitSpeed: 1.0, rotSpeed: 0.01, moonCount: 1, description: "Our home, teeming with life.", day: "24 Hours", year: "365 Days", dia: "12,742 km", temp: "15°C" },
    { name: "MARS", type: "terrestrial", color1: "#C1440E", color2: "#8B3108", size: 0.6, distance: 38, orbitSpeed: 0.5, rotSpeed: 0.009, moonCount: 2, description: "The Red Planet, dusty and cold.", day: "24h 37m", year: "687 Earth Days", dia: "6,779 km", temp: "-65°C" },
    { name: "JUPITER", type: "gas", color1: "#C99039", color2: "#A67635", size: 2.5, distance: 65, orbitSpeed: 0.08, rotSpeed: 0.025, moonCount: 4, description: "Massive gas giant with Great Red Spot.", day: "9h 56m", year: "12 Earth Years", dia: "139,820 km", temp: "-110°C" },
    { name: "SATURN", type: "gas", color1: "#E3D8A8", color2: "#C7B679", size: 2.2, distance: 95, orbitSpeed: 0.03, rotSpeed: 0.023, moonCount: 5, description: "Jewel of the system with icy rings.", day: "10h 34m", year: "29 Earth Years", dia: "116,460 km", temp: "-140°C" },
    { name: "URANUS", type: "ice_giant", color1: "#A3E6D7", color2: "#65C9C8", size: 1.6, distance: 130, orbitSpeed: 0.01, rotSpeed: 0.015, moonCount: 2, description: "Ice giant rotating on its side.", day: "17h 14m", year: "84 Earth Years", dia: "50,724 km", temp: "-195°C" },
    { name: "NEPTUNE", type: "ice_giant", color1: "#3E66F9", color2: "#1E3BB0", size: 1.5, distance: 160, orbitSpeed: 0.006, rotSpeed: 0.016, moonCount: 1, description: "Deep blue, windy and cold.", day: "16h 6m", year: "165 Earth Years", dia: "49,244 km", temp: "-200°C" }
];

const bodies = planetsData.map(data => createPlanet(data));

const saturnMesh = bodies[5].mesh;
const ringGeo = new THREE.RingGeometry(3.0, 5.0, 64);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xE3D8A8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2.2; saturnMesh.add(ring);

// --- ASTEROIDS ---
const asteroidCount = 800;
const astGeo = new THREE.DodecahedronGeometry(0.15, 0);
const astMat = new THREE.MeshStandardMaterial({ color: 0x887766 });
const astInstanced = new THREE.InstancedMesh(astGeo, astMat, asteroidCount);
scene.add(astInstanced);
const dummy = new THREE.Object3D();
for(let i=0; i<asteroidCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 45 + Math.random() * 10;
    const y = (Math.random() - 0.5) * 3.0;
    dummy.position.set(Math.cos(angle)*dist, y, Math.sin(angle)*dist);
    dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    dummy.scale.setScalar(0.5 + Math.random());
    dummy.updateMatrix();
    astInstanced.setMatrixAt(i, dummy.matrix);
}

// --- BACKGROUND ---
function createStars() {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) pos[i] = (Math.random()-0.5)*2000;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({size: 1.5, color: 0xffffff, transparent: true, opacity: 0.8});
    scene.add(new THREE.Points(geo, mat));
}
createStars();

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    
    // Default to rotating normally if no gesture or hand not active
    let dt = config.baseSpeed;
    
    // Only stop time if hand is active AND fist is detected
    if (state.gameActive && state.currentGesture === 'FIST') {
        dt = config.stopSpeed;
    }
    
    state.time += dt * state.speedMultiplier;
    sunUniforms.time.value += 0.01; 

    bodies.forEach(b => {
        b.pivot.rotation.y += b.speed * dt;
        
        // Rotations continue unless time stopped
        if (!state.gameActive || state.currentGesture !== 'FIST') {
            b.mesh.rotation.y += b.rotationSpeed; 
            if(b.mesh.userData.clouds) b.mesh.userData.clouds.rotation.y += b.rotationSpeed * 1.2;
            b.moons.forEach(m => m.pivot.rotation.y += m.speed);
        }
    });

    if (!state.gameActive || state.currentGesture !== 'FIST') astInstanced.rotation.y += 0.0005;

    const target = bodies[state.currentPlanetIndex];
    const pPos = new THREE.Vector3();
    target.mesh.getWorldPosition(pPos);
    
    const sunToPlanet = pPos.clone().normalize();
    
    if (state.gameActive && state.currentGesture === 'POINTING' && state.lastLandmarks) {
        const indexX = state.lastLandmarks[8].x;
        if (indexX < 0.4) state.cameraRotationAngle -= 0.03; 
        else if (indexX > 0.6) state.cameraRotationAngle += 0.03; 
    }
    
    const dist = state.isZoomed ? config.zoomDist : config.normalDist;
    const offset = sunToPlanet.clone().multiplyScalar(dist);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.cameraRotationAngle);
    
    const height = state.isZoomed ? 2 : 5;
    const desiredPos = pPos.clone().add(offset).add(new THREE.Vector3(0, height, 0));
    
    camera.position.lerp(desiredPos, config.camSmoothness);
    camera.lookAt(pPos);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GESTURES ---
function detectGesture(landmarks) {
    const d = (i1, i2) => Math.sqrt(Math.pow(landmarks[i1].x - landmarks[i2].x, 2) + Math.pow(landmarks[i1].y - landmarks[i2].y, 2));
    const isOpen = (tip, pip) => d(0, tip) > d(0, pip); 
    const i = isOpen(8, 6);
    const m = isOpen(12, 10);
    const r = isOpen(16, 14);
    const p = isOpen(20, 18);
    
    if (i && !m && !r && !p) return 'POINTING';
    if (!i && !m && !r && !p) return 'FIST';
    if (i && m && !r && !p) return 'PEACE';
    if (i && m && r && !p) return 'THREE';
    if (i && m && r && p) return 'PALM';
    return 'NONE';
}

// STABILIZATION BUFFER
function getStabilizedGesture(rawGesture) {
    state.gestureHistory.push(rawGesture);
    if (state.gestureHistory.length > 5) state.gestureHistory.shift();
    
    const counts = {};
    state.gestureHistory.forEach(g => counts[g] = (counts[g] || 0) + 1);
    
    let stable = 'NONE';
    let maxCount = 0;
    for (const [gesture, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            stable = gesture;
        }
    }
    if (maxCount >= 3) return stable;
    return state.currentGesture;
}

const videoElement = document.getElementById('input-video');
const loading = document.getElementById('loading');
const startScreen = document.getElementById('start-screen');
const uiLayer = document.getElementById('ui-layer');

const ui = {
    name: document.getElementById('planet-name'),
    info: document.getElementById('planet-info'),
    type: document.getElementById('planet-type'),
    moons: document.getElementById('planet-moons'),
    day: document.getElementById('planet-day'),
    year: document.getElementById('planet-year'),
    dia: document.getElementById('planet-dia'),
    temp: document.getElementById('planet-temp'),
    panel: document.getElementById('info-panel'),
    status: document.getElementById('status-msg'),
    guides: { 
        palm: document.getElementById('guide-palm'), 
        one: document.getElementById('guide-one'), 
        fist: document.getElementById('guide-fist'), 
        peace: document.getElementById('guide-peace'), 
        three: document.getElementById('guide-three') 
    }
};

function startGame() {
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
        state.gameActive = true;
        uiLayer.style.opacity = '1';
    }, 800);
}

function onResults(results) {
    if (!state.modelLoaded) {
        loading.style.display = 'none';
        startScreen.style.display = 'flex';
        state.modelLoaded = true;
    }

    if (!state.gameActive) return;

    if (results.multiHandLandmarks?.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const rawGesture = detectGesture(landmarks);
        const gesture = getStabilizedGesture(rawGesture);
        
        state.currentGesture = gesture;
        state.lastLandmarks = landmarks; 
        
        Object.values(ui.guides).forEach(g => {
            g.classList.remove('gesture-active');
            g.style.opacity = '0.6';
        });

        if (gesture === 'PALM') ui.guides.palm.classList.add('gesture-active');
        if (gesture === 'POINTING') ui.guides.one.classList.add('gesture-active');
        if (gesture === 'FIST') ui.guides.fist.classList.add('gesture-active');
        if (gesture === 'PEACE') ui.guides.peace.classList.add('gesture-active');
        if (gesture === 'THREE') ui.guides.three.classList.add('gesture-active');

        const now = Date.now();
        if (now - state.lastGestureTime > config.gestureCooldown) {
            if (gesture === 'PALM') {
                state.currentPlanetIndex = (state.currentPlanetIndex + 1) % bodies.length;
                const p = bodies[state.currentPlanetIndex].data;
                ui.name.innerText = p.name;
                ui.info.innerText = p.description;
                ui.type.innerText = p.type;
                ui.moons.innerText = p.moonCount;
                ui.day.innerText = p.day;
                ui.year.innerText = p.year;
                ui.dia.innerText = p.dia;
                ui.temp.innerText = p.temp;
                state.isZoomed = false;
                state.cameraRotationAngle = 0;
                state.lastGestureTime = now;
            } else if (gesture === 'THREE') {
                state.showInfo = !state.showInfo;
                ui.panel.style.opacity = state.showInfo ? '1' : '0';
                state.lastGestureTime = now;
            } else if (gesture === 'PEACE') {
                state.cameraRotationAngle = 0;
                state.isZoomed = false;
                state.lastGestureTime = now;
            }
        }
        
        if (gesture === 'FIST') { 
            ui.status.innerText = "CMD: TIME STOPPED"; 
        } else if (gesture === 'POINTING') { 
            const x = landmarks[8].x;
            let dir = "HOLD CENTER";
            if (x < 0.4) dir = "<< SPINNING LEFT";
            if (x > 0.6) dir = "SPINNING RIGHT >>";
            ui.status.innerText = `CMD: ${dir}`; 
        } else if (gesture === 'PEACE') { 
            state.isZoomed = false; ui.status.innerText = "CMD: ORBIT NORMAL"; 
        } else {
            ui.status.innerText = "SYSTEM ACTIVE";
        }
    } else {
        state.currentGesture = 'NONE';
        state.gestureHistory = [];
        Object.values(ui.guides).forEach(g => {
            g.classList.remove('gesture-active');
            g.style.opacity = '0.6';
        });
        ui.status.innerText = "AUTO-PILOT ACTIVE";
    }
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
hands.onResults(onResults);

const cameraUtils = new Camera(videoElement, { onFrame: async () => await hands.send({image: videoElement}), width: 640, height: 480 });
cameraUtils.start().catch(e => console.error(e));
