/**
 * ScoringEngine - Authoritative Game Scoring & Progression Engine
 * Single source of truth for base scoring, combo bonuses, power-up multipliers, and level thresholds.
 */
export class ScoringEngine {
    static BASE_POINTS = 10;
    static BONUS_POINTS = 30;
    static SPEED_POINTS = 15;
    static COMBO_WINDOW_MS = 3500;
    static MAX_COMBO_BONUS = 20;
    static POINTS_PER_LEVEL = 100;

    constructor(options = {}) {
        this.basePoints = options.basePoints || ScoringEngine.BASE_POINTS;
        this.bonusPoints = options.bonusPoints || ScoringEngine.BONUS_POINTS;
        this.speedPoints = options.speedPoints || ScoringEngine.SPEED_POINTS;
        this.pointsPerLevel = options.pointsPerLevel || ScoringEngine.POINTS_PER_LEVEL;
        this.foodPerLevel = options.foodPerLevel || 5;

        this.reset();
    }

    reset() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.foodEaten = 0;
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboDurationMs = ScoringEngine.COMBO_WINDOW_MS;
        this.multiplier = 1;
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('snake_highscore') || '0', 10);
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('snake_highscore', this.highScore.toString());
        } catch (e) {
            // Ignore storage quota or disabled storage errors
        }
    }

    /**
     * Authoritative calculation function shared across engine, instructions, and calculator.
     * @param {string} foodType - 'normal', 'bonus', or 'speed'
     * @param {number} comboStreak - Current consecutive eat streak (1 to N)
     * @param {number} multiplier - Active power-up multiplier (1, 2, 3, or 6)
     * @param {number} speedBonus - Extra dynamic speed bonus
     */
    static calculatePoints(foodType = 'normal', comboStreak = 1, multiplier = 1, speedBonus = 0) {
        let base = ScoringEngine.BASE_POINTS;
        if (foodType === 'bonus') {
            base = ScoringEngine.BONUS_POINTS;
        } else if (foodType === 'speed') {
            base = ScoringEngine.SPEED_POINTS;
        }

        base += speedBonus;

        let comboBonus = 0;
        if (comboStreak > 1) {
            comboBonus = Math.min((comboStreak - 1) * 5, ScoringEngine.MAX_COMBO_BONUS);
        }

        const effectiveMultiplier = Math.max(1, multiplier);
        const totalPoints = Math.round((base + comboBonus) * effectiveMultiplier);

        return {
            basePoints: base,
            comboBonus: comboBonus,
            effectiveMultiplier: effectiveMultiplier,
            totalPoints: totalPoints
        };
    }

    registerFoodEat(foodType = 'normal', activeMultiplier = 1, speedBonus = 0) {
        this.foodEaten++;
        this.comboCount++;

        const mult = (activeMultiplier && activeMultiplier > 1) ? activeMultiplier : this.multiplier;
        const calc = ScoringEngine.calculatePoints(foodType, this.comboCount, mult, speedBonus);

        this.score += calc.totalPoints;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        // Check level progression
        const oldLevel = this.level;
        this.level = Math.floor(this.score / this.pointsPerLevel) + 1;
        const leveledUp = this.level > oldLevel;

        return {
            pointsEarned: calc.totalPoints,
            basePoints: calc.basePoints,
            comboBonus: calc.comboBonus,
            comboCount: this.comboCount,
            currentScore: this.score,
            highScore: this.highScore,
            level: this.level,
            leveledUp: leveledUp
        };
    }

    resetCombo() {
        this.comboCount = 0;
    }

    setMultiplier(multiplier = 1) {
        this.multiplier = Math.max(1, multiplier);
    }
}
