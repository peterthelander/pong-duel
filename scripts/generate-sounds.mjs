import { writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';

const sampleRate = 22050;
const sounds = {
  retro: { wall: [440, 0.08], paddle: [660, 0.07], point: [520, 0.2] },
  soft: { wall: [330, 0.12], paddle: [490, 0.10], point: [390, 0.24] },
  arcade: { wall: [570, 0.08], paddle: [850, 0.09], point: [670, 0.28] },
  chime: { wall: [780, 0.14], paddle: [1040, 0.17], point: [880, 0.35] },
  bubble: { wall: [280, 0.11], paddle: [390, 0.13], point: [320, 0.25] },
  laser: { wall: [720, 0.12], paddle: [960, 0.14], point: [820, 0.28] },
  bell: { wall: [610, 0.2], paddle: [910, 0.22], point: [760, 0.38] },
  pop: { wall: [210, 0.06], paddle: [320, 0.07], point: [260, 0.18] },
  drum: { wall: [130, 0.13], paddle: [180, 0.12], point: [155, 0.26] },
  cosmic: { wall: [380, 0.18], paddle: [530, 0.2], point: [440, 0.4] },
  sparkle: { wall: [950, 0.11], paddle: [1250, 0.14], point: [1100, 0.3] },
};

function waveform(style, frequency, time, duration) {
  const progress = time / duration;
  const phase = 2 * Math.PI * frequency * time;
  switch (style) {
    case 'retro': return Math.sign(Math.sin(phase));
    case 'arcade': return Math.sign(Math.sin(phase * (1 + 0.15 * progress)));
    case 'chime': return (Math.sin(phase) + 0.45 * Math.sin(phase * 2.01)) / 1.45;
    case 'bubble': return Math.sin(phase * (1 + 1.2 * progress));
    case 'laser': return Math.sin(phase * (1 - 0.7 * progress));
    case 'bell': return (Math.sin(phase) + 0.5 * Math.sin(phase * 2.76)) / 1.5;
    case 'pop': return Math.sin(phase * (1 - 0.45 * progress));
    case 'drum': return Math.sin(phase * (1 - 0.65 * progress));
    case 'cosmic': return Math.sin(phase + 2.5 * Math.sin(2 * Math.PI * 12 * time));
    case 'sparkle': return (Math.sin(phase) + 0.4 * Math.sin(phase * 3.2)) / 1.4;
    default: return Math.sin(phase);
  }
}

for (const [style, effects] of Object.entries(sounds)) {
  for (const [effect, [frequency, duration]] of Object.entries(effects)) {
    const samples = Math.floor(sampleRate * duration);
    const wav = Buffer.alloc(44 + samples * 2);
    wav.write('RIFF', 0);
    wav.writeUInt32LE(wav.length - 8, 4);
    wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(sampleRate, 24);
    wav.writeUInt32LE(sampleRate * 2, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write('data', 36);
    wav.writeUInt32LE(samples * 2, 40);
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const envelope = Math.min(1, time / 0.01) * Math.pow(1 - i / samples, 2);
      const wave = waveform(style, frequency, time, duration);
      wav.writeInt16LE(Math.round(wave * envelope * (style === 'retro' || style === 'arcade' ? 5000 : 6500)), 44 + i * 2);
    }
    writeFileSync(new URL(`../assets/sounds/${style}-${effect}.wav`, import.meta.url), wav);
  }
}
