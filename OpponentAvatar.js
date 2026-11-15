import { StyleSheet, View } from 'react-native';

export default function OpponentAvatar({ opponent }) {
  return (
    <View accessible={false} style={styles.portrait}>
      <View style={[styles.hair, opponent.longHair && styles.longHair, { backgroundColor: opponent.hair }]} />
      <View style={[styles.neck, { backgroundColor: opponent.skin }]} />
      <View style={[styles.armLeft, { backgroundColor: opponent.skin }]} />
      <View style={[styles.armRight, { backgroundColor: opponent.skin }]} />
      <View style={[styles.shirt, { backgroundColor: opponent.shirt }]} />
      <View style={[styles.face, { backgroundColor: opponent.skin }]}>
        <View style={[styles.eyeLeft, { backgroundColor: opponent.eyes || '#1e293b' }]} />
        <View style={[styles.eyeRight, { backgroundColor: opponent.eyes || '#1e293b' }]} />
        {opponent.lashes ? <><View style={styles.lashLeft} /><View style={styles.lashRight} /></> : null}
        <View style={styles.smile} />
      </View>
      <View style={[styles.fringe, { backgroundColor: opponent.hair }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  portrait: { width: 96, height: 100 },
  hair: { position: 'absolute', top: 2, left: 20, width: 56, height: 62, borderRadius: 28 },
  longHair: { height: 91, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  face: { position: 'absolute', top: 12, left: 25, width: 46, height: 48, borderRadius: 23 },
  fringe: { position: 'absolute', top: 4, left: 24, width: 48, height: 13, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 6 },
  neck: { position: 'absolute', top: 51, left: 41, width: 14, height: 18 },
  shirt: { position: 'absolute', top: 65, left: 21, width: 54, height: 34, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  armLeft: { position: 'absolute', top: 72, left: 11, width: 13, height: 26, borderRadius: 7 },
  armRight: { position: 'absolute', top: 72, right: 11, width: 13, height: 26, borderRadius: 7 },
  eyeLeft: { position: 'absolute', top: 19, left: 11, width: 4, height: 5, borderRadius: 3, backgroundColor: '#1e293b' },
  eyeRight: { position: 'absolute', top: 19, right: 11, width: 4, height: 5, borderRadius: 3, backgroundColor: '#1e293b' },
  lashLeft: { position: 'absolute', top: 17, left: 12, width: 2, height: 3, backgroundColor: '#241a18' },
  lashRight: { position: 'absolute', top: 17, right: 12, width: 2, height: 3, backgroundColor: '#241a18' },
  smile: { position: 'absolute', top: 31, left: 18, width: 10, height: 5, borderBottomWidth: 2, borderColor: '#7c3d3d', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
});
