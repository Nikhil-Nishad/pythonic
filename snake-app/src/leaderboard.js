/**
 * LeaderboardService - Modular High-Scores & Leaderboard Engine
 */
export class LeaderboardService {
    constructor(storageKey = 'snake_leaderboard', maxEntries = 10) {
        this.storageKey = storageKey;
        this.maxEntries = maxEntries;
        this.defaultAvatars = ['🐍', '👑', '⚡', '🔥', '👾', '🚀', '⭐', '🏆', '🎯', '💎'];
        this.scores = this.loadScores();
    }

    loadScores() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed.sort((a, b) => b.score - a.score).slice(0, this.maxEntries);
                }
            }
        } catch (e) {
            // Fallback to default mock leaderboard if unparseable
        }

        // Return initial curated leaderboard entries for dynamic feel
        return [
            { name: 'Pythonic', score: 350, level: 4, date: '2026-08-10', avatar: '👑' },
            { name: 'ViperKing', score: 280, level: 3, date: '2026-08-09', avatar: '🐍' },
            { name: 'SpeedRunner', score: 210, level: 3, date: '2026-08-08', avatar: '⚡' },
            { name: 'ArcadeMaster', score: 160, level: 2, date: '2026-08-07', avatar: '👾' },
            { name: 'RetroPro', score: 110, level: 2, date: '2026-08-06', avatar: '🔥' }
        ];
    }

    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (e) {
            // Ignore quota errors
        }
    }

    isHighScore(score) {
        if (score <= 0) return false;
        if (this.scores.length < this.maxEntries) return true;
        return score > this.scores[this.scores.length - 1].score;
    }

    addEntry(name, score, level = 1, avatar = null) {
        const cleanName = (name || 'Anonymous').trim().slice(0, 15);
        const chosenAvatar = avatar || this.defaultAvatars[Math.floor(Math.random() * this.defaultAvatars.length)];
        const dateStr = new Date().toISOString().split('T')[0];

        const newEntry = {
            name: cleanName,
            score: score,
            level: level,
            date: dateStr,
            avatar: chosenAvatar
        };

        this.scores.push(newEntry);
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, this.maxEntries);

        this.saveScores();
        return newEntry;
    }

    getTopScores() {
        return [...this.scores];
    }

    clear() {
        this.scores = [];
        this.saveScores();
    }
}
