/**
 * TutorialManager - Interactive Onboarding & Controls Guide Engine
 */
export class TutorialManager {
    constructor(storageKey = 'snake_tutorial_seen') {
        this.storageKey = storageKey;
    }

    hasSeenTutorial() {
        try {
            return localStorage.getItem(this.storageKey) === 'true';
        } catch (e) {
            return false;
        }
    }

    markTutorialSeen() {
        try {
            localStorage.setItem(this.storageKey, 'true');
        } catch (e) {
            // Ignore storage errors
        }
    }

    resetTutorial() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            // Ignore storage errors
        }
    }
}
