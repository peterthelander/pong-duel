import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OpponentAvatar from '../../OpponentAvatar';
import { BACKGROUNDS, OPPONENTS } from '../../gameOptions';
import { useGameSettings } from '../../gameSettings';
import { menuStyles as styles } from '../../menuStyles';

export default function HomeScreen() {
  const { soundEnabled, soundStyle, audioStatus, startAudio, playSound, opponent, background, playerName, playerLevel, updatePreference, storageError, setEnteredGame } = useGameSettings();
  const insets = useSafeAreaInsets();
  const loading = soundEnabled && audioStatus === 'loading';
  const opponentIndex = OPPONENTS.findIndex((item) => item.name === opponent);
  const selected = OPPONENTS[opponentIndex];
  const theme = BACKGROUNDS.find((item) => item.name === background);

  return (
    <View style={[styles.screen, { backgroundColor: theme.color }]}>
      <View style={[styles.orbLeft, { backgroundColor: theme.left }]} />
      <View style={[styles.orbRight, { backgroundColor: theme.right }]} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.eyebrow}>READY FOR A RALLY?</Text>
        <Text style={styles.title}>Pong Duel</Text>
        <Text style={styles.subtitle}>{playerName || 'Player'} · Level {playerLevel}</Text>
        <View style={styles.opponentCard}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous opponent" style={styles.arrow} onPress={() => updatePreference('opponent', OPPONENTS[(opponentIndex + OPPONENTS.length - 1) % OPPONENTS.length].name)}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <View style={styles.opponentInfo}>
            <OpponentAvatar opponent={selected} />
            <Text style={styles.optionTitle}>{selected.name}</Text>
            <Text style={styles.optionSubtitle}>AI · Level {selected.level}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Next opponent" style={styles.arrow} onPress={() => updatePreference('opponent', OPPONENTS[(opponentIndex + 1) % OPPONENTS.length].name)}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
        {soundEnabled && audioStatus === 'failed' ? <Text style={styles.warning}>Sound unavailable</Text> : null}
        {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play Pong Duel"
          disabled={loading}
          style={[styles.playButton, loading && styles.disabled]}
          onPress={() => {
            if (soundEnabled) {
              startAudio();
              playSound('paddle', soundStyle);
            }
            setEnteredGame(true);
            router.replace('/game');
          }}
        >
          <Text style={styles.playButtonText}>{loading ? 'Loading sounds...' : 'Play'}</Text>
        </Pressable>
        <View style={styles.options}>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => router.push('/settings')}>
            <Text style={styles.optionTitle}>Settings</Text>
            <Text style={styles.optionSubtitle}>Sound</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => router.push('/characters')}>
            <Text style={styles.optionTitle}>Characters</Text>
            <Text style={styles.optionSubtitle}>Paddle color</Text>
          </Pressable>
        </View>
        <View style={styles.optionsSecondary}>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => router.push('/profile')}>
            <Text style={styles.optionTitle}>Profile</Text>
            <Text style={styles.optionSubtitle}>Name and appearance</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => router.push('/background')}>
            <Text style={styles.optionTitle}>Background</Text>
            <Text style={styles.optionSubtitle}>Arena design</Text>
          </Pressable>
        </View>
        <View style={styles.optionsSecondary}>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => router.push('/ball')}>
            <Text style={styles.optionTitle}>Ball</Text>
            <Text style={styles.optionSubtitle}>Color, size and pattern</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
