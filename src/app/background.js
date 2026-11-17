import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundDecorations from '../../BackgroundDecorations';
import { BACKGROUNDS, BACKGROUND_POSITIONS, BACKGROUND_SHAPES, PADDLE_COLORS } from '../../gameOptions';
import { useGameSettings } from '../../gameSettings';
import { menuStyles as styles } from '../../menuStyles';

export default function BackgroundScreen() {
  const { background, backgroundDecorations, updatePreference, storageError } = useGameSettings();
  const [selectedDecoration, setSelectedDecoration] = useState(0);
  const insets = useSafeAreaInsets();
  const theme = BACKGROUNDS.find((item) => item.name === background);
  const decoration = backgroundDecorations[selectedDecoration];
  const updateDecoration = (key, value) => {
    updatePreference('backgroundDecorations', backgroundDecorations.map((item, index) =>
      index === selectedDecoration ? { ...item, [key]: value } : item
    ));
  };
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
      <Text style={styles.inputLabel}>Preview</Text>
      <View style={[styles.backgroundPreview, { backgroundColor: theme.color }]}>
        <View style={[styles.orbLeft, { backgroundColor: theme.left }]} />
        <View style={[styles.orbRight, { backgroundColor: theme.right }]} />
        <BackgroundDecorations decorations={backgroundDecorations} />
      </View>
      <Text style={styles.hint}>Choose a shape, color, and position for each decoration.</Text>
      <Text style={styles.inputLabel}>Decoration</Text>
      <View style={styles.appearanceOptions}>
        {backgroundDecorations.map((_, index) => (
          <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Decoration ${index + 1}${selectedDecoration === index ? ', selected' : ''}`} accessibilityState={{ selected: selectedDecoration === index }} style={[styles.appearanceOption, selectedDecoration === index && styles.colorSelected]} onPress={() => setSelectedDecoration(index)}>
            <Text style={styles.appearanceOptionText}>Decoration {index + 1}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.inputLabel}>Shape</Text>
      <View style={styles.appearanceOptions}>
        {BACKGROUND_SHAPES.map(({ name, value }) => (
          <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${name} shape${decoration.shape === value ? ', selected' : ''}`} accessibilityState={{ selected: decoration.shape === value }} style={[styles.appearanceOption, decoration.shape === value && styles.colorSelected]} onPress={() => updateDecoration('shape', value)}>
            <Text style={styles.appearanceOptionText}>{name}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.inputLabel}>Shape color</Text>
      <View style={styles.appearanceOptions}>
        {PADDLE_COLORS.map(({ name, color }) => (
          <Pressable key={color} accessibilityRole="button" accessibilityLabel={`${name} shape color${decoration.color === color ? ', selected' : ''}`} accessibilityState={{ selected: decoration.color === color }} style={[styles.appearanceOption, decoration.color === color && styles.colorSelected]} onPress={() => updateDecoration('color', color)}>
            <View style={[styles.appearanceSwatch, { backgroundColor: color }]} />
            <Text style={styles.appearanceOptionText}>{name}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.inputLabel}>Position</Text>
      <View style={styles.backgroundPositionGrid}>
        {BACKGROUND_POSITIONS.map(({ name }) => (
          <Pressable key={name} accessibilityRole="button" accessibilityLabel={`${name} position${decoration.position === name ? ', selected' : ''}`} accessibilityState={{ selected: decoration.position === name }} style={[styles.appearanceOption, styles.backgroundPositionOption, decoration.position === name && styles.colorSelected]} onPress={() => updateDecoration('position', name)}>
            <Text style={styles.appearanceOptionText}>{name}</Text>
          </Pressable>
        ))}
      </View>
      {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
      <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.replace('/')}><Text style={styles.backButtonText}>Home</Text></Pressable>
    </ScrollView>
  );
}
