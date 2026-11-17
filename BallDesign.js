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
      {pattern === 'Double stripe' ? (
        <>
          <View style={{ position: 'absolute', top: size * 0.25, width: size, height: size * 0.14, backgroundColor: mark }} />
          <View style={{ position: 'absolute', top: size * 0.61, width: size, height: size * 0.14, backgroundColor: mark }} />
        </>
      ) : null}
      {pattern === 'Diagonal' ? (
        <View style={{ position: 'absolute', top: size * 0.4, left: -size * 0.2, width: size * 1.4, height: size * 0.2, backgroundColor: mark, transform: [{ rotate: '-45deg' }] }} />
      ) : null}
      {pattern === 'Cross' ? (
        <>
          <View style={{ position: 'absolute', top: size * 0.42, width: size, height: size * 0.16, backgroundColor: mark }} />
          <View style={{ position: 'absolute', left: size * 0.42, height: size, width: size * 0.16, backgroundColor: mark }} />
        </>
      ) : null}
      {pattern === 'Ring' ? (
        <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.2, width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, borderWidth: size * 0.1, borderColor: mark }} />
      ) : null}
      {pattern === 'Bullseye' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.14, top: size * 0.14, width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36, borderWidth: size * 0.09, borderColor: mark }} />
          <View style={{ position: 'absolute', left: size * 0.39, top: size * 0.39, width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, backgroundColor: mark }} />
        </>
      ) : null}
      {pattern === 'Half' ? (
        <View style={{ position: 'absolute', left: size * 0.5, width: size * 0.5, height: size, backgroundColor: mark }} />
      ) : null}
      {pattern === 'Checker' ? (
        <>
          <View style={{ position: 'absolute', left: 0, top: 0, width: size * 0.5, height: size * 0.5, backgroundColor: mark }} />
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: size * 0.5, height: size * 0.5, backgroundColor: mark }} />
        </>
      ) : null}
    </View>
  );
}
