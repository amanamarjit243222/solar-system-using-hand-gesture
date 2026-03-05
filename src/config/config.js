export const CONFIG = {
    camSmoothness: 0.03,
    baseSpeed: 0.005,
    stopSpeed: 0.00,
    zoomDist: 5.0,
    normalDist: 12.0,
    gestureCooldown: 1200
};

export const PLANETS_DATA = [
    { name: "MERCURY", type: "terrestrial", color1: "#A5A5A5", color2: "#5A5A5A", size: 0.4, distance: 12, orbitSpeed: 4.1, rotSpeed: 0.001, moonCount: 0, description: "Smallest planet, closest to the Sun.", day: "176 Earth Days", year: "88 Earth Days", dia: "4,880 km", temp: "167°C" },
    { name: "VENUS", type: "gas", color1: "#E6DBB8", color2: "#D4C393", size: 0.9, distance: 18, orbitSpeed: 1.6, rotSpeed: 0.0005, moonCount: 0, description: "Hottest planet with thick atmosphere.", day: "243 Earth Days", year: "225 Earth Days", dia: "12,104 km", temp: "464°C" },
    { name: "EARTH", type: "terrestrial", color1: "#1C4E85", color2: "#102a4a", size: 1.0, distance: 28, orbitSpeed: 1.0, rotSpeed: 0.01, moonCount: 1, description: "Our home, teeming with life.", day: "24 Hours", year: "365 Days", dia: "12,742 km", temp: "15°C" },
    { name: "MARS", type: "terrestrial", color1: "#C1440E", color2: "#8B3108", size: 0.6, distance: 38, orbitSpeed: 0.5, rotSpeed: 0.009, moonCount: 2, description: "The Red Planet, dusty and cold.", day: "24h 37m", year: "687 Earth Days", dia: "6,779 km", temp: "-65°C" },
    { name: "JUPITER", type: "gas", color1: "#C99039", color2: "#A67635", size: 2.5, distance: 65, orbitSpeed: 0.08, rotSpeed: 0.025, moonCount: 4, description: "Massive gas giant with Great Red Spot.", day: "9h 56m", year: "12 Earth Years", dia: "139,820 km", temp: "-110°C" },
    { name: "SATURN", type: "gas", color1: "#E3D8A8", color2: "#C7B679", size: 2.2, distance: 95, orbitSpeed: 0.03, rotSpeed: 0.023, moonCount: 5, description: "Jewel of the system with icy rings.", day: "10h 34m", year: "29 Earth Years", dia: "116,460 km", temp: "-140°C" },
    { name: "URANUS", type: "ice_giant", color1: "#A3E6D7", color2: "#65C9C8", size: 1.6, distance: 130, orbitSpeed: 0.01, rotSpeed: 0.015, moonCount: 2, description: "Ice giant rotating on its side.", day: "17h 14m", year: "84 Earth Years", dia: "50,724 km", temp: "-195°C" },
    { name: "NEPTUNE", type: "ice_giant", color1: "#3E66F9", color2: "#1E3BB0", size: 1.5, distance: 160, orbitSpeed: 0.006, rotSpeed: 0.016, moonCount: 1, description: "Deep blue, windy and cold.", day: "16h 6m", year: "165 Earth Years", dia: "49,244 km", temp: "-200°C" }
];
