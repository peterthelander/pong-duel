import { calculateAiSpeed } from './gameOptions';

export function updateAiPaddle({ paddle, ball, arena, ballSize, paddleWidth, opponentLevel, playerLevel, scoreDiff, now, dt }) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lookAhead = ball.vy < 0 ? 0.22 : 0.08;
  const jitter = Math.sin(now / 180) * (ball.vy < 0 ? 9 : 4);
  const target = clamp(ball.x + ballSize / 2 + ball.vx * lookAhead + jitter - paddleWidth / 2, 0, arena.width - paddleWidth);
  const maxStep = calculateAiSpeed(opponentLevel, playerLevel, scoreDiff) * dt;
  return { ...paddle, x: paddle.x + clamp(target - paddle.x, -maxStep, maxStep) };
}
