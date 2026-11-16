import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BallDesign from '../../BallDesign';
import { BALL_COLORS, BALL_PATTERNS, BALL_SIZES } from '../../gameOptions';
import { useGameSettings } from '../../gameSettings';
import { menuStyles as styles } from '../../menuStyles';

export default function BallScreen() {
  const { ballColor, ballSize, ballPattern, updatePreference, storageError } = useGameSettings();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Ball</Text>
      <Text style={styles.subtitle}>Choose your ball. Size changes gameplay.</Text>
      <View style={{ marginTop: 24 }}>
        <BallDesign size={ballSize * 2} color={ballColor} pattern={ballPattern} />
      </View>
      <Text style={styles.inputLabel}>Color</Text>
      <View style={styles.colors}>
        {BALL_COLORS.map(({ name, color }) => (
          <Pressable key={name} accessibilityRole="button" accessibilityLabel={`${name} ball color${ballColor === color ? ', selected' : ''}`} style={[styles.colorOption, ballColor === color && styles.colorSelected]} onPress={() => updatePreference('ballColor', color)}>
            <BallDesign size={28} color={color} pattern={ballPattern} />
            <Text style={styles.colorName}>{name}</Text>
            <Text style={styles.selectedLabel}>{ballColor === color ? 'Selected' : ' '}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.inputLabel}>Size</Text>
      <View style={styles.colors}>
        {BALL_SIZES.map(({ name, size }) => (
          <Pressable key={name} accessibilityRole="button" accessibilityLabel={`${name} ball size${ballSize === size ? ', selected' : ''}`} style={[styles.soundOption, ballSize === size && styles.colorSelected]} onPress={() => updatePreference('ballSize', size)}>
            <Text style={styles.colorName}>{name}</Text>
            <Text style={styles.selectedLabel}>{ballSize === size ? 'Selected' : ' '}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.inputLabel}>Pattern</Text>
      <View style={styles.colors}>
        {BALL_PATTERNS.map((pattern) => (
          <Pressable key={pattern} accessibilityRole="button" accessibilityLabel={`${pattern} ball pattern${ballPattern === pattern ? ', selected' : ''}`} style={[styles.soundOption, ballPattern === pattern && styles.colorSelected]} onPress={() => updatePreference('ballPattern', pattern)}>
            <BallDesign size={28} color={ballColor} pattern={pattern} />
            <Text style={styles.colorName}>{pattern}</Text>
            <Text style={styles.selectedLabel}>{ballPattern === pattern ? 'Selected' : ' '}</Text>
          </Pressable>
        ))}
      </View>
      {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
      <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.replace('/')}>
        <Text style={styles.backButtonText}>Home</Text>
      </Pressable>
    </ScrollView>
  );
}
