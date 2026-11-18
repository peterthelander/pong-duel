import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTouchController } from '../TwoPlayerController.js';
import { paddleCrossing, topPaddleCrossing, playerBounceVelocity } from '../gamePhysics.js';

const arena = { width: 390, height: 844 };
const touch = (identifier, locationX, locationY) => ({ identifier, locationX, locationY });

test('two simultaneous touches control their original paddles independently', () => {
  const controller = createTouchController(true);
  const moves = [];
  const move = (...args) => moves.push(args);
  controller.start([touch(1, 100, 100), touch(2, 200, 700)], arena, move);
  controller.move([touch(1, 150, 500), touch(2, 250, 300)], move);
  assert.deepEqual(moves, [
    ['top', 100, 100], ['bottom', 200, 700],
    ['top', 150, 500], ['bottom', 250, 300],
  ]);
  controller.end([touch(1, 150, 500)]);
  controller.start([touch(3, 80, 90)], arena, move);
  controller.move([touch(2, 270, 750), touch(3, 90, 110)], move);
  assert.deepEqual(moves.slice(-3), [['top', 80, 90], ['bottom', 270, 750], ['top', 90, 110]]);
});

test('extra touches do not steal a paddle and cancelled touches release ownership', () => {
  const controller = createTouchController(true);
  const moves = [];
  const move = (...args) => moves.push(args);
  controller.start([touch(1, 100, 100), touch(2, 150, 150)], arena, move);
  controller.move([touch(2, 200, 200)], move);
  assert.equal(moves.length, 1);
  controller.clear();
  controller.start([touch(2, 200, 200)], arena, move);
  assert.deepEqual(moves.at(-1), ['top', 200, 200]);
});

test('single-player touch controls only the lower half', () => {
  const controller = createTouchController(false);
  const moves = [];
  controller.start([touch(1, 30, 50), touch(2, 70, 600)], arena, (...args) => moves.push(args));
  assert.deepEqual(moves, [['bottom', 70, 600]]);
});

test('top and bottom paddle crossings are symmetric, including moving paddles and misses', () => {
  const top = { x: 100, y: 126 };
  const bottom = { x: 100, y: 704 };
  assert.ok(topPaddleCrossing(125, 160, 125, 130, 18, top, top, 96, 14));
  assert.ok(paddleCrossing(125, 670, 125, 700, 18, bottom, bottom, 96));
  assert.equal(topPaddleCrossing(10, 160, 10, 130, 18, top, top, 96, 14), null);
  assert.equal(topPaddleCrossing(125, 130, 125, 160, 18, top, top, 96, 14), null);
  assert.ok(topPaddleCrossing(160, 160, 160, 130, 18, { x: 0, y: 126 }, top, 96, 14));
  assert.ok(-playerBounceVelocity(-360, -126, -136, 0.1) > 360);
});
