/**
 * QuestManager - Generates 3 deterministic daily quests per day and tracks completion.
 * Changes deterministically every midnight based on date string hash.
 */
export class QuestManager {
    static QUEST_POOL = [
        { id: 'eat_apples_10', title: 'Orchard Harvest', desc: 'Eat 10 Normal Apples', target: 10, reward: '🍏 25 pts' },
        { id: 'eat_bonus_3', title: 'Golden Feast', desc: 'Eat 3 Golden Bonus Apples', target: 3, reward: '👑 50 pts' },
        { id: 'reach_level_3', title: 'Speed Demon', desc: 'Reach Level 3 in a single game', target: 3, reward: '🔥 Flame Badge' },
        { id: 'reach_level_5', title: 'Arcade Master', desc: 'Reach Level 5 in a single game', target: 5, reward: '⚡ Neon Badge' },
        { id: 'score_150', title: 'High Roller', desc: 'Score 150 points in a single run', target: 150, reward: '🎨 Matrix Skin' },
        { id: 'score_300', title: 'Snake Legend', desc: 'Score 300 points in a single run', target: 300, reward: '🏆 Golden Trophy' },
        { id: 'collect_powerup_2', title: 'Skill Seeker', desc: 'Collect 2 power-up items', target: 2, reward: '🛡️ Aegis Badge' },
        { id: 'combo_streak_3', title: 'Combo Master', desc: 'Achieve a 3x or higher combo streak', target: 3, reward: '⭐ Star Badge' }
    ];

    constructor(storageKey = 'snake_daily_quests') {
        this.storageKey = storageKey;
        this.todayStr = new Date().toISOString().split('T')[0];
        this.quests = this.loadQuests();
    }

    /**
     * Deterministic hash from date string (e.g. "2026-11-13")
     */
    _hashDate(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    loadQuests() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.date === this.todayStr && Array.isArray(parsed.quests) && parsed.quests.length === 3) {
                    return parsed.quests;
                }
            }
        } catch (e) {
            // Ignore parse errors
        }

        // Generate 3 deterministic daily quests using date seed
        const pool = [...QuestManager.QUEST_POOL];
        const seed = this._hashDate(this.todayStr);
        const selected = [];

        for (let i = 0; i < 3; i++) {
            const idx = (seed + i * 3) % pool.length;
            const chosen = pool.splice(idx, 1)[0];
            selected.push({
                ...chosen,
                progress: chosen.id.startsWith('reach_level') ? 1 : 0,
                completed: false
            });
        }

        this.saveQuests(selected);
        return selected;
    }

    saveQuests(quests = this.quests) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                date: this.todayStr,
                quests: quests
            }));
        } catch (e) {
            // Ignore quota errors
        }
    }

    updateProgress(stats = {}) {
        let changed = false;
        this.quests.forEach(quest => {
            if (quest.completed) return;

            if (quest.id === 'eat_apples_10' && stats.normalEaten) {
                quest.progress = Math.min(quest.target, quest.progress + stats.normalEaten);
            }
            if (quest.id === 'eat_bonus_3' && stats.bonusEaten) {
                quest.progress = Math.min(quest.target, quest.progress + stats.bonusEaten);
            }
            if (quest.id === 'reach_level_3' && stats.level) {
                quest.progress = Math.max(quest.progress, stats.level);
            }
            if (quest.id === 'reach_level_5' && stats.level) {
                quest.progress = Math.max(quest.progress, stats.level);
            }
            if (quest.id === 'score_150' && stats.score) {
                quest.progress = Math.max(quest.progress, stats.score);
            }
            if (quest.id === 'score_300' && stats.score) {
                quest.progress = Math.max(quest.progress, stats.score);
            }
            if (quest.id === 'collect_powerup_2' && stats.powerupsCollected) {
                quest.progress = Math.min(quest.target, quest.progress + stats.powerupsCollected);
            }
            if (quest.id === 'combo_streak_3' && stats.comboCount) {
                quest.progress = Math.max(quest.progress, stats.comboCount);
            }

            if (quest.progress >= quest.target && !quest.completed) {
                quest.completed = true;
                changed = true;
            }
        });

        if (changed) {
            this.saveQuests();
        }
        return this.quests;
    }

    getQuests() {
        return [...this.quests];
    }
}
