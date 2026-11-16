import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OpponentAvatar from '../../OpponentAvatar';
import { useGameSettings } from '../../gameSettings';
import { AVATAR_EYE_COLORS, AVATAR_HAIR_COLORS, AVATAR_HAIRSTYLES, AVATAR_MOUTHS, AVATAR_SHOULDERS, AVATAR_SKIN_COLORS, PADDLE_COLORS, POINTS_PER_LEVEL } from '../../gameOptions';
import { menuStyles as styles } from '../../menuStyles';

function AppearanceOptions({ label, options, value, onChange }) {
  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.appearanceOptions}>
        {options.map((option) => (
          <Pressable
            key={option.name}
            accessibilityRole="button"
            accessibilityLabel={`${option.name} ${label.toLowerCase()}${value === option.value ? ', selected' : ''}`}
            accessibilityState={{ selected: value === option.value }}
            style={[styles.appearanceOption, value === option.value && styles.colorSelected]}
            onPress={() => onChange(option.value)}
          >
            {option.color ? <View style={[styles.appearanceSwatch, { backgroundColor: option.color }]} /> : null}
            <Text style={styles.appearanceOptionText}>{option.name}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

export default function ProfileScreen() {
  const { playerName, playerAvatar, playerLevel, progressPoints, updatePreference, storageError } = useGameSettings();
  const [name, setName] = useState(playerName);
  const [avatar, setAvatar] = useState(playerAvatar);
  const insets = useSafeAreaInsets();

  const save = () => {
    updatePreference('playerName', name.trim());
    updatePreference('playerAvatar', avatar);
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
        <Text style={styles.hint}>Progress: {progressPoints} of {POINTS_PER_LEVEL} points. Every {POINTS_PER_LEVEL} points earns 1 level.</Text>
        <Text style={styles.hint}>Win matches to earn 1 point per 100 opponent levels.</Text>
        <Text style={styles.hint}>A higher level makes your opponent faster.</Text>
        <Text style={styles.inputLabel}>Your appearance</Text>
        <View style={styles.avatarPreview}><OpponentAvatar opponent={avatar} /></View>
        <AppearanceOptions label="Hair length" options={[{ name: 'Short', value: false }, { name: 'Long', value: true }]} value={avatar.longHair} onChange={(longHair) => setAvatar((current) => ({ ...current, longHair }))} />
        <AppearanceOptions label="Hairstyle" options={AVATAR_HAIRSTYLES} value={avatar.hairstyle} onChange={(hairstyle) => setAvatar((current) => ({ ...current, hairstyle }))} />
        <Text style={styles.hint}>Hair length applies when hairstyle is None. Hair down is always long.</Text>
        <AppearanceOptions label="Hair color" options={AVATAR_HAIR_COLORS.map(({ name, color }) => ({ name, color, value: color }))} value={avatar.hair} onChange={(hair) => setAvatar((current) => ({ ...current, hair }))} />
        <AppearanceOptions label="Skin color" options={AVATAR_SKIN_COLORS.map(({ name, color }) => ({ name, color, value: color }))} value={avatar.skin} onChange={(skin) => setAvatar((current) => ({ ...current, skin }))} />
        <AppearanceOptions label="Shirt color" options={PADDLE_COLORS.map(({ name, color }) => ({ name, color, value: color }))} value={avatar.shirt} onChange={(shirt) => setAvatar((current) => ({ ...current, shirt }))} />
        <AppearanceOptions label="Eye color" options={AVATAR_EYE_COLORS.map(({ name, color }) => ({ name, color, value: color }))} value={avatar.eyes} onChange={(eyes) => setAvatar((current) => ({ ...current, eyes }))} />
        <AppearanceOptions label="Eyelashes" options={[{ name: 'No', value: false }, { name: 'Yes', value: true }]} value={avatar.lashes} onChange={(lashes) => setAvatar((current) => ({ ...current, lashes }))} />
        <AppearanceOptions label="Mouth" options={AVATAR_MOUTHS} value={avatar.mouth} onChange={(mouth) => setAvatar((current) => ({ ...current, mouth }))} />
        <AppearanceOptions label="Shoulders" options={AVATAR_SHOULDERS} value={avatar.shoulders} onChange={(shoulders) => setAvatar((current) => ({ ...current, shoulders }))} />
        <AppearanceOptions label="Glasses" options={[{ name: 'No', value: false }, { name: 'Yes', value: true }]} value={avatar.glasses} onChange={(glasses) => setAvatar((current) => ({ ...current, glasses }))} />
        <AppearanceOptions label="Necklace" options={[{ name: 'No', value: false }, { name: 'Yes', value: true }]} value={avatar.necklace} onChange={(necklace) => setAvatar((current) => ({ ...current, necklace }))} />
        {storageError ? <Text style={styles.warning}>{storageError}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" style={styles.playButton} onPress={save}><Text style={styles.playButtonText}>Save</Text></Pressable>
      <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.replace('/')}><Text style={styles.backButtonText}>Cancel</Text></Pressable>
    </ScrollView>
  );
}
