import { router } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from '../../gameSettings';
import { menuStyles as styles } from '../../menuStyles';
import { SOUND_STYLES } from '../../gameOptions';

export default function SettingsScreen() {
  const { soundEnabled, setSoundEnabled, soundStyle, updatePreference, audioStatus, startAudio, playSound, storageError } = useGameSettings();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Choose how you play.</Text>
        <View style={styles.setting}>
          <Text style={styles.optionTitle}>Sound effects</Text>
          <Switch
            accessibilityLabel="Sound effects"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#475569', true: '#0891b2' }}
          />
        </View>
        <Text style={styles.inputLabel}>Sound style</Text>
        <Text style={styles.hint}>{soundEnabled ? 'Tap a selected style again to hear it.' : 'Turn on sound effects to hear a style.'}</Text>
        <View style={styles.colors}>
          {SOUND_STYLES.map((style) => (
            <Pressable key={style} accessibilityRole="button" accessibilityLabel={`${style} sounds${soundStyle === style ? ', selected' : ''}`} onPress={() => {
              if (soundStyle !== style) {
                updatePreference('soundStyle', style);
              } else if (soundEnabled && audioStatus === 'ready') {
                startAudio();
                playSound('paddle', style);
              }
            }} style={[styles.soundOption, soundStyle === style && styles.colorSelected]}>
              <Text style={styles.colorName}>{style}</Text>
              <Text style={styles.selectedLabel}>{soundStyle === style ? 'Selected' : ' '}</Text>
            </Pressable>
          ))}
        </View>
        {soundEnabled && audioStatus === 'loading' ? <Text style={styles.hint}>Loading sounds...</Text> : null}
        {soundEnabled && audioStatus === 'failed' ? <Text style={styles.warning}>Sound unavailable</Text> : null}
        {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
        <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>Home</Text>
        </Pressable>
    </ScrollView>
  );
}
