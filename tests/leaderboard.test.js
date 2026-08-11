import test from 'node:test';
import assert from 'node:assert/strict';
import { LeaderboardService } from '../src/leaderboard.js';

// Polyfill minimal localStorage for node environment if absent
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => store.get(k) || null,
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear()
    };
}

test('LeaderboardService - loads initial default scores', () => {
    localStorage.clear();
    const lb = new LeaderboardService('test_lb', 5);
    const scores = lb.getTopScores();

    assert.equal(scores.length, 5);
    assert.equal(scores[0].name, 'Pythonic');
    assert.equal(scores[0].score, 350);
});

test('LeaderboardService - detects high score', () => {
    localStorage.clear();
    const lb = new LeaderboardService('test_lb', 5);
    assert.equal(lb.isHighScore(400), true);
    assert.equal(lb.isHighScore(50), false);
});

test('LeaderboardService - adds score and keeps top N entries sorted', () => {
    localStorage.clear();
    const lb = new LeaderboardService('test_lb', 3);
    lb.addEntry('Player1', 500, 5, '👑');

    const scores = lb.getTopScores();
    assert.equal(scores.length, 3);
    assert.equal(scores[0].name, 'Player1');
    assert.equal(scores[0].score, 500);
});
