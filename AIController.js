import { calculateAiSpeed } from './gameOptions';
import { GAME_CONSTANTS } from './GameCore';

const { PADDLE_WIDTH } = GAME_CONSTANTS;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class AIController {
  constructor(opponentData, playerLevel, ballSize, arena) {
    this.opponentData = opponentData;
    this.playerLevel = playerLevel;
    this.ballSize = ballSize;
    this.arena = arena;
    this.previousBottomPaddleRef = { x: 0, y: 0 };
  }

  updatePaddles(topPaddleXRef, bottomPaddleXRef, ball, now, dt, elapsedSeconds) {
    // AI controls top paddle
    const scoreDiff = 0; // Could pass scores if needed
    const aiSpeed = calculateAiSpeed(this.opponentData.level, this.playerLevel, scoreDiff);
    const lookAhead = ball.vy < 0 ? 0.22 : 0.08;
    const aiJitter = Math.sin(now / 180) * (ball.vy < 0 ? 9 : 4);
    const aiTargetX = clamp(
      ball.x + this.ballSize / 2 + ball.vx * lookAhead + aiJitter - PADDLE_WIDTH / 2,
      0,
      this.arena.width - PADDLE_WIDTH
    );
    const aiDelta = aiTargetX - topPaddleXRef.current;
    const aiMaxStep = aiSpeed * dt;
    topPaddleXRef.current += clamp(aiDelta, -aiMaxStep, aiMaxStep);

    // Player controls bottom paddle via touch (handled externally)
  }

  setPreviousBottomPaddle(x, y) {
    this.previousBottomPaddleRef = { x, y };
  }

  updateBottomPaddle(touchX, touchY) {
    // Handled by App.js directly
  }
}
