import { CONFIG, PLANETS_DATA } from './config/config.js';
import { InterfaceManager, detectGesture, getStabilizedGesture } from './ui/interface.js';
import { createPlanet, createAsteroids, createStars } from './physics/engine.js';

class SolarSystemApp {
    constructor() {
        this.ui = new InterfaceManager();
        this.state = {
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

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.sunUniforms = { time: { value: 0 } };
        this.bodies = [];
        this.astInstanced = null;
    }

    init() {
        this.setupGraphics();
        this.setupLighting();
        this.setupSystem();
        this.setupHands();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.animate();
    }

    setupGraphics() {
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0005);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        document.body.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
        this.scene.add(ambientLight);
        const sunLight = new THREE.PointLight(0xffffff, 4000, 0, 1.8);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        this.scene.add(sunLight);
    }

    setupSystem() {
        // Sun
        const sunGeo = new THREE.SphereGeometry(4.0, 64, 64);
        const sunMat = new THREE.ShaderMaterial({
            uniforms: this.sunUniforms,
            vertexShader: document.getElementById('sun-vertex').textContent,
            fragmentShader: document.getElementById('sun-fragment').textContent
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(sun);

        // Glow
        const spriteCanvas = document.createElement('canvas'); spriteCanvas.width = 128; spriteCanvas.height = 128;
        const sCtx = spriteCanvas.getContext('2d');
        const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64); grad.addColorStop(0, 'rgba(255, 200, 100, 1.0)'); grad.addColorStop(0.2, 'rgba(255, 120, 20, 0.6)'); grad.addColorStop(0.5, 'rgba(255, 60, 0, 0.2)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        sCtx.fillStyle = grad; sCtx.fillRect(0, 0, 128, 128);
        const glowTex = new THREE.CanvasTexture(spriteCanvas);
        const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending });
        const glow = new THREE.Sprite(glowMat);
        glow.scale.set(16, 16, 1);
        this.scene.add(glow);

        // Planets
        this.bodies = PLANETS_DATA.map(data => createPlanet(data, this.scene));

        // Saturn Rings
        const ringGeo = new THREE.RingGeometry(3.0, 5.0, 64);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xE3D8A8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.2;
        this.bodies[5].mesh.add(ring);

        // Asteroids & Stars
        this.astInstanced = createAsteroids(this.scene);
        createStars(this.scene);
    }

    setupHands() {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => this.onHandsResults(results));

        const videoElement = document.getElementById('input-video');
        const cameraUtils = new Camera(videoElement, {
            onFrame: async () => await hands.send({ image: videoElement }),
            width: 640,
            height: 480
        });
        cameraUtils.start().catch(e => console.error(e));

        // Bind Start
        document.getElementById('start-btn').onclick = () => this.ui.startGame(this.state);
    }

    onHandsResults(results) {
        if (!this.state.modelLoaded) {
            this.ui.showStartScreen();
            this.state.modelLoaded = true;
        }

        if (!this.state.gameActive) return;

        if (results.multiHandLandmarks?.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const rawGesture = detectGesture(landmarks);
            const gesture = getStabilizedGesture(rawGesture, this.state);

            this.state.currentGesture = gesture;
            this.state.lastLandmarks = landmarks;

            this.ui.updateGestureGuides(gesture);

            const now = Date.now();
            if (now - this.state.lastGestureTime > CONFIG.gestureCooldown) {
                this.handleGestures(gesture, now);
            }

            this.updateStatusText(gesture, landmarks);
        } else {
            this.state.currentGesture = 'NONE';
            this.state.gestureHistory = [];
            this.ui.updateGestureGuides('NONE');
            this.ui.updateStatus("AUTO-PILOT ACTIVE");
        }
    }

    handleGestures(gesture, now) {
        if (gesture === 'PALM') {
            this.state.currentPlanetIndex = (this.state.currentPlanetIndex + 1) % this.bodies.length;
            const p = this.bodies[this.state.currentPlanetIndex].data;
            this.ui.updateTelemetry(p, this.state);
            this.state.isZoomed = false;
            this.state.cameraRotationAngle = 0;
            this.state.lastGestureTime = now;
        } else if (gesture === 'THREE') {
            this.state.showInfo = !this.state.showInfo;
            this.ui.toggleInfoPanel(this.state.showInfo);
            this.state.lastGestureTime = now;
        } else if (gesture === 'PEACE') {
            this.state.cameraRotationAngle = 0;
            this.state.isZoomed = false;
            this.state.lastGestureTime = now;
        }
    }

    updateStatusText(gesture, landmarks) {
        if (gesture === 'FIST') {
            this.ui.updateStatus("CMD: TIME STOPPED");
        } else if (gesture === 'POINTING') {
            const x = landmarks[8].x;
            let dir = "HOLD CENTER";
            if (x < 0.4) dir = "<< SPINNING LEFT";
            if (x > 0.6) dir = "SPINNING RIGHT >>";
            this.ui.updateStatus(`CMD: ${dir}`);
        } else if (gesture === 'PEACE') {
            this.state.isZoomed = false;
            this.ui.updateStatus("CMD: ORBIT NORMAL");
        } else {
            this.ui.updateStatus("SYSTEM ACTIVE");
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        let dt = CONFIG.baseSpeed;
        if (this.state.gameActive && this.state.currentGesture === 'FIST') {
            dt = CONFIG.stopSpeed;
        }

        this.state.time += dt * this.state.speedMultiplier;
        this.sunUniforms.time.value += 0.01;

        this.bodies.forEach(b => {
            b.pivot.rotation.y += b.speed * dt;
            if (!this.state.gameActive || this.state.currentGesture !== 'FIST') {
                b.mesh.rotation.y += b.rotationSpeed;
                if (b.mesh.userData.clouds) b.mesh.userData.clouds.rotation.y += b.rotationSpeed * 1.2;
                b.moons.forEach(m => m.pivot.rotation.y += m.speed);
            }
        });

        if (!this.state.gameActive || this.state.currentGesture !== 'FIST') {
            this.astInstanced.rotation.y += 0.0005;
        }

        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }

    updateCamera() {
        const target = this.bodies[this.state.currentPlanetIndex];
        const pPos = new THREE.Vector3();
        target.mesh.getWorldPosition(pPos);

        const sunToPlanet = pPos.clone().normalize();

        if (this.state.gameActive && this.state.currentGesture === 'POINTING' && this.state.lastLandmarks) {
            const indexX = this.state.lastLandmarks[8].x;
            if (indexX < 0.4) this.state.cameraRotationAngle -= 0.03;
            else if (indexX > 0.6) this.state.cameraRotationAngle += 0.03;
        }

        const dist = this.state.isZoomed ? CONFIG.zoomDist : CONFIG.normalDist;
        const offset = sunToPlanet.clone().multiplyScalar(dist);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.state.cameraRotationAngle);

        const height = this.state.isZoomed ? 2 : 5;
        const desiredPos = pPos.clone().add(offset).add(new THREE.Vector3(0, height, 0));

        this.camera.position.lerp(desiredPos, CONFIG.camSmoothness);
        this.camera.lookAt(pPos);
    }
}

const App = new SolarSystemApp();
window.onload = () => App.init();
