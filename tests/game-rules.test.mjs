import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateWinProgress } from '../gameOptions.js';
import { paddleCrossingX, serveBallY } from '../gamePhysics.js';

test('wins award opponent-based points and carry progress across levels', () => {
  assert.deepEqual(calculateWinProgress(1, 0, 100), { earnedPoints: 2, playerLevel: 1, progressPoints: 2 });
  assert.deepEqual(calculateWinProgress(1, 2, 200), { earnedPoints: 4, playerLevel: 3, progressPoints: 1 });
  assert.deepEqual(calculateWinProgress(850, 4, 300), { earnedPoints: 6, playerLevel: 854, progressPoints: 0 });
  assert.deepEqual(calculateWinProgress(999, 4, 600), { earnedPoints: 12, playerLevel: 1000, progressPoints: 1 });
});

test('a serve starts above an overlapping player paddle', () => {
  assert.equal(serveBallY(90, 291, 18, 60, 300, 96, 14), 282);
  assert.equal(serveBallY(180, 291, 18, 60, 300, 96, 14), 291);
  assert.equal(serveBallY(90, 250, 18, 60, 300, 96, 14), 250);
});

test('paddle collision detects a fast ball crossing its current height', () => {
  assert.equal(paddleCrossingX(40, 260, 60, 310, 18, 30, 300, 96), 48.8);
  assert.equal(paddleCrossingX(40, 260, 60, 310, 18, 100, 300, 96), null);
  assert.equal(paddleCrossingX(40, 310, 60, 260, 18, 30, 300, 96), null);
  assert.equal(paddleCrossingX(40, 300, 60, 320, 18, 30, 300, 96), null);
});
