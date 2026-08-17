/**
 * NativeBridge — Capacitor 6 Plugin Wrapper for Modern Snake Android App
 *
 * Provides a safe, unified API for native Android capabilities.
 * All methods gracefully fall back to web APIs or no-ops when running in a browser.
 *
 * Usage:
 *   import { NativeBridge } from './src/native/bridge.js';
 *   await NativeBridge.init();
 *   NativeBridge.vibrateLight();
 */

const isNative = () =>
  typeof window !== 'undefined' &&
  typeof window.Capacitor !== 'undefined' &&
  window.Capacitor.isNativePlatform();

const plugin = (name) => {
  try {
    return isNative() ? window.Capacitor.Plugins[name] : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// Initialization & Platform Setup
// ─────────────────────────────────────────────
async function init() {
  if (!isNative()) return;

  try {
    // Hide splash screen after game canvas is ready
    const Splash = plugin('SplashScreen');
    if (Splash) {
      setTimeout(() => Splash.hide(), 500);
    }

    // Set immersive dark status bar
    const StatusBar = plugin('StatusBar');
    if (StatusBar) {
      await StatusBar.setStyle({ style: 'DARK' });
      await StatusBar.setBackgroundColor({ color: '#0d1117' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }

    // Lock to portrait
    const ScreenOrientation = plugin('ScreenOrientation');
    if (ScreenOrientation) {
      await ScreenOrientation.lock({ orientation: 'portrait' });
    }

    console.log('[NativeBridge] Initialized on Android');
  } catch (e) {
    console.warn('[NativeBridge] Init error:', e);
  }
}

// ─────────────────────────────────────────────
// Haptic Feedback
// ─────────────────────────────────────────────
async function vibrateLight() {
  const Haptics = plugin('Haptics');
  if (Haptics) {
    try { await Haptics.impact({ style: 'LIGHT' }); return; } catch {}
  }
  if (navigator.vibrate) navigator.vibrate(15);
}

async function vibrateMedium() {
  const Haptics = plugin('Haptics');
  if (Haptics) {
    try { await Haptics.impact({ style: 'MEDIUM' }); return; } catch {}
  }
  if (navigator.vibrate) navigator.vibrate(30);
}

async function vibrateHeavy() {
  const Haptics = plugin('Haptics');
  if (Haptics) {
    try { await Haptics.impact({ style: 'HEAVY' }); return; } catch {}
  }
  if (navigator.vibrate) navigator.vibrate([40, 30, 60]);
}

async function vibrateSuccess() {
  const Haptics = plugin('Haptics');
  if (Haptics) {
    try { await Haptics.notification({ type: 'SUCCESS' }); return; } catch {}
  }
  if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
}

async function vibrateError() {
  const Haptics = plugin('Haptics');
  if (Haptics) {
    try { await Haptics.notification({ type: 'ERROR' }); return; } catch {}
  }
  if (navigator.vibrate) navigator.vibrate([50, 20, 50, 20, 50]);
}

// ─────────────────────────────────────────────
// Android Back Button Handling
// ─────────────────────────────────────────────
let backButtonListenerAdded = false;

function setupBackButton(callback) {
  const App = plugin('App');
  if (!App || backButtonListenerAdded) return;

  App.addListener('backButton', ({ canGoBack }) => {
    callback({ canGoBack });
  });
  backButtonListenerAdded = true;
}

// ─────────────────────────────────────────────
// App Lifecycle (foreground / background)
// ─────────────────────────────────────────────
function onAppStateChange(callback) {
  const App = plugin('App');
  if (!App) return;
  App.addListener('appStateChange', ({ isActive }) => {
    callback(isActive);
  });
}

// ─────────────────────────────────────────────
// Platform Detection Utilities
// ─────────────────────────────────────────────
function getPlatform() {
  if (!isNative()) return 'web';
  try {
    return window.Capacitor.getPlatform(); // 'android' | 'ios'
  } catch {
    return 'web';
  }
}

function isAndroid() {
  return getPlatform() === 'android';
}

export const NativeBridge = {
  init,
  isNative,
  getPlatform,
  isAndroid,
  vibrateLight,
  vibrateMedium,
  vibrateHeavy,
  vibrateSuccess,
  vibrateError,
  setupBackButton,
  onAppStateChange,
};
