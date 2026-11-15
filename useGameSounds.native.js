import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect } from 'react';

export function useGameSounds() {
  const wall = useAudioPlayer(require('./assets/sounds/bounce.wav'));
  const paddle = useAudioPlayer(require('./assets/sounds/click.wav'));
  const point = useAudioPlayer(require('./assets/sounds/goal.wav'));
  const retroWall = useAudioPlayer(require('./assets/sounds/retro-wall.wav'));
  const retroPaddle = useAudioPlayer(require('./assets/sounds/retro-paddle.wav'));
  const retroPoint = useAudioPlayer(require('./assets/sounds/retro-point.wav'));
  const softWall = useAudioPlayer(require('./assets/sounds/soft-wall.wav'));
  const softPaddle = useAudioPlayer(require('./assets/sounds/soft-paddle.wav'));
  const softPoint = useAudioPlayer(require('./assets/sounds/soft-point.wav'));

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch((error) => console.error('Could not configure game audio:', error));
  }, []);

  const playSound = useCallback((sound, style) => {
    const player = {
      Classic: { wall, paddle, point },
      Retro: { wall: retroWall, paddle: retroPaddle, point: retroPoint },
      Soft: { wall: softWall, paddle: softPaddle, point: softPoint },
    }[style][sound];
    try {
      void player.seekTo(0).catch((error) => console.error('Could not rewind game sound:', error));
      player.play();
    } catch (error) {
      console.error('Could not play game sound:', error);
    }
  }, [wall, paddle, point, retroWall, retroPaddle, retroPoint, softWall, softPaddle, softPoint]);

  return { audioStatus: 'ready', startAudio: () => {}, playSound };
}
