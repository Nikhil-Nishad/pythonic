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
    const engine = new ScoringEngine();
    const result = engine.registerFoodEat('normal');

    assert.equal(result.pointsEarned, 10);
    assert.equal(engine.score, 10);
    assert.equal(engine.comboCount, 1);
});

test('ScoringEngine - bonus food and combos', () => {
    const engine = new ScoringEngine();
    engine.registerFoodEat('normal'); // combo 1 -> 10 pts
    const result2 = engine.registerFoodEat('bonus'); // base 30 + combo bonus 5 = 35 pts

    assert.equal(result2.pointsEarned, 35);
    assert.equal(engine.score, 45);
    assert.equal(engine.comboCount, 2);
});

test('ScoringEngine - speed food points', () => {
    const engine = new ScoringEngine();
    const result = engine.registerFoodEat('speed');
    assert.equal(result.pointsEarned, 15);
    assert.equal(engine.score, 15);
});

test('ScoringEngine - combo bonus capping', () => {
    const engine = new ScoringEngine();
    // Eat 10 foods in a row
    for (let i = 0; i < 9; i++) {
        engine.registerFoodEat('normal');
    }
    // 10th eat: base 10 + max combo bonus 20 = 30 pts
    const result = engine.registerFoodEat('normal');
    assert.equal(result.comboBonus, 20);
    assert.equal(result.pointsEarned, 30);
});

test('ScoringEngine - power-up multipliers (Double Points & Score Frenzy)', () => {
    const engine = new ScoringEngine();
    // Normal eat with 2x Double Points
    const res2x = engine.registerFoodEat('normal', 2);
    assert.equal(res2x.pointsEarned, 20); // 10 * 2 = 20

    // Bonus eat with 3x Score Frenzy on combo 2
    const res3x = engine.registerFoodEat('bonus', 3);
    // base 30 + combo bonus 5 = 35 * 3 = 105
    assert.equal(res3x.pointsEarned, 105);
    assert.equal(engine.score, 125);
});

test('ScoringEngine - authoritative calculatePoints static method', () => {
    const calcNormal = ScoringEngine.calculatePoints('normal', 1, 1);
    assert.equal(calcNormal.totalPoints, 10);

    const calcBonus = ScoringEngine.calculatePoints('bonus', 3, 2);
    // (30 + 10) * 2 = 80
    assert.equal(calcBonus.totalPoints, 80);

    const calcSpeed = ScoringEngine.calculatePoints('speed', 1, 1);
    assert.equal(calcSpeed.totalPoints, 15);
});

test('ScoringEngine - level progression', () => {
    const engine = new ScoringEngine({ pointsPerLevel: 100 });
    const res1 = engine.registerFoodEat('normal', 5); // 50 pts, level 1
    assert.equal(res1.level, 1);
    assert.equal(res1.leveledUp, false);

    const res2 = engine.registerFoodEat('normal', 6); // (10 + 5) * 6 = 90 pts -> total 140 pts, level 2!
    assert.equal(res2.level, 2);
    assert.equal(res2.leveledUp, true);
});
