import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from './gameSettings';
import { BACKGROUNDS, OPPONENTS, pointsForOpponent } from './gameOptions';
import { useGameCore, GAME_CONSTANTS } from './GameCore';
import { AIController } from './AIController';
import BallDesign from './BallDesign';
import OpponentAvatar from './OpponentAvatar';
import BackgroundDecorations from './BackgroundDecorations';

const { PADDLE_HEIGHT, PADDLE_MARGIN, WIN_SCORE } = GAME_CONSTANTS;
const PADDLE_WIDTH = 96;

export default function App() {
  const { audioStatus, soundEnabled, soundStyle, paddleColor, ballColor, ballSize: BALL_SIZE, ballPattern, opponent, background, backgroundDecorations, playerName, playerAvatar, playerLevel, awardWin, setEnteredGame, playSound: playAudio } = useGameSettings();
  const opponentData = OPPONENTS.find((item) => item.name === opponent);
  const theme = BACKGROUNDS.find((item) => item.name === background);
  const insets = useSafeAreaInsets();

  const [arena, setArena] = useState({ width: 0, height: 0 });
  const winAwardedRef = useRef(false);
  const bottomPaddleYRef = useRef(0);
  const controllerRef = useRef(null);

  const playSound = useCallback((sound) => {
    if (soundEnabled) {
      playAudio(sound, soundStyle);
    }
  }, [soundEnabled, soundStyle, playAudio]);

  if (!controllerRef.current && arena.width > 0) {
    controllerRef.current = new AIController(opponentData, playerLevel, BALL_SIZE, arena);
  }

  const updateBottomPaddle = (touchX, touchY) => {
    if (arena.width <= 0 || arena.height <= 0) {
      return;
    }
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const nextX = clamp(touchX - PADDLE_WIDTH / 2, 0, arena.width - PADDLE_WIDTH);
    const nextY = clamp(arena.height / 2 + touchY - PADDLE_HEIGHT / 2, arena.height / 2, arena.height - PADDLE_HEIGHT);
    bottomPaddleYRef.current = nextY;
  };

  const handleScoreChange = useCallback(() => {
    // Handle any UI updates needed when score changes
  }, []);

  const handleWin = useCallback(() => {
    if (!winAwardedRef.current) {
      winAwardedRef.current = true;
      awardWin(opponentData.name);
    }
  }, [opponentData, awardWin]);

  const { ballPosition, topPaddleX, bottomPaddleX, topScore, bottomScore, matchWinner, trail, restartMatch } = useGameCore(
    arena,
    controllerRef.current,
    {
      onPlaySound: playSound,
      onScoreChange: handleScoreChange,
      onWin: handleWin,
    }
  );

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
          <OpponentAvatar opponent={opponentData} size={32} />
          <Text numberOfLines={1} style={styles.scoreName}>{opponentData.name}</Text>
          <Text numberOfLines={1} style={styles.scoreLabel}>: {topScore}</Text>
        </View>
        <View style={styles.scoreEntry}>
          <OpponentAvatar opponent={playerAvatar} size={32} />
          <Text numberOfLines={1} style={styles.scoreName}>{playerName || 'You'}</Text>
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

      {trail.map((ghost, index) => (
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
      <View style={[styles.paddle, styles.playerPaddle, { top: bottomPaddleYRef.current, left: bottomPaddleX, backgroundColor: paddleColor, shadowColor: paddleColor }]} />

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
