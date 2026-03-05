# 🌌 Solar System Explorer: Touchless 3D Navigation

![JS Tests](https://github.com/amanamarjit243222/solar-system-using-hand-gesture/actions/workflows/js-tests.yml/badge.svg)

### 🚀 **[View Live Deployment: Experience the Interactive Simulation](https://controlsolarsystemusinghands.netlify.app/)**

![Space Exploration HUD](solar_system_hud.png)

An immersive 3D simulation of our Solar System controlled entirely by **hand gestures**.

## 🌟 The "Wow" Factor
This project bridges the gap between digital content and physical space. By combining **Three.js** for high-fidelity 3D rendering with **MediaPipe's** machine learning for real-time hand-tracking, it creates a "Minority Report" style interface for space exploration.

## 👥 Who This Is For
- **Museums & Science Centers**: Creating interactive, touchless exhibits for visitors.
- **Experiential Brand Agencies**: Developing unique, gesture-driven web installations for physical storefronts or events.
- **Educational Tech (EdTech)**: Prototyping next-generation spatial learning tools for classrooms.

## 🖐️ Gesture Commands
- ✋ **Open Palm**: Navigate to the next planet.
- ✊ **Closed Fist**: Freeze time (Pause orbits).
- ☝️ **Index Finger**: Spatial rotation (Rotate camera around the planet).
- ✌️ **Peace Sign**: Reset view.
- 🖖 **Three Fingers**: Toggle the Telemetry HUD.

## ✨ Technical Highlights
- **High-Fidelity 3D**: Custom shaders for atmospheric glow and realistic lighting using Three.js.
- **Latency-Free Control**: Optimized ML inference directly in the browser via MediaPipe.
- **Sci-Fi Telemetry**: Real-time data overlays for planetary statistics.

## 🏗️ Code Architecture

```
solar-system-using-hand-gesture/
├── index.html               # Application shell
├── package.json             # Dependencies & test scripts
├── assets/                  # Skybox, textures, icons
├── src/
│   ├── main.js              # App entry — scene setup & animation loop
│   ├── config/
│   │   └── config.js        # Planet data (8 planets) & camera constants
│   ├── physics/
│   │   └── engine.js        # Planet/moon/asteroid/star factory functions
│   └── ui/
│       └── interface.js     # HUD overlays & telemetry panel
└── tests/
    └── solar-system.test.js # Unit tests — planet data, physics, gesture logic
```

## 🛠️ Tech Stack
- **3D Engine**: [Three.js](https://threejs.org/) `^0.134.0`
- **ML / Gesture Recognition**: [@mediapipe/hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) `^0.4`
- **Language**: Vanilla ES6 JavaScript (Modular ESM)
- **Testing**: Jest `^29.7`
- **Deployment**: Netlify (static, zero-build)

## 🚀 Local Setup

> **Prerequisites**: Webcam required for gesture control.

```bash
git clone https://github.com/amanamarjit243222/solar-system-using-hand-gesture.git
cd solar-system-using-hand-gesture

# Install dev tools (Jest)
npm install

# Start local server
npm start
# Opens at http://localhost:8000
```

## 🧪 Running Tests

```bash
npm test
```

Tests are **browser-independent** — they validate the pure JS logic without Three.js or MediaPipe:
- **Planet Data Integrity** — 8 planets, ordered by distance, correct types
- **Orbital Physics** — Inner planets orbit faster, gas giants are larger
- **Moon Physics** — Sizing and orbit distance calculations
- **Asteroid Belt** — Placed correctly between Mars and Jupiter
- **Navigation Logic** — Planet index lookups and bounds checking
- **Gesture Cooldown** — Gesture debounce logic validated

## 🌐 Deployment

**Netlify (Recommended):**
1. Go to [netlify.com](https://netlify.com) → "New Site from Git"
2. Connect your GitHub repository
3. Set Build Command: (leave empty) | Publish dir: `./`
4. Click Deploy

**GitHub Pages:**
Go to Settings → Pages → Deploy from `main` branch → root folder.

## 📸 Visual Proof
![Start Menu](start_menu.png)
![Telemetry HUD](solar_system_hud.png)
