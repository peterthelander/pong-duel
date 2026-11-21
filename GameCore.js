import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { updateAiPaddle } from './AIController';
import { paddleCrossing, paddleSlideVelocity, playerBounceVelocity, serveBallY, topPaddleCrossing } from './gamePhysics';

const PADDLE_WIDTH = 96;
const PADDLE_HEIGHT = 14;
const PADDLE_MARGIN = 126;
const BASE_BALL_SPEED = 360;
const MAX_BALL_SPEED = 850;
const WIN_SCORE = 7;
const SERVE_DELAY_MS = 480;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function useGameCore(arena, { ballSize, twoPlayer, opponentLevel, playerLevel, onPlaySound, onWin }) {
  const ballPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const paddles = useRef({ top: { x: 0, y: 0 }, bottom: { x: 0, y: 0 } });
  const previousPaddles = useRef(paddles.current);
  const scores = useRef({ top: 0, bottom: 0 });
  const trailRef = useRef(Array.from({ length: 4 }, () => ({ x: 0, y: 0 })));
  const lastFrame = useRef(0);
  const pauseUntil = useRef(0);
  const servePending = useRef(false);
  const [positions, setPositions] = useState(paddles.current);
  const [score, setScore] = useState(scores.current);
  const [winner, setWinner] = useState(null);
  const [trail, setTrail] = useState(trailRef.current);

  const resetBall = useCallback((direction, delay = 0) => {
    const x = (arena.width - ballSize) / 2;
    const y = (arena.height - ballSize) / 2;
    ballRef.current = { x, y, vx: (Math.random() * 2 - 1) * 170, vy: BASE_BALL_SPEED * direction };
    trailRef.current = trailRef.current.map(() => ({ x, y }));
    setTrail(trailRef.current);
    pauseUntil.current = performance.now() + delay;
    servePending.current = true;
    lastFrame.current = 0;
    ballPosition.setValue({ x, y });
  }, [arena.width, arena.height, ballSize, ballPosition]);

  const restartMatch = useCallback(() => {
    scores.current = { top: 0, bottom: 0 };
    setScore(scores.current);
    setWinner(null);
    resetBall(Math.random() > 0.5 ? 1 : -1, SERVE_DELAY_MS);
  }, [resetBall]);

  const movePaddle = useCallback((side, x, y) => {
    if (arena.width <= 0 || arena.height <= 0) return;
    const top = side === 'top';
    const position = {
      x: clamp(x - PADDLE_WIDTH / 2, 0, Math.max(0, arena.width - PADDLE_WIDTH)),
      y: clamp(y - PADDLE_HEIGHT / 2, top ? 0 : arena.height / 2, top ? arena.height / 2 - PADDLE_HEIGHT : arena.height - PADDLE_HEIGHT),
    };
    paddles.current = { ...paddles.current, [side]: position };
    setPositions(paddles.current);
  }, [arena.width, arena.height]);

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0) return;
    const x = Math.max(0, (arena.width - PADDLE_WIDTH) / 2);
    paddles.current = {
      top: { x, y: Math.min(PADDLE_MARGIN, arena.height / 2 - PADDLE_HEIGHT) },
      bottom: { x, y: clamp(arena.height - PADDLE_MARGIN - PADDLE_HEIGHT, arena.height / 2, arena.height - PADDLE_HEIGHT) },
    };
    previousPaddles.current = paddles.current;
    setPositions(paddles.current);
    resetBall(Math.random() > 0.5 ? 1 : -1, SERVE_DELAY_MS);
  }, [arena.width, arena.height, resetBall]);

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0 || winner) return undefined;
    let frame;
    const step = (now) => {
      const elapsed = lastFrame.current ? Math.max(0, (now - lastFrame.current) / 1000) : 0;
      const dt = Math.min(elapsed, 0.033);
      lastFrame.current = now;
      const ball = ballRef.current;
      const previous = previousPaddles.current;
      if (!twoPlayer) {
        paddles.current = {
          ...paddles.current,
          top: updateAiPaddle({
            paddle: paddles.current.top, ball, arena, ballSize, paddleWidth: PADDLE_WIDTH,
            opponentLevel, playerLevel, scoreDiff: scores.current.bottom - scores.current.top, now, dt,
          }),
        };
        setPositions(paddles.current);
      }
      const current = paddles.current;
      previousPaddles.current = current;

      if (now < pauseUntil.current) {
        frame = requestAnimationFrame(step);
        return;
      }
      if (servePending.current) {
        servePending.current = false;
        if (ball.vy > 0) {
          ball.y = serveBallY(ball.x, ball.y, ballSize, current.bottom.x, current.bottom.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        } else {
          ball.y = -serveBallY(ball.x, -ball.y - ballSize, ballSize, current.top.x, -current.top.y - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT) - ballSize;
        }
      }

      const previousX = ball.x;
      const previousY = ball.y;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      trailRef.current = [{ x: ball.x, y: ball.y }, ...trailRef.current.slice(0, 3)];
      setTrail(trailRef.current);

      if (ball.x <= 0) {
        ball.x = 0;
        ball.vx = Math.abs(ball.vx);
        onPlaySound('wall');
      } else if (ball.x + ballSize >= arena.width) {
        ball.x = arena.width - ballSize;
        ball.vx = -Math.abs(ball.vx);
        onPlaySound('wall');
      }

      const topCrossing = ball.vy < 0 && topPaddleCrossing(previousX, previousY, ball.x, ball.y, ballSize, previous.top, current.top, PADDLE_WIDTH, PADDLE_HEIGHT);
      const bottomCrossing = ball.vy > 0 && paddleCrossing(previousX, previousY, ball.x, ball.y, ballSize, previous.bottom, current.bottom, PADDLE_WIDTH);
      if (topCrossing) {
        ball.y = current.top.y + PADDLE_HEIGHT;
        ball.vy = -playerBounceVelocity(ball.vy, -previous.top.y, -current.top.y, elapsed);
        ball.vx += ((topCrossing.ballX + ballSize / 2 - topCrossing.paddleX - PADDLE_WIDTH / 2) / (PADDLE_WIDTH / 2)) * 270 + paddleSlideVelocity(previous.top.x, current.top.x, elapsed);
        onPlaySound('paddle');
      } else if (bottomCrossing) {
        ball.y = current.bottom.y - ballSize;
        ball.vy = playerBounceVelocity(ball.vy, previous.bottom.y, current.bottom.y, elapsed);
        ball.vx += ((bottomCrossing.ballX + ballSize / 2 - bottomCrossing.paddleX - PADDLE_WIDTH / 2) / (PADDLE_WIDTH / 2)) * 270 + paddleSlideVelocity(previous.bottom.x, current.bottom.x, elapsed);
        onPlaySound('paddle');
      }
      ball.vx = clamp(ball.vx, -MAX_BALL_SPEED, MAX_BALL_SPEED);
      ball.vy = clamp(ball.vy, -MAX_BALL_SPEED, MAX_BALL_SPEED);

      const scoringSide = ball.y + ballSize < 0 ? 'bottom' : ball.y > arena.height ? 'top' : null;
      if (scoringSide) {
        scores.current = { ...scores.current, [scoringSide]: scores.current[scoringSide] + 1 };
        setScore(scores.current);
        onPlaySound('point');
        if (scores.current[scoringSide] >= WIN_SCORE) {
          setWinner(scoringSide);
          onWin(scoringSide);
          return;
        }
        resetBall(scoringSide === 'bottom' ? 1 : -1, SERVE_DELAY_MS);
      } else {
        ballPosition.setValue({ x: ball.x, y: ball.y });
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      lastFrame.current = 0;
    };
  }, [arena.width, arena.height, ballSize, ballPosition, twoPlayer, opponentLevel, playerLevel, winner, onPlaySound, onWin, resetBall]);

  return { ballPosition, positions, score, winner, trail, restartMatch, movePaddle };
}

export const GAME_CONSTANTS = { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN, WIN_SCORE };
