import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AVATAR_EYE_COLORS, AVATAR_HAIR_COLORS, AVATAR_HAIRSTYLES, AVATAR_MOUTHS, AVATAR_SHOULDERS, AVATAR_SKIN_COLORS, BACKGROUNDS, BACKGROUND_POSITIONS, BACKGROUND_SHAPES, BALL_COLORS, BALL_PATTERNS, BALL_SIZES, calculateAiSpeed, calculateWinProgress, eyelashColorForEyes, OPPONENTS, PADDLE_COLORS } from '../gameOptions.js';
import { defaults, recordOpponentWin, validatePreferences } from '../gamePreferences.js';
import { paddleCrossing, playerBounceVelocity, serveBallY } from '../gamePhysics.js';

test('wins award one point per 100 opponent levels and advance every three points', () => {
  assert.deepEqual(calculateWinProgress(1, 0, 100), { earnedPoints: 1, playerLevel: 1, progressPoints: 1 });
  assert.deepEqual(calculateWinProgress(1, 1, 200), { earnedPoints: 2, playerLevel: 2, progressPoints: 0 });
  assert.deepEqual(calculateWinProgress(1, 2, 100), { earnedPoints: 1, playerLevel: 2, progressPoints: 0 });
  assert.deepEqual(calculateWinProgress(850, 2, 600), { earnedPoints: 6, playerLevel: 852, progressPoints: 2 });
  assert.deepEqual(calculateWinProgress(999, 2, 600), { earnedPoints: 6, playerLevel: 1000, progressPoints: 2 });
});

test('match wins are counted per opponent and preserve progress across saves', () => {
  const { opponentWins, ...oldPreferences } = defaults;
  let preferences = validatePreferences({ ...oldPreferences, playerName: 'Player' });
  assert.deepEqual(preferences.opponentWins, {});
  const previous = preferences;
  preferences = recordOpponentWin(preferences, 'Ruby');
  assert.deepEqual(previous.opponentWins, {});
  assert.deepEqual(preferences.opponentWins, { Ruby: 1 });
  assert.equal(preferences.playerLevel, 3);
  assert.equal(preferences.progressPoints, 1);
  preferences = recordOpponentWin(preferences, 'Nova');
  preferences = recordOpponentWin(preferences, 'Ruby');
  preferences = recordOpponentWin(preferences, 'Ruby');
  assert.deepEqual(preferences.opponentWins, { Ruby: 3, Nova: 1 });
  assert.equal(preferences.playerName, 'Player');
  assert.deepEqual(validatePreferences(JSON.parse(JSON.stringify(preferences))), preferences);
  assert.throws(() => recordOpponentWin(preferences, 'Unknown'), /Unknown opponent/);
  for (const invalid of [null, [], { Ruby: -1 }, { Ruby: 1.5 }, { Ruby: '3' }, { Ruby: Number.MAX_SAFE_INTEGER + 1 }]) {
    assert.throws(() => validatePreferences({ ...defaults, opponentWins: invalid }), /invalid/);
  }
});

test('new and updated opponents are selectable, persistent, and award points for their levels', () => {
  for (const [name, level] of [
    ['Orly', 300], ['Mike', 300], ['Jeremiah', 400], ['Victoria', 400],
    ['Uma', 400], ['Winter', 500], ['John', 500], ['Esther', 600],
    ['Madison', 600], ['Ruby', 700], ['Benjamin', 700], ['Nova', 800],
    ['Tori', 800], ['Meg', 900], ['Dara', 900], ['Ezra', 900],
    ['Emma', 1000], ['Victor', 1000],
  ]) {
    const matches = OPPONENTS.filter((opponent) => opponent.name === name);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].level, level);
    assert.equal(validatePreferences({ ...defaults, opponent: name }).opponent, name);
    assert.equal(calculateWinProgress(1, 0, matches[0].level).earnedPoints, level / 100);
  }
});

test('Nell has long hair', () => {
  const nell = OPPONENTS.find((opponent) => opponent.name === 'Nell');
  assert.ok(nell);
  assert.equal(nell.longHair, true);
});

test('higher opponent levels make the AI faster, including at a high player level and score lead', () => {
  let previousSpeed = 0;
  for (let opponentLevel = 100; opponentLevel <= 1000; opponentLevel += 100) {
    const speed = calculateAiSpeed(opponentLevel, 1000, 6);
    assert.ok(speed > previousSpeed, `level ${opponentLevel} should be harder than the previous level`);
    previousSpeed = speed;
  }
});

test('saved progress is converted once without losing preferences or levels', () => {
  const { progressRuleVersion, ...legacy } = defaults;
  for (let points = 0; points <= 4; points++) {
    const restored = validatePreferences({ ...legacy, playerLevel: 10, playerName: 'Player', progressPoints: points });
    assert.equal(restored.playerLevel, 10 + Math.floor(points / 3));
    assert.equal(restored.progressPoints, points % 3);
    assert.equal(restored.progressRuleVersion, progressRuleVersion);
    assert.equal(restored.playerName, 'Player');
    assert.deepEqual(validatePreferences(restored), restored);
  }
  const { progressPoints, ...older } = legacy;
  assert.equal(validatePreferences(older).progressPoints, 0);
  assert.equal(validatePreferences({ ...legacy, playerLevel: 1000, progressPoints: 4 }).playerLevel, 1000);
  assert.throws(() => validatePreferences({ ...defaults, progressPoints: 3 }), /invalid/);
  assert.throws(() => validatePreferences({ ...defaults, progressRuleVersion: 3 }), /invalid/);
});

test('ball settings preserve old preferences and validate every supported choice', () => {
  const { ballColor, ballSize, ballPattern, ...legacy } = defaults;
  assert.deepEqual(validatePreferences(legacy), defaults);
  assert.equal(defaults.ballSize, 18);
  assert.deepEqual(BALL_SIZES.map(({ name, size }) => [name, size]), [
    ['Extra small', 8], ['Small', 12], ['Medium', 18], ['Large', 26], ['Extra large', 34],
  ]);
  assert.deepEqual(BALL_PATTERNS, ['Solid', 'Stripe', 'Dots', 'Double stripe', 'Diagonal', 'Cross', 'Ring', 'Bullseye', 'Half', 'Checker']);
  for (const { color } of BALL_COLORS) {
    assert.equal(validatePreferences({ ...defaults, ballColor: color }).ballColor, color);
  }
  for (const { size } of BALL_SIZES) {
    assert.equal(validatePreferences({ ...defaults, ballSize: size }).ballSize, size);
  }
  for (const pattern of BALL_PATTERNS) {
    assert.equal(validatePreferences({ ...defaults, ballPattern: pattern }).ballPattern, pattern);
  }
  assert.throws(() => validatePreferences({ ...defaults, ballSize: 99 }), /invalid/);
  assert.throws(() => validatePreferences({ ...defaults, ballColor: 'invalid' }), /invalid/);
  assert.throws(() => validatePreferences({ ...defaults, ballPattern: 'invalid' }), /invalid/);
});

test('background decorations migrate and persist supported shapes, colors, and positions', () => {
  const { backgroundDecorations, ...legacy } = defaults;
  assert.deepEqual(validatePreferences({ ...legacy, playerLevel: 42 }), { ...defaults, playerLevel: 42 });
  assert.equal(backgroundDecorations.length, 9);
  assert.equal(new Set(backgroundDecorations.map(({ position }) => position)).size, 9);
  const previous = [
    { shape: 'heart', color: PADDLE_COLORS[0].color, position: 'Center' },
    { shape: 'star', color: PADDLE_COLORS[1].color, position: 'Top right' },
  ];
  const migrated = validatePreferences({ ...defaults, backgroundDecorations: previous });
  assert.deepEqual(migrated.backgroundDecorations, [...previous, ...backgroundDecorations.slice(2)]);
  assert.deepEqual(validatePreferences(migrated), migrated);
  const previousFive = [
    ...previous,
    { shape: 'circle', color: PADDLE_COLORS[2].color, position: 'Middle left' },
    { shape: 'diamond', color: PADDLE_COLORS[3].color, position: 'Bottom center' },
    { shape: 'star', color: PADDLE_COLORS[4].color, position: 'Top left' },
  ];
  const migratedFive = validatePreferences({ ...defaults, backgroundDecorations: previousFive });
  assert.deepEqual(migratedFive.backgroundDecorations, [...previousFive, ...backgroundDecorations.slice(5)]);
  assert.deepEqual(validatePreferences(JSON.parse(JSON.stringify(migratedFive))), migratedFive);
  const allDecorations = backgroundDecorations.map((_, index) => ({
    shape: BACKGROUND_SHAPES[1 + index % (BACKGROUND_SHAPES.length - 1)].value,
    color: PADDLE_COLORS[index].color,
    position: BACKGROUND_POSITIONS[index].name,
  }));
  assert.deepEqual(validatePreferences(JSON.parse(JSON.stringify({ ...defaults, backgroundDecorations: allDecorations }))).backgroundDecorations, allDecorations);
  for (const { name } of BACKGROUNDS) {
    assert.equal(validatePreferences({ ...defaults, background: name }).background, name);
  }
  assert.deepEqual(BACKGROUND_SHAPES.map(({ value }) => value), ['none', 'heart', 'diamond', 'circle', 'star']);
  assert.equal(BACKGROUND_POSITIONS.length, 9);
  for (const shape of BACKGROUND_SHAPES) {
    for (const position of BACKGROUND_POSITIONS) {
      for (const color of PADDLE_COLORS) {
        const decorations = [{ shape: shape.value, color: color.color, position: position.name }, ...backgroundDecorations.slice(1)];
        const saved = JSON.parse(JSON.stringify({ ...defaults, backgroundDecorations: decorations }));
        assert.deepEqual(validatePreferences(saved).backgroundDecorations, decorations);
      }
    }
  }
  for (const decorations of [
    null, [], [backgroundDecorations[0]], [null, backgroundDecorations[1]],
    backgroundDecorations.slice(0, 3), backgroundDecorations.slice(0, 4),
    backgroundDecorations.slice(0, 6), backgroundDecorations.slice(0, 7), backgroundDecorations.slice(0, 8),
    [{ ...previousFive[0], shape: 'invalid' }, ...previousFive.slice(1)],
    [...backgroundDecorations, backgroundDecorations[0]],
    [{ ...backgroundDecorations[0], shape: 'invalid' }, ...backgroundDecorations.slice(1)],
    [{ ...backgroundDecorations[0], color: 'invalid' }, ...backgroundDecorations.slice(1)],
    [{ ...backgroundDecorations[0], position: 'invalid' }, ...backgroundDecorations.slice(1)],
  ]) {
    assert.throws(() => validatePreferences({ ...defaults, backgroundDecorations: decorations }), /invalid/);
  }
});

test('avatar preferences migrate old saves and preserve every supported appearance', () => {
  const { playerAvatar, ...legacy } = defaults;
  assert.deepEqual(validatePreferences({ ...legacy, playerName: 'Player', playerLevel: 42 }), {
    ...defaults, playerName: 'Player', playerLevel: 42,
  });
  for (const [field, colors] of [['hair', AVATAR_HAIR_COLORS], ['skin', AVATAR_SKIN_COLORS], ['shirt', PADDLE_COLORS]]) {
    for (const { color } of colors) {
      const avatar = { ...playerAvatar, [field]: color, longHair: true, lashes: true };
      assert.deepEqual(validatePreferences(JSON.parse(JSON.stringify({ ...defaults, playerAvatar: avatar }))).playerAvatar, avatar);
    }
  }
  for (const avatar of [
    null, {}, { ...playerAvatar, hair: 'invalid' }, { ...playerAvatar, skin: 'invalid' },
    { ...playerAvatar, shirt: 'invalid' }, { ...playerAvatar, longHair: 'yes' },
    { ...playerAvatar, lashes: 1 },
  ]) {
    assert.throws(() => validatePreferences({ ...defaults, playerAvatar: avatar }), /invalid/);
  }
});

test('new avatar choices migrate existing portraits, round-trip and reject invalid values', () => {
  const { hairstyle, mouth, shoulders, glasses, necklace, ...oldAvatar } = defaults.playerAvatar;
  const oldPreferences = { ...defaults, playerName: 'Player', playerLevel: 42, playerAvatar: { ...oldAvatar, longHair: true, lashes: true } };
  const migrated = validatePreferences(oldPreferences);
  assert.deepEqual(migrated.playerAvatar, { ...defaults.playerAvatar, ...oldAvatar, longHair: true, lashes: true });
  assert.equal(migrated.playerLevel, 42);
  assert.equal(migrated.playerName, 'Player');
  assert.deepEqual(validatePreferences(migrated), migrated);

  for (const [field, options] of [['hairstyle', AVATAR_HAIRSTYLES], ['mouth', AVATAR_MOUTHS], ['shoulders', AVATAR_SHOULDERS]]) {
    for (const { value } of options) {
      const avatar = { ...migrated.playerAvatar, [field]: value, glasses: true, necklace: true };
      assert.deepEqual(validatePreferences(JSON.parse(JSON.stringify({ ...defaults, playerAvatar: avatar }))).playerAvatar, avatar);
    }
    assert.throws(() => validatePreferences({ ...defaults, playerAvatar: { ...defaults.playerAvatar, [field]: 'invalid' } }), /invalid/);
  }
  for (const field of ['glasses', 'necklace']) {
    assert.throws(() => validatePreferences({ ...defaults, playerAvatar: { ...defaults.playerAvatar, [field]: null } }), /invalid/);
  }
  assert.deepEqual(AVATAR_HAIRSTYLES.map(({ value }) => value), [
    'none', 'braid', 'braidedPonytail', 'highPonytail', 'lowPonytail', 'frenchBraid', 'pigtails', 'hairDown',
  ]);
});

test('eye color is saved and determines eyelash color for players and opponents', () => {
  const { eyes, ...oldAvatar } = defaults.playerAvatar;
  assert.deepEqual(validatePreferences({ ...defaults, playerAvatar: oldAvatar }).playerAvatar, defaults.playerAvatar);
  for (const [eyeColor, lashColor] of [
    ['#1e293b', '#241a18'],
    ['#3b82f6', '#c49b63'],
    ['#59402a', '#a36836'],
    ['#3b241b', '#573326'],
  ]) {
    assert.ok(AVATAR_EYE_COLORS.some((choice) => choice.color === eyeColor));
    assert.equal(eyelashColorForEyes(eyeColor), lashColor);
    const saved = JSON.parse(JSON.stringify({ ...defaults, playerAvatar: { ...defaults.playerAvatar, eyes: eyeColor, lashes: true } }));
    assert.equal(validatePreferences(saved).playerAvatar.eyes, eyeColor);
  }
  for (const opponent of OPPONENTS) {
    assert.doesNotThrow(() => eyelashColorForEyes(opponent.eyes ?? eyes));
  }
  assert.throws(() => validatePreferences({ ...defaults, playerAvatar: { ...defaults.playerAvatar, eyes: 'invalid' } }), /invalid/);
  assert.throws(() => eyelashColorForEyes('invalid'), /Unsupported eye color/);
});

test('ball size changes paddle collision and serve clearance', () => {
  const paddle = { x: 100, y: 300 };
  assert.equal(paddleCrossing(78, 260, 78, 310, 12, paddle, paddle, 96), null);
  assert.notEqual(paddleCrossing(78, 260, 78, 310, 26, paddle, paddle, 96), null);
  for (const { size } of BALL_SIZES) {
    assert.equal(serveBallY(100, 295, size, 100, 300, 96, 14), 300 - size);
  }
});

test('a serve starts above an overlapping player paddle', () => {
  assert.equal(serveBallY(90, 291, 18, 60, 300, 96, 14), 282);
  assert.equal(serveBallY(180, 291, 18, 60, 300, 96, 14), 291);
  assert.equal(serveBallY(90, 250, 18, 60, 300, 96, 14), 250);
});

test('paddle collision detects a fast ball crossing its current height', () => {
  const paddle = { x: 30, y: 300 };
  assert.deepEqual(paddleCrossing(40, 260, 60, 310, 18, paddle, paddle, 96), { ballX: 48.8, paddleX: 30 });
  assert.equal(paddleCrossing(40, 260, 60, 310, 18, { x: 100, y: 300 }, { x: 100, y: 300 }, 96), null);
  assert.equal(paddleCrossing(40, 310, 60, 260, 18, paddle, paddle, 96), null);
  assert.equal(paddleCrossing(40, 300, 60, 320, 18, paddle, paddle, 96), null);
});

test('a rising paddle catches a descending ball when their paths cross between frames', () => {
  assert.deepEqual(
    paddleCrossing(40, 270, 44, 280, 18, { x: 30, y: 320 }, { x: 30, y: 290 }, 96),
    { ballX: 43.2, paddleX: 30 }
  );
  assert.equal(paddleCrossing(40, 270, 44, 280, 18, { x: 100, y: 320 }, { x: 100, y: 290 }, 96), null);
  assert.equal(paddleCrossing(40, 270, 44, 280, 18, { x: 30, y: 300 }, { x: 30, y: 320 }, 96), null);
});

test('hitting while moving the paddle upward adds a capped, frame-rate-independent speed boost', () => {
  const stationary = playerBounceVelocity(360, 300, 300, 0.02);
  assert.equal(stationary, -370.8);
  assert.equal(playerBounceVelocity(360, 300, 310, 0.02), stationary);
  assert.equal(playerBounceVelocity(360, 300, 290, 0), stationary);
  const moving = playerBounceVelocity(360, 300, 290, 0.02);
  assert.ok(Math.abs(moving) >= Math.abs(stationary) + 300);
  assert.equal(moving, playerBounceVelocity(360, 300, 295, 0.01));
  assert.equal(playerBounceVelocity(360, 300, 200, 0.02), stationary - 350);
});

test('horizontal paddle position is evaluated at the crossing, not the end of the frame', () => {
  assert.deepEqual(
    paddleCrossing(50, 270, 50, 290, 18, { x: 0, y: 300 }, { x: 100, y: 300 }, 40),
    { ballX: 50, paddleX: 60 }
  );
  assert.equal(paddleCrossing(50, 270, 50, 290, 18, { x: 150, y: 300 }, { x: 30, y: 300 }, 40), null);
});
