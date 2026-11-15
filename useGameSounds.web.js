import { useCallback, useEffect, useRef, useState } from 'react';
import { createWebAudio } from './webAudio';

export function useGameSounds() {
  const audioRef = useRef(null);
  const [audioStatus, setAudioStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    let audio;
    const initialize = async () => {
      audio = createWebAudio();
      await audio.load();
      if (active) {
        audioRef.current = audio;
        setAudioStatus('ready');
      }
    };
    void initialize().catch((error) => {
      if (active) {
        console.error('Could not initialize game sounds:', error);
        setAudioStatus('failed');
      }
    });

    return () => {
      active = false;
      audioRef.current = null;
      if (audio) {
        void audio.close().catch((error) => console.error('Could not close game audio:', error));
      }
    };
  }, []);

  const startAudio = useCallback(() => {
    if (audioRef.current) {
      void audioRef.current.unlock().catch((error) => {
        console.error('Could not enable game sounds:', error);
        setAudioStatus('failed');
      });
    }
  }, []);

  const playSound = useCallback((sound, style) => {
    if (audioRef.current) {
      try {
        audioRef.current.play(sound, style);
      } catch (error) {
        console.error('Could not play game sound:', error);
        setAudioStatus('failed');
      }
    }
  }, []);

  return { audioStatus, startAudio, playSound };
}
