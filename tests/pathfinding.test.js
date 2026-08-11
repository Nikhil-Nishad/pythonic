import test from 'node:test';
import assert from 'node:assert/strict';
import { AStarPathfinder } from '../src/ai/pathfinding.js';
import { BotController } from '../src/ai/botController.js';

test('AStarPathfinder - finds direct path to target', () => {
    const start = { x: 0, y: 0 };
    const target = { x: 2, y: 0 };
    const path = AStarPathfinder.findPath(start, target, 10, [], []);

    assert.equal(path.length, 2);
    assert.equal(path[0], 'right');
});

test('AStarPathfinder - navigates around simple obstacle', () => {
    const start = { x: 0, y: 0 };
    const target = { x: 2, y: 0 };
    const obstacles = [{ x: 1, y: 0 }]; // Block direct right step

    const path = AStarPathfinder.findPath(start, target, 10, obstacles, []);
    assert.ok(path.length > 0);
    assert.notEqual(path[0], ''); // Path exists avoiding wall
});

test('BotController - initializes and executes step towards food', () => {
    const bot = new BotController(10);
    bot.reset();

    const targetFood = { x: 5, y: 3 };
    const result = bot.move(targetFood, [], []);

    assert.equal(result.collided, false);
    assert.equal(bot.body.length, 3);
});
