import { writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';

const sampleRate = 22050;
const sounds = {
  retro: { wall: [440, 0.08], paddle: [660, 0.07], point: [520, 0.2] },
  soft: { wall: [330, 0.12], paddle: [490, 0.10], point: [390, 0.24] },
};

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
      const phase = 2 * Math.PI * frequency * time;
      const wave = style === 'retro' ? Math.sign(Math.sin(phase)) : Math.sin(phase);
      wav.writeInt16LE(Math.round(wave * envelope * (style === 'retro' ? 5000 : 6500)), 44 + i * 2);
    }
    writeFileSync(new URL(`../assets/sounds/${style}-${effect}.wav`, import.meta.url), wav);
  }
}
