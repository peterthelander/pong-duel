import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect } from 'react';
import { SOUND_ASSETS } from './soundAssets';

export function useGameSounds(style) {
  const wall = useAudioPlayer(SOUND_ASSETS[style].wall);
  const paddle = useAudioPlayer(SOUND_ASSETS[style].paddle);
  const point = useAudioPlayer(SOUND_ASSETS[style].point);

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
