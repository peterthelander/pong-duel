import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameSettings } from '../../gameSettings';
import { menuStyles as styles } from '../../menuStyles';

export default function ProfileScreen() {
  const { playerName, playerLevel, progressPoints, updatePreference, storageError } = useGameSettings();
  const [name, setName] = useState(playerName);
  const insets = useSafeAreaInsets();

  const save = () => {
    updatePreference('playerName', name.trim());
    router.replace('/');
  };

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Saved only on this device.</Text>
      <View style={styles.form}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput accessibilityLabel="Name" value={name} onChangeText={setName} maxLength={30} placeholder="Player" placeholderTextColor="#94a3b8" style={styles.input} />
        <Text style={styles.inputLabel}>Level {playerLevel}</Text>
        <Text style={styles.hint}>Progress: {progressPoints} of 5 points. Every 5 points earns 2 levels.</Text>
        <Text style={styles.hint}>Win matches to earn points. Higher-level opponents award more points.</Text>
        <Text style={styles.hint}>A higher level makes your opponent faster.</Text>
        {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" style={styles.playButton} onPress={save}><Text style={styles.playButtonText}>Save</Text></Pressable>
      <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.replace('/')}><Text style={styles.backButtonText}>Cancel</Text></Pressable>
    </ScrollView>
  );
}
