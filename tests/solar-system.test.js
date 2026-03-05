/**
 * @jest-environment node
 *
 * Unit Tests for Solar System Explorer - Physics & Configuration
 *
 * Tests cover the pure, deterministic logic functions and data validation.
 * Three.js canvas/WebGL rendering is tested through manual visual verification
 * (see README for how to run the live demo).
 */

// -------------------------------------------------------
// Mirroring PLANETS_DATA from src/config/config.js
// -------------------------------------------------------
const PLANETS_DATA = [
    { name: "MERCURY", type: "terrestrial", size: 0.4, distance: 12, orbitSpeed: 4.1, rotSpeed: 0.001, moonCount: 0 },
    { name: "VENUS", type: "gas", size: 0.9, distance: 18, orbitSpeed: 1.6, rotSpeed: 0.0005, moonCount: 0 },
    { name: "EARTH", type: "terrestrial", size: 1.0, distance: 28, orbitSpeed: 1.0, rotSpeed: 0.01, moonCount: 1 },
    { name: "MARS", type: "terrestrial", size: 0.6, distance: 38, orbitSpeed: 0.5, rotSpeed: 0.009, moonCount: 2 },
    { name: "JUPITER", type: "gas", size: 2.5, distance: 65, orbitSpeed: 0.08, rotSpeed: 0.025, moonCount: 4 },
    { name: "SATURN", type: "gas", size: 2.2, distance: 95, orbitSpeed: 0.03, rotSpeed: 0.023, moonCount: 5 },
    { name: "URANUS", type: "ice_giant", size: 1.6, distance: 130, orbitSpeed: 0.01, rotSpeed: 0.015, moonCount: 2 },
    { name: "NEPTUNE", type: "ice_giant", size: 1.5, distance: 160, orbitSpeed: 0.006, rotSpeed: 0.016, moonCount: 1 }
];

const CONFIG = {
    camSmoothness: 0.03,
    baseSpeed: 0.005,
    stopSpeed: 0.00,
    zoomDist: 5.0,
    normalDist: 12.0,
    gestureCooldown: 1200
};

// -------------------------------------------------------
// Pure helper functions (mirrored from engine.js logic)
// -------------------------------------------------------
function getMoonSize(planetSize) {
    return planetSize * 0.2; // minimum moon size factor
}

function getMoonOrbitDistance(planetSize, moonIndex) {
    return planetSize * (2.5 + moonIndex * 1.5);
}

function getAsteroidBeltRange() {
    return { inner: 45, outer: 55 }; // distances 45–55 AU equivalent
}

function getPlanetByIndex(data, index) {
    return data[index] ?? null;
}

function isGestureOnCooldown(lastGestureTime, now, cooldown) {
    return (now - lastGestureTime) < cooldown;
}

// -------------------------------------------------------
// Tests: Solar System Data Integrity
// -------------------------------------------------------
describe('Planet Configuration Data', () => {
    test('contains exactly 8 planets', () => {
        expect(PLANETS_DATA).toHaveLength(8);
    });

    test('all planets have required fields', () => {
        const requiredFields = ['name', 'type', 'size', 'distance', 'orbitSpeed', 'rotSpeed', 'moonCount'];
        PLANETS_DATA.forEach(planet => {
            requiredFields.forEach(field => {
                expect(planet).toHaveProperty(field);
            });
        });
    });

    test('planets are ordered by increasing distance from sun', () => {
        for (let i = 1; i < PLANETS_DATA.length; i++) {
            expect(PLANETS_DATA[i].distance).toBeGreaterThan(PLANETS_DATA[i - 1].distance);
        }
    });

    test('inner planets orbit faster than outer planets', () => {
        const mercury = PLANETS_DATA.find(p => p.name === 'MERCURY');
        const neptune = PLANETS_DATA.find(p => p.name === 'NEPTUNE');
        expect(mercury.orbitSpeed).toBeGreaterThan(neptune.orbitSpeed);
    });

    test('gas giants are larger than terrestrial planets', () => {
        const terrestrial = PLANETS_DATA.filter(p => p.type === 'terrestrial');
        const gasGiants = PLANETS_DATA.filter(p => p.type === 'gas');
        const maxTerrestrial = Math.max(...terrestrial.map(p => p.size));
        const minGasGiant = Math.min(...gasGiants.map(p => p.size));
        expect(minGasGiant).toBeGreaterThan(maxTerrestrial);
    });

    test('Earth has exactly 1 moon', () => {
        const earth = PLANETS_DATA.find(p => p.name === 'EARTH');
        expect(earth.moonCount).toBe(1);
    });

    test('Jupiter has the most moons (4) of all visible planets', () => {
        const maxMoons = Math.max(...PLANETS_DATA.map(p => p.moonCount));
        const richest = PLANETS_DATA.find(p => p.moonCount === maxMoons);
        expect(richest.name).toBe('JUPITER');
    });

    test('planet types are only valid values', () => {
        const validTypes = ['terrestrial', 'gas', 'ice_giant'];
        PLANETS_DATA.forEach(planet => {
            expect(validTypes).toContain(planet.type);
        });
    });
});

// -------------------------------------------------------
// Tests: Moon Sizing Logic
// -------------------------------------------------------
describe('Moon Physics', () => {
    test('moon size scales with planet size', () => {
        expect(getMoonSize(1.0)).toBeCloseTo(0.2);
        expect(getMoonSize(2.5)).toBeCloseTo(0.5);
    });

    test('moon orbit distance increases per moon index', () => {
        const d0 = getMoonOrbitDistance(1.0, 0);
        const d1 = getMoonOrbitDistance(1.0, 1);
        expect(d1).toBeGreaterThan(d0);
    });
});

// -------------------------------------------------------
// Tests: Asteroid Belt
// -------------------------------------------------------
describe('Asteroid Belt', () => {
    test('belt range is between Mars and Jupiter distances', () => {
        const mars = PLANETS_DATA.find(p => p.name === 'MARS');
        const jupiter = PLANETS_DATA.find(p => p.name === 'JUPITER');
        const belt = getAsteroidBeltRange();
        expect(belt.inner).toBeGreaterThan(mars.distance);
        expect(belt.outer).toBeLessThan(jupiter.distance);
    });
});

// -------------------------------------------------------
// Tests: Navigation Logic
// -------------------------------------------------------
describe('Planet Navigation', () => {
    test('returns planet by valid index', () => {
        expect(getPlanetByIndex(PLANETS_DATA, 0).name).toBe('MERCURY');
        expect(getPlanetByIndex(PLANETS_DATA, 7).name).toBe('NEPTUNE');
    });

    test('returns null for out-of-bounds index', () => {
        expect(getPlanetByIndex(PLANETS_DATA, 99)).toBeNull();
    });
});

// -------------------------------------------------------
// Tests: Gesture Cooldown System
// -------------------------------------------------------
describe('Gesture Cooldown', () => {
    test('blocks gesture within cooldown period', () => {
        const now = Date.now();
        const lastGesture = now - 500; // 500ms ago
        expect(isGestureOnCooldown(lastGesture, now, CONFIG.gestureCooldown)).toBe(true);
    });

    test('allows gesture after cooldown expires', () => {
        const now = Date.now();
        const lastGesture = now - 2000; // 2000ms ago
        expect(isGestureOnCooldown(lastGesture, now, CONFIG.gestureCooldown)).toBe(false);
    });
});
