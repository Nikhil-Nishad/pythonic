# 08. Snake App — Developer Quickstart Guide

> **snake-app/** is a self-contained Capacitor 6 project that wraps the Modern Snake web game
> into a native Android APK/AAB without requiring Android Studio on your local machine.

---

## Project Structure

```
snake-app/
├── index.html          # Mobile-first game shell (safe-area, exit dialog, splash)
├── styles.css          → symlink / copied from root (unchanged)
├── app-mobile.css      # Android-specific CSS overrides (safe-area, D-pad, bottom sheet)
├── game.js             → symlink / copied from root (unchanged — 100% compatible)
├── game-native.js      # Capacitor haptics patch & lifecycle wiring
├── src/
│   ├── native/
│   │   └── bridge.js   # NativeBridge — unified Capacitor plugin wrapper
│   ├── scoring.js      → from root src/
│   ├── leaderboard.js  → from root src/
│   ├── tutorial.js     → from root src/
│   ├── vitals.js       → from root src/
│   ├── audio/          → from root src/
│   ├── ai/             → from root src/
│   ├── quests/         → from root src/
│   ├── share/          → from root src/
│   └── skins/          → from root src/
├── capacitor.config.json
├── package.json
└── .gitignore
```

---

## Step 1 — Install Dependencies (one-time)

```powershell
cd snake-app
pnpm install
```

---

## Step 2 — Sync Web Assets to Android (every time you change any web file)

> **This is the core Capacitor workflow.** After modifying any `.js`, `.css`, or `.html` file,
> you must run `cap sync` to copy your changes into the Android native shell.

```powershell
# From snake-app/
npx cap sync android
```

Then **push to GitHub** — the GitHub Actions workflow will automatically build your APK!

---

## Step 3 — Trigger a Build (No Local Android Studio Needed)

1. Commit & push any change inside `snake-app/` to your `main` or `master` branch.
2. Go to **GitHub → Actions → "Build Modern Snake — Android APK & AAB"**.
3. Wait ~10–15 minutes for the cloud build.
4. Download your `app-debug.apk` from the **Artifacts** section.

### Manual Trigger
You can also trigger a build manually from GitHub Actions without pushing any code:

> **GitHub → Actions → "Build Modern Snake — Android APK & AAB" → Run workflow**

---

## Step 4 — Install APK on Your Android Device

```powershell
# Option A: ADB (if Android platform-tools is installed)
adb install app-debug.apk

# Option B: Transfer the .apk to your phone and open it
# (Enable "Install unknown apps" in Android Settings → Security)
```

---

## Step 5 — Configure Release Signing (for Play Store)

To build a **signed release AAB** for Google Play, add these secrets to your GitHub repo:

> **GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description |
|-------------|-------------|
| `KEYSTORE_BASE64` | Your `.jks` keystore file, base64 encoded |
| `KEYSTORE_PASS` | Keystore password |
| `KEY_ALIAS` | Key alias name inside the keystore |
| `KEY_PASS` | Key password |

### Generating a Keystore (one-time, run locally)

```powershell
# Requires Java JDK (keytool comes with it)
keytool -genkey -v `
  -keystore release-key.jks `
  -alias modernsnake `
  -keyalg RSA -keysize 2048 -validity 10000

# Convert to base64 for GitHub Secret
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release-key.jks")) | clip
# Paste the clipboard content as KEYSTORE_BASE64 in GitHub
```

> [!WARNING]
> **Never commit your .jks keystore file** to the repository! It is listed in `.gitignore`.
> Back it up somewhere safe. If you lose it, you cannot update your app on the Play Store.

---

## Development: Testing in Browser

You can test the game locally in any browser (the NativeBridge gracefully no-ops):

```powershell
cd snake-app
pnpm dev
# Opens http://localhost:3001
```

---

## AndroidManifest.xml Customization

After `npx cap add android` generates the `android/` directory, edit:
`android/app/src/main/AndroidManifest.xml`

Key attributes to set:
```xml
<application android:hardwareAccelerated="true">
    <activity
        android:screenOrientation="portrait"
        android:launchMode="singleTask"
        android:exported="true">
    </activity>
</application>
```

---

## Capacitor Config Reference

[`capacitor.config.json`](file:///d:/TimePass/v2.0/pythonic/snake-app/capacitor.config.json)

| Key | Value | Purpose |
|-----|-------|---------|
| `appId` | `com.nikhilnishad.modernsnake` | Play Store unique app identifier |
| `appName` | `Modern Snake` | Display name on device |
| `webDir` | `.` | Folder containing `index.html` |
| `androidScheme` | `https` | Security — avoids mixed content issues |
| `SplashScreen.launchShowDuration` | `2000ms` | How long native splash shows |
| `StatusBar.style` | `DARK` | Matches the game's dark theme |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npx cap add android` fails | Run `pnpm install` first inside `snake-app/` |
| APK installs but blank screen | Check GitHub Actions logs for JS errors; run with `webContentsDebuggingEnabled: true` |
| Touch controls don't work | Ensure `touch-action: none` is set on the canvas |
| Back button exits instead of pausing | NativeBridge `setupBackButton` runs automatically via `index.html` inline script |
| Haptics not firing on device | Enable "Haptic Feedback" in the in-game Settings panel |
| Build fails with Gradle error | Update `android/build.gradle` `compileSdkVersion` to 34 |

---

## Related Documentation

- [`01_TECH_STACK_COMPARISON.md`](file:///d:/TimePass/v2.0/pythonic/App_Migration/01_TECH_STACK_COMPARISON.md)
- [`03_CAPACITOR_TWA_STEP_BY_STEP_GUIDE.md`](file:///d:/TimePass/v2.0/pythonic/App_Migration/03_CAPACITOR_TWA_STEP_BY_STEP_GUIDE.md)
- [`05_GITHUB_ACTIONS_PIPELINE.md`](file:///d:/TimePass/v2.0/pythonic/App_Migration/05_GITHUB_ACTIONS_PIPELINE.md)
- [`07_PLAY_STORE_LAUNCH_RUNBOOK.md`](file:///d:/TimePass/v2.0/pythonic/App_Migration/07_PLAY_STORE_LAUNCH_RUNBOOK.md)
