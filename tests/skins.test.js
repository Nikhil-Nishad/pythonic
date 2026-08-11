import test from 'node:test';
import assert from 'node:assert/strict';
import { SkinRegistry, SKINS } from '../src/skins/skinRegistry.js';
import { SkinStore } from '../src/skins/skinStore.js';

// Polyfill minimal localStorage
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => store.get(k) || null,
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear()
    };
}

test('SkinRegistry - returns default skin and total skins list', () => {
    const defaultSkin = SkinRegistry.getSkin('default');
    assert.equal(defaultSkin.id, 'default');
    assert.equal(defaultSkin.name, 'Cyber Blue');

    const allSkins = SkinRegistry.getAllSkins();
    assert.equal(allSkins.length, 5);
});

test('SkinStore - initial state unlocks default skin', () => {
    localStorage.clear();
    const store = new SkinStore('test_skins', 'test_active_skin');
    assert.equal(store.activeSkinId, 'default');
    assert.equal(store.isUnlocked('default'), true);
    assert.equal(store.isUnlocked('neon_matrix'), false);
});

test('SkinStore - unlocks skins based on score/level criteria', () => {
    localStorage.clear();
    const store = new SkinStore('test_skins', 'test_active_skin');

    // Score 150 unlocks neon_matrix (requires score 100)
    const unlocked = store.checkUnlocks(150, 1);
    assert.equal(unlocked.length, 1);
    assert.equal(unlocked[0].id, 'neon_matrix');
    assert.equal(store.isUnlocked('neon_matrix'), true);

    // Set active skin
    const success = store.setActiveSkin('neon_matrix');
    assert.equal(success, true);
    assert.equal(store.getActiveSkin().id, 'neon_matrix');
});
