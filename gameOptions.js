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
  { name: 'Mike', level: 100, skin: '#d29d78', hair: '#282526', shirt: '#60a5fa' },
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

export function calculateAiSpeed(opponentLevel, playerLevel, scoreDifference) {
  const scoreBoost = Math.max(-60, Math.min(140, scoreDifference * 22));
  return Math.max(260, Math.min(850, 270 + opponentLevel * 0.5 + playerLevel * 0.12 + scoreBoost));
}

export function calculateWinProgress(playerLevel, progressPoints, opponentLevel) {
  const earnedPoints = Math.floor(opponentLevel / 100) * 2;
  const total = progressPoints + earnedPoints;
  return {
    earnedPoints,
    playerLevel: Math.min(1000, playerLevel + Math.floor(total / 5) * 2),
    progressPoints: total % 5,
  };
}
