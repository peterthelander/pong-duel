import { applyProgressPoints, BACKGROUNDS, MAX_PLAYER_LEVEL, OPPONENTS, PADDLE_COLORS, POINTS_PER_LEVEL, SOUND_STYLES } from './gameOptions.js';

const PROGRESS_RULE_VERSION = 2;

export const defaults = {
  soundEnabled: true,
  soundStyle: 'Classic',
  paddleColor: PADDLE_COLORS[0].color,
  opponent: 'Nell',
  background: 'Night',
  playerName: '',
  playerLevel: 1,
  progressPoints: 0,
  progressRuleVersion: PROGRESS_RULE_VERSION,
};

export function validatePreferences(value) {
  if (value && typeof value === 'object' && !('progressPoints' in value)) {
    value = { ...value, progressPoints: 0 };
  }
  const version = value?.progressRuleVersion ?? 1;
  if (!value || typeof value !== 'object' ||
      (version !== 1 && version !== PROGRESS_RULE_VERSION) ||
      typeof value.soundEnabled !== 'boolean' ||
      !SOUND_STYLES.includes(value.soundStyle) ||
      !PADDLE_COLORS.some((item) => item.color === value.paddleColor) ||
      !OPPONENTS.some((item) => item.name === value.opponent) ||
      !BACKGROUNDS.some((item) => item.name === value.background) ||
      typeof value.playerName !== 'string' || value.playerName.length > 30 ||
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
