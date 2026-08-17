/**
 * game-native.js — Capacitor Native Enhancement Layer for snake-app
 *
 * This module monkey-patches the SnakeGame instance that game.js creates,
 * upgrading the browser vibrate() calls to use Capacitor Haptics on Android.
 * It also wires up auto-pause/resume via app lifecycle events.
 *
 * Load order in index.html:
 *   1. bridge.js (NativeBridge module)
 *   2. game.js   (SnakeGame instance stored as window.snakeGame)
 *   3. game-native.js (this file — enhancements applied after game loads)
 */

import { NativeBridge } from './src/native/bridge.js';

// ─────────────────────────────────────────────────────────────────────────────
// Wait for SnakeGame to finish initializing, then apply native patches
// ─────────────────────────────────────────────────────────────────────────────
function patchGame(game) {
    if (!game) return;

    // Expose a controller interface for NativeBridge back-button & app lifecycle
    window._gameController = {
        pauseGame: () => {
            if (game.state === 'playing') game.pauseGame?.();
        },
        resumeAudio: () => {
            game.audio?.resume?.();
        }
    };

    // ── Upgrade vibrate() to use Capacitor Haptics ────────────────────────────
    const originalVibrate = game.vibrate.bind(game);

    game.vibrate = function(pattern) {
        if (!this.hapticEnabled) return;

        // Route to native Capacitor haptics when on Android
        if (NativeBridge.isNative()) {
            if (Array.isArray(pattern)) {
                // Heavy pattern = game over / collision
                NativeBridge.vibrateHeavy();
            } else if (typeof pattern === 'number') {
                if (pattern >= 40) {
                    NativeBridge.vibrateMedium();
                } else {
                    NativeBridge.vibrateLight();
                }
            }
        } else {
            // Fallback to original navigator.vibrate
            originalVibrate(pattern);
        }
    };

    // ── Level-up success notification ─────────────────────────────────────────
    const originalLevelUp = game.handleLevelUp?.bind(game);
    if (originalLevelUp) {
        game.handleLevelUp = function() {
            if (NativeBridge.isNative() && this.hapticEnabled) {
                NativeBridge.vibrateSuccess();
            }
            return originalLevelUp();
        };
    }

    // ── Game-over error notification ──────────────────────────────────────────
    const originalGameOver = game.endGame?.bind(game);
    if (originalGameOver) {
        game.endGame = function() {
            if (NativeBridge.isNative() && this.hapticEnabled) {
                NativeBridge.vibrateError();
            }
            return originalGameOver();
        };
    }

    console.log('[NativePatch] SnakeGame enhanced with Capacitor Haptics ✓');
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply patch after game.js finishes initializing (DOMContentLoaded + timeout)
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // game.js uses setTimeout 50ms before creating SnakeGame
    // We wait 200ms to guarantee it's ready
    setTimeout(() => {
        if (window.snakeGame) {
            patchGame(window.snakeGame);
        } else {
            // Polling fallback for slow devices
            let attempts = 0;
            const poller = setInterval(() => {
                if (window.snakeGame || attempts++ > 20) {
                    clearInterval(poller);
                    patchGame(window.snakeGame);
                }
            }, 100);
        }
    }, 200);
});
