import { Redirect } from 'expo-router';
import { useGameSettings } from '../../gameSettings';

export default function GameScreen() {
  const { enteredGame, gameMode } = useGameSettings();

  if (!enteredGame) {
    return <Redirect href="/" />;
  }

  if (gameMode === 'two-player') {
    const TwoPlayerGame = require('../../TwoPlayerGame').default;
    return <TwoPlayerGame />;
  }

  const Game = require('../../App').default;
  return <Game />;
}
