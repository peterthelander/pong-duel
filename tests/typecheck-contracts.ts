import { calculateWinProgress } from '../gameOptions';
import { paddleCrossing, serveBallY } from '../gamePhysics';

const paddle = { x: 30, y: 300 };
const collision = paddleCrossing(40, 260, 60, 310, 18, paddle, paddle, 96);
if (collision !== null) {
  const crossingX: number = collision.ballX;
  void crossingX;
}

// @ts-expect-error Paddle coordinates must be numbers.
paddleCrossing(40, 260, 60, 310, 18, { x: '30', y: 300 }, paddle, 96);
// @ts-expect-error A serve requires numeric ball coordinates.
serveBallY('90', 291, 18, 60, 300, 96, 14);
// @ts-expect-error Progression levels must be numbers.
calculateWinProgress('1', 0, 100);
