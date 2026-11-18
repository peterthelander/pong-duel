import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from './gameSettings';
import { BACKGROUNDS, OPPONENTS, pointsForOpponent } from './gameOptions';
import { useGameCore, GAME_CONSTANTS } from './GameCore';
import { createTouchController } from './TwoPlayerController';
import BallDesign from './BallDesign';
import OpponentAvatar from './OpponentAvatar';
import BackgroundDecorations from './BackgroundDecorations';

const { PADDLE_WIDTH, PADDLE_HEIGHT, WIN_SCORE } = GAME_CONSTANTS;

export default function App({ twoPlayer = false }) {
  const { audioStatus, soundEnabled, soundStyle, paddleColor, ballColor, ballSize: BALL_SIZE, ballPattern, opponent, background, backgroundDecorations, playerName, playerAvatar, playerLevel, awardWin, setEnteredGame, playSound: playAudio } = useGameSettings();
  const opponentData = OPPONENTS.find((item) => item.name === opponent);
  const theme = BACKGROUNDS.find((item) => item.name === background);
  const insets = useSafeAreaInsets();

  const [arena, setArena] = useState({ width: 0, height: 0 });
  const [touchController] = useState(() => createTouchController(twoPlayer));

  const playSound = useCallback((sound) => {
    if (soundEnabled) {
      playAudio(sound, soundStyle);
    }
  }, [soundEnabled, soundStyle, playAudio]);

  const handleWin = useCallback((side) => {
    if (!twoPlayer && side === 'bottom') {
      awardWin(opponentData.name);
    }
  }, [twoPlayer, opponentData.name, awardWin]);

  const { ballPosition, positions, score, winner, trail, restartMatch, movePaddle } = useGameCore(
    arena,
    {
      ballSize: BALL_SIZE,
      twoPlayer,
      opponentLevel: opponentData.level,
      playerLevel,
      onPlaySound: playSound,
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
          {!twoPlayer ? <OpponentAvatar opponent={opponentData} size={32} /> : null}
          <Text numberOfLines={1} style={styles.scoreName}>{twoPlayer ? 'Player 2' : opponentData.name}</Text>
          <Text numberOfLines={1} style={styles.scoreLabel}>: {score.top}</Text>
        </View>
        <View style={styles.scoreEntry}>
          {!twoPlayer ? <OpponentAvatar opponent={playerAvatar} size={32} /> : null}
          <Text numberOfLines={1} style={styles.scoreName}>{twoPlayer ? 'Player 1' : playerName || 'You'}</Text>
          <Text numberOfLines={1} style={styles.scoreLabel}>: {score.bottom}</Text>
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

      <View style={[styles.paddle, styles.aiPaddle, { top: positions.top.y, left: positions.top.x }]} />
      <View style={[styles.paddle, styles.playerPaddle, { top: positions.bottom.y, left: positions.bottom.x, backgroundColor: paddleColor, shadowColor: paddleColor }]} />

      <View
        accessibilityLabel="Game arena"
        style={styles.touchZone}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderStart={(event) => touchController.start(event.nativeEvent.changedTouches, arena, movePaddle)}
        onResponderMove={(event) => touchController.move(event.nativeEvent.changedTouches, movePaddle)}
        onResponderEnd={(event) => touchController.end(event.nativeEvent.changedTouches)}
        onResponderTerminate={() => touchController.clear()}
      />

      {winner ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Play again" style={styles.overlay} onPress={() => { touchController.clear(); restartMatch(); }}>
          <Text style={styles.overlayTitle}>{twoPlayer ? `${winner === 'bottom' ? 'Player 1' : 'Player 2'} Wins` : winner === 'bottom' ? 'You Win' : `${opponentData.name} Wins`}</Text>
          {!twoPlayer && winner === 'bottom' ? <Text style={styles.overlaySub}>+{pointsForOpponent(opponentData.level)} progress {pointsForOpponent(opponentData.level) === 1 ? 'point' : 'points'}</Text> : null}
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
  touchZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
