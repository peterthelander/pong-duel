import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect } from 'react';

export function useGameSounds() {
  const wall = useAudioPlayer(require('./assets/sounds/bounce.wav'));
  const paddle = useAudioPlayer(require('./assets/sounds/click.wav'));
  const point = useAudioPlayer(require('./assets/sounds/goal.wav'));

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch((error) => console.error('Could not configure game audio:', error));
  }, []);

  const playSound = useCallback((sound) => {
    const player = { wall, paddle, point }[sound];
    try {
      void player.seekTo(0).catch((error) => console.error('Could not rewind game sound:', error));
      player.play();
    } catch (error) {
      console.error('Could not play game sound:', error);
    }
  }, [wall, paddle, point]);

  return { audioStatus: 'ready', startAudio: () => {}, playSound };
}
