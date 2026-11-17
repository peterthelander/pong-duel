import { Asset } from 'expo-asset';
import { SOUND_ASSETS } from './soundAssets';

export function createWebAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio is not supported by this browser.');
  }

  const context = new AudioContextClass();
  const buffers = {};

  return {
    async load() {
      await Promise.all(
        Object.entries(SOUND_ASSETS).flatMap(([style, effects]) => Object.entries(effects).map(async ([effect, asset]) => {
          const name = `${style}-${effect}`;
          const response = await fetch(Asset.fromModule(asset).uri);
          if (!response.ok) {
            throw new Error(`Could not load ${name} sound: HTTP ${response.status}`);
          }
          buffers[name] = await context.decodeAudioData(await response.arrayBuffer());
        }))
      );
    },
    unlock() {
      return context.resume();
    },
    play(name, style) {
      const source = context.createBufferSource();
      source.buffer = buffers[`${style}-${name}`];
      source.connect(context.destination);
      source.start();
    },
    close() {
      return context.close();
    },
  };
}
