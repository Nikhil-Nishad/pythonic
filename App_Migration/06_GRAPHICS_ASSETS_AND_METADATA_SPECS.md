# 06. Graphics Assets & Metadata Specifications

High-converting visual assets are the single biggest driver of Play Store install conversions (CRO). This document specifies the exact dimensions, design templates, and screenshot layouts required by the Google Play Console.

---

## 1. Required Asset Checklist & Specifications

| Asset | Dimensions | Format | Max File Size | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **High-Res App Icon** | `512 x 512 px` | 32-bit PNG (with Alpha) | `1 MB` | Store listing & search results |
| **Adaptive Icon Foreground** | `432 x 432 px` (Safe zone 264px) | Transparent PNG | `1 MB` | Android device home screen |
| **Adaptive Icon Background** | `432 x 432 px` (Color `#0d1117`) | Solid PNG / Vector | `1 MB` | Android device home screen |
| **Feature Graphic** | `1024 x 500 px` | 24-bit PNG or JPEG (No alpha) | `15 MB` | Top banner on store listing & ads |
| **Phone Screenshots (4–8)** | `1080 x 2400 px` (Portrait 20:9) | 24-bit PNG or JPEG | `8 MB / image` | Main carousel on store listing |
| **7-inch Tablet Screenshots** | `1200 x 1920 px` | PNG or JPEG | `8 MB / image` | Tablet discoverability |
| **10-inch Tablet Screenshots**| `1600 x 2560 px` | PNG or JPEG | `8 MB / image` | Tablet discoverability & Chromebook |
| **Promo Video (Optional)** | `1920 x 1080 px` (Landscape) | YouTube URL | - | Auto-playing preview trailer |

---

## 2. App Icon Design Blueprint

```
+-------------------------------------------------------+
|  512 x 512 px Icon Composition                        |
|                                                       |
|   Background: Deep Dark Navy Gradient (#0d1117 -> #161b22)|
|                                                       |
|                  ┌──────────┐                         |
|                  │  🐍 🟢   │  Glowing Neon Snake     |
|                  │    └─┐   │  Vector Segment Head    |
|                  │ 🍎   │   │  Glossy Red Apple       |
|                  └──────┘   │                         |
|                                                       |
|   Subtle Cyan Glow Ring: 8px stroke (#58a6ff)         |
+-------------------------------------------------------+
```

---

## 3. Feature Graphic Blueprint (`1024 x 500 px`)

The Feature Graphic appears at the top of your Google Play Store listing.

- **Safe Zone**: Keep all text and key characters within the central `820 x 380 px` to avoid cutoff on varying mobile screen sizes.
- **Left Side (`35%`)**: Bold typography:
  - Header: **`MODERN SNAKE`** (Color: `#58a6ff`, Font: Space Grotesk Bold, 52pt)
  - Subhead: **`60FPS RETRO ARCADE ACTION`** (Color: `#3fb950`, 24pt)
  - Badges: `⚡ 100% Offline` | `🤖 A* AI Rivals` | `🎨 Neon Skins`
- **Right Side (`65%`)**: Isometric rendering of the snake grid with glowing fruit, vibrant particles, and rival AI bot head.
- **Background**: Modern glassmorphic radial gradient with ambient glow orbs.

---

## 4. Phone Screenshots Storyboard (6-Slide Sequence)

Use a clean mockup frame (e.g., Pixel 8 / modern bezel-less device) with bold top caption banners:

| Slide # | Headline Banner | Visual Content Shown |
| :---: | :--- | :--- |
| **1** | **`CLASSIC SNAKE REIMAGINED`** | Vibrant dark mode canvas with glowing cyan snake, floating stats header, and fluid ambient background. |
| **2** | **`LOCKED 60FPS FLUID MOTION`** | On-screen tactile controls highlighted with subtle glow; speed level progression badge visible. |
| **3** | **`CHALLENGE SMART AI RIVALS`** | Split-color grid in VS Bot mode; player snake racing against red AI bot snake with A* path trail. |
| **4** | **`COLLECT EPIC NEON SKINS`** | Open Skin Selector showing Emerald, Cyberpunk Glow, Molten Lava, and Golden Dragon skins. |
| **5** | **`DAILY QUESTS & COMBOS`** | Active quest list with "Claim Reward" button and active 5x Combo Multiplier particle explosion on board. |
| **6** | **`100% OFFLINE — NO ADS`** | Airplane mode icon with game active; global top-10 leaderboard showcase. |

---

## 5. 30-Second Promo Video Script

If uploading a trailer to YouTube for the Play Store listing:

- **0:00 – 0:05**: Nostalgic Nokia 3310 green pixel screen dissolves into modern 60FPS neon canvas.
  - *Text Overlay: "The Classic You Love. Reimagined."*
- **0:05 – 0:12**: Fast-paced gameplay montage showcasing snake growth, eating bonus golden food, and triggering 5x combo multiplier.
  - *Sound: Procedural 8-bit chiptune sound synthesis in background.*
- **0:12 – 0:20**: Switch to VS Bot mode showing real-time race against A* AI opponent.
  - *Text Overlay: "Outsmart Intelligent AI Rivals!"*
- **0:20 – 0:25**: Quick montage of unlocking custom skins and completing daily quests.
- **0:25 – 0:30**: Final splash screen with download badge: *"Play Free Now on Google Play"*.
