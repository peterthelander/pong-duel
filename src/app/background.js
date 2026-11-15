import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BACKGROUNDS } from '../../gameOptions';
import { useGameSettings } from '../../gameSettings';
import { menuStyles as styles } from '../../menuStyles';

export default function BackgroundScreen() {
  const { background, updatePreference, storageError } = useGameSettings();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Background</Text>
      <Text style={styles.subtitle}>Choose your arena.</Text>
      <View style={styles.colors}>
        {BACKGROUNDS.map((item) => (
          <Pressable key={item.name} accessibilityRole="button" accessibilityLabel={`${item.name} background${background === item.name ? ', selected' : ''}`} onPress={() => updatePreference('background', item.name)} style={[styles.colorOption, background === item.name && styles.colorSelected]}>
            <View style={[styles.backgroundSample, { backgroundColor: item.color, borderColor: item.left }]} />
            <Text style={styles.colorName}>{item.name}</Text>
            <Text style={styles.selectedLabel}>{background === item.name ? 'Selected' : ' '}</Text>
          </Pressable>
        ))}
      </View>
      {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
      <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.replace('/')}><Text style={styles.backButtonText}>Home</Text></Pressable>
    </ScrollView>
  );
}
