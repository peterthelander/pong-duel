import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from './gameSettings';
import { BACKGROUNDS, calculateAiSpeed, OPPONENTS, pointsForOpponent } from './gameOptions';
import { paddleCrossing, serveBallY } from './gamePhysics';
import BallDesign from './BallDesign';

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

export default function App() {
  const ballPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const rallyPausedUntilRef = useRef(0);
  const servePendingRef = useRef(false);
  const { audioStatus, soundEnabled, soundStyle, paddleColor, ballColor, ballSize: BALL_SIZE, ballPattern, opponent, background, playerName, playerLevel, awardWin, setEnteredGame, playSound: playAudio } = useGameSettings();
  const opponentData = OPPONENTS.find((item) => item.name === opponent);
  const theme = BACKGROUNDS.find((item) => item.name === background);
  const insets = useSafeAreaInsets();
  const playSound = useCallback((sound) => {
    if (soundEnabled) {
      playAudio(sound, soundStyle);
    }
  }, [soundEnabled, soundStyle, playAudio]);

  const topPaddleXRef = useRef(0);
  const bottomPaddleXRef = useRef(0);
  const bottomPaddleYRef = useRef(0);
  const previousBottomPaddleRef = useRef({ x: 0, y: 0 });
  const winAwardedRef = useRef(false);
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
  const [bottomPaddleX, setBottomPaddleX] = useState(0);
  const [bottomPaddleY, setBottomPaddleY] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [bottomScore, setBottomScore] = useState(0);
  const [matchWinner, setMatchWinner] = useState(null);
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
    winAwardedRef.current = false;
    lastFrameTimeRef.current = 0;
    resetBall(randomServeDirection(), SERVE_DELAY_MS);
  };

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0) {
      return;
    }

    const initialTop = (arena.width - PADDLE_WIDTH) / 2;
    const initialBottom = (arena.width - PADDLE_WIDTH) / 2;
    topPaddleXRef.current = initialTop;
    bottomPaddleXRef.current = initialBottom;
    bottomPaddleYRef.current = clamp(arena.height - PADDLE_MARGIN - PADDLE_HEIGHT, arena.height / 2, arena.height - PADDLE_HEIGHT);
    previousBottomPaddleRef.current = { x: initialBottom, y: bottomPaddleYRef.current };
    setTopPaddleX(initialTop);
    setBottomPaddleX(initialBottom);
    setBottomPaddleY(bottomPaddleYRef.current);
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

      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.033);
      lastFrameTimeRef.current = now;
      const previousPaddle = previousBottomPaddleRef.current;
      const paddle = { x: bottomPaddleXRef.current, y: bottomPaddleYRef.current };
      previousBottomPaddleRef.current = paddle;

      if (matchWinner) {
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      // AI paddle tracks the ball with a capped movement speed.
      const ball = ballRef.current;
      const scoreDiff = bottomScoreRef.current - topScoreRef.current;
      const aiSpeed = calculateAiSpeed(opponentData.level, playerLevel, scoreDiff);
      const lookAhead = ball.vy < 0 ? 0.22 : 0.08;
      const aiJitter = Math.sin(now / 180) * (ball.vy < 0 ? 9 : 4);
      const aiTargetX = clamp(
        ball.x + BALL_SIZE / 2 + ball.vx * lookAhead + aiJitter - PADDLE_WIDTH / 2,
        0,
        arena.width - PADDLE_WIDTH
      );
      const aiDelta = aiTargetX - topPaddleXRef.current;
      const aiMaxStep = aiSpeed * dt;
      topPaddleXRef.current += clamp(aiDelta, -aiMaxStep, aiMaxStep);
      setTopPaddleX(topPaddleXRef.current);

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
        }
      }

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

      // Top paddle collision.
      const overlapsTopPaddleX =
        ball.x + BALL_SIZE >= topPaddleXRef.current && ball.x <= topPaddleXRef.current + PADDLE_WIDTH;
      const hitsTopPaddleY = ball.y <= topPaddleY + PADDLE_HEIGHT && ball.y + BALL_SIZE >= topPaddleY;
      if (ball.vy < 0 && overlapsTopPaddleX && hitsTopPaddleY) {
        ball.y = topPaddleY + PADDLE_HEIGHT;
        ball.vy = Math.abs(ball.vy) * 1.03;
        const offset = (ballCenterX - (topPaddleXRef.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ball.vx += offset * 270;
        playSound('paddle');
      }

      // Bottom paddle collision.
      const crossing = paddleCrossing(
        previousBallX, previousBallY, ball.x, ball.y, BALL_SIZE,
        previousPaddle, paddle, PADDLE_WIDTH
      );
      if (ball.vy > 0 && crossing !== null) {
        ball.y = paddle.y - BALL_SIZE;
        ball.vy = -Math.abs(ball.vy) * 1.03;
        const offset =
          (crossing.ballX + BALL_SIZE / 2 - (crossing.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
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
          if (!winAwardedRef.current) {
            winAwardedRef.current = true;
            awardWin(opponentData.level);
          }
          setMatchWinner('You');
          resetBall(1);
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        // Bottom player won, so serve toward bottom.
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
          setMatchWinner(opponentData.name);
          resetBall(-1);
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        // Top player (AI) won, so serve toward top.
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
  }, [arena.height, arena.width, awardWin, BALL_SIZE, ballPosition, matchWinner, opponentData.level, playerLevel, playSound]);

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

      <Text style={styles.title}>Pong Duel</Text>

      <View style={styles.scoreboard}>
        <Text numberOfLines={1} style={styles.scoreLabel}>{opponentData.name}: {topScore}</Text>
        <Text numberOfLines={1} style={styles.scoreLabel}>{playerName || 'You'}: {bottomScore}</Text>
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

      <View style={[styles.paddle, styles.aiPaddle, { top: PADDLE_MARGIN, left: topPaddleX }]} />
      <View style={[styles.paddle, styles.playerPaddle, { top: bottomPaddleY, left: bottomPaddleX, backgroundColor: paddleColor, shadowColor: paddleColor }]} />

      <View
        style={styles.bottomTouchZone}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => updateBottomPaddle(event.nativeEvent.locationX, event.nativeEvent.locationY)}
        onResponderMove={(event) => updateBottomPaddle(event.nativeEvent.locationX, event.nativeEvent.locationY)}
      />

      {matchWinner ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Play again" style={styles.overlay} onPress={restartMatch}>
          <Text style={styles.overlayTitle}>{matchWinner === 'You' ? 'You Win' : `${matchWinner} Wins`}</Text>
          {matchWinner === 'You' ? <Text style={styles.overlaySub}>+{pointsForOpponent(opponentData.level)} progress {pointsForOpponent(opponentData.level) === 1 ? 'point' : 'points'}</Text> : null}
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
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreLabel: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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
  aiPaddle: {
    backgroundColor: '#fca5a5',
    shadowColor: '#ef4444',
    shadowOpacity: 0.35,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  playerPaddle: {
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
  bottomTouchZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
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
