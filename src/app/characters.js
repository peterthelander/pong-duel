import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from '../../gameSettings';
import { PADDLE_COLORS } from '../../gameOptions';
import { menuStyles as styles } from '../../menuStyles';

export default function CharactersScreen() {
  const { paddleColor, setPaddleColor, storageError } = useGameSettings();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>Characters</Text>
        <Text style={styles.subtitle}>Choose your paddle color.</Text>
        <View style={styles.colors}>
          {PADDLE_COLORS.map(({ name, color }) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityLabel={`${name} paddle${paddleColor === color ? ', selected' : ''}`}
              style={[styles.colorOption, paddleColor === color && styles.colorSelected]}
              onPress={() => setPaddleColor(color)}
            >
              <View style={[styles.colorSample, { backgroundColor: color }]} />
              <Text style={styles.colorName}>{name}</Text>
              <Text style={styles.selectedLabel}>{paddleColor === color ? 'Selected' : ' '}</Text>
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
