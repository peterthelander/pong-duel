import { applyProgressPoints, AVATAR_EYE_COLORS, AVATAR_HAIR_COLORS, AVATAR_HAIRSTYLES, AVATAR_MOUTHS, AVATAR_SHOULDERS, AVATAR_SKIN_COLORS, BACKGROUNDS, BACKGROUND_POSITIONS, BACKGROUND_SHAPES, BALL_COLORS, BALL_PATTERNS, BALL_SIZES, calculateWinProgress, MAX_PLAYER_LEVEL, OPPONENTS, PADDLE_COLORS, POINTS_PER_LEVEL, SOUND_STYLES } from './gameOptions.js';

const PROGRESS_RULE_VERSION = 2;

export const defaults = {
  soundEnabled: true,
  soundStyle: 'Classic',
  paddleColor: PADDLE_COLORS[0].color,
  ballColor: BALL_COLORS[0].color,
  ballSize: BALL_SIZES[2].size,
  ballPattern: BALL_PATTERNS[0],
  opponent: 'Nell',
  background: 'Night',
  gameMode: 'vs-ai',
  backgroundDecorations: [
    { shape: 'none', color: PADDLE_COLORS[1].color, position: 'Top left' },
    { shape: 'none', color: PADDLE_COLORS[6].color, position: 'Bottom right' },
    { shape: 'none', color: PADDLE_COLORS[4].color, position: 'Top right' },
    { shape: 'none', color: PADDLE_COLORS[7].color, position: 'Bottom left' },
    { shape: 'none', color: PADDLE_COLORS[5].color, position: 'Center' },
    { shape: 'none', color: PADDLE_COLORS[0].color, position: 'Top center' },
    { shape: 'none', color: PADDLE_COLORS[2].color, position: 'Middle left' },
    { shape: 'none', color: PADDLE_COLORS[3].color, position: 'Middle right' },
    { shape: 'none', color: PADDLE_COLORS[8].color, position: 'Bottom center' },
  ],
  playerName: '',
  playerAvatar: {
    skin: AVATAR_SKIN_COLORS[1].color,
    hair: AVATAR_HAIR_COLORS[1].color,
    eyes: AVATAR_EYE_COLORS[0].color,
    shirt: PADDLE_COLORS[0].color,
    longHair: false,
    lashes: false,
    hairstyle: 'none',
    mouth: 'smile',
    shoulders: 'medium',
    glasses: false,
    necklace: false,
  },
  playerLevel: 1,
  progressPoints: 0,
  progressRuleVersion: PROGRESS_RULE_VERSION,
  opponentWins: {},
};

export function validatePreferences(value) {
  if (value && typeof value === 'object' && !('progressPoints' in value)) {
    value = { ...value, progressPoints: 0 };
  }
  if (value && typeof value === 'object') {
    value = {
      ...(!('ballColor' in value) && { ballColor: defaults.ballColor }),
      ...(!('ballSize' in value) && { ballSize: defaults.ballSize }),
      ...(!('ballPattern' in value) && { ballPattern: defaults.ballPattern }),
      ...(!('playerAvatar' in value) && { playerAvatar: defaults.playerAvatar }),
      ...(!('opponentWins' in value) && { opponentWins: defaults.opponentWins }),
      ...(!('backgroundDecorations' in value) && { backgroundDecorations: defaults.backgroundDecorations }),
      ...(!('gameMode' in value) && { gameMode: defaults.gameMode }),
      ...value,
    };
    if (value.playerAvatar && typeof value.playerAvatar === 'object' && !Array.isArray(value.playerAvatar)) {
      const avatar = value.playerAvatar;
      value.playerAvatar = {
        ...(!('hairstyle' in avatar) && { hairstyle: defaults.playerAvatar.hairstyle }),
        ...(!('eyes' in avatar) && { eyes: defaults.playerAvatar.eyes }),
        ...(!('mouth' in avatar) && { mouth: defaults.playerAvatar.mouth }),
        ...(!('shoulders' in avatar) && { shoulders: defaults.playerAvatar.shoulders }),
        ...(!('glasses' in avatar) && { glasses: defaults.playerAvatar.glasses }),
        ...(!('necklace' in avatar) && { necklace: defaults.playerAvatar.necklace }),
        ...avatar,
      };
    }
    if (Array.isArray(value.backgroundDecorations) && [2, 5].includes(value.backgroundDecorations.length)) {
      value.backgroundDecorations = [
        ...value.backgroundDecorations,
        ...defaults.backgroundDecorations.slice(value.backgroundDecorations.length),
      ];
    }
  }
  const version = value?.progressRuleVersion ?? 1;
  if (!value || typeof value !== 'object' ||
      (version !== 1 && version !== PROGRESS_RULE_VERSION) ||
      typeof value.soundEnabled !== 'boolean' ||
      !SOUND_STYLES.includes(value.soundStyle) ||
      !PADDLE_COLORS.some((item) => item.color === value.paddleColor) ||
      !BALL_COLORS.some((item) => item.color === value.ballColor) ||
      !BALL_SIZES.some((item) => item.size === value.ballSize) ||
      !BALL_PATTERNS.includes(value.ballPattern) ||
      !OPPONENTS.some((item) => item.name === value.opponent) ||
      !BACKGROUNDS.some((item) => item.name === value.background) ||
      !(value.gameMode === 'vs-ai' || value.gameMode === 'two-player') ||
      !Array.isArray(value.backgroundDecorations) || value.backgroundDecorations.length !== defaults.backgroundDecorations.length ||
      !value.backgroundDecorations.every((item) => item && typeof item === 'object' &&
        BACKGROUND_SHAPES.some((shape) => shape.value === item.shape) &&
        PADDLE_COLORS.some((color) => color.color === item.color) &&
        BACKGROUND_POSITIONS.some((position) => position.name === item.position)) ||
      typeof value.playerName !== 'string' || value.playerName.length > 30 ||
      !value.playerAvatar || typeof value.playerAvatar !== 'object' ||
      !AVATAR_SKIN_COLORS.some((item) => item.color === value.playerAvatar.skin) ||
      !AVATAR_HAIR_COLORS.some((item) => item.color === value.playerAvatar.hair) ||
      !AVATAR_EYE_COLORS.some((item) => item.color === value.playerAvatar.eyes) ||
      !PADDLE_COLORS.some((item) => item.color === value.playerAvatar.shirt) ||
      typeof value.playerAvatar.longHair !== 'boolean' ||
      typeof value.playerAvatar.lashes !== 'boolean' ||
      !AVATAR_HAIRSTYLES.some((item) => item.value === value.playerAvatar.hairstyle) ||
      !AVATAR_MOUTHS.some((item) => item.value === value.playerAvatar.mouth) ||
      !AVATAR_SHOULDERS.some((item) => item.value === value.playerAvatar.shoulders) ||
      typeof value.playerAvatar.glasses !== 'boolean' ||
      typeof value.playerAvatar.necklace !== 'boolean' ||
      !value.opponentWins || typeof value.opponentWins !== 'object' || Array.isArray(value.opponentWins) ||
      !Object.values(value.opponentWins).every((count) => Number.isSafeInteger(count) && count >= 0) ||
      !Number.isInteger(value.playerLevel) || value.playerLevel < 1 || value.playerLevel > MAX_PLAYER_LEVEL ||
      !Number.isInteger(value.progressPoints) || value.progressPoints < 0 ||
      value.progressPoints >= (version === 1 ? 5 : POINTS_PER_LEVEL)) {
    throw new Error('Saved preferences are invalid.');
  }

  if (version === 1) {
    return {
      ...value,
      ...applyProgressPoints(value.playerLevel, value.progressPoints),
      progressRuleVersion: PROGRESS_RULE_VERSION,
    };
  }
  return value;
}

export function recordOpponentWin(preferences, opponentName) {
  const opponent = OPPONENTS.find((item) => item.name === opponentName);
  if (!opponent) throw new Error(`Unknown opponent: ${opponentName}`);
  const wins = Object.prototype.hasOwnProperty.call(preferences.opponentWins, opponentName) ? preferences.opponentWins[opponentName] : 0;
  if (!Number.isSafeInteger(wins) || wins < 0 || wins === Number.MAX_SAFE_INTEGER) {
    throw new Error(`Invalid win count for ${opponentName}.`);
  }
  const progress = calculateWinProgress(preferences.playerLevel, preferences.progressPoints, opponent.level);
  return {
    ...preferences,
    playerLevel: progress.playerLevel,
    progressPoints: progress.progressPoints,
    opponentWins: { ...preferences.opponentWins, [opponentName]: wins + 1 },
  };
}
