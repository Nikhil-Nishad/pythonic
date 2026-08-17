/**
 * ScoringEngine - Modular Game Scoring & Progression Engine
 */
export class ScoringEngine {
    constructor(options = {}) {
        this.basePoints = options.basePoints || 10;
        this.bonusMultiplier = options.bonusMultiplier || 3;
        this.pointsPerLevel = options.pointsPerLevel || 100;
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
        this.comboDurationMs = 3000;
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

    registerFoodEat(foodType = 'normal', speedBonus = 0) {
        this.foodEaten++;
        this.comboCount++;

        // Calculate base points for this food
        let points = this.basePoints;
        if (foodType === 'bonus') {
            points *= this.bonusMultiplier;
        } else if (foodType === 'speed') {
            points += 5;
        }

        // Apply speed bonus
        points += speedBonus;

        // Calculate Combo Multiplier
        let comboBonus = 0;
        if (this.comboCount > 1) {
            comboBonus = Math.min((this.comboCount - 1) * 5, 25);
        }

        const totalEarned = (points + comboBonus) * this.multiplier;
        this.score += totalEarned;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        // Check level progression
        const oldLevel = this.level;
        this.level = Math.floor(this.score / this.pointsPerLevel) + 1;
        const leveledUp = this.level > oldLevel;

        return {
            pointsEarned: totalEarned,
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
        this.multiplier = multiplier;
    }
}
