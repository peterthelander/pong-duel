import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { GameSettingsProvider, useGameSettings } from '../../gameSettings';

function Navigation() {
  const { storageReady } = useGameSettings();
  if (!storageReady) {
    return <View style={{ flex: 1, backgroundColor: '#071524', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#f8fafc' }}>Loading...</Text></View>;
  }
  return <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#071524' } }} />;
}

export default function RootLayout() {
  return (
    <GameSettingsProvider>
      <StatusBar style="light" />
      <Navigation />
    </GameSettingsProvider>
  );
}
