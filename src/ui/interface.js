export class InterfaceManager {
    constructor() {
        this.loading = document.getElementById('loading');
        this.startScreen = document.getElementById('start-screen');
        this.uiLayer = document.getElementById('ui-layer');

        this.ui = {
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
    }

    startGame(state) {
        this.startScreen.style.opacity = '0';
        setTimeout(() => {
            this.startScreen.style.display = 'none';
            state.gameActive = true;
            this.uiLayer.style.opacity = '1';
        }, 800);
    }

    showStartScreen() {
        this.loading.style.display = 'none';
        this.startScreen.style.display = 'flex';
    }

    updateTelemetry(planetData, state) {
        this.ui.name.innerText = planetData.name;
        this.ui.info.innerText = planetData.description;
        this.ui.type.innerText = planetData.type;
        this.ui.moons.innerText = planetData.moonCount;
        this.ui.day.innerText = planetData.day;
        this.ui.year.innerText = planetData.year;
        this.ui.dia.innerText = planetData.dia;
        this.ui.temp.innerText = planetData.temp;
    }

    updateGestureGuides(gesture) {
        Object.values(this.ui.guides).forEach(g => {
            g.classList.remove('gesture-active');
            g.style.opacity = '0.6';
        });

        if (gesture === 'PALM') this.ui.guides.palm.classList.add('gesture-active');
        if (gesture === 'POINTING') this.ui.guides.one.classList.add('gesture-active');
        if (gesture === 'FIST') this.ui.guides.fist.classList.add('gesture-active');
        if (gesture === 'PEACE') this.ui.guides.peace.classList.add('gesture-active');
        if (gesture === 'THREE') this.ui.guides.three.classList.add('gesture-active');
    }

    updateStatus(message) {
        this.ui.status.innerText = message;
    }

    toggleInfoPanel(show) {
        this.ui.panel.style.opacity = show ? '1' : '0';
    }
}

export function detectGesture(landmarks) {
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

export function getStabilizedGesture(rawGesture, state) {
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
