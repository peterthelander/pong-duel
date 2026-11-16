export const PADDLE_COLORS = [
  { name: 'Cyan', color: '#67e8f9' },
  { name: 'Pink', color: '#f9a8d4' },
  { name: 'Lime', color: '#bef264' },
  { name: 'Orange', color: '#fdba74' },
  { name: 'Red', color: '#f87171' },
  { name: 'Purple', color: '#c4b5fd' },
  { name: 'Blue', color: '#60a5fa' },
  { name: 'Yellow', color: '#fde047' },
  { name: 'Green', color: '#4ade80' },
  { name: 'White', color: '#f8fafc' },
];

export const OPPONENTS = [
  { name: 'Nell', level: 300, skin: '#eab89b', hair: '#573326', shirt: '#a78bfa' },
  { name: 'Mike', level: 300, skin: '#d29d78', hair: '#282526', shirt: '#60a5fa' },
  { name: 'Orly', level: 300, skin: '#e7bfa5', hair: '#6b432e', shirt: '#c084fc', eyes: '#59402a', lashes: true, longHair: true },
  { name: 'Jeremiah', level: 400, skin: '#c98f6c', hair: '#30221f', shirt: '#34d399', eyes: '#3b241b' },
  { name: 'Victoria', level: 400, skin: '#e8b99a', hair: '#4b2925', shirt: '#f472b6', eyes: '#59402a', lashes: true, longHair: true },
  { name: 'Uma', level: 400, skin: '#b87d5c', hair: '#241a18', shirt: '#fbbf24', eyes: '#3b241b', lashes: true, longHair: true },
  { name: 'Winter', level: 500, skin: '#f0d0b5', hair: '#c49b63', shirt: '#93c5fd', eyes: '#3b82f6', lashes: true, longHair: true },
  { name: 'John', level: 500, skin: '#d8a682', hair: '#493125', shirt: '#fb923c', eyes: '#59402a' },
  { name: 'Esther', level: 600, skin: '#d8a682', hair: '#3e2723', shirt: '#a78bfa', eyes: '#59402a', lashes: true, longHair: true },
  { name: 'Madison', level: 600, skin: '#f0d0b5', hair: '#a27750', shirt: '#f472b6', eyes: '#3b82f6', lashes: true, longHair: true },
  { name: 'Ruby', level: 700, skin: '#e7bfa5', hair: '#8b3e2f', shirt: '#f87171', eyes: '#59402a', lashes: true, longHair: true },
  { name: 'Benjamin', level: 700, skin: '#c98f6c', hair: '#30221f', shirt: '#60a5fa', eyes: '#3b241b' },
  { name: 'Rose', level: 100, skin: '#e7b49b', hair: '#653b33', shirt: '#fb7185', longHair: true },
  { name: 'Linnie', level: 100, skin: '#d6a17f', hair: '#30221f', shirt: '#a78bfa', longHair: true },
  { name: 'Jake', level: 200, skin: '#f1c7a6', hair: '#a36836', shirt: '#4ade80' },
  { name: 'Scarlet', level: 200, skin: '#e8b99a', hair: '#632f29', shirt: '#f87171', longHair: true },
  { name: 'Sophia', level: 400, skin: '#f0d0b5', hair: '#5b3627', shirt: '#fb7185', eyes: '#59402a', lashes: true, longHair: true },
  { name: 'Peter', level: 500, skin: '#f0d0b5', hair: '#a27750', shirt: '#60a5fa', eyes: '#3b82f6' },
  { name: 'Chika', level: 600, skin: '#f0d0b5', hair: '#111114', shirt: '#2dd4bf', eyes: '#3b241b', lashes: true, longHair: true },
];

export const BACKGROUNDS = [
  { name: 'Night', color: '#071524', left: 'rgba(14, 116, 144, 0.18)', right: 'rgba(251, 146, 60, 0.14)' },
  { name: 'Sunset', color: '#33172b', left: 'rgba(251, 146, 60, 0.22)', right: 'rgba(244, 114, 182, 0.22)' },
  { name: 'Forest', color: '#09231e', left: 'rgba(74, 222, 128, 0.18)', right: 'rgba(45, 212, 191, 0.18)' },
];

export const SOUND_STYLES = ['Classic', 'Retro', 'Soft'];
export const POINTS_PER_LEVEL = 3;
export const MAX_PLAYER_LEVEL = 1000;

/**
 * @param {number} playerLevel
 * @param {number} points
 * @returns {{playerLevel: number, progressPoints: number}}
 */
export function applyProgressPoints(playerLevel, points) {
  return {
    playerLevel: Math.min(MAX_PLAYER_LEVEL, playerLevel + Math.floor(points / POINTS_PER_LEVEL)),
    progressPoints: points % POINTS_PER_LEVEL,
  };
}

/**
 * @param {number} opponentLevel
 * @returns {number}
 */
export function pointsForOpponent(opponentLevel) {
  return Math.floor(opponentLevel / 100);
}

/**
 * @param {number} opponentLevel
 * @param {number} playerLevel
 * @param {number} scoreDifference
 * @returns {number}
 */
export function calculateAiSpeed(opponentLevel, playerLevel, scoreDifference) {
  const scoreBoost = Math.max(-60, Math.min(140, scoreDifference * 22));
  return Math.max(260, Math.min(850, 270 + opponentLevel * 0.5 + playerLevel * 0.12 + scoreBoost));
}

/**
 * @param {number} playerLevel
 * @param {number} progressPoints
 * @param {number} opponentLevel
 * @returns {{earnedPoints: number, playerLevel: number, progressPoints: number}}
 */
export function calculateWinProgress(playerLevel, progressPoints, opponentLevel) {
  const earnedPoints = pointsForOpponent(opponentLevel);
  return {
    earnedPoints,
    ...applyProgressPoints(playerLevel, progressPoints + earnedPoints),
  };
}
