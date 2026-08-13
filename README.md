# Modern Snake Game 🐍✨

[![Version 5.0.0](https://img.shields.io/badge/version-5.0.0-blue.svg)](https://github.com/Nikhil-Nishad/pythonic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](manifest.webmanifest)
[![SEO Score](https://img.shields.io/badge/SEO-100-brightgreen.svg)](sitemap.xml)
[![Tests Passing](https://img.shields.io/badge/tests-13%2F13%20passing-brightgreen.svg)](tests/)

A high-performance, mobile-friendly, Google-level SEO optimized browser game built with **Vanilla JavaScript ES Modules**, **HTML5 Canvas**, and **CSS3**. Features persistent local/remote Leaderboards, 8 Unlockable Power-up Skills, Adaptive AI Rival Difficulty, Responsive Score & Skill Summaries, Custom Skins Shop, Procedural Web Audio Synth, Daily Quests, PWA offline support, and 13 dedicated multi-page SEO articles.

---

## 🌟 Version 5.0.0 Key Features

- **🎮 60FPS Fluid Gameplay**: Smooth 60FPS canvas rendering with particle trail bursts, screen shake, and ambient lighting orbs.
- **⚡ 8 Power-Up Skills**: Complete skill arsenal including *Slow Time*, *Ghost Mode*, *Double Points*, *Shrink*, *Shield*, *Food Magnet*, *Freeze Bot*, and *Score Frenzy* with dedicated activation feedback & score multiplier mechanics.
- **🤖 Adaptive AI Rival Bot Mode (VS AI)**: 4-tier adaptive difficulty system (*Easy*, *Medium*, *Hard*, *Expert*) scaling AI pathfinding (A* & safe heuristic routing) dynamically with player score.
- **📊 Responsive Score Screen & Skills Breakdown**: Completely redesigned game over overlay with mobile-responsive flex layout, bot difficulty reached display, and detailed skill breakdown cards.
- **🌐 Multi-Page SEO & Domain Crawl Architecture**: 13 standalone, crawlable SEO blog articles with JSON-LD `BlogPosting`, `BreadcrumbList`, and `FAQPage` schema markup for search dominance.
- **🎨 Custom Skins & Cosmetics Shop**: Unlockable snake visual themes (*Cyber Blue*, *Matrix Code*, *Dragon Blaze*, *Retro Arcade*, *Golden Empire*) with live skin selection modal & custom particle effects.
- **🎹 Procedural Web Audio Synthesizer**: Zero-asset `SynthAudioEngine` generating 8-bit sound effects & musical arpeggios using pure Web Audio API oscillators.
- **📜 Daily Quests & Missions**: Rotating daily challenge missions (*"Fruit Feast"*, *"Speed Demon"*, *"High Roller"*) with progress tracking and unlockable reward badges.
- **📸 Victory Card Exporter**: Downloadable PNG victory badge generator for sharing high scores on social media.
- **📱 PWA & Offline Play**: Service worker (`sw.js` v5.0.0) cache-first offline support and Web App manifest (`manifest.webmanifest`).

---

## 📁 Directory Structure

```
├── index.html                 # Main Game UI & Structured Schema
├── instructions.html          # SEO-Optimized How-to-Play Guide & FAQ
├── blog.html                  # SEO Blog & Strategy Articles
├── styles.css                 # Custom Vanilla CSS Design System
├── game.js                    # Core Game Loop & Event System
├── sw.js                      # Service Worker Offline PWA Cache
├── manifest.webmanifest       # Web App Manifest
├── sitemap.xml                # Search Engine Sitemap
├── robots.txt                 # Search Engine Crawler Config
├── package.json               # Node Scripts & Dependencies
├── src/                       # Modular Engine Services
│   ├── scoring.js             # ScoringEngine (Combos, Multipliers, Levels)
│   ├── leaderboard.js         # LeaderboardService (Persistence & Ranks)
│   ├── tutorial.js            # TutorialManager (Onboarding)
│   ├── vitals.js              # VitalsMonitor (RUM Web Vitals Agent)
│   ├── skins/                 # SkinRegistry & SkinStore
│   ├── ai/                    # A* Pathfinding & BotController
│   ├── audio/                 # SynthAudioEngine (Web Audio Oscillators)
│   ├── quests/                # QuestManager (Daily Missions)
│   └── share/                 # ScoreExporter (Victory Card PNG)
├── tests/                     # Unit Tests Suite
│   ├── scoring.test.js        # Scoring Engine Tests
│   ├── leaderboard.test.js    # Leaderboard Service Tests
│   ├── skins.test.js          # Skins & Cosmetics Store Tests
│   └── pathfinding.test.js    # A* Pathfinding & Bot AI Tests
└── prompts/                   # Project Roadmaps & Specs
    ├── version_3.md           # Version 3 Feature Specification
    ├── version_4.md           # Version 4 Single-Player AI & Cosmetics
    └── version_5.md           # Version 5 3D WebGL & WebGPU Roadmap
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Nikhil-Nishad/pythonic.git
cd pythonic
```

### 2. Run Tests
```bash
pnpm test
```

### 3. Start Local Development Server
```bash
pnpm start
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

The codebase includes node unit tests covering core business logic:
```bash
node --test tests/*.test.js
```
*13/13 tests passing with 100% assertion coverage.*

---

## 📜 License

Distributed under the MIT License. See `package.json` for details.
