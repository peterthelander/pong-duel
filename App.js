import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const PADDLE_WIDTH = 96;
const PADDLE_HEIGHT = 14;
const PADDLE_MARGIN = 82;
const BALL_SIZE = 18;
const BASE_BALL_SPEED = 360;
const MAX_BALL_SPEED = 850;
const AI_MAX_SPEED = 420;
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
  const wallSoundPlayer = useAudioPlayer(require('./assets/sounds/bounce.wav'));
  const paddleSoundPlayer = useAudioPlayer(require('./assets/sounds/click.wav'));
  const pointSoundPlayer = useAudioPlayer(require('./assets/sounds/goal.wav'));

  const topPaddleXRef = useRef(0);
  const bottomPaddleXRef = useRef(0);
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
  const [topScore, setTopScore] = useState(0);
  const [bottomScore, setBottomScore] = useState(0);
  const [matchWinner, setMatchWinner] = useState(null);

  const replaySound = (player) => {
    try {
      void player.seekTo(0);
      player.play();
    } catch {
      // Ignore transient playback issues to keep gameplay smooth.
    }
  };

  const updateBottomPaddle = (touchX) => {
    if (arena.width <= 0) {
      return;
    }
    const next = clamp(touchX - PADDLE_WIDTH / 2, 0, arena.width - PADDLE_WIDTH);
    bottomPaddleXRef.current = next;
    setBottomPaddleX(next);
  };

  const resetBall = (directionY, delayMs = 0) => {
    const centerX = (arena.width - BALL_SIZE) / 2;
    const centerY = (arena.height - BALL_SIZE) / 2;
    const initialVX = (Math.random() * 2 - 1) * 170;
    const initialVY = BASE_BALL_SPEED * directionY;

    ballRef.current = { x: centerX, y: centerY, vx: initialVX, vy: initialVY };
    trailRef.current = trailRef.current.map(() => ({ x: centerX, y: centerY }));
    rallyPausedUntilRef.current = performance.now() + delayMs;
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
    topPaddleXRef.current = initialTop;
    bottomPaddleXRef.current = initialBottom;
    setTopPaddleX(initialTop);
    setBottomPaddleX(initialBottom);
    resetBall(randomServeDirection(), SERVE_DELAY_MS);
  }, [arena.height, arena.width]);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  useEffect(() => {
    topScoreRef.current = topScore;
    bottomScoreRef.current = bottomScore;
  }, [bottomScore, topScore]);

  useEffect(() => {
    if (arena.width <= 0 || arena.height <= 0) {
      return undefined;
    }

    const topPaddleY = PADDLE_MARGIN;
    const bottomPaddleY = arena.height - PADDLE_MARGIN - PADDLE_HEIGHT;

    const step = (now) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = now;
      }

      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.033);
      lastFrameTimeRef.current = now;

      if (matchWinner) {
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      // AI paddle tracks the ball with a capped movement speed.
      const ball = ballRef.current;
      const scoreDiff = bottomScoreRef.current - topScoreRef.current;
      const aiSkillBoost = clamp(scoreDiff * 22, -60, 140);
      const aiSpeed = clamp(AI_MAX_SPEED + aiSkillBoost, 320, 560);
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
        replaySound(wallSoundPlayer);
      } else if (ball.x + BALL_SIZE >= arena.width) {
        ball.x = arena.width - BALL_SIZE;
        ball.vx = -Math.abs(ball.vx);
        replaySound(wallSoundPlayer);
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
        replaySound(paddleSoundPlayer);
      }

      // Bottom paddle collision.
      const overlapsBottomPaddleX =
        ball.x + BALL_SIZE >= bottomPaddleXRef.current &&
        ball.x <= bottomPaddleXRef.current + PADDLE_WIDTH;
      const hitsBottomPaddleY =
        ball.y + BALL_SIZE >= bottomPaddleY && ball.y <= bottomPaddleY + PADDLE_HEIGHT;
      if (ball.vy > 0 && overlapsBottomPaddleX && hitsBottomPaddleY) {
        ball.y = bottomPaddleY - BALL_SIZE;
        ball.vy = -Math.abs(ball.vy) * 1.03;
        const offset =
          (ballCenterX - (bottomPaddleXRef.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ball.vx += offset * 270;
        replaySound(paddleSoundPlayer);
      }

      // Clamp speed so gameplay stays controllable.
      ball.vx = clamp(ball.vx, -MAX_BALL_SPEED, MAX_BALL_SPEED);
      ball.vy = clamp(ball.vy, -MAX_BALL_SPEED, MAX_BALL_SPEED);

      // Scoring: ball exits top or bottom.
      if (ball.y + BALL_SIZE < 0) {
        const nextBottomScore = bottomScoreRef.current + 1;
        bottomScoreRef.current = nextBottomScore;
        setBottomScore(nextBottomScore);
        replaySound(pointSoundPlayer);
        if (nextBottomScore >= WIN_SCORE) {
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
        replaySound(pointSoundPlayer);
        if (nextTopScore >= WIN_SCORE) {
          setMatchWinner('AI');
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
  }, [arena.height, arena.width, ballPosition, matchWinner]);

  const netSegments = Array.from({ length: 12 }, (_, i) => i);
  const ballSpeed = Math.hypot(ballRef.current.vx, ballRef.current.vy);
  const ballScale = clamp(ballSpeed / 560, 0.95, 1.2);

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setArena({ width, height });
      }}
    >
      <View style={styles.bgOrbLeft} />
      <View style={styles.bgOrbRight} />

      <Text style={styles.title}>Pong Duel</Text>

      <View style={styles.scoreboard}>
        <Text style={styles.scoreLabel}>AI: {topScore}</Text>
        <Text style={styles.scoreLabel}>You: {bottomScore}</Text>
      </View>
      <Text style={styles.goalLabel}>First to {WIN_SCORE}</Text>

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
            transform: [{ translateX: ballPosition.x }, { translateY: ballPosition.y }, { scale: ballScale }],
          },
        ]}
      />

      <View style={[styles.paddle, styles.aiPaddle, { top: PADDLE_MARGIN, left: topPaddleX }]} />
      <View style={[styles.paddle, styles.playerPaddle, { bottom: PADDLE_MARGIN, left: bottomPaddleX }]} />

      <View
        style={styles.bottomTouchZone}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => updateBottomPaddle(event.nativeEvent.locationX)}
        onResponderMove={(event) => updateBottomPaddle(event.nativeEvent.locationX)}
      />

      {matchWinner ? (
        <Pressable style={styles.overlay} onPress={restartMatch}>
          <Text style={styles.overlayTitle}>{matchWinner === 'You' ? 'You Win' : 'AI Wins'}</Text>
          <Text style={styles.overlaySub}>Tap to play again</Text>
        </Pressable>
      ) : null}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071524',
    overflow: 'hidden',
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
    left: 28,
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
  ballTrail: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#f59e0b',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#fbbf24',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  bottomTouchZone: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
