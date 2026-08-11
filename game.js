import { ScoringEngine } from './src/scoring.js';
import { LeaderboardService } from './src/leaderboard.js';
import { TutorialManager } from './src/tutorial.js';
import { VitalsMonitor } from './src/vitals.js';

/**
 * Modern Snake Game - High Quality Implementation
 * Features: Smooth animations, particle effects, sound, levels, touch controls, settings
 */

// ============================================
// Configuration & Constants
// ============================================
const CONFIG = {
    // Grid
    GRID_SIZE: 20,
    INITIAL_SPEED: 130, // ms per frame
    SPEED_INCREMENT: 8, // ms faster per level
    MIN_SPEED: 50,      // maximum speed cap

    // Scoring
    BASE_POINTS: 10,
    BONUS_MULTIPLIER: 3,
    STREAK_BONUS: 5,

    // Levels
    POINTS_PER_LEVEL: 100,
    FOOD_PER_LEVEL: 5,

    // Visual
    PARTICLE_COUNT: 12,
    PARTICLE_LIFE: 600,
    SCREEN_SHAKE_DURATION: 150,

    // Performance
    TARGET_FPS: 60,
    MAX_PARTICLES: 150,
    PARTICLE_BATCH_SIZE: 50,

    // Accessibility
    REDUCED_MOTION_DURATION: 0.01,

    // Colors (CSS variables mapped)
    COLORS: {
        snakeHead: '#58a6ff',
        snakeBody: '#388bfd',
        snakeTail: '#1f6feb',
        snakeGlow: 'rgba(88, 166, 255, 0.6)',
        foodNormal: '#58a6ff',
        foodBonus: '#d29922',
        foodSpeed: '#f85149',
        foodGlow: 'rgba(88, 166, 255, 0.8)',
        grid: 'rgba(48, 54, 61, 0.3)',
        bg: '#0d1117',
        particle: ['#58a6ff', '#a371f7', '#00d9ff', '#ff6b9d', '#d29922', '#3fb950']
    }
};

// Game State Enum
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_UP: 'level_up'
};

// Direction Vectors
const Directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

const OppositeDirection = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
};

// Food Types
const FoodType = {
    NORMAL: 'normal',
    BONUS: 'bonus',
    SPEED: 'speed'
};

// Power-up Types
const PowerUpType = {
    SLOW_MO: 'slow_mo',
    GHOST: 'ghost',
    DOUBLE_POINTS: 'double_points',
    SHRINK: 'shrink',
    SHIELD: 'shield'
};

// Game Modes
const GameMode = {
    CLASSIC: 'classic',
    ARCADE: 'arcade',
    CHALLENGE: 'challenge'
};

// ============================================
// Utility Functions
// ============================================
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const lerp = (a, b, t) => a + (b - a) * t;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[randomInt(0, arr.length - 1)];

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.frameTimes = [];
    }

    update() {
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;
        this.frameTimes.push(delta);
        if (this.frameTimes.length > 60) this.frameTimes.shift();

        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = now;
        }
        return this.fps;
    }

    getAverageFPS() {
        if (this.frameTimes.length < 2) return this.fps;
        const total = this.frameTimes.reduce((a, b) => a + b, 0);
        return Math.round(1000 / (total / this.frameTimes.length));
    }
}

// ============================================
// Audio Engine (Web Audio API)
// ============================================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.musicEnabled = true;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicOscillators = [];
        this.musicInterval = null;
        this.ambientOscillators = [];
    }

    async init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();

            this.masterGain.connect(this.ctx.destination);
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);

            this.masterGain.gain.value = 0.3;
            this.musicGain.gain.value = 0.15;
            this.sfxGain.gain.value = 0.4;
        } catch (e) {
            console.warn('Audio not supported:', e);
            this.enabled = false;
        }
    }

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = enabled ? 0.3 : 0;
        }
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (this.musicGain) {
            this.musicGain.gain.value = enabled ? 0.15 : 0;
        }
        if (!enabled) this.stopMusic();
    }

    setSfxVolume(vol) {
        if (this.sfxGain) this.sfxGain.gain.value = clamp(vol, 0, 1);
    }

    setMasterVolume(vol) {
        if (this.masterGain) this.masterGain.gain.value = clamp(vol, 0, 1);
    }

    // --- Sound Effects ---
    playTone(freq, duration, type = 'sine', gainVal = 1, delay = 0) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = type;
        osc.frequency.value = freq;
        const now = this.ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.start(now);
        osc.stop(now + duration);
    }

    playChord(freqs, duration, type = 'sine', gainVal = 0.5) {
        freqs.forEach((f, i) => this.playTone(f, duration, type, gainVal, i * 0.02));
    }

    // Eat sound
    playEat(isBonus = false) {
        if (isBonus) {
            this.playChord([660, 880, 1320], 0.2, 'triangle', 0.3);
        } else {
            this.playTone(520, 0.1, 'square', 0.25);
            this.playTone(780, 0.1, 'square', 0.15, 0.03);
        }
    }

    // Level up
    playLevelUp() {
        this.playChord([523.25, 659.25, 783.99, 1046.5], 0.5, 'sine', 0.25);
        setTimeout(() => this.playChord([1046.5, 1318.5, 1568], 0.4, 'triangle', 0.2), 150);
    }

    // Game over
    playGameOver() {
        this.playTone(330, 0.3, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(247, 0.3, 'sawtooth', 0.3), 150);
        setTimeout(() => this.playTone(196, 0.5, 'sawtooth', 0.3), 300);
    }

    // Move tick (subtle)
    playMove() {
        this.playTone(180, 0.02, 'sine', 0.05);
    }

    // Direction change
    playTurn() {
        this.playTone(280, 0.04, 'triangle', 0.08);
    }

    // Button click
    playClick() {
        this.playTone(800, 0.06, 'square', 0.1);
    }

    // Power-up sounds
    playPowerUp(type) {
        const sounds = {
            [PowerUpType.SLOW_MO]: () => this.playChord([440, 554, 659], 0.4, 'sine', 0.2),
            [PowerUpType.GHOST]: () => this.playChord([523, 784, 1047], 0.3, 'triangle', 0.25),
            [PowerUpType.DOUBLE_POINTS]: () => this.playChord([659, 880, 1319], 0.4, 'square', 0.2),
            [PowerUpType.SHRINK]: () => this.playTone(880, 0.2, 'sawtooth', 0.2),
            [PowerUpType.SHIELD]: () => this.playChord([392, 523, 659], 0.5, 'sine', 0.25)
        };
        if (sounds[type]) sounds[type]();
    }

    // Power-up expire
    playPowerUpExpire() {
        this.playTone(220, 0.3, 'sawtooth', 0.2);
    }

    // --- Ambient Music ---
    startMusic() {
        if (!this.enabled || !this.musicEnabled || !this.ctx) return;
        this.stopMusic();
        const notes = [220, 247, 277, 311, 330, 370, 415, 440];
        let noteIndex = 0;
        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled) return;
            const freq = notes[noteIndex % notes.length];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
            osc.start(now);
            osc.stop(now + 3);
            this.musicOscillators.push(osc);
            noteIndex++;
        }, 3000);
    }

    startAmbientSounds(level = 1) {
        if (!this.enabled || !this.musicEnabled || !this.ctx) return;
        this.stopAmbientSounds();
        // Add environmental sounds based on level
        const ambientNotes = [110, 131, 147, 165, 196]; // Lower register
        let noteIndex = 0;
        this.ambientInterval = setInterval(() => {
            if (!this.musicEnabled) return;
            const freq = ambientNotes[noteIndex % ambientNotes.length] * (1 + level * 0.05);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 5);
            osc.start(now);
            osc.stop(now + 6);
            this.ambientOscillators.push(osc);
            noteIndex++;
        }, 5000);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        this.musicOscillators.forEach(osc => { try { osc.stop(); } catch {} });
        this.musicOscillators = [];
    }

    stopAmbientSounds() {
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
        this.ambientOscillators.forEach(osc => { try { osc.stop(); } catch {} });
        this.ambientOscillators = [];
    }

    stopAll() {
        this.stopMusic();
        this.stopAmbientSounds();
    }
}

// ============================================
// Particle System (Optimized)
// ============================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.enabled = true;
        this.particlePool = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.particles = [];
            this.particlePool = [];
        }
    }

    getParticle() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return {};
    }

    releaseParticle(p) {
        this.particlePool.push(p);
    }

    emit(x, y, color, count = CONFIG.PARTICLE_COUNT, options = {}) {
        if (!this.enabled) return;
        if (this.particles.length >= CONFIG.MAX_PARTICLES) return;

        const {
            speed = 3,
            life = CONFIG.PARTICLE_LIFE,
            size = 4,
            gravity = 0,
            shrink = true
        } = options;

        const actualCount = Math.min(count, CONFIG.MAX_PARTICLES - this.particles.length);

        for (let i = 0; i < actualCount; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const velocity = speed * (0.5 + Math.random() * 0.8);
            const p = this.getParticle();
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * velocity;
            p.vy = Math.sin(angle) * velocity;
            p.color = color || randomChoice(CONFIG.COLORS.particle);
            p.life = life * (0.7 + Math.random() * 0.6);
            p.maxLife = life;
            p.size = size * (0.5 + Math.random() * 0.8);
            p.gravity = gravity;
            p.shrink = shrink;
            p.rotation = Math.random() * Math.PI * 2;
            p.rotSpeed = (Math.random() - 0.5) * 0.1;
            this.particles.push(p);
        }
    }

    emitBurst(x, y, color, count = 20) {
        this.emit(x, y, color, count, { speed: 5, life: 800, size: 6, gravity: 0.02 });
    }

    emitTrail(x, y, color) {
        if (!this.enabled) return;
        if (this.particles.length >= CONFIG.MAX_PARTICLES) return;

        const p = this.getParticle();
        p.x = x + (Math.random() - 0.5) * 10;
        p.y = y + (Math.random() - 0.5) * 10;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
        p.color = color || CONFIG.COLORS.snakeHead;
        p.life = 300;
        p.maxLife = 300;
        p.size = 3 + Math.random() * 3;
        p.gravity = 0;
        p.shrink = true;
        p.rotation = 0;
        p.rotSpeed = 0;
        this.particles.push(p);
    }

    update(dt) {
        if (!this.enabled) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (!reducedMotion) {
                p.life -= dt;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.rotSpeed;
            } else {
                p.life = 0; // Instant fade for reduced motion
            }
            if (p.life <= 0) {
                this.releaseParticle(this.particles.splice(i, 1)[0]);
            }
        }
    }

    render() {
        if (!this.enabled || this.particles.length === 0) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Batch render for performance
        this.particles.forEach(p => {
            const alpha = reducedMotion ? 0 : (p.life / p.maxLife);
            if (alpha <= 0) return;

            const size = p.shrink ? p.size * alpha : p.size;
            if (size < 0.5) return;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = alpha * 0.8;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            if (p.size > 4) {
                const spikes = 5;
                const outerR = size;
                const innerR = size * 0.4;
                for (let i = 0; i < spikes * 2; i++) {
                    const r = i % 2 === 0 ? outerR : innerR;
                    const angle = (Math.PI * i) / spikes;
                    this.ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                this.ctx.closePath();
            } else {
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
            }
            this.ctx.fill();
            this.ctx.restore();
        });
    }
}

// ============================================
// Screen Shake Effect
// ============================================
class ScreenShake {
    constructor(element) {
        this.element = element;
        this.intensity = 0;
        this.duration = 0;
        this.startTime = 0;
        this.originalTransform = '';
    }

    shake(intensity = 8, duration = CONFIG.SCREEN_SHAKE_DURATION) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) return;

        this.intensity = intensity;
        this.duration = duration;
        this.startTime = performance.now();
        this.originalTransform = this.element.style.transform || '';
    }

    update() {
        if (this.intensity <= 0) return;
        const elapsed = performance.now() - this.startTime;
        if (elapsed >= this.duration) {
            this.intensity = 0;
            this.element.style.transform = this.originalTransform;
            return;
        }
        const progress = elapsed / this.duration;
        const currentIntensity = this.intensity * (1 - progress);
        const x = (Math.random() - 0.5) * currentIntensity * 2;
        const y = (Math.random() - 0.5) * currentIntensity * 2;
        this.element.style.transform = `${this.originalTransform} translate(${x}px, ${y}px)`;
    }
}

// ============================================
// Power-up System
// ============================================
class PowerUpSystem {
    constructor() {
        this.activePowerUps = new Map();
        this.powerUpConfig = {
            [PowerUpType.SLOW_MO]: { duration: 5000, color: '#3fb950', icon: '⏱' },
            [PowerUpType.GHOST]: { duration: 4000, color: '#a371f7', icon: '👻' },
            [PowerUpType.DOUBLE_POINTS]: { duration: 6000, color: '#d29922', icon: '2×' },
            [PowerUpType.SHRINK]: { duration: 5000, color: '#f85149', icon: '🔻' },
            [PowerUpType.SHIELD]: { duration: 8000, color: '#58a6ff', icon: '🛡' }
        };
    }

    getAvailablePowerUps() {
        return Object.values(PowerUpType).filter(type => !this.activePowerUps.has(type));
    }

    spawnRandomPowerUp() {
        const available = this.getAvailablePowerUps();
        if (available.length === 0) return null;
        return randomChoice(available);
    }

    activate(powerUpType, onActivate = null, onExpire = null) {
        const config = this.powerUpConfig[powerUpType];
        if (!config) return false;

        this.activePowerUps.set(powerUpType, {
            startTime: performance.now(),
            duration: config.duration,
            config,
            onActivate,
            onExpire
        });

        if (onActivate) onActivate(powerUpType);
        return true;
    }

    update() {
        const now = performance.now();
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            if (now - powerUp.startTime >= powerUp.duration) {
                if (powerUp.onExpire) powerUp.onExpire(type);
                this.activePowerUps.delete(type);
            }
        }
    }

    isActive(type) {
        return this.activePowerUps.has(type);
    }

    getRemainingTime(type) {
        const powerUp = this.activePowerUps.get(type);
        if (!powerUp) return 0;
        const elapsed = performance.now() - powerUp.startTime;
        return Math.max(0, powerUp.duration - elapsed);
    }

    getActivePowerUps() {
        return Array.from(this.activePowerUps.entries()).map(([type, data]) => ({
            type,
            remaining: this.getRemainingTime(type),
            duration: data.duration,
            config: data.config
        }));
    }

    clear() {
        this.activePowerUps.forEach((_, type) => {
            const data = this.activePowerUps.get(type);
            if (data?.onExpire) data.onExpire(type);
        });
        this.activePowerUps.clear();
    }
}

// ============================================
// Achievement System
// ============================================
class AchievementSystem {
    constructor() {
        this.achievements = {
            first_food: { id: 'first_food', name: 'First Bite', desc: 'Eat your first food', icon: '🍎', unlocked: false },
            score_100: { id: 'score_100', name: 'Centurion', desc: 'Reach 100 points', icon: '💯', unlocked: false },
            score_500: { id: 'score_500', name: 'High Scorer', desc: 'Reach 500 points', icon: '🏆', unlocked: false },
            score_1000: { id: 'score_1000', name: 'Snake Master', desc: 'Reach 1000 points', icon: '👑', unlocked: false },
            level_5: { id: 'level_5', name: 'Level Up', desc: 'Reach level 5', icon: '📈', unlocked: false },
            level_10: { id: 'level_10', name: 'Speed Demon', desc: 'Reach level 10', icon: '⚡', unlocked: false },
            length_20: { id: 'length_20', name: 'Long Boy', desc: 'Grow to length 20', icon: '🐍', unlocked: false },
            streak_5: { id: 'streak_5', name: 'Hot Streak', desc: 'Eat 5 bonus foods in a row', icon: '🔥', unlocked: false },
            no_walls: { id: 'no_walls', name: 'Wall Hacker', desc: 'Win with wall collision off', icon: '👻', unlocked: false },
            survival_60: { id: 'survival_60', name: 'Survivor', desc: 'Survive for 60 seconds', icon: '⏱', unlocked: false },
            powerup_collector: { id: 'powerup_collector', name: 'Collector', desc: 'Collect 10 power-ups', icon: '💎', unlocked: false }
        };
        this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('snake_achievements');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                Object.keys(progress).forEach(key => {
                    if (this.achievements[key]) {
                        this.achievements[key].unlocked = progress[key];
                    }
                });
            } catch (e) {
                console.warn('Failed to load achievements:', e);
            }
        }
    }

    saveProgress() {
        const progress = {};
        Object.keys(this.achievements).forEach(key => {
            progress[key] = this.achievements[key].unlocked;
        });
        localStorage.setItem('snake_achievements', JSON.stringify(progress));
    }

    checkAchievements(gameState) {
        const newlyUnlocked = [];

        if (gameState.foodEaten >= 1 && !this.achievements.first_food.unlocked) {
            this.unlock('first_food', newlyUnlocked);
        }
        if (gameState.score >= 100 && !this.achievements.score_100.unlocked) {
            this.unlock('score_100', newlyUnlocked);
        }
        if (gameState.score >= 500 && !this.achievements.score_500.unlocked) {
            this.unlock('score_500', newlyUnlocked);
        }
        if (gameState.score >= 1000 && !this.achievements.score_1000.unlocked) {
            this.unlock('score_1000', newlyUnlocked);
        }
        if (gameState.level >= 5 && !this.achievements.level_5.unlocked) {
            this.unlock('level_5', newlyUnlocked);
        }
        if (gameState.level >= 10 && !this.achievements.level_10.unlocked) {
            this.unlock('level_10', newlyUnlocked);
        }
        if (gameState.snake.length >= 20 && !this.achievements.length_20.unlocked) {
            this.unlock('length_20', newlyUnlocked);
        }
        if (gameState.streak >= 5 && !this.achievements.streak_5.unlocked) {
            this.unlock('streak_5', newlyUnlocked);
        }
        if (!gameState.wallCollision && gameState.score > 0 && !this.achievements.no_walls.unlocked) {
            this.unlock('no_walls', newlyUnlocked);
        }

        if (newlyUnlocked.length > 0) {
            this.saveProgress();
        }

        return newlyUnlocked;
    }

    unlock(id, array) {
        if (this.achievements[id] && !this.achievements[id].unlocked) {
            this.achievements[id].unlocked = true;
            array.push(this.achievements[id]);
        }
    }

    getAllAchievements() {
        return Object.values(this.achievements);
    }

    getUnlockedCount() {
        return Object.values(this.achievements).filter(a => a.unlocked).length;
    }

    getTotalCount() {
        return Object.keys(this.achievements).length;
    }
}

// ============================================
// Statistics Tracker
// ============================================
class StatisticsTracker {
    constructor() {
        this.stats = {
            totalGames: 0,
            totalScore: 0,
            highScore: 0,
            totalFoodEaten: 0,
            totalPlayTime: 0,
            longestGame: 0,
            longestSnake: 0,
            powerUpsCollected: 0,
            deaths: 0
        };
        this.sessionStartTime = 0;
        this.loadStats();
    }

    loadStats() {
        const saved = localStorage.getItem('snake_statistics');
        if (saved) {
            try {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load statistics:', e);
            }
        }
    }

    saveStats() {
        localStorage.setItem('snake_statistics', JSON.stringify(this.stats));
    }

    startSession() {
        this.sessionStartTime = performance.now();
    }

    endSession(gameData) {
        const sessionTime = (performance.now() - this.sessionStartTime) / 1000;

        this.stats.totalGames++;
        this.stats.totalScore += gameData.score;
        this.stats.highScore = Math.max(this.stats.highScore, gameData.score);
        this.stats.totalFoodEaten += gameData.foodEaten;
        this.stats.totalPlayTime += sessionTime;
        this.stats.longestGame = Math.max(this.stats.longestGame, sessionTime);
        this.stats.longestSnake = Math.max(this.stats.longestSnake, gameData.maxLength);
        this.stats.deaths++;

        this.saveStats();
    }

    addPowerUp() {
        this.stats.powerUpsCollected++;
        this.saveStats();
    }

    getStats() {
        return { ...this.stats };
    }

    getAverageScore() {
        return this.stats.totalGames > 0 ? Math.round(this.stats.totalScore / this.stats.totalGames) : 0;
    }

    getAverageGameTime() {
        return this.stats.totalGames > 0 ? Math.round(this.stats.totalPlayTime / this.stats.totalGames) : 0;
    }
}

// ============================================
// Main Game Class
// ============================================
class SnakeGame {
    constructor() {
        // DOM Elements
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleCanvas = document.getElementById('particle-canvas');

        // Overlays
        this.startOverlay = document.getElementById('start-overlay');
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.levelUpOverlay = document.getElementById('level-up-overlay');
        this.levelUpNumber = document.getElementById('level-up-number');

        // Stats
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.levelEl = document.getElementById('level');

        // Final stats
        this.finalScoreEl = document.getElementById('final-score');
        this.finalLevelEl = document.getElementById('final-level');
        this.finalLengthEl = document.getElementById('final-length');
        this.newRecordEl = document.getElementById('new-record');

        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.settingsFab = document.getElementById('settings-fab');
        this.soundFab = document.getElementById('sound-fab');
        this.closeSettings = document.getElementById('close-settings');
        this.settingsPanel = document.getElementById('settings-panel');

        // Settings toggles
        this.soundToggle = document.getElementById('sound-toggle');
        this.musicToggle = document.getElementById('music-toggle');
        this.particlesToggle = document.getElementById('particles-toggle');
        this.glowToggle = document.getElementById('glow-toggle');
        this.gridToggle = document.getElementById('grid-toggle');
        this.wallsToggle = document.getElementById('walls-toggle');
        this.hapticToggle = document.getElementById('haptic-toggle');

        // New settings
        this.themeToggle = document.getElementById('theme-toggle');
        this.masterVolumeSlider = document.getElementById('master-volume');
        this.sfxVolumeSlider = document.getElementById('sfx-volume');
        this.musicVolumeSlider = document.getElementById('music-volume');

        // Touch controls
        this.touchControls = document.getElementById('touch-controls');
        this.touchBtns = document.querySelectorAll('.touch-btn');

        // Game state
        this.state = GameState.MENU;
        this.gameMode = GameMode.CLASSIC;
        this.gridSize = CONFIG.GRID_SIZE;
        this.tileCount = 0;
        this.tileSize = 0;
        this.snake = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.food = null;
        this.foodType = FoodType.NORMAL;
        this.foodPulse = 0;
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.speed = CONFIG.INITIAL_SPEED;
        this.foodEaten = 0;
        this.streak = 0;
        this.lastMoveTime = 0;
        this.animationId = null;
        this.maxLength = 3;
        this.sessionStartTime = 0;

        // Visual settings
        this.showGrid = true;
        this.showGlow = true;
        this.wallCollision = true;
        this.hapticEnabled = false;
        this.darkMode = true;

        // Systems
        this.audio = new AudioEngine();
        this.particles = new ParticleSystem(this.particleCanvas);
        this.screenShake = new ScreenShake(this.canvas.parentElement);
        this.powerUps = new PowerUpSystem();
        this.achievements = new AchievementSystem();
        this.statistics = new StatisticsTracker();
        this.performance = new PerformanceMonitor();

        // Modular V3 Engines
        this.scoringEngine = new ScoringEngine();
        this.leaderboardService = new LeaderboardService();
        this.tutorialManager = new TutorialManager();
        this.vitalsMonitor = new VitalsMonitor();

        // Leaderboard UI elements
        this.leaderboardFab = document.getElementById('leaderboard-fab');
        this.leaderboardPanel = document.getElementById('leaderboard-panel');
        this.closeLeaderboardBtn = document.getElementById('close-leaderboard');
        this.leaderboardBody = document.getElementById('leaderboard-body');

        if (this.leaderboardFab) {
            this.leaderboardFab.addEventListener('click', () => this.openLeaderboard());
        }
        if (this.closeLeaderboardBtn) {
            this.closeLeaderboardBtn.addEventListener('click', () => this.closeLeaderboard());
        }

        // Power-up state
        this.activePowerUp = null;
        this.powerUpPosition = null;
        this.powerUpPulse = 0;
        this.powerUpSpawnTimer = 0;
        this.ghostMode = false;
        this.shieldActive = false;

        // Game timing
        this.lastFrameTime = 0;
        this.frameAccumulator = 0;
        this.targetFrameTime = 1000 / CONFIG.TARGET_FPS;

        // Touch handling
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Accessibility
        this.announcer = document.getElementById('sr-announcer') || this.createAnnouncer();

        this.init();
    }

    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.padding = '0';
        announcer.style.margin = '-1px';
        announcer.style.overflow = 'hidden';
        announcer.style.clip = 'rect(0, 0, 0, 0)';
        announcer.style.whiteSpace = 'nowrap';
        announcer.style.border = '0';
        document.body.appendChild(announcer);
        return announcer;
    }

    announce(message) {
        this.announcer.textContent = '';
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 50);
    }

    openLeaderboard() {
        if (!this.leaderboardPanel) return;
        this.renderLeaderboard();
        this.leaderboardPanel.classList.remove('hidden');
    }

    closeLeaderboard() {
        if (!this.leaderboardPanel) return;
        this.leaderboardPanel.classList.add('hidden');
    }

    renderLeaderboard() {
        if (!this.leaderboardBody || !this.leaderboardService) return;
        const scores = this.leaderboardService.getTopScores();

        this.leaderboardBody.innerHTML = scores.map((entry, index) => `
            <tr>
                <td><span class="rank-badge rank-${index + 1}">${index + 1}</span></td>
                <td>
                    <div class="player-info">
                        <span class="player-avatar">${entry.avatar || '🐍'}</span>
                        <span>${entry.name}</span>
                    </div>
                </td>
                <td class="score-value-cell">${entry.score}</td>
                <td>Level ${entry.level || 1}</td>
            </tr>
        `).join('');
    }

    spawnFloatingScore(text, canvasX, canvasY, isCombo = false) {
        const container = document.querySelector('.game-canvas-wrapper') || document.body;
        const popup = document.createElement('div');
        popup.className = `floating-score-popup ${isCombo ? 'combo' : ''}`;
        popup.textContent = text;
        popup.style.left = `${canvasX}px`;
        popup.style.top = `${canvasY}px`;

        container.appendChild(popup);
        setTimeout(() => {
            if (popup && popup.parentElement) {
                popup.parentElement.removeChild(popup);
            }
        }, 800);
    }

    async init() {
        // Load settings & high score
        this.loadSettings();
        this.loadHighScore();
        this.updateHighScoreDisplay();

        // Initialize audio
        await this.audio.init();

        // Set up canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Event listeners
        this.bindEvents();

        // Initial render
        this.render();

        // Show touch controls on mobile
        this.updateTouchControlsVisibility();

        // Apply theme
        this.applyTheme();

        // Start performance monitoring
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            const fps = this.performance.getAverageFPS();
            if (fps < 30) {
                // Auto-reduce particle count if performance is poor
                if (this.particles.particles.length > 50) {
                    this.particles.particles = this.particles.particles.slice(0, 50);
                }
            }
        }, 5000);
    }

    bindEvents() {
        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.menuBtn.addEventListener('click', () => this.showMenu());

        // Settings
        this.settingsFab.addEventListener('click', () => this.toggleSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsPanel());
        this.soundFab.addEventListener('click', () => this.toggleSound());

        // Settings toggles
        this.soundToggle.addEventListener('change', (e) => this.setSoundEnabled(e.target.checked));
        this.musicToggle.addEventListener('change', (e) => this.setMusicEnabled(e.target.checked));
        this.particlesToggle.addEventListener('change', (e) => this.setParticlesEnabled(e.target.checked));
        this.glowToggle.addEventListener('change', (e) => this.setGlowEnabled(e.target.checked));
        this.gridToggle.addEventListener('change', (e) => this.setGridEnabled(e.target.checked));
        this.wallsToggle.addEventListener('change', (e) => this.setWallCollision(e.target.checked));
        this.hapticToggle.addEventListener('change', (e) => this.setHapticEnabled(e.target.checked));

        // New settings
        if (this.themeToggle) {
            this.themeToggle.addEventListener('change', (e) => this.setTheme(e.target.checked));
        }
        if (this.masterVolumeSlider) {
            this.masterVolumeSlider.addEventListener('input', (e) => {
                this.setMasterVolume(e.target.value / 100);
                this.updateSliderValue('master-volume', e.target.value);
            });
            this.masterVolumeSlider.addEventListener('change', () => this.saveSettings());
        }
        if (this.sfxVolumeSlider) {
            this.sfxVolumeSlider.addEventListener('input', (e) => {
                this.setSfxVolume(e.target.value / 100);
                this.updateSliderValue('sfx-volume', e.target.value);
            });
            this.sfxVolumeSlider.addEventListener('change', () => this.saveSettings());
        }
        if (this.musicVolumeSlider) {
            this.musicVolumeSlider.addEventListener('input', (e) => {
                this.setMusicVolume(e.target.value / 100);
                this.updateSliderValue('music-volume', e.target.value);
            });
            this.musicVolumeSlider.addEventListener('change', () => this.saveSettings());
        }

        // Touch controls
        this.touchBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTouchDirection(btn.dataset.dir);
                btn.classList.add('active');
            }, { passive: false });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
            }, { passive: false });
            btn.addEventListener('click', () => this.handleTouchDirection(btn.dataset.dir));
        });

        // Swipe gestures on canvas
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Click on canvas to start/resume
        this.canvas.addEventListener('click', () => this.handleCanvasClick());

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === GameState.PLAYING) {
                this.pauseGame();
            }
        });

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Reduced motion media query listener
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', () => this.handleReducedMotionChange());
    }

    handleReducedMotionChange() {
        // Re-render with new motion preferences
        this.render();
    }

    // ============================================
    // Settings Management
    // ============================================
    loadSettings() {
        const saved = localStorage.getItem('snake_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.audio.setEnabled(settings.sound !== false);
                this.audio.setMusicEnabled(settings.music !== false);
                this.particles.setEnabled(settings.particles !== false);
                this.showGlow = settings.glow !== false;
                this.showGrid = settings.grid !== false;
                this.wallCollision = settings.walls !== false;
                this.hapticEnabled = settings.haptic === true;
                this.darkMode = settings.darkMode !== false;
                this.audio.setMasterVolume(settings.masterVolume ?? 0.3);
                this.audio.setSfxVolume(settings.sfxVolume ?? 0.4);
                this.audio.setMusicVolume(settings.musicVolume ?? 0.15);

                // Update UI
                this.soundToggle.checked = settings.sound !== false;
                this.musicToggle.checked = settings.music !== false;
                this.particlesToggle.checked = settings.particles !== false;
                this.glowToggle.checked = settings.glow !== false;
                this.gridToggle.checked = settings.grid !== false;
                this.wallsToggle.checked = settings.walls !== false;
                this.hapticToggle.checked = settings.haptic === true;
                if (this.themeToggle) this.themeToggle.checked = settings.darkMode !== false;
                if (this.masterVolumeSlider) this.masterVolumeSlider.value = Math.round((settings.masterVolume ?? 0.3) * 100);
                if (this.sfxVolumeSlider) this.sfxVolumeSlider.value = Math.round((settings.sfxVolume ?? 0.4) * 100);
                if (this.musicVolumeSlider) this.musicVolumeSlider.value = Math.round((settings.musicVolume ?? 0.15) * 100);
                this.updateSoundFab();
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
    }

    saveSettings() {
        const settings = {
            sound: this.audio.enabled,
            music: this.audio.musicEnabled,
            particles: this.particles.enabled,
            glow: this.showGlow,
            grid: this.showGrid,
            walls: this.wallCollision,
            haptic: this.hapticEnabled,
            darkMode: this.darkMode,
            masterVolume: this.audio.masterGain?.gain.value ?? 0.3,
            sfxVolume: this.audio.sfxGain?.gain.value ?? 0.4,
            musicVolume: this.audio.musicGain?.gain.value ?? 0.15
        };
        localStorage.setItem('snake_settings', JSON.stringify(settings));
    }

    loadHighScore() {
        const saved = localStorage.getItem('snake_highscore');
        if (saved) {
            this.highScore = parseInt(saved, 10) || 0;
        }
    }

    saveHighScore() {
        localStorage.setItem('snake_highscore', this.highScore.toString());
    }

    updateHighScoreDisplay() {
        this.highScoreEl.textContent = this.highScore;
    }

    // Settings handlers
    setSoundEnabled(enabled) {
        this.audio.setEnabled(enabled);
        this.soundToggle.checked = enabled;
        this.updateSoundFab();
        this.saveSettings();
        if (enabled) this.audio.playClick();
    }

    setMusicEnabled(enabled) {
        this.audio.setMusicEnabled(enabled);
        this.musicToggle.checked = enabled;
        this.saveSettings();
        if (enabled) this.audio.playClick();
    }

    setParticlesEnabled(enabled) {
        this.particles.setEnabled(enabled);
        this.particlesToggle.checked = enabled;
        this.saveSettings();
    }

    setGlowEnabled(enabled) {
        this.showGlow = enabled;
        this.glowToggle.checked = enabled;
        this.saveSettings();
    }

    setGridEnabled(enabled) {
        this.showGrid = enabled;
        this.gridToggle.checked = enabled;
        this.saveSettings();
    }

    setWallCollision(enabled) {
        this.wallCollision = enabled;
        this.wallsToggle.checked = enabled;
        this.saveSettings();
    }

    setHapticEnabled(enabled) {
        this.hapticEnabled = enabled;
        this.hapticToggle.checked = enabled;
        this.saveSettings();
    }

    setTheme(darkMode) {
        this.darkMode = darkMode;
        if (this.themeToggle) this.themeToggle.checked = darkMode;
        this.applyTheme();
        this.saveSettings();
    }

    setMasterVolume(vol) {
        this.audio.setMasterVolume(vol);
        if (this.masterVolumeSlider) this.masterVolumeSlider.value = Math.round(vol * 100);
    }

    setSfxVolume(vol) {
        this.audio.setSfxVolume(vol);
        if (this.sfxVolumeSlider) this.sfxVolumeSlider.value = Math.round(vol * 100);
    }

    setMusicVolume(vol) {
        if (this.audio.musicGain) this.audio.musicGain.gain.value = clamp(vol, 0, 1);
        if (this.musicVolumeSlider) this.musicVolumeSlider.value = Math.round(vol * 100);
    }

    toggleSound() {
        this.setSoundEnabled(!this.audio.enabled);
    }

    updateSoundFab() {
        this.soundFab.classList.toggle('muted', !this.audio.enabled);
        this.soundFab.setAttribute('aria-label', this.audio.enabled ? 'Mute sound' : 'Unmute sound');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
    }

    toggleSettings() {
        const isHidden = this.settingsPanel.classList.toggle('hidden');
        if (!isHidden) {
            this.audio.playClick();
            if (this.state === GameState.PLAYING) this.pauseGame();
        } else {
            this.audio.playClick();
        }
    }

    closeSettingsPanel() {
        this.settingsPanel.classList.add('hidden');
        this.audio.playClick();
    }

    // ============================================
    // Canvas & Resize
    // ============================================
    resizeCanvas() {
        const wrapper = this.canvas.parentElement;
        const rect = wrapper.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Calculate tile size based on container
        const maxSize = Math.min(rect.width, rect.height);
        this.tileSize = Math.max(8, Math.floor(maxSize / this.gridSize));
        const canvasSize = this.tileSize * this.gridSize;

        this.canvas.width = canvasSize * dpr;
        this.canvas.height = canvasSize * dpr;
        this.canvas.style.width = `${canvasSize}px`;
        this.canvas.style.height = `${canvasSize}px`;
        this.ctx.scale(dpr, dpr);

        // Resize particle canvas
        this.particles.resize();
    }

    // ============================================
    // Input Handling
    // ============================================
    handleKeydown(e) {
        // Global shortcuts
        if (e.code === 'Space') {
            e.preventDefault();
            this.handleSpace();
            return;
        }
        if (e.code === 'Escape') {
            if (this.state === GameState.PLAYING) this.pauseGame();
            else if (this.state === GameState.PAUSED) this.resumeGame();
            else if (!this.settingsPanel.classList.contains('hidden')) this.closeSettingsPanel();
            return;
        }
        if (e.key === 'm' || e.key === 'M') {
            this.toggleSound();
            return;
        }
        if (e.key === 'r' || e.key === 'R') {
            if (this.state === GameState.GAME_OVER || this.state === GameState.MENU) {
                this.startGame();
                return;
            }
        }

        // Game controls
        if (this.state !== GameState.PLAYING) return;

        const dirMap = {
            'ArrowUp': 'up', 'KeyW': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyA': 'left',
            'ArrowRight': 'right', 'KeyD': 'right'
        };

        const newDir = dirMap[e.code];
        if (newDir && newDir !== OppositeDirection[this.direction]) {
            this.nextDirection = newDir;
            this.audio.playTurn();
            if (this.hapticEnabled) this.vibrate(10);
        }
    }

    handleSpace() {
        switch (this.state) {
            case GameState.MENU:
                this.startGame();
                break;
            case GameState.PLAYING:
                this.pauseGame();
                break;
            case GameState.PAUSED:
                this.resumeGame();
                break;
            case GameState.GAME_OVER:
                this.startGame();
                break;
        }
    }

    handleCanvasClick() {
        if (this.state === GameState.MENU || this.state === GameState.GAME_OVER) {
            this.startGame();
        } else if (this.state === GameState.PAUSED) {
            this.resumeGame();
        }
    }

    handleTouchDirection(dir) {
        if (this.state !== GameState.PLAYING) return;
        if (dir !== OppositeDirection[this.direction]) {
            this.nextDirection = dir;
            this.audio.playTurn();
            if (this.hapticEnabled) this.vibrate(10);
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (this.state !== GameState.PLAYING) return;
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        const threshold = 30;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > threshold) this.handleTouchDirection('right');
            else if (dx < -threshold) this.handleTouchDirection('left');
        } else {
            if (dy > threshold) this.handleTouchDirection('down');
            else if (dy < -threshold) this.handleTouchDirection('up');
        }
    }

    vibrate(pattern) {
        if (navigator.vibrate && this.hapticEnabled) {
            navigator.vibrate(pattern);
        }
    }

    updateTouchControlsVisibility() {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        this.touchControls.setAttribute('aria-hidden', !isTouch);
    }

    // ============================================
    // Game State Management
    // ============================================
    startGame() {
        this.audio.resume();
        this.audio.playClick();
        this.audio.startMusic();
        this.audio.startAmbientSounds(this.level);

        // Reset state
        this.state = GameState.PLAYING;
        if (this.scoringEngine) this.scoringEngine.reset();
        this.score = 0;
        this.level = 1;
        this.speed = CONFIG.INITIAL_SPEED;
        this.foodEaten = 0;
        this.streak = 0;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.maxLength = 3;
        this.sessionStartTime = performance.now();
        this.statistics.startSession();

        // Initialize snake in center
        const center = Math.floor(this.gridSize / 2);
        this.snake = [
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center }
        ];

        // Clear power-ups & obstacles
        this.powerUps.clear();
        this.activePowerUp = null;
        this.powerUpPosition = null;
        this.ghostMode = false;
        this.shieldActive = false;
        this.obstacles = [];

        this.spawnFood();
        this.hideAllOverlays();
        this.updateStats();
        this.lastMoveTime = performance.now();
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    pauseGame() {
        if (this.state !== GameState.PLAYING) return;
        this.state = GameState.PAUSED;
        this.audio.stopMusic();
        this.audio.stopAmbientSounds();
        this.pauseOverlay.classList.remove('hidden');
        this.audio.playClick();
        this.announce('Game paused');
    }

    resumeGame() {
        if (this.state !== GameState.PAUSED) return;
        this.state = GameState.PLAYING;
        this.audio.playClick();
        this.audio.startMusic();
        this.audio.startAmbientSounds(this.level);
        this.pauseOverlay.classList.add('hidden');
        this.lastMoveTime = performance.now();
        this.lastFrameTime = performance.now();
        this.gameLoop();
        this.announce('Game resumed');
    }

    levelUp() {
        this.level++;
        this.foodEaten = 0;
        this.speed = Math.max(CONFIG.MIN_SPEED, CONFIG.INITIAL_SPEED - (this.level - 1) * CONFIG.SPEED_INCREMENT);

        // Pause snake movement for 2 seconds (2000ms) on level up
        this.state = GameState.LEVEL_UP;
        this.audio.playLevelUp();
        this.screenShake.shake(10, 400);

        if (this.levelUpOverlay && this.levelUpNumber) {
            this.levelUpNumber.textContent = this.level;
            this.levelUpOverlay.classList.remove('hidden');
        }

        this.spawnObstacles();
        this.announce(`Level Up! Level ${this.level}`);

        // 2-second pause timer before resuming gameplay loop
        setTimeout(() => {
            if (this.levelUpOverlay) {
                this.levelUpOverlay.classList.add('hidden');
            }
            if (this.state === GameState.LEVEL_UP) {
                this.state = GameState.PLAYING;
                this.lastMoveTime = performance.now();
                this.lastFrameTime = performance.now();
                this.spawnFood();
                this.gameLoop();
            }
        }, 2000);
    }

    spawnObstacles() {
        this.obstacles = [];
        if (this.level < 3) return;

        const obstacleCount = Math.min(8, (this.level - 2) * 2);
        let emptyCells = [];
        for (let y = 1; y < this.gridSize - 1; y++) {
            for (let x = 1; x < this.gridSize - 1; x++) {
                if (!this.snake.some(seg => seg.x === x && seg.y === y) &&
                    !(this.food && this.food.x === x && this.food.y === y)) {
                    emptyCells.push({ x, y });
                }
            }
        }

        for (let i = 0; i < obstacleCount && emptyCells.length > 0; i++) {
            const idx = Math.floor(Math.random() * emptyCells.length);
            this.obstacles.push(emptyCells.splice(idx, 1)[0]);
        }
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        this.audio.stopMusic();
        this.audio.stopAmbientSounds();
        this.audio.playGameOver();
        this.screenShake.shake(12, 300);
        this.powerUps.clear();

        if (this.hapticEnabled) this.vibrate([50, 30, 50, 30, 100]);

        // Check high score & leaderboard
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
            this.newRecordEl.classList.remove('hidden');
            this.announce('New high score!');
        }

        if (this.leaderboardService && this.leaderboardService.isHighScore(this.score)) {
            this.leaderboardService.addEntry('Player', this.score, this.level);
        }

        // Update final stats
        this.finalScoreEl.textContent = this.score;
        this.finalLevelEl.textContent = this.level;
        this.finalLengthEl.textContent = this.snake.length;

        // Check achievements
        const newAchievements = this.achievements.checkAchievements({
            score: this.score,
            level: this.level,
            snake: this.snake,
            foodEaten: this.foodEaten,
            streak: this.streak,
            wallCollision: this.wallCollision
        });

        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements[0]);
        }

        // End statistics session
        this.statistics.endSession({
            score: this.score,
            foodEaten: this.foodEaten,
            maxLength: this.maxLength
        });

        this.gameOverOverlay.classList.remove('hidden');
        this.updateStats();
        this.announce(`Game over. Final score: ${this.score}`);
    }

    showMenu() {
        this.state = GameState.MENU;
        this.audio.stopMusic();
        this.audio.stopAmbientSounds();
        this.powerUps.clear();
        this.hideAllOverlays();
        this.startOverlay.classList.remove('hidden');
        this.resetSnakeVisual();
        this.render();
        this.announce('Main menu');
    }

    hideAllOverlays() {
        this.startOverlay.classList.add('hidden');
        this.pauseOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
        this.levelUpOverlay.classList.add('hidden');
    }

    levelUp() {
        this.level++;
        this.speed = Math.max(CONFIG.MIN_SPEED, this.speed - CONFIG.SPEED_INCREMENT);
        this.foodEaten = 0;
        this.streak = 0;

        this.state = GameState.LEVEL_UP;
        this.audio.playLevelUp();
        this.audio.startAmbientSounds(this.level);
        this.particles.emitBurst(
            this.food.x * this.tileSize + this.tileSize / 2,
            this.food.y * this.tileSize + this.tileSize / 2,
            CONFIG.COLORS.particle[0],
            30
        );

        this.levelUpNumber.textContent = this.level;
        this.levelUpOverlay.classList.remove('hidden');
        this.announce(`Level up! Now at level ${this.level}`);

        // Auto-resume after animation
        setTimeout(() => {
            if (this.state === GameState.LEVEL_UP) {
                this.state = GameState.PLAYING;
                this.levelUpOverlay.classList.add('hidden');
                this.lastMoveTime = performance.now();
                this.gameLoop();
            }
        }, 1500);
    }

    resetSnakeVisual() {
        const center = Math.floor(this.gridSize / 2);
        this.snake = [
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center }
        ];
        this.direction = 'right';
    }

    showAchievementNotification(achievement) {
        // Create temporary notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-text">
                    <strong>Achievement Unlocked!</strong>
                    <span>${achievement.name}</span>
                </div>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--accent-warning);
            border-radius: var(--radius-md);
            padding: 16px 20px;
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================
    // Game Logic
    // ============================================
    gameLoop() {
        if (this.state !== GameState.PLAYING && this.state !== GameState.LEVEL_UP) return;

        const now = performance.now();
        const frameDelta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Frame rate limiting
        this.frameAccumulator += frameDelta;

        if (this.frameAccumulator >= this.targetFrameTime) {
            this.performance.update();
            this.powerUps.update();
            this.handlePowerUpSpawning(now);
            this.updatePowerUpEffects();
            this.frameAccumulator = 0;
        }

        const dt = now - this.lastMoveTime;

        if (dt >= this.getEffectiveSpeed()) {
            this.update();
            this.lastMoveTime = now;
        }

        this.render();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    getEffectiveSpeed() {
        if (this.powerUps.isActive(PowerUpType.SLOW_MO)) {
            return this.speed * 2; // Half speed
        }
        return this.speed;
    }

    handlePowerUpSpawning(now) {
        // Spawn power-up every 15-25 seconds
        this.powerUpSpawnTimer += this.targetFrameTime;

        if (this.powerUpSpawnTimer >= 15000 + Math.random() * 10000) {
            this.powerUpSpawnTimer = 0;
            if (!this.activePowerUp && this.powerUps.getAvailablePowerUps().length > 0) {
                this.spawnPowerUp();
            }
        }

        // Pulse animation
        if (this.activePowerUp) {
            this.powerUpPulse += 0.1;
        }
    }

    spawnPowerUp() {
        let emptyCells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.snake.some(seg => seg.x === x && seg.y === y) &&
                    !(this.food && this.food.x === x && this.food.y === y)) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length === 0) return;

        this.powerUpPosition = randomChoice(emptyCells);
        this.activePowerUp = this.powerUps.spawnRandomPowerUp();
        this.powerUpPulse = 0;
    }

    updatePowerUpEffects() {
        // Handle power-up expiration
        if (this.ghostMode && !this.powerUps.isActive(PowerUpType.GHOST)) {
            this.ghostMode = false;
        }
        if (this.shieldActive && !this.powerUps.isActive(PowerUpType.SHIELD)) {
            this.shieldActive = false;
        }
    }

    update() {
        this.direction = this.nextDirection;
        const dir = Directions[this.direction];
        const head = this.snake[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall collision
        if (this.wallCollision && !this.ghostMode) {
            if (newHead.x < 0 || newHead.x >= this.gridSize ||
                newHead.y < 0 || newHead.y >= this.gridSize) {
                if (this.shieldActive) {
                    this.shieldActive = false;
                    this.powerUps.activePowerUps.delete(PowerUpType.SHIELD);
                    this.audio.playPowerUpExpire();
                } else {
                    this.gameOver();
                    return;
                }
            }
        } else {
            // Wrap around
            newHead.x = (newHead.x + this.gridSize) % this.gridSize;
            newHead.y = (newHead.y + this.gridSize) % this.gridSize;
        }

        // Self collision
        if (!this.ghostMode && this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            if (this.shieldActive) {
                this.shieldActive = false;
                this.powerUps.activePowerUps.delete(PowerUpType.SHIELD);
                this.audio.playPowerUpExpire();
            } else {
                this.gameOver();
                return;
            }
        }

        // Obstacle collision
        if (!this.ghostMode && this.obstacles && this.obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
            if (this.shieldActive) {
                this.shieldActive = false;
                this.powerUps.activePowerUps.delete(PowerUpType.SHIELD);
                this.audio.playPowerUpExpire();
            } else {
                this.gameOver();
                return;
            }
        }

        // Move snake
        this.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.eatFood();
        }
        // Check power-up collision
        else if (this.activePowerUp && this.powerUpPosition &&
                 newHead.x === this.powerUpPosition.x && newHead.y === this.powerUpPosition.y) {
            this.collectPowerUp();
        } else {
            this.snake.pop();
        }

        // Update max length
        if (this.snake.length > this.maxLength) {
            this.maxLength = this.snake.length;
        }

        // Trail particles
        if (this.particles.enabled) {
            const tail = this.snake[this.snake.length - 1];
            this.particles.emitTrail(
                tail.x * this.tileSize + this.tileSize / 2,
                tail.y * this.tileSize + this.tileSize / 2,
                CONFIG.COLORS.snakeTail
            );
        }
    }

    spawnFood() {
        let emptyCells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.snake.some(seg => seg.x === x && seg.y === y) &&
                    !(this.powerUpPosition && this.powerUpPosition.x === x && this.powerUpPosition.y === y)) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length === 0) return;

        this.food = randomChoice(emptyCells);

        const rand = Math.random();
        if (rand < 0.1) {
            this.foodType = FoodType.BONUS;
        } else if (rand < 0.2) {
            this.foodType = FoodType.SPEED;
        } else {
            this.foodType = FoodType.NORMAL;
        }
        this.foodPulse = 0;
    }

    eatFood() {
        this.audio.playEat(this.foodType === FoodType.BONUS);
        if (this.hapticEnabled) this.vibrate(this.foodType === FoodType.BONUS ? 30 : 15);

        const scoreResult = this.scoringEngine.registerFoodEat(this.foodType);
        this.score = this.scoringEngine.score;
        if (this.scoringEngine.highScore > this.highScore) {
            this.highScore = this.scoringEngine.highScore;
        }
        this.foodEaten++;

        const fx = this.food.x * this.tileSize + this.tileSize / 2;
        const fy = this.food.y * this.tileSize + this.tileSize / 2;
        const foodColor = this.getFoodColor(this.foodType);
        this.particles.emitBurst(fx, fy, foodColor, this.foodType === FoodType.BONUS ? 25 : 15);
        this.screenShake.shake(this.foodType === FoodType.BONUS ? 6 : 3, 100);

        const popupText = `+${scoreResult.pointsEarned}${scoreResult.comboCount > 1 ? ` 🔥x${scoreResult.comboCount}` : ''}`;
        this.spawnFloatingScore(popupText, fx, fy, scoreResult.comboCount > 1);

        if (this.foodEaten >= CONFIG.FOOD_PER_LEVEL) {
            this.levelUp();
        } else {
            this.spawnFood();
        }

        this.updateStats();
    }

    collectPowerUp() {
        const type = this.activePowerUp;
        this.audio.playPowerUp(type);
        if (this.hapticEnabled) this.vibrate(50);

        const config = this.powerUps.powerUpConfig[type];
        this.particles.emitBurst(
            this.powerUpPosition.x * this.tileSize + this.tileSize / 2,
            this.powerUpPosition.y * this.tileSize + this.tileSize / 2,
            config.color,
            30
        );

        this.powerUps.activate(type,
            (t) => this.onPowerUpActivate(t),
            (t) => this.onPowerUpExpire(t)
        );

        this.activePowerUp = null;
        this.powerUpPosition = null;
        this.statistics.addPowerUp();
    }

    onPowerUpActivate(type) {
        switch (type) {
            case PowerUpType.GHOST:
                this.ghostMode = true;
                this.announce('Ghost mode activated');
                break;
            case PowerUpType.SHIELD:
                this.shieldActive = true;
                this.announce('Shield activated');
                break;
            case PowerUpType.SLOW_MO:
                this.announce('Slow motion activated');
                break;
            case PowerUpType.DOUBLE_POINTS:
                this.announce('Double points activated');
                break;
            case PowerUpType.SHRINK:
                if (this.snake.length > 3) {
                    this.snake = this.snake.slice(0, Math.max(3, this.snake.length - 3));
                }
                this.announce('Snake shrunk');
                break;
        }
    }

    onPowerUpExpire(type) {
        switch (type) {
            case PowerUpType.GHOST:
                this.ghostMode = false;
                this.announce('Ghost mode expired');
                break;
            case PowerUpType.SHIELD:
                this.shieldActive = false;
                this.announce('Shield expired');
                break;
            case PowerUpType.SLOW_MO:
                this.announce('Slow motion expired');
                break;
            case PowerUpType.DOUBLE_POINTS:
                this.announce('Double points expired');
                break;
        }
        this.audio.playPowerUpExpire();
    }

    getFoodColor(type) {
        switch (type) {
            case FoodType.BONUS: return CONFIG.COLORS.foodBonus;
            case FoodType.SPEED: return CONFIG.COLORS.foodSpeed;
            default: return CONFIG.COLORS.foodNormal;
        }
    }

    updateStats() {
        this.scoreEl.textContent = this.score;
        this.levelEl.textContent = this.level;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
            this.highScoreEl.classList.add('new-high');
            setTimeout(() => this.highScoreEl.classList.remove('new-high'), 500);
        }
    }

    // ============================================
    // Rendering
    // ============================================
    render() {
        // Clear
        this.ctx.fillStyle = CONFIG.COLORS.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        if (this.showGrid) this.drawGrid();

        // Power-up
        if (this.activePowerUp && this.powerUpPosition) {
            this.drawPowerUp();
        }

        // Obstacles
        this.drawObstacles();

        // Food
        this.drawFood();

        // Snake
        this.drawSnake();

        // Particles
        this.particles.render();

        // Screen shake
        this.screenShake.update();

        // Active power-up indicators
        this.drawPowerUpIndicators();
    }

    drawObstacles() {
        if (!this.obstacles || this.obstacles.length === 0) return;
        const radius = 4;
        this.obstacles.forEach(obs => {
            const x = obs.x * this.tileSize;
            const y = obs.y * this.tileSize;

            if (this.showGlow) {
                this.ctx.shadowColor = '#f85149';
                this.ctx.shadowBlur = 10;
            }

            this.ctx.fillStyle = '#da3633';
            this.ctx.strokeStyle = '#f85149';
            this.ctx.lineWidth = 2;

            this.roundRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4, radius);
            this.ctx.fill();
            this.ctx.stroke();

            // Inner hazard mark
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 6, y + 6);
            this.ctx.lineTo(x + this.tileSize - 6, y + this.tileSize - 6);
            this.ctx.moveTo(x + this.tileSize - 6, y + 6);
            this.ctx.lineTo(x + 6, y + this.tileSize - 6);
            this.ctx.stroke();

            this.ctx.shadowBlur = 0;
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.grid;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();

        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * this.tileSize;
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.gridSize * this.tileSize);
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.gridSize * this.tileSize, pos);
        }
        this.ctx.stroke();
    }

    drawPowerUp() {
        const x = this.powerUpPosition.x * this.tileSize;
        const y = this.powerUpPosition.y * this.tileSize;
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const radius = this.tileSize / 2 - 2;

        const config = this.powerUps.powerUpConfig[this.activePowerUp];
        const pulseScale = 1 + Math.sin(this.powerUpPulse) * 0.15;

        // Glow
        if (this.showGlow) {
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius * 2.5
            );
            gradient.addColorStop(0, config.color + '60');
            gradient.addColorStop(1, config.color + '00');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius * 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Power-up body (hexagon)
        this.ctx.fillStyle = config.color;
        this.ctx.beginPath();
        const sides = 6;
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
            const r = radius * pulseScale;
            this.ctx.lineTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Icon
        this.ctx.fillStyle = '#0d1117';
        this.ctx.font = `bold ${radius * 0.7}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(config.icon, centerX, centerY + radius * 0.1);
    }

    drawPowerUpIndicators() {
        const active = this.powerUps.getActivePowerUps();
        if (active.length === 0) return;

        const indicatorSize = 32;
        const padding = 8;
        const startX = 8;
        const startY = 8;

        active.forEach((powerUp, index) => {
            const x = startX + index * (indicatorSize + padding);
            const y = startY;
            const progress = powerUp.remaining / powerUp.duration;

            // Background
            this.ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
            this.roundRect(x, y, indicatorSize, indicatorSize, 6);
            this.ctx.fill();

            // Icon background
            this.ctx.fillStyle = powerUp.config.color;
            this.roundRect(x + 2, y + 2, indicatorSize - 4, indicatorSize - 4, 4);
            this.ctx.fill();

            // Icon
            this.ctx.fillStyle = '#0d1117';
            this.ctx.font = `bold ${indicatorSize * 0.5}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(powerUp.config.icon, x + indicatorSize / 2, y + indicatorSize / 2 - 2);

            // Progress bar
            this.ctx.fillStyle = powerUp.config.color + '80';
            this.ctx.fillRect(x + 2, y + indicatorSize - 4, (indicatorSize - 4) * progress, 2);
        });
    }

    drawFood() {
        const x = this.food.x * this.tileSize;
        const y = this.food.y * this.tileSize;
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const radius = this.tileSize / 2 - 2;

        this.foodPulse += 0.15;
        const pulseScale = 1 + Math.sin(this.foodPulse) * 0.1;

        const color = this.getFoodColor(this.foodType);

        // Glow
        if (this.showGlow) {
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius * 2
            );
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, color + '00');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Food body
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        if (this.foodType === FoodType.BONUS) {
            const spikes = 5;
            const outerR = radius * pulseScale;
            const innerR = radius * 0.4 * pulseScale;
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (Math.PI * i) / spikes - Math.PI / 2;
                this.ctx.lineTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
            }
            this.ctx.closePath();
        } else if (this.foodType === FoodType.SPEED) {
            const r = radius * pulseScale;
            this.ctx.moveTo(centerX, centerY - r);
            this.ctx.lineTo(centerX + r, centerY);
            this.ctx.lineTo(centerX, centerY + r);
            this.ctx.lineTo(centerX - r, centerY);
            this.ctx.closePath();
        } else {
            this.ctx.arc(centerX, centerY, radius * pulseScale, 0, Math.PI * 2);
        }
        this.ctx.fill();

        // Inner highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSnake() {
        this.snake.forEach((seg, index) => {
            const x = seg.x * this.tileSize;
            const y = seg.y * this.tileSize;
            const isHead = index === 0;
            const isTail = index === this.snake.length - 1;
            const progress = this.snake.length > 1 ? index / (this.snake.length - 1) : 0;

            // Color interpolation
            let color;
            if (isHead) {
                color = CONFIG.COLORS.snakeHead;
            } else if (isTail) {
                color = CONFIG.COLORS.snakeTail;
            } else {
                const r = Math.round(lerp(88, 31, progress));
                const g = Math.round(lerp(166, 111, progress));
                const b = Math.round(lerp(255, 235, progress));
                color = `rgb(${r}, ${g}, ${b})`;
            }

            // Ghost mode transparency
            if (this.ghostMode && !isHead) {
                this.ctx.globalAlpha = 0.4;
            }

            // Segment size (head slightly larger)
            const padding = isHead ? 1 : 2;
            const segSize = this.tileSize - padding * 2;
            const radius = isHead ? 6 : (isTail ? 4 : 5);

            // Glow for head
            if (isHead && this.showGlow) {
                this.ctx.shadowColor = this.ghostMode ? CONFIG.COLORS.snakeGlow.replace('0.6', '0.3') : CONFIG.COLORS.snakeGlow;
                this.ctx.shadowBlur = 15;
            } else {
                this.ctx.shadowBlur = 0;
            }

            // Shield effect
            if (this.shieldActive && isHead) {
                this.ctx.shadowColor = '#58a6ff';
                this.ctx.shadowBlur = 20;
            }

            // Draw segment with rounded corners
            this.ctx.fillStyle = color;
            this.roundRect(
                x + padding,
                y + padding,
                segSize,
                segSize,
                radius
            );
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;

            // Head details
            if (isHead) {
                this.drawSnakeHead(x + padding, y + padding, segSize);
            }
        });
    }

    drawSnakeHead(x, y, size) {
        const eyeSize = Math.max(3, size * 0.15);
        const eyeOffset = size * 0.25;
        const centerX = x + size / 2;
        const centerY = y + size / 2;

        let eye1X, eye1Y, eye2X, eye2Y;

        switch (this.direction) {
            case 'up':
                eye1X = centerX - eyeOffset; eye1Y = centerY - eyeOffset;
                eye2X = centerX + eyeOffset; eye2Y = centerY - eyeOffset;
                break;
            case 'down':
                eye1X = centerX - eyeOffset; eye1Y = centerY + eyeOffset;
                eye2X = centerX + eyeOffset; eye2Y = centerY + eyeOffset;
                break;
            case 'left':
                eye1X = centerX - eyeOffset; eye1Y = centerY - eyeOffset;
                eye2X = centerX - eyeOffset; eye2Y = centerY + eyeOffset;
                break;
            case 'right':
                eye1X = centerX + eyeOffset; eye1Y = centerY - eyeOffset;
                eye2X = centerX + eyeOffset; eye2Y = centerY + eyeOffset;
                break;
        }

        // Eye whites
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils
        this.ctx.fillStyle = '#0d1117';
        const pupilOffset = eyeSize * 0.3;
        let pupilDirX = 0, pupilDirY = 0;
        switch (this.direction) {
            case 'up': pupilDirY = -1; break;
            case 'down': pupilDirY = 1; break;
            case 'left': pupilDirX = -1; break;
            case 'right': pupilDirX = 1; break;
        }
        this.ctx.beginPath();
        this.ctx.arc(eye1X + pupilDirX * pupilOffset, eye1Y + pupilDirY * pupilOffset, eyeSize * 0.5, 0, Math.PI * 2);
        this.ctx.arc(eye2X + pupilDirX * pupilOffset, eye2Y + pupilDirY * pupilOffset, eyeSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    roundRect(x, y, w, h, r) {
        const maxRadius = Math.min(w, h) / 2;
        const radius = Math.min(r, maxRadius);
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + w - radius, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        this.ctx.lineTo(x + w, y + h - radius);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        this.ctx.lineTo(x + radius, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
}

// ============================================
// Initialize Game
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.snakeGame = new SnakeGame();
    }, 50);
});

window.addEventListener('beforeunload', () => {
    if (window.snakeGame) {
        window.snakeGame.audio.stopAll();
    }
});

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .achievement-notification {
        font-family: var(--font-ui);
    }
    .achievement-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .achievement-icon {
        font-size: 1.5rem;
    }
    .achievement-text {
        display: flex;
        flex-direction: column;
    }
    .achievement-text strong {
        color: var(--accent-warning);
        font-size: 0.8rem;
    }
    .achievement-text span {
        color: var(--fg-secondary);
        font-size: 0.85rem;
    }
`;
document.head.appendChild(style);