import { GAME_CONSTANTS } from './GameCore';

const { PADDLE_WIDTH } = GAME_CONSTANTS;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class TwoPlayerController {
  constructor(ballSize, arena) {
    this.ballSize = ballSize;
    this.arena = arena;
    this.activeTouches = {};
    this.topPaddleXRef = { current: 0 };
    this.bottomPaddleXRef = { current: 0 };
  }

  updatePaddles(topPaddleXRef, bottomPaddleXRef, ball, now, dt, elapsedSeconds) {
    // Paddles are updated via touch handlers, positions already in refs
  }

  handleMultiTouch(event, topPaddleXRef, bottomPaddleXRef, arenaDimensions) {
    if (!event.touches) return;
    this.activeTouches = {};
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const clientRect = event.currentTarget.getBoundingClientRect();
      const touchX = touch.clientX - clientRect.left;
      const touchY = touch.clientY - clientRect.top;
      this.activeTouches[touch.identifier] = { x: touchX, y: touchY };

      if (touchY < arenaDimensions.height / 2) {
        this.updateTopPaddle(touchX, topPaddleXRef, arenaDimensions);
      } else {
        this.updateBottomPaddle(touchX, bottomPaddleXRef, arenaDimensions);
      }
    }
  }

  handleTouchEnd(event, topPaddleXRef, bottomPaddleXRef, arenaDimensions) {
    if (!event.touches) return;
    this.activeTouches = {};
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const clientRect = event.currentTarget.getBoundingClientRect();
      const touchX = touch.clientX - clientRect.left;
      const touchY = touch.clientY - clientRect.top;
      this.activeTouches[touch.identifier] = { x: touchX, y: touchY };

      if (touchY < arenaDimensions.height / 2) {
        this.updateTopPaddle(touchX, topPaddleXRef, arenaDimensions);
      } else {
        this.updateBottomPaddle(touchX, bottomPaddleXRef, arenaDimensions);
      }
    }
  }

  updateTopPaddle(touchX, topPaddleXRef, arenaDimensions) {
    const nextX = clamp(touchX - PADDLE_WIDTH / 2, 0, arenaDimensions.width - PADDLE_WIDTH);
    topPaddleXRef.current = nextX;
  }

  updateBottomPaddle(touchX, bottomPaddleXRef, arenaDimensions) {
    const nextX = clamp(touchX - PADDLE_WIDTH / 2, 0, arenaDimensions.width - PADDLE_WIDTH);
    bottomPaddleXRef.current = nextX;
  }
}

