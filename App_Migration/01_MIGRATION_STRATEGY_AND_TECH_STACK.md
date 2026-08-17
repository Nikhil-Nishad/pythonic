# 01. Migration Strategy & Technology Stack Comparison

## 1. Executive Problem Statement
The goal is to convert the modern Snake Game web codebase into a production-ready Android App (`.apk` / `.aab`) publishable on the Google Play Store under two key constraints:
1. **Low-Spec Development Machine**: Avoid heavy memory footprints (such as running the Android Studio IDE + Android Emulator simultaneously, which easily exhausts 8GB–16GB RAM).
2. **Preserve High-Fidelity Performance**: Retain the buttery-smooth 60FPS canvas rendering, procedural Web Audio synthesizer, instant load times, and custom touch controls.

---

## 2. Technology Stack Evaluation Matrix

| Criterion | Option A: Capacitor (Recommended) | Option B: Bubblewrap / TWA | Option C: Pure Flutter (Flame Engine) | Option D: Flutter Hybrid (WebView) |
| :--- | :--- | :--- | :--- | :--- |
| **Codebase Reuse** | **100%** (HTML5, JS, CSS) | **100%** (Hosted PWA / TWA) | **0%** (Full rewrite in Dart) | **100%** (Embedded in Flutter) |
| **RAM Usage during Dev** | **~250 MB** (VS Code + CLI) | **~150 MB** (Node CLI) | **~2.5 GB - 4 GB** (Dart/Flutter) | **~2.5 GB - 4 GB** |
| **Local Disk Space** | **~600 MB** | **~350 MB** | **~8 GB - 15 GB** (Flutter SDK) | **~8 GB - 15 GB** |
| **Local Android Studio Needed?** | **No** (Cloud CI/CD or CLI) | **No** (CLI only) | **Yes/CLI** (Heavy Gradle) | **Yes/CLI** |
| **Offline Performance** | ⚡ **Instant** (Local bundled assets) | 🌐 **Dependent on Cache/SW** | ⚡ **Instant** (Native bytecode) | ⚡ **Instant** (Local bundle) |
| **Binary Size (.aab)** | **~2.5 MB - 4.5 MB** | **~1.2 MB - 2.0 MB** | **~12 MB - 25 MB** | **~15 MB - 30 MB** |
| **Frame Rate** | **Locked 60 FPS** (Hardware Canvas) | **Locked 60 FPS** (Chrome Engine) | **60 - 120 FPS** (Skia/Impeller) | **60 FPS** |
| **Native API Access** | ✅ Rich Plugins (Haptics, GPGS, IAP) | ⚠️ Limited Web APIs only | ✅ Direct Platform Channels | ✅ Direct Platform Channels |
| **Development Time** | ⏱️ **1 - 2 Hours** | ⏱️ **30 Minutes** | ⏱️ **3 - 4 Weeks** | ⏱️ **1 - 2 Days** |

---

## 3. Deep Dive into the Approaches

### Option A: **Capacitor 6 (The Prime Champion for Low-Spec PCs)**
- **How it works**: Capacitor wraps your exact existing web files (`index.html`, `game.js`, `styles.css`, `src/`) into a native Android WebView app container with high-performance hardware acceleration (`android:hardwareAccelerated="true"`).
- **Why it fits a low-spec PC**:
  - You edit HTML/JS/CSS in your favorite lightweight editor (VS Code, Sublime, Notepad++).
  - You do not need to launch Android Studio to edit or test.
  - You test in real-time in any desktop browser or connected Android phone via `chrome://inspect`.
  - Android binaries (`.aab` and `.apk`) are built automatically using **GitHub Actions CI/CD** in the cloud.
- **Native Capabilities**: Full support for native haptic feedback, custom splash screens, status bar theme synchronization, Google Play In-App Review prompts, and AdMob banner/interstitial ads.

### Option B: **Bubblewrap TWA (Trusted Web Activity)**
- **How it works**: Uses Google's official Trusted Web Activity standard to open your live hosted PWA (`https://pythonics.vercel.app/`) in full-screen standalone Chrome without browser URL bars.
- **Pros**: Smallest possible binary (~1.5 MB), automatic updates whenever you push to Vercel.
- **Cons**: Requires active domain ownership, digital asset links (`/.well-known/assetlinks.json`), and requires internet for the initial handshake or depends strictly on Service Worker caching for offline play.

### Option C: **Pure Flutter (Full Dart / Flame Engine Rewrite)**
- **How it works**: Complete recreation of the game using Flutter and the Flame 2D game engine.
- **Pros**: Native Skia/Impeller rendering pipeline, single codebase for iOS/Android/macOS/Windows, high control over native widgets.
- **Cons for Low-Spec PC**:
  - Massive initial download and setup (Flutter SDK + Android Command-line Tools + Gradle cache).
  - Gradle compilation on dual-core or 4GB RAM PCs can freeze the system for 10–20 minutes per cold build.
  - Requires translating ~3,500 lines of existing JavaScript (Canvas particle physics, A* pathfinding bot, Web Audio synth oscillators, skin registries, dynamic quest state).

### Option D: **Flutter Hybrid Shell (`flutter_inappwebview`)**
- **How it works**: Create a Flutter application that serves the local web assets inside a `InAppWebView` widget.
- **Verdict**: Adds 15MB+ of Flutter runtime overhead without providing any performance benefit over Capacitor.

---

## 4. Strategic Architecture Verdict

### 🏆 Recommended 2-Phase Strategy:

```
[Phase 1: Immediate Launch (Capacitor 6 + Cloud Builds)]
  ├── Zero code rewrite (100% existing JS game engine reused)
  ├── 100% Cloud-built via GitHub Actions (0% CPU stress on your PC)
  ├── Fast-tracked to Google Play Store in days
  └── Instant compliance with Google Play Store 2026 guidelines

[Phase 2: Long-Term Evolution (Optional Native Flutter Engine)]
  └── If you later acquire a high-end workstation or desire native iOS/macOS releases,
      reference Document 04 for the Flame / Dart architectural blueprint.
```
