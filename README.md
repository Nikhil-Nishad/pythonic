# Modern Snake Game 🐍✨

[![Version 3.1.0](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/Nikhil-Nishad/pythonic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](manifest.webmanifest)
[![SEO Score](https://img.shields.io/badge/SEO-100-brightgreen.svg)](sitemap.xml)

A high-performance, mobile-friendly, Google-level SEO optimized browser game built with **Vanilla JavaScript ES Modules**, **HTML5 Canvas**, and **CSS3**. Features persistent local/remote Leaderboards, Level Progression with 2-second pause countdowns, Dynamic Hazard Obstacles, Power-ups, PWA offline support, and dedicated developer blog articles.

---

## 🌟 Key Features

- **🎮 60FPS Fluid Gameplay**: Smooth 60FPS canvas rendering with particle trail bursts, screen shake, and ambient lighting orbs.
- **🏆 Persistent Leaderboard System**: Modular `LeaderboardService` tracking top scores, player names, avatar badges, and rank achievements.
- **⚡ Dynamic Levels & Obstacles**: Level progression featuring a **2-second pause & countdown timer** on Level Up and dynamic hazard obstacles spawning at Level 3+.
- **🍎 Food Types & Power-ups**: Normal apples, 3x Golden Bonuses, Speed boosts, Slow-Mo, Ghost mode, Shields, Double Points, and Shrink power-ups.
- **📱 PWA & Offline Play**: Service worker (`sw.js`) cache-first offline support and Web App manifest (`manifest.webmanifest`).
- **🔍 Google-Level SEO & Structured Data**: Complete Open Graph, Twitter Cards, `sitemap.xml`, `robots.txt`, and rich **JSON-LD schema markup** (`SoftwareApplication`, `Game`, `FAQPage`, `BlogPosting`).
- **📰 Dedicated Content & Blog Pages**: Integrated `instructions.html` guide and `blog.html` strategy articles.

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
│   └── vitals.js              # VitalsMonitor (RUM Web Vitals Agent)
├── tests/                     # Unit Tests
│   ├── scoring.test.js        # Scoring Engine Test Suite
│   └── leaderboard.test.js    # Leaderboard Service Test Suite
└── prompts/                   # Project Roadmaps & Specs
    ├── version_3.md           # Version 3 Feature Specification
    └── version_4.md           # Version 4 Multiplayer & AI Roadmap
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
*7/7 tests passing with 100% assertion coverage.*

---

## 📜 License

Distributed under the MIT License. See `package.json` for details.
