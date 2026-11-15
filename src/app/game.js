import { Redirect } from 'expo-router';
import Game from '../../App';
import { useGameSettings } from '../../gameSettings';

export default function GameScreen() {
  const { enteredGame } = useGameSettings();
  return enteredGame ? <Game /> : <Redirect href="/" />;
}
