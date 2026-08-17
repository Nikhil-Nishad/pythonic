# 02. Low-Spec PC Setup & Cloud CI/CD Build Guide

This guide enables you to build, test, and package the Android app **without installing Android Studio or running memory-heavy emulators**.

---

## 1. The Low-Spec PC Workflow Overview

```
[Local Machine (Low RAM/CPU)]
  ├── Code editing in VS Code / lightweight editor
  ├── Local testing in browser (pnpm start / live server)
  ├── USB Debugging on real physical Android device (chrome://inspect)
  └── Git push to GitHub repository
         │
         ▼
[GitHub Actions Cloud Runner (Free Cloud CI/CD)]
  ├── 16 GB RAM + 4 vCPUs (Ubuntu Cloud Runner)
  ├── Compiles Java/Gradle and native Android project
  ├── Signs `.aab` / `.apk` using Keystore Secrets
  └── Outputs ready-to-download `.apk` (for phone) & `.aab` (for Google Play)
```

---

## 2. Local Testing on a Real Android Phone (Zero Emulator Lag)

Emulators require 4GB–8GB of RAM and significant CPU virtualization. A real Android phone connected via USB provides **100% accurate performance, haptic testing, and zero system load**.

### Steps to Setup USB Debugging:
1. **Enable Developer Options on Android Phone**:
   - Go to `Settings` > `About Phone`.
   - Tap `Build Number` 7 times until you see `"You are now a developer!"`.
2. **Enable USB Debugging**:
   - Go to `Settings` > `System` / `Additional Settings` > `Developer Options`.
   - Turn on **USB Debugging** and **Install via USB**.
3. **Connect Phone to PC via USB Cable**:
   - On the phone popup, check `"Always allow from this computer"` and tap **Allow**.
4. **Live Inspect & Test**:
   - Open Google Chrome on your PC.
   - Navigate to `chrome://inspect/#devices`.
   - You will see your connected phone. You can port-forward `http://localhost:3000` or inspect the WebView with full DevTools, breakpoints, and console logs!

---

## 3. Creating the Android Keystore (Signing Key) via CLI

Google Play requires all release App Bundles (`.aab`) to be cryptographically signed. You can generate your release key in 10 seconds using the standard Java `keytool` CLI.

Run this command in your terminal (PowerShell or Bash):

```powershell
keytool -genkey -v -keystore release-key.jks -alias snake-key -keyalg RSA -keysize 2048 -validity 10000
```

> [!IMPORTANT]
> - **Remember your Password and Alias**: Save the password and alias name securely.
> - **Do NOT commit `release-key.jks` to GitHub!** Keep it in a secure local backup.

### Convert Keystore to Base64 (For GitHub Secrets):
Run the following PowerShell command to convert your keystore into a text string:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release-key.jks")) | Out-File -FilePath keystore_base64.txt
```

---

## 4. Setting up GitHub Secrets

In your GitHub repository:
1. Navigate to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following 4 secrets:

| Secret Name | Value Description |
| :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | The complete text content from `keystore_base64.txt` |
| `KEYSTORE_PASSWORD` | The password you entered during `keytool` creation |
| `KEY_ALIAS` | `snake-key` (or your chosen alias) |
| `KEY_PASSWORD` | The key password (usually the same as keystore password) |

---

## 5. Automated GitHub Actions CI/CD Workflow

Create the file `.github/workflows/android-build.yml` in your repository. Every time you push or trigger manually, GitHub's cloud servers will compile and sign your Android `.aab` and `.apk`!

```yaml
name: Build & Sign Android App

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK and AAB
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile || pnpm install

      - name: Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Sync Capacitor Android Project
        run: |
          npx cap sync android

      - name: Decode Release Keystore
        if: env.ANDROID_KEYSTORE_BASE64 != ''
        env:
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > android/app/release-key.jks

      - name: Build Release Bundle (AAB) & APK
        working-directory: android
        run: |
          ./gradlew bundleRelease assembleRelease

      - name: Sign Android Release Artifacts
        if: env.KEYSTORE_PASSWORD != ''
        uses: ralfirza/action-android-build-sign@v1.0.1
        with:
          releaseDirectory: android/app/build/outputs/bundle/release
          signingKey: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          keyStorePassword: ${{ secrets.KEYSTORE_PASSWORD }}
          keyAlias: ${{ secrets.KEY_ALIAS }}
          keyPassword: ${{ secrets.KEY_PASSWORD }}
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}

      - name: Upload Release AAB (Google Play Store)
        uses: actions/upload-artifact@v4
        with:
          name: modern-snake-release-aab
          path: android/app/build/outputs/bundle/release/*.aab

      - name: Upload Test APK (Direct Phone Install)
        uses: actions/upload-artifact@v4
        with:
          name: modern-snake-test-apk
          path: android/app/build/outputs/apk/release/*.apk
```

---

## 6. Downloading Your Completed Android App
1. Go to your repository's **Actions** tab on GitHub.
2. Click on the latest workflow run.
3. Under **Artifacts** at the bottom, download:
   - `modern-snake-test-apk`: Install directly onto any Android phone for offline field testing.
   - `modern-snake-release-aab`: Upload directly into the **Google Play Console**!
