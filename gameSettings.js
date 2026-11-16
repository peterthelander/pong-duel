import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { defaults, recordOpponentWin, validatePreferences } from './gamePreferences';
import { useGameSounds } from './useGameSounds';

const STORAGE_KEY = 'pong-duel-preferences-v1';
const GameSettingsContext = createContext(null);

export function GameSettingsProvider({ children }) {
  const [preferences, setPreferences] = useState(defaults);
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [enteredGame, setEnteredGame] = useState(false);
  const writeQueue = useRef(Promise.resolve());
  const audio = useGameSounds();

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      const restored = saved === null ? defaults : validatePreferences(JSON.parse(saved));
      if (active) {
        setPreferences(restored);
        setStorageAvailable(true);
      }
    }).catch((error) => {
      console.error('Could not load preferences:', error);
      if (active) setStorageError('Could not load saved preferences. Changes will not be saved.');
    }).finally(() => {
      if (active) setStorageReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!storageReady || !storageAvailable) return;
    const data = JSON.stringify(preferences);
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(STORAGE_KEY, data))
      .then(() => setStorageError(''))
      .catch((error) => {
        console.error('Could not save preferences:', error);
        setStorageError('Could not save preferences on this device.');
      });
  }, [preferences, storageAvailable, storageReady]);

  const updatePreference = (key, value) => setPreferences((current) => ({ ...current, [key]: value }));
  const awardWin = useCallback((opponentName) => {
    setPreferences((current) => recordOpponentWin(current, opponentName));
  }, []);

  return (
    <GameSettingsContext.Provider value={{
      ...preferences, updatePreference, awardWin, storageReady, storageError, enteredGame, setEnteredGame, ...audio,
      setSoundEnabled: (value) => updatePreference('soundEnabled', value),
      setPaddleColor: (value) => updatePreference('paddleColor', value),
    }}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  const settings = useContext(GameSettingsContext);
  if (!settings) throw new Error('useGameSettings must be used within GameSettingsProvider');
  return settings;
}
