# 🌌 Solar System Explorer: Touchless 3D Navigation

### 🚀 **[View Live Deployment: Experience the Interactive Simulation](https://controlsolarsystemusinghands.netlify.app/)**

An immersive 3D simulation of our Solar System controlled entirely by **hand gestures**. No mouse, no keyboard—just your hands in the air.

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

## 🚀 Local Setup
```bash
git clone https://github.com/amanamarjit243222/solar-system-using-hand-gesture.git
cd solar-system-using-hand-gesture
python -m http.server 8000
```
*Note: Requires webcam access.*

## 📸 Visual Proof
![Start Menu](start_menu.png)
![Telemetry HUD](solar_system_hud.png)

