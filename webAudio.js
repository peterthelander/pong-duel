import { Asset } from 'expo-asset';

const SOUND_ASSETS = {
  wall: require('./assets/sounds/bounce.wav'),
  paddle: require('./assets/sounds/click.wav'),
  point: require('./assets/sounds/goal.wav'),
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
    play(name) {
      const source = context.createBufferSource();
      source.buffer = buffers[name];
      source.connect(context.destination);
      source.start();
    },
    close() {
      return context.close();
    },
  };
}
