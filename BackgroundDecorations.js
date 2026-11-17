import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BACKGROUND_POSITIONS } from './gameOptions';

const SYMBOLS = { heart: '♥︎', diamond: '◆', circle: '●', star: '★' };

function BackgroundDecorations({ decorations }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {decorations.map((decoration, index) => {
        if (decoration.shape === 'none') return null;
        const position = BACKGROUND_POSITIONS.find((item) => item.name === decoration.position);
        return (
          <View key={index} style={[styles.position, { left: `${position.x}%`, top: `${position.y}%` }]}>
            <Text accessible={false} style={[styles.symbol, { color: decoration.color }]}>{SYMBOLS[decoration.shape]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default memo(BackgroundDecorations);

const styles = StyleSheet.create({
  position: { position: 'absolute', width: 64, height: 64, marginLeft: -32, marginTop: -32, alignItems: 'center', justifyContent: 'center', opacity: 0.3 },
  symbol: { fontSize: 50, lineHeight: 64, textAlign: 'center', includeFontPadding: false },
});
