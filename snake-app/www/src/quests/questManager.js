/**
 * QuestManager - Generates 3 daily quests per day and tracks completion
 */
export class QuestManager {
    constructor(storageKey = 'snake_daily_quests') {
        this.storageKey = storageKey;
        this.todayStr = new Date().toISOString().split('T')[0];
        this.quests = this.loadQuests();
    }

    loadQuests() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.date === this.todayStr && Array.isArray(parsed.quests)) {
                    return parsed.quests;
                }
            }
        } catch (e) {
            // Ignore errors
        }

        // Generate fresh daily quests for today
        const freshQuests = [
            { id: 'eat_bonus_3', title: 'Fruit Feast', desc: 'Eat 3 Golden Bonus apples', target: 3, progress: 0, completed: false, reward: '👑 50 pts' },
            { id: 'reach_level_3', title: 'Speed Demon', desc: 'Reach Level 3 in a game', target: 3, progress: 1, completed: false, reward: '🔥 Flame Badge' },
            { id: 'score_150', title: 'High Roller', desc: 'Score 150 points in a single run', target: 150, progress: 0, completed: false, reward: '🎨 Matrix Skin' }
        ];

        this.saveQuests(freshQuests);
        return freshQuests;
    }

    saveQuests(quests = this.quests) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                date: this.todayStr,
                quests: quests
            }));
        } catch (e) {
            // Ignore errors
        }
    }

    updateProgress(stats = {}) {
        let changed = false;
        this.quests.forEach(quest => {
            if (quest.completed) return;

            if (quest.id === 'eat_bonus_3' && stats.bonusEaten) {
                quest.progress = Math.min(quest.target, quest.progress + stats.bonusEaten);
            }
            if (quest.id === 'reach_level_3' && stats.level) {
                quest.progress = Math.max(quest.progress, stats.level);
            }
            if (quest.id === 'score_150' && stats.score) {
                quest.progress = Math.max(quest.progress, stats.score);
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
