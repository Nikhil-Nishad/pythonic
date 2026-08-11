import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoringEngine } from '../src/scoring.js';

test('ScoringEngine - initial state', () => {
    const engine = new ScoringEngine({ basePoints: 10, pointsPerLevel: 100 });
    assert.equal(engine.score, 0);
    assert.equal(engine.level, 1);
    assert.equal(engine.comboCount, 0);
});

test('ScoringEngine - register normal food eat', () => {
    const engine = new ScoringEngine({ basePoints: 10 });
    const result = engine.registerFoodEat('normal');

    assert.equal(result.pointsEarned, 10);
    assert.equal(engine.score, 10);
    assert.equal(engine.comboCount, 1);
});

test('ScoringEngine - bonus food and combos', () => {
    const engine = new ScoringEngine({ basePoints: 10, bonusMultiplier: 3 });
    engine.registerFoodEat('normal'); // combo 1 -> 10 pts
    const result2 = engine.registerFoodEat('bonus'); // base 30 + combo bonus 5 = 35 pts

    assert.equal(result2.pointsEarned, 35);
    assert.equal(engine.score, 45);
    assert.equal(engine.comboCount, 2);
});

test('ScoringEngine - level progression', () => {
    const engine = new ScoringEngine({ basePoints: 50, pointsPerLevel: 100 });
    const res1 = engine.registerFoodEat('normal'); // 50 pts, level 1
    assert.equal(res1.level, 1);
    assert.equal(res1.leveledUp, false);

    const res2 = engine.registerFoodEat('normal'); // +55 pts = 105 pts, level 2!
    assert.equal(res2.level, 2);
    assert.equal(res2.leveledUp, true);
});
