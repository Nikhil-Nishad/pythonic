/**
 * SkinStore - Manages unlocked cosmetics state and active skin selection persistence
 */
import { SKINS, SkinRegistry } from './skinRegistry.js';

export class SkinStore {
    constructor(storageKey = 'snake_unlocked_skins', activeSkinKey = 'snake_active_skin') {
        this.storageKey = storageKey;
        this.activeSkinKey = activeSkinKey;
        this.unlockedSkins = this.loadUnlockedSkins();
        this.activeSkinId = this.loadActiveSkin();
    }

    loadUnlockedSkins() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return new Set(parsed);
            }
        } catch (e) {
            // Ignore errors
        }
        return new Set(['default']);
    }

    saveUnlockedSkins() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.unlockedSkins)));
        } catch (e) {
            // Ignore errors
        }
    }

    loadActiveSkin() {
        try {
            const id = localStorage.getItem(this.activeSkinKey);
            if (id && SKINS[id]) return id;
        } catch (e) {
            // Ignore errors
        }
        return 'default';
    }

    setActiveSkin(skinId) {
        if (this.isUnlocked(skinId)) {
            this.activeSkinId = skinId;
            try {
                localStorage.setItem(this.activeSkinKey, skinId);
            } catch (e) {
                // Ignore errors
            }
            return true;
        }
        return false;
    }

    getActiveSkin() {
        return SkinRegistry.getSkin(this.activeSkinId);
    }

    isUnlocked(skinId) {
        return this.unlockedSkins.has(skinId) || skinId === 'default';
    }

    checkUnlocks(score = 0, level = 1) {
        const newlyUnlocked = [];
        for (const skin of SkinRegistry.getAllSkins()) {
            if (this.isUnlocked(skin.id)) continue;

            let conditionMet = false;
            if (skin.requiredScore && score >= skin.requiredScore) {
                conditionMet = true;
            }
            if (skin.requiredLevel && level >= skin.requiredLevel) {
                conditionMet = true;
            }

            if (conditionMet) {
                this.unlockedSkins.add(skin.id);
                newlyUnlocked.push(skin);
            }
        }

        if (newlyUnlocked.length > 0) {
            this.saveUnlockedSkins();
        }
        return newlyUnlocked;
    }
}
