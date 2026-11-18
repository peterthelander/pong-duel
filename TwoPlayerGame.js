import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from './gameSettings';
import { BACKGROUNDS } from './gameOptions';
import { paddleCrossing, playerBounceVelocity, serveBallY } from './gamePhysics';
import BallDesign from './BallDesign';
import BackgroundDecorations from './BackgroundDecorations';

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

export default function TwoPlayerGame() {
  const ballPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const rallyPausedUntilRef = useRef(0);
  const servePendingRef = useRef(false);
  const { audioStatus, soundEnabled, soundStyle, paddleColor, ballColor, ballSize: BALL_SIZE, ballPattern, background, backgroundDecorations, playerName, playerLevel, setEnteredGame, playSound: playAudio } = useGameSettings();
  const theme = BACKGROUNDS.find((item) => item.name === background);
  const insets = useSafeAreaInsets();
  const playSound = useCallback((sound) => {
    if (soundEnabled) {
      playAudio(sound, soundStyle);
    }
  }, [soundEnabled, soundStyle, playAudio]);

  const topPaddleXRef = useRef(0);
  const bottomPaddleXRef = useRef(0);
  const topPaddleYRef = useRef(0);
  const bottomPaddleYRef = useRef(0);
  const activeTouchesRef = useRef({});
  const previousTopPaddleRef = useRef({ x: 0, y: 0 });
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

  const [arena, setArena] = useState({ width: 0, height: 0 });
  const [topPaddleX, setTopPaddleX] = useState(0);
  const [topPaddleY, setTopPaddleY] = useState(0);
  const [bottomPaddleX, setBottomPaddleX] = useState(0);
  const [bottomPaddleY, setBottomPaddleY] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [bottomScore, setBottomScore] = useState(0);
  const [matchWinner, setMatchWinner] = useState(null);

  const updateTopPaddle = (touchX, touchY) => {
    if (arena.width <= 0 || arena.height <= 0) {
      return;
    }
    const nextX = clamp(touchX - PADDLE_WIDTH / 2, 0, arena.width - PADDLE_WIDTH);
    const nextY = clamp(touchY - PADDLE_HEIGHT / 2, PADDLE_HEIGHT, arena.height / 2);
    topPaddleXRef.current = nextX;
    topPaddleYRef.current = nextY;
    setTopPaddleX(nextX);
    setTopPaddleY(nextY);
  };

  const updateBottomPaddle = (touchX, touchY) => {
    if (arena.width <= 0 || arena.height <= 0) {
      return;
    }
    const nextX = clamp(touchX - PADDLE_WIDTH / 2, 0, arena.width - PADDLE_WIDTH);
    const nextY = clamp(arena.height / 2 + touchY - PADDLE_HEIGHT / 2, arena.height / 2, arena.height - PADDLE_HEIGHT);
    bottomPaddleXRef.current = nextX;
    bottomPaddleYRef.current = nextY;
    setBottomPaddleX(nextX);
    setBottomPaddleY(nextY);
  };

  const handleMultiTouch = useCallback((event) => {
    if (!event.touches) return;
    activeTouchesRef.current = {};
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const clientRect = event.currentTarget.getBoundingClientRect();
      const touchX = touch.clientX - clientRect.left;
      const touchY = touch.clientY - clientRect.top;
      activeTouchesRef.current[touch.identifier] = { x: touchX, y: touchY };
      if (touchY < arena.height / 2) {
        updateTopPaddle(touchX, touchY);
      } else {
        updateBottomPaddle(touchX, touchY - arena.height / 2);
      }
    }
  }, [arena.height, arena.width]);

  const handleTouchEnd = useCallback((event) => {
    if (!event.touches) return;
    activeTouchesRef.current = {};
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const clientRect = event.currentTarget.getBoundingClientRect();
      const touchX = touch.clientX - clientRect.left;
      const touchY = touch.clientY - clientRect.top;
      activeTouchesRef.current[touch.identifier] = { x: touchX, y: touchY };
      if (touchY < arena.height / 2) {
        updateTopPaddle(touchX, touchY);
      } else {
        updateBottomPaddle(touchX, touchY - arena.height / 2);
      }
    }
  }, [arena.height, arena.width]);

  const resetBall = (directionY, delayMs = 0) => {
    const centerX = (arena.width - BALL_SIZE) / 2;
    const centerY = (arena.height - BALL_SIZE) / 2;
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

    const initialTop = (arena.width - PADDLE_WIDTH) / 2;
    const initialBottom = (arena.width - PADDLE_WIDTH) / 2;
    const topY = PADDLE_MARGIN;
    const bottomY = clamp(arena.height - PADDLE_MARGIN - PADDLE_HEIGHT, arena.height / 2, arena.height - PADDLE_HEIGHT);

    topPaddleXRef.current = initialTop;
    topPaddleYRef.current = topY;
    bottomPaddleXRef.current = initialBottom;
    bottomPaddleYRef.current = bottomY;
    previousTopPaddleRef.current = { x: initialTop, y: topY };
    previousBottomPaddleRef.current = { x: initialBottom, y: bottomY };
    setTopPaddleX(initialTop);
    setTopPaddleY(topY);
    setBottomPaddleX(initialBottom);
    setBottomPaddleY(bottomY);
    resetBall(randomServeDirection(), SERVE_DELAY_MS);
  }, [arena.height, arena.width, BALL_SIZE]);

  useEffect(() => {
    topScoreRef.current = topScore;
    bottomScoreRef.current = bottomScore;
  }, [bottomScore, topScore]);

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0) {
      return undefined;
    }

    const topPaddleY = PADDLE_MARGIN;

    const step = (now) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = now;
      }

      const elapsedSeconds = Math.max(0, (now - lastFrameTimeRef.current) / 1000);
      const dt = Math.min(elapsedSeconds, 0.033);
      lastFrameTimeRef.current = now;

      const topPaddle = { x: topPaddleXRef.current, y: topPaddleYRef.current };
      const bottomPaddle = { x: bottomPaddleXRef.current, y: bottomPaddleYRef.current };
      const previousTopPaddle = previousTopPaddleRef.current;
      const previousBottomPaddle = previousBottomPaddleRef.current;
      previousTopPaddleRef.current = topPaddle;
      previousBottomPaddleRef.current = bottomPaddle;

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

      if (now < rallyPausedUntilRef.current) {
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      if (servePendingRef.current) {
        servePendingRef.current = false;
        if (ball.vy > 0) {
          ball.y = serveBallY(
            ball.x, ball.y, BALL_SIZE, bottomPaddleXRef.current,
            bottomPaddleYRef.current, PADDLE_WIDTH, PADDLE_HEIGHT
          );
        } else {
          ball.y = serveBallY(
            ball.x, ball.y, BALL_SIZE, topPaddleXRef.current,
            topPaddleYRef.current, PADDLE_WIDTH, PADDLE_HEIGHT
          );
        }
      }

      // Bounce from side walls.
      if (ball.x <= 0) {
        ball.x = 0;
        ball.vx = Math.abs(ball.vx);
        playSound('wall');
      } else if (ball.x + BALL_SIZE >= arena.width) {
        ball.x = arena.width - BALL_SIZE;
        ball.vx = -Math.abs(ball.vx);
        playSound('wall');
      }

      const ballCenterX = ball.x + BALL_SIZE / 2;

      // Top paddle collision (player 2).
      const topCrossing = paddleCrossing(
        previousBallX, previousBallY, ball.x, ball.y, BALL_SIZE,
        previousTopPaddle, topPaddle, PADDLE_WIDTH
      );
      if (ball.vy < 0 && topCrossing !== null) {
        ball.y = topPaddleY + PADDLE_HEIGHT;
        ball.vy = playerBounceVelocity(ball.vy, previousTopPaddle.y, topPaddle.y, elapsedSeconds);
        const offset =
          (topCrossing.ballX + BALL_SIZE / 2 - (topCrossing.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ball.vx += offset * 270;
        playSound('paddle');
      }

      // Bottom paddle collision (player 1).
      const bottomCrossing = paddleCrossing(
        previousBallX, previousBallY, ball.x, ball.y, BALL_SIZE,
        previousBottomPaddle, bottomPaddle, PADDLE_WIDTH
      );
      if (ball.vy > 0 && bottomCrossing !== null) {
        ball.y = bottomPaddleYRef.current - BALL_SIZE;
        ball.vy = playerBounceVelocity(ball.vy, previousBottomPaddle.y, bottomPaddle.y, elapsedSeconds);
        const offset =
          (bottomCrossing.ballX + BALL_SIZE / 2 - (bottomCrossing.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ball.vx += offset * 270;
        playSound('paddle');
      }

      // Clamp speed so gameplay stays controllable.
      ball.vx = clamp(ball.vx, -MAX_BALL_SPEED, MAX_BALL_SPEED);
      ball.vy = clamp(ball.vy, -MAX_BALL_SPEED, MAX_BALL_SPEED);

      // Scoring: ball exits top or bottom.
      if (ball.y + BALL_SIZE < 0) {
        const nextBottomScore = bottomScoreRef.current + 1;
        bottomScoreRef.current = nextBottomScore;
        setBottomScore(nextBottomScore);
        playSound('point');
        if (nextBottomScore >= WIN_SCORE) {
          setMatchWinner('Player 1');
          resetBall(1);
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        resetBall(1, SERVE_DELAY_MS);
        lastFrameTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      if (ball.y > arena.height) {
        const nextTopScore = topScoreRef.current + 1;
        topScoreRef.current = nextTopScore;
        setTopScore(nextTopScore);
        playSound('point');
        if (nextTopScore >= WIN_SCORE) {
          setMatchWinner('Player 2');
          resetBall(-1);
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        resetBall(-1, SERVE_DELAY_MS);
        lastFrameTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      ballPosition.setValue({ x: ball.x, y: ball.y });
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameTimeRef.current = 0;
    };
  }, [arena.height, arena.width, BALL_SIZE, ballPosition, matchWinner, playSound]);

  const netSegments = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.color }]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setArena({ width, height });
      }}
    >
      <View style={[styles.bgOrbLeft, { backgroundColor: theme.left }]} />
      <View style={[styles.bgOrbRight, { backgroundColor: theme.right }]} />
      <BackgroundDecorations decorations={backgroundDecorations} />

      <Text style={styles.title}>Pong Duel</Text>

      <View style={styles.scoreboard} pointerEvents="none">
        <View style={styles.scoreEntry}>
          <Text numberOfLines={1} style={styles.scoreName}>Player 2</Text>
          <Text numberOfLines={1} style={styles.scoreLabel}>: {topScore}</Text>
        </View>
        <View style={styles.scoreEntry}>
          <Text numberOfLines={1} style={styles.scoreName}>Player 1</Text>
          <Text numberOfLines={1} style={styles.scoreLabel}>: {bottomScore}</Text>
        </View>
      </View>
      <Text style={styles.goalLabel}>First to {WIN_SCORE}</Text>
      {soundEnabled && audioStatus === 'failed' ? (
        <Text style={styles.audioWarning}>Sound unavailable</Text>
      ) : null}

      <View style={styles.netContainer} pointerEvents="none">
        {netSegments.map((segment) => (
          <View key={segment} style={styles.netDash} />
        ))}
      </View>

      {trailRef.current.map((ghost, index) => (
        <View
          key={index}
          style={[
            styles.ballTrail,
            {
              left: ghost.x,
              top: ghost.y,
              width: BALL_SIZE,
              height: BALL_SIZE,
              borderRadius: BALL_SIZE / 2,
              backgroundColor: ballColor,
              opacity: 0.14 - index * 0.03,
              transform: [{ scale: 1 - index * 0.08 }],
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.ball,
          {
            width: BALL_SIZE,
            height: BALL_SIZE,
            borderRadius: BALL_SIZE / 2,
            shadowColor: ballColor,
            transform: [{ translateX: ballPosition.x }, { translateY: ballPosition.y }],
          },
        ]}
      >
        <BallDesign size={BALL_SIZE} color={ballColor} pattern={ballPattern} />
      </Animated.View>

      <View style={[styles.paddle, styles.player2Paddle, { top: topPaddleY, left: topPaddleX }]} />
      <View style={[styles.paddle, styles.player1Paddle, { top: bottomPaddleY, left: bottomPaddleX, backgroundColor: paddleColor, shadowColor: paddleColor }]} />

      <View
        style={styles.touchZoneContainer}
        onTouchMove={handleMultiTouch}
        onTouchStart={handleMultiTouch}
        onTouchEnd={handleTouchEnd}
      />

      {matchWinner ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Play again" style={styles.overlay} onPress={restartMatch}>
          <Text style={styles.overlayTitle}>{matchWinner} Wins</Text>
          <Text style={styles.overlaySub}>Tap to play again</Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Home"
        style={[styles.homeButton, { top: Math.max(insets.top, 8) }]}
        onPress={() => {
          setEnteredGame(false);
          router.replace('/');
        }}
      >
        <Text style={styles.homeButtonText}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071524',
    overflow: 'hidden',
    ...Platform.select({ web: { width: '100%', maxWidth: 520, alignSelf: 'center' } }),
  },
  bgOrbLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -70,
    top: 110,
    backgroundColor: 'rgba(14, 116, 144, 0.18)',
  },
  bgOrbRight: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -90,
    bottom: 120,
    backgroundColor: 'rgba(251, 146, 60, 0.14)',
  },
  title: {
    position: 'absolute',
    top: 22,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#dbeafe',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scoreboard: {
    position: 'absolute',
    top: 54,
    left: 78,
    right: 28,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    flexDirection: 'row',
  },
  scoreEntry: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 0,
  },
  scoreName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
    marginLeft: 2,
  },
  goalLabel: {
    position: 'absolute',
    top: 94,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  audioWarning: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
  },
  netContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -6,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  netDash: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  paddle: {
    position: 'absolute',
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    borderRadius: 8,
  },
  player2Paddle: {
    backgroundColor: '#fca5a5',
    shadowColor: '#ef4444',
    shadowOpacity: 0.35,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  player1Paddle: {
    backgroundColor: '#67e8f9',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.35,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  homeButton: {
    position: 'absolute',
    left: 8,
    minWidth: 62,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#10283b',
    borderColor: '#334155',
    borderWidth: 1,
  },
  homeButtonText: { color: '#67e8f9', fontSize: 14, fontWeight: '800' },
  ballTrail: {
    position: 'absolute',
  },
  ball: {
    position: 'absolute',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  topTouchZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
  },
  bottomTouchZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
  },
  touchZoneContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.74)',
  },
  overlayTitle: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  overlaySub: {
    marginTop: 10,
    color: '#93c5fd',
    fontSize: 15,
    fontWeight: '700',
  },
});
