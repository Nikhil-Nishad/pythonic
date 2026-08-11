# Version 4 Project Plan – Real-Time Multiplayer, Custom Cosmetics & AI Difficulty

Below is the structured roadmap and architectural specification for **Version 4.0**:

---

## 1️⃣ Feature Pillars

| # | Feature | Details / Deliverable |
|---|---------|-----------------------|
| 1 | **Real-Time Multiplayer** | 1v1 Dual Battles powered by persistent WebSockets / WebRTC. Players compete on split-screen canvas grids to trap each other's snake. |
| 2 | **Custom Skins & Cosmetics** | Unlockable visual snake skins (Neon Cyber, Dragon Scale, Retro Pixel, Golden Royalty) earned via score achievements. |
| 3 | **AI Adaptive Difficulty** | Dynamic AI Bot opponent mode using A* pathfinding and adaptive speed curves based on player performance metrics. |
| 4 | **Web Audio Synthesizer** | Pure Web Audio API procedural sound synthesizer (sine/square/sawtooth oscillators) replacing sample audio for 0-byte footprint audio effects. |
| 5 | **Native Haptics & Gamepad API** | Full Bluetooth / USB Gamepad controller support (Xbox, PlayStation, Joy-Con) and Web Vibration API haptics. |

---

## 2️⃣ Architecture & Directory Breakdown

```
src/
├── multiplayer/
│   ├── socketClient.js       # WebSocket connection manager
│   ├── rtcPeer.js            # WebRTC P2P dual-battle room negotiation
│   └── matchmaker.js         # Matchmaking queue engine
├── skins/
│   ├── skinRegistry.js       # Skin definitions, color palettes & shaders
│   └── skinStore.js          # Unlocked cosmetics persistence manager
├── ai/
│   ├── pathfinding.js        # A* grid navigation algorithm
│   └── botController.js      # Adaptive difficulty state machine
├── audio/
│   └── synthAudio.js         # Web Audio procedural oscillator synth engine
```

---

## 3️⃣ Milestone Schedule (Version 4.0 -> 4.2)

- **v4.0.0 (Q4 2026)**: Web Audio synth engine, custom snake skins registry, and Gamepad API integration.
- **v4.1.0 (Q1 2027)**: Single-player AI bot opponent mode with A* pathfinding.
- **v4.2.0 (Q2 2027)**: Full WebSockets / WebRTC 1v1 multiplayer dual battle arena.

---

## 4️⃣ Task Checklist

- [ ] Implement `SynthAudioEngine` replacing audio files with Web Audio oscillators.
- [ ] Add `SkinRegistry` and snake skin selection grid in settings modal.
- [ ] Implement Gamepad API input handler.
- [ ] Build A* pathfinding AI bot engine.
- [ ] Deploy WebSocket multiplayer matchmaking server.
