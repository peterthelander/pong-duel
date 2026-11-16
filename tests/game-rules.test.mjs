import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateWinProgress } from '../gameOptions.js';
import { defaults, validatePreferences } from '../gamePreferences.js';
import { paddleCrossing, serveBallY } from '../gamePhysics.js';

test('wins award one point per 100 opponent levels and advance every three points', () => {
  assert.deepEqual(calculateWinProgress(1, 0, 100), { earnedPoints: 1, playerLevel: 1, progressPoints: 1 });
  assert.deepEqual(calculateWinProgress(1, 1, 200), { earnedPoints: 2, playerLevel: 2, progressPoints: 0 });
  assert.deepEqual(calculateWinProgress(1, 2, 100), { earnedPoints: 1, playerLevel: 2, progressPoints: 0 });
  assert.deepEqual(calculateWinProgress(850, 2, 600), { earnedPoints: 6, playerLevel: 852, progressPoints: 2 });
  assert.deepEqual(calculateWinProgress(999, 2, 600), { earnedPoints: 6, playerLevel: 1000, progressPoints: 2 });
});

test('saved progress is converted once without losing preferences or levels', () => {
  const { progressRuleVersion, ...legacy } = defaults;
  for (let points = 0; points <= 4; points++) {
    const restored = validatePreferences({ ...legacy, playerLevel: 10, playerName: 'Player', progressPoints: points });
    assert.equal(restored.playerLevel, 10 + Math.floor(points / 3));
    assert.equal(restored.progressPoints, points % 3);
    assert.equal(restored.progressRuleVersion, progressRuleVersion);
    assert.equal(restored.playerName, 'Player');
    assert.deepEqual(validatePreferences(restored), restored);
  }
  const { progressPoints, ...older } = legacy;
  assert.equal(validatePreferences(older).progressPoints, 0);
  assert.equal(validatePreferences({ ...legacy, playerLevel: 1000, progressPoints: 4 }).playerLevel, 1000);
  assert.throws(() => validatePreferences({ ...defaults, progressPoints: 3 }), /invalid/);
  assert.throws(() => validatePreferences({ ...defaults, progressRuleVersion: 3 }), /invalid/);
});

test('a serve starts above an overlapping player paddle', () => {
  assert.equal(serveBallY(90, 291, 18, 60, 300, 96, 14), 282);
  assert.equal(serveBallY(180, 291, 18, 60, 300, 96, 14), 291);
  assert.equal(serveBallY(90, 250, 18, 60, 300, 96, 14), 250);
});

test('paddle collision detects a fast ball crossing its current height', () => {
  const paddle = { x: 30, y: 300 };
  assert.deepEqual(paddleCrossing(40, 260, 60, 310, 18, paddle, paddle, 96), { ballX: 48.8, paddleX: 30 });
  assert.equal(paddleCrossing(40, 260, 60, 310, 18, { x: 100, y: 300 }, { x: 100, y: 300 }, 96), null);
  assert.equal(paddleCrossing(40, 310, 60, 260, 18, paddle, paddle, 96), null);
  assert.equal(paddleCrossing(40, 300, 60, 320, 18, paddle, paddle, 96), null);
});

test('a rising paddle catches a descending ball when their paths cross between frames', () => {
  assert.deepEqual(
    paddleCrossing(40, 270, 44, 280, 18, { x: 30, y: 320 }, { x: 30, y: 290 }, 96),
    { ballX: 43.2, paddleX: 30 }
  );
  assert.equal(paddleCrossing(40, 270, 44, 280, 18, { x: 100, y: 320 }, { x: 100, y: 290 }, 96), null);
  assert.equal(paddleCrossing(40, 270, 44, 280, 18, { x: 30, y: 300 }, { x: 30, y: 320 }, 96), null);
});

test('horizontal paddle position is evaluated at the crossing, not the end of the frame', () => {
  assert.deepEqual(
    paddleCrossing(50, 270, 50, 290, 18, { x: 0, y: 300 }, { x: 100, y: 300 }, 40),
    { ballX: 50, paddleX: 60 }
  );
  assert.equal(paddleCrossing(50, 270, 50, 290, 18, { x: 150, y: 300 }, { x: 30, y: 300 }, 40), null);
});
