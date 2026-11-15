import { Asset } from 'expo-asset';

const SOUND_ASSETS = {
  'Classic-wall': require('./assets/sounds/bounce.wav'),
  'Classic-paddle': require('./assets/sounds/click.wav'),
  'Classic-point': require('./assets/sounds/goal.wav'),
  'Retro-wall': require('./assets/sounds/retro-wall.wav'),
  'Retro-paddle': require('./assets/sounds/retro-paddle.wav'),
  'Retro-point': require('./assets/sounds/retro-point.wav'),
  'Soft-wall': require('./assets/sounds/soft-wall.wav'),
  'Soft-paddle': require('./assets/sounds/soft-paddle.wav'),
  'Soft-point': require('./assets/sounds/soft-point.wav'),
};

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
        Object.entries(SOUND_ASSETS).map(async ([name, asset]) => {
          const response = await fetch(Asset.fromModule(asset).uri);
          if (!response.ok) {
            throw new Error(`Could not load ${name} sound: HTTP ${response.status}`);
          }
          buffers[name] = await context.decodeAudioData(await response.arrayBuffer());
        })
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
