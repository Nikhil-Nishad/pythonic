import test from 'node:test';
import assert from 'node:assert/strict';
import { QuestManager } from '../src/quests/questManager.js';

test('QuestManager - generates 3 deterministic daily quests', () => {
    const qm = new QuestManager('test_quests_key_1');
    const quests = qm.getQuests();

    assert.equal(quests.length, 3);
    assert.ok(quests[0].title);
    assert.ok(quests[1].title);
    assert.ok(quests[2].title);
    assert.notEqual(quests[0].id, quests[1].id);
    assert.notEqual(quests[1].id, quests[2].id);
});

test('QuestManager - deterministic seeding returns identical quests for same date', () => {
    const qm1 = new QuestManager('test_quests_key_2');
    const qm2 = new QuestManager('test_quests_key_3');

    assert.deepEqual(
        qm1.getQuests().map(q => q.id),
        qm2.getQuests().map(q => q.id)
    );
});

test('QuestManager - updates progress and marks completed', () => {
    const qm = new QuestManager('test_quests_key_4');
    const initial = qm.getQuests();
    const targetQuest = initial[0];

    qm.updateProgress({
        normalEaten: 15,
        bonusEaten: 5,
        level: 5,
        score: 500,
        powerupsCollected: 5,
        comboCount: 5
    });

    const updated = qm.getQuests();
    assert.ok(updated.some(q => q.completed === true));
});
