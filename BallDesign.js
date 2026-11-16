import { View } from 'react-native';

export default function BallDesign({ size, color, pattern }) {
  const mark = 'rgba(15, 23, 42, 0.75)';
  return (
    <View pointerEvents="none" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, overflow: 'hidden' }}>
      {pattern === 'Stripe' ? (
        <View style={{ position: 'absolute', top: size * 0.4, width: size, height: size * 0.2, backgroundColor: mark }} />
      ) : null}
      {pattern === 'Dots' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.25, top: size * 0.25, width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: mark }} />
          <View style={{ position: 'absolute', right: size * 0.25, bottom: size * 0.25, width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: mark }} />
        </>
      ) : null}
    </View>
  );
}
