import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { paddleCrossing, playerBounceVelocity, serveBallY } from './gamePhysics';

const PADDLE_WIDTH = 96;
const PADDLE_HEIGHT = 14;
const PADDLE_MARGIN = 126;
const BASE_BALL_SPEED = 360;
const MAX_BALL_SPEED = 850;
const WIN_SCORE = 7;
const SERVE_DELAY_MS = 480;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomServeDirection() {
  return Math.random() > 0.5 ? 1 : -1;
}

export function useGameCore(arena, controller, callbacks) {
  const ballPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const rallyPausedUntilRef = useRef(0);
  const servePendingRef = useRef(false);

  const topPaddleXRef = useRef(0);
  const bottomPaddleXRef = useRef(0);
  const previousBottomPaddleRef = useRef({ x: 0, y: 0 });
  const topScoreRef = useRef(0);
  const bottomScoreRef = useRef(0);
  const trailRef = useRef(
    Array.from({ length: 4 }, () => ({
      x: 0,
      y: 0,
    }))
  );
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const [topPaddleX, setTopPaddleX] = useState(0);
  const [bottomPaddleX, setBottomPaddleX] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [bottomScore, setBottomScore] = useState(0);
  const [matchWinner, setMatchWinner] = useState(null);
  const [trail, setTrail] = useState(trailRef.current);

  const { onPlaySound, onScoreChange, onWin } = callbacks;

  const resetBall = (directionY, delayMs = 0) => {
    const centerX = (arena.width - controller.ballSize) / 2;
    const centerY = (arena.height - controller.ballSize) / 2;
    const initialVX = (Math.random() * 2 - 1) * 170;
    const initialVY = BASE_BALL_SPEED * directionY;

    ballRef.current = { x: centerX, y: centerY, vx: initialVX, vy: initialVY };
    trailRef.current = trailRef.current.map(() => ({ x: centerX, y: centerY }));
    rallyPausedUntilRef.current = performance.now() + delayMs;
    servePendingRef.current = true;
    ballPosition.setValue({ x: centerX, y: centerY });
  };

  const restartMatch = () => {
    topScoreRef.current = 0;
    bottomScoreRef.current = 0;
    setTopScore(0);
    setBottomScore(0);
    setMatchWinner(null);
    lastFrameTimeRef.current = 0;
    resetBall(randomServeDirection(), SERVE_DELAY_MS);
  };

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0) {
      return;
    }

    const initialX = (arena.width - PADDLE_WIDTH) / 2;
    topPaddleXRef.current = initialX;
    bottomPaddleXRef.current = initialX;
    previousBottomPaddleRef.current = { x: initialX, y: arena.height - PADDLE_MARGIN - PADDLE_HEIGHT };
    setTopPaddleX(initialX);
    setBottomPaddleX(initialX);
    resetBall(randomServeDirection(), SERVE_DELAY_MS);
  }, [arena.height, arena.width]);

  useEffect(() => {
    topScoreRef.current = topScore;
    bottomScoreRef.current = bottomScore;
  }, [topScore, bottomScore]);

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0) {
      return undefined;
    }

    const topPaddleY = PADDLE_MARGIN;
    const bottomPaddleY = clamp(arena.height - PADDLE_MARGIN - PADDLE_HEIGHT, arena.height / 2, arena.height - PADDLE_HEIGHT);

    const step = (now) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = now;
      }

      const elapsedSeconds = Math.max(0, (now - lastFrameTimeRef.current) / 1000);
      const dt = Math.min(elapsedSeconds, 0.033);
      lastFrameTimeRef.current = now;

      if (matchWinner) {
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      const ball = ballRef.current;
      const previousBallX = ball.x;
      const previousBallY = ball.y;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      trailRef.current = [
        { x: ball.x, y: ball.y },
        trailRef.current[0],
        trailRef.current[1],
        trailRef.current[2],
      ];
      setTrail([...trailRef.current]);

      // Update paddles via controller
      controller.updatePaddles(topPaddleXRef, bottomPaddleXRef, ball, now, dt, elapsedSeconds);
      setTopPaddleX(topPaddleXRef.current);
      setBottomPaddleX(bottomPaddleXRef.current);

      if (now < rallyPausedUntilRef.current) {
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      if (servePendingRef.current) {
        servePendingRef.current = false;
        if (ball.vy > 0) {
          ball.y = serveBallY(
            ball.x, ball.y, controller.ballSize, bottomPaddleXRef.current,
            bottomPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT
          );
        } else {
          ball.y = serveBallY(
            ball.x, ball.y, controller.ballSize, topPaddleXRef.current,
            topPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT
          );
        }
      }

      // Bounce from side walls
      if (ball.x <= 0) {
        ball.x = 0;
        ball.vx = Math.abs(ball.vx);
        onPlaySound('wall');
      } else if (ball.x + controller.ballSize >= arena.width) {
        ball.x = arena.width - controller.ballSize;
        ball.vx = -Math.abs(ball.vx);
        onPlaySound('wall');
      }

      // Top paddle collision
      const topCrossing = paddleCrossing(
        previousBallX, previousBallY, ball.x, ball.y, controller.ballSize,
        { x: topPaddleXRef.current, y: topPaddleY }, { x: topPaddleXRef.current, y: topPaddleY }, PADDLE_WIDTH
      );
      if (ball.vy < 0 && topCrossing !== null) {
        ball.y = topPaddleY + PADDLE_HEIGHT;
        ball.vy = Math.abs(ball.vy) * 1.03;
        const offset = (topCrossing.ballX + controller.ballSize / 2 - (topCrossing.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ball.vx += offset * 270;
        onPlaySound('paddle');
      }

      // Bottom paddle collision
      const previousPaddle = previousBottomPaddleRef.current;
      const paddle = { x: bottomPaddleXRef.current, y: bottomPaddleY };
      const bottomCrossing = paddleCrossing(
        previousBallX, previousBallY, ball.x, ball.y, controller.ballSize,
        previousPaddle, paddle, PADDLE_WIDTH
      );
      if (ball.vy > 0 && bottomCrossing !== null) {
        ball.y = paddle.y - controller.ballSize;
        ball.vy = playerBounceVelocity(ball.vy, previousPaddle.y, paddle.y, elapsedSeconds);
        const offset =
          (bottomCrossing.ballX + controller.ballSize / 2 - (bottomCrossing.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ball.vx += offset * 270;
        onPlaySound('paddle');
      }

      previousBottomPaddleRef.current = paddle;

      // Clamp speed
      ball.vx = clamp(ball.vx, -MAX_BALL_SPEED, MAX_BALL_SPEED);
      ball.vy = clamp(ball.vy, -MAX_BALL_SPEED, MAX_BALL_SPEED);

      // Scoring
      if (ball.y + controller.ballSize < 0) {
        const nextBottomScore = bottomScoreRef.current + 1;
        bottomScoreRef.current = nextBottomScore;
        setBottomScore(nextBottomScore);
        onScoreChange(nextBottomScore, topScoreRef.current);
        onPlaySound('point');
        if (nextBottomScore >= WIN_SCORE) {
          onWin('bottom');
          setMatchWinner('Player 1');
          resetBall(1);
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        resetBall(1, SERVE_DELAY_MS);
      } else if (ball.y >= arena.height) {
        const nextTopScore = topScoreRef.current + 1;
        topScoreRef.current = nextTopScore;
        setTopScore(nextTopScore);
        onScoreChange(topScoreRef.current, bottomScoreRef.current);
        onPlaySound('point');
        if (nextTopScore >= WIN_SCORE) {
          onWin('top');
          setMatchWinner('Player 2');
          resetBall(-1);
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        resetBall(-1, SERVE_DELAY_MS);
      }

      ballPosition.setValue({ x: ball.x, y: ball.y });
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [arena, controller, onPlaySound, onScoreChange, onWin]);

  return {
    ballPosition,
    topPaddleX,
    bottomPaddleX,
    topScore,
    bottomScore,
    matchWinner,
    trail,
    restartMatch,
  };
}

export const GAME_CONSTANTS = {
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  BASE_BALL_SPEED,
  MAX_BALL_SPEED,
  WIN_SCORE,
  SERVE_DELAY_MS,
};
