# Version 4 Project Plan – Single-Player AI Rival, Custom Cosmetics & Procedural Web Audio

Below is the enhanced, structured feature specification and architecture roadmap for **Version 4.0** (Client-side focus with 0 backend/WebSocket overhead):

---

## 1️⃣ Key Feature Pillars

| # | Feature | Details / Deliverable |
|---|---------|-----------------------|
| 1 | **Custom Skins & Visual Cosmetics** | Unlockable snake skins (Neon Cyber, Matrix Rain, Dragon Scale, Retro 8-Bit, Golden Royalty) earned via score achievements. Includes live skin selector modal & custom particle effects. |
| 2 | **AI Rival Bot Mode (VS AI)** | Single-player arcade battle mode against an AI rival snake on the same grid using A* pathfinding & dynamic safety collision avoidance. |
| 3 | **Procedural Web Audio Synthesizer** | Zero-asset Web Audio API synth engine generating 8-bit sound effects (jump, eat, power-up, game over) & procedural synthwave ambient music using pure oscillators (sine, square, sawtooth). |
| 4 | **Daily Quests & Achievement Badges** | Rotating daily challenge missions (e.g. "Eat 5 Golden Apples in one run", "Reach Level 5 without hitting walls") with unlockable badge trophies. |
| 5 | **Score Card Exporter & Social Share** | High-score victory card generator creating downloadable PNG image badges of final game stats for easy sharing. |

---

## 2️⃣ Modular Directory Structure (`src/`)

```
src/
├── skins/
│   ├── skinRegistry.js       # Skin color palettes, glow styles & particle themes
│   └── skinStore.js          # Unlocked cosmetics & active skin selection persistence
├── ai/
│   ├── pathfinding.js        # A* grid pathfinding algorithm for AI rival snake
│   └── botController.js      # AI bot behavior state machine & difficulty manager
├── audio/
│   └── synthAudio.js         # Procedural Web Audio API oscillator sound synthesizer
├── quests/
│   └── questManager.js       # Daily quests generator & progress tracker
└── share/
    └── scoreExporter.js      # Canvas-based high score victory card image exporter
```

---

## 3️⃣ Implementation Checklist

- [ ] Implement `SkinRegistry` and `SkinStore` modules with 5 unique visual themes and a Skin Selector UI modal.
- [ ] Implement `Pathfinding` (A* algorithm) and `BotController` to render an AI Rival Snake in VS AI game mode.
- [ ] Implement `SynthAudioEngine` replacing external audio calls with zero-latency Web Audio oscillators.
- [ ] Implement `QuestManager` for daily challenge tracking & streak rewards.
- [ ] Integrate Victory Card Canvas Exporter for downloading shareable score cards.