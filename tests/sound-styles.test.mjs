import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { SOUND_STYLES } from '../gameOptions.js';
import { defaults, validatePreferences } from '../gamePreferences.js';

test('every sound style has distinct playable assets and persists in preferences', () => {
  const source = readFileSync(new URL('../soundAssets.js', import.meta.url), 'utf8');
  const assets = runInNewContext(source.replace('export const SOUND_ASSETS =', 'SOUND_ASSETS ='), {
    require: (path) => path,
  });
  assert.equal(SOUND_STYLES.length, 12);
  assert.deepEqual(Object.keys(assets), SOUND_STYLES);
  assert.equal(defaults.soundStyle, 'Classic');
  for (const style of SOUND_STYLES) {
    assert.equal(validatePreferences(JSON.parse(JSON.stringify({ ...defaults, soundStyle: style }))).soundStyle, style);
    assert.deepEqual(Object.keys(assets[style]).sort(), ['paddle', 'point', 'wall']);
  }
  for (const effect of ['wall', 'paddle', 'point']) {
    const hashes = new Set();
    for (const style of SOUND_STYLES) {
      const wav = readFileSync(new URL(`../${assets[style][effect]}`, import.meta.url));
      assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
      assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
      assert.ok(wav.length > 44 && wav.subarray(44).some((byte) => byte !== 0), `${style} ${effect} is audible`);
      hashes.add(createHash('sha256').update(wav).digest('hex'));
    }
    assert.equal(hashes.size, SOUND_STYLES.length, `${effect} sounds should be distinct`);
  }
  assert.throws(() => validatePreferences({ ...defaults, soundStyle: 'invalid' }), /invalid/);
});
