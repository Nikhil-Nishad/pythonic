# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-08-11

### Added
- **SEO Optimization**: Google-level SEO meta tags, Open Graph, Twitter Cards, and `SoftwareApplication` / `Game` JSON-LD structured data.
- **Dedicated Landing Page**: `instructions.html` with step-by-step gameplay instructions, controls preview, strategy tips, and interactive FAQ with `FAQPage` schema.
- **Leaderboard System**: Modular `LeaderboardService` featuring high scores, player avatars, local storage persistence, rank badges, and API sync interfaces.
- **Scoring Engine**: Dedicated `ScoringEngine` module supporting base points, combo multipliers, speed bonuses, streaks, and level progression rules.
- **Interactive Tutorial**: `TutorialManager` overlay system guiding new players through keyboard & touch controls.
- **Progressive Web App (PWA)**: Web app manifest (`manifest.webmanifest`) and Cache-First Service Worker (`sw.js`) for offline play.
- **Performance Telemetry**: RUM `VitalsMonitor` monitoring LCP, CLS, INP, and FPS.
- **CI/CD & Automation**: GitHub Actions CI workflow for linting, testing, asset validation, and automated building.
- **Automated Tests**: Unit test suite for scoring engine and leaderboard persistence.

### Changed
- Refactored core game loop to integrate modular engines.
- Enhanced UI aesthetics with glow effects, floating score popups, and dark mode design tokens.
