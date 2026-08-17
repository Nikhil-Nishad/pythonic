# 03. Step-by-Step Capacitor Android Implementation Guide

This guide walks through converting the Modern Snake web project into a native Android project using **Capacitor 6** without needing local Android Studio.

---

## 1. Project Initialization & Dependencies

In your project root (`pythonic`), install Capacitor core, CLI, Android platform, and high-value native plugins using `pnpm`:

```bash
# 1. Install Capacitor Core and CLI
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# 2. Install Native Enhancements (Haptics, Status Bar, Splash Screen, Hardware Back Button)
pnpm add @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen @capacitor/app @capacitor/screen-orientation
```

---

## 2. Capacitor Configuration File (`capacitor.config.json`)

Create `capacitor.config.json` in your project root:

```json
{
  "appId": "com.nikhilnishad.modernsnake",
  "appName": "Modern Snake",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "launchAutoHide": true,
      "backgroundColor": "#0d1117",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#0d1117",
      "overlaysWebView": false
    }
  },
  "android": {
    "allowMixedContent": false,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  }
}
```

---

## 3. Generate Android Native Shell

Run the initialization and add command:

```bash
# Initialize Capacitor
npx cap init "Modern Snake" "com.nikhilnishad.modernsnake" --web-dir .

# Add Android Platform
npx cap add android
```

This creates the `android/` directory containing the native Gradle configuration and Android app template.

---

## 4. Native JavaScript Bridge Integration

Enhance [`game.js`](file:///d:/TimePass/v2.0/pythonic/game.js) to trigger native Android APIs when running inside the app while remaining 100% functional on the web.

Add a small helper module or snippet:

```javascript
// Native Device API Bridge (Capacitor Safe Wrapper)
const NativeBridge = {
    isNative: window.Capacitor !== undefined,

    // Native Haptics
    vibrateLight: async function() {
        if (this.isNative && window.Capacitor.Plugins.Haptics) {
            try {
                await window.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' });
            } catch (e) {}
        } else if (navigator.vibrate) {
            navigator.vibrate(15);
        }
    },

    vibrateHeavy: async function() {
        if (this.isNative && window.Capacitor.Plugins.Haptics) {
            try {
                await window.Capacitor.Plugins.Haptics.impact({ style: 'HEAVY' });
            } catch (e) {}
        } else if (navigator.vibrate) {
            navigator.vibrate([40, 30, 60]);
        }
    },

    // Handle Android Hardware Back Button
    setupBackButton: function(onBackPress) {
        if (this.isNative && window.Capacitor.Plugins.App) {
            window.Capacitor.Plugins.App.addListener('backButton', ({ canGoBack }) => {
                onBackPress();
            });
        }
    },

    // Set Status Bar Color
    initStatusBar: async function() {
        if (this.isNative && window.Capacitor.Plugins.StatusBar) {
            try {
                await window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#0d1117' });
            } catch (e) {}
        }
    }
};

// Example Integration in Game Events:
// 1. On Food Eat: NativeBridge.vibrateLight();
// 2. On Game Over Collision: NativeBridge.vibrateHeavy();
// 3. On Hardware Back:
NativeBridge.setupBackButton(() => {
    // If a modal is open, close it. Otherwise, pause or show exit prompt.
    const activeOverlay = document.querySelector('.settings-panel:not(.hidden)');
    if (activeOverlay) {
        activeOverlay.classList.add('hidden');
    } else {
        // Toggle Game Pause
        const pauseBtn = document.getElementById('pause-overlay');
        if (pauseBtn) pauseBtn.classList.toggle('hidden');
    }
});
```

---

## 5. Optimizing `AndroidManifest.xml`

Inside `android/app/src/main/AndroidManifest.xml`, ensure high-performance hardware rendering and screen orientation lock:

```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme"
    android:hardwareAccelerated="true"> <!-- CRITICAL for locked 60FPS Canvas -->

    <activity
        android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
        android:name=".MainActivity"
        android:label="@string/title_activity_main"
        android:theme="@style/AppTheme.NoActionBarLaunch"
        android:launchMode="singleTask"
        android:screenOrientation="portrait"
        android:exported="true">

        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

---

## 6. Syncing Web Assets to Android

Whenever you modify any web file (`index.html`, `game.js`, `styles.css`, etc.):

```bash
# Copies web files into the native android assets folder
npx cap sync android
```

Once synced, push to GitHub. The GitHub Actions cloud runner will immediately compile and sign the release `.aab` file!
