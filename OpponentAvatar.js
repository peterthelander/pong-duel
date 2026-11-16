import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AVATAR_EYE_COLORS, eyelashColorForEyes } from './gameOptions';

function Braid({ color, style }) {
  return (
    <View style={[styles.braid, style]}>
      {[0, 1, 2, 3].map((segment) => (
        <View key={segment} style={[styles.braidSection, { backgroundColor: color }, segment % 2 === 0 ? styles.braidLeft : styles.braidRight]} />
      ))}
      <View style={styles.hairTie} />
    </View>
  );
}

function OpponentAvatar({ opponent, size = 96 }) {
  const scale = size / 96;
  const eyeColor = opponent.eyes ?? AVATAR_EYE_COLORS[0].color;
  const lashColor = eyelashColorForEyes(eyeColor);
  const hairstyle = opponent.hairstyle || 'none';
  const shoulderOffset = opponent.shoulders === 'broad' ? 8 : opponent.shoulders === 'narrow' ? -7 : 0;
  return (
    <View accessible={false} pointerEvents="none" style={{ width: size, height: 100 * scale }}>
      <View style={[styles.portrait, { position: 'absolute', left: (size - 96) / 2, top: (100 * scale - 100) / 2, transform: [{ scale }] }]}>
        {(hairstyle === 'highPonytail' || hairstyle === 'braidedPonytail') ? <View style={[styles.ponytail, styles.highPonytail, { backgroundColor: opponent.hair }]} /> : null}
        {hairstyle === 'lowPonytail' ? <View style={[styles.ponytail, styles.lowPonytail, { backgroundColor: opponent.hair }]} /> : null}
        {hairstyle === 'pigtails' ? <>
          <View style={[styles.pigtail, styles.pigtailLeft, { backgroundColor: opponent.hair }]} />
          <View style={[styles.pigtail, styles.pigtailRight, { backgroundColor: opponent.hair }]} />
        </> : null}
        <View style={[styles.hair, ((opponent.longHair && hairstyle === 'none') || hairstyle === 'hairDown') && styles.longHair, { backgroundColor: opponent.hair }]} />
        <View style={[styles.neck, { backgroundColor: opponent.skin }]} />
        <View style={[styles.armLeft, { left: 11 - shoulderOffset, backgroundColor: opponent.skin }]} />
        <View style={[styles.armRight, { right: 11 - shoulderOffset, backgroundColor: opponent.skin }]} />
        <View style={[styles.shirt, { left: 21 - shoulderOffset, width: 54 + shoulderOffset * 2, backgroundColor: opponent.shirt }]} />
        {opponent.necklace ? <View style={styles.necklace}><View style={styles.pendant} /></View> : null}
        <View style={[styles.face, { backgroundColor: opponent.skin }]}>
          {opponent.lashes ? <><View style={[styles.lashLeft, { backgroundColor: lashColor }]} /><View style={[styles.lashRight, { backgroundColor: lashColor }]} /></> : null}
          <View style={[styles.eyeLeft, { backgroundColor: eyeColor }]} />
          <View style={[styles.eyeRight, { backgroundColor: eyeColor }]} />
          {opponent.glasses ? <View style={styles.glasses}><View style={styles.lens} /><View style={styles.bridge} /><View style={styles.lens} /></View> : null}
          <View style={opponent.mouth === 'straight' ? styles.straightMouth : opponent.mouth === 'open' ? styles.openMouth : styles.smile} />
        </View>
        <View style={[styles.fringe, { backgroundColor: opponent.hair }]} />
        {hairstyle === 'braid' ? <Braid color={opponent.hair} style={styles.sideBraid} /> : null}
        {hairstyle === 'braidedPonytail' ? <Braid color={opponent.hair} style={styles.ponytailBraid} /> : null}
        {hairstyle === 'frenchBraid' ? <Braid color={opponent.hair} style={styles.frenchBraid} /> : null}
      </View>
    </View>
  );
}

export default memo(OpponentAvatar);

const styles = StyleSheet.create({
  portrait: { width: 96, height: 100 },
  hair: { position: 'absolute', top: 2, left: 20, width: 56, height: 62, borderRadius: 28 },
  longHair: { height: 91, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  ponytail: { position: 'absolute', left: 66, width: 19, height: 44, borderRadius: 10 },
  highPonytail: { top: 5, transform: [{ rotate: '-22deg' }] },
  lowPonytail: { top: 32, transform: [{ rotate: '-8deg' }] },
  pigtail: { position: 'absolute', top: 31, width: 18, height: 39, borderRadius: 9 },
  pigtailLeft: { left: 10, transform: [{ rotate: '14deg' }] },
  pigtailRight: { right: 10, transform: [{ rotate: '-14deg' }] },
  braid: { position: 'absolute', width: 15, alignItems: 'center' },
  sideBraid: { left: 68, top: 33 },
  ponytailBraid: { left: 73, top: 19 },
  frenchBraid: { left: 65, top: 6 },
  braidSection: { width: 12, height: 12, marginBottom: -3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 6 },
  braidLeft: { transform: [{ rotate: '25deg' }] },
  braidRight: { transform: [{ rotate: '-25deg' }] },
  hairTie: { width: 10, height: 3, borderRadius: 2, backgroundColor: '#f9a8d4' },
  face: { position: 'absolute', top: 12, left: 25, width: 46, height: 48, borderRadius: 23 },
  fringe: { position: 'absolute', top: 4, left: 24, width: 48, height: 13, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 6 },
  neck: { position: 'absolute', top: 51, left: 41, width: 14, height: 18 },
  shirt: { position: 'absolute', top: 65, left: 21, width: 54, height: 34, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  armLeft: { position: 'absolute', top: 72, left: 11, width: 13, height: 26, borderRadius: 7 },
  armRight: { position: 'absolute', top: 72, right: 11, width: 13, height: 26, borderRadius: 7 },
  eyeLeft: { position: 'absolute', top: 19, left: 11, width: 4, height: 5, borderRadius: 3, backgroundColor: '#1e293b' },
  eyeRight: { position: 'absolute', top: 19, right: 11, width: 4, height: 5, borderRadius: 3, backgroundColor: '#1e293b' },
  lashLeft: { position: 'absolute', top: 19, left: 9, width: 4, height: 2, borderRadius: 1, transform: [{ rotate: '25deg' }] },
  lashRight: { position: 'absolute', top: 19, right: 9, width: 4, height: 2, borderRadius: 1, transform: [{ rotate: '-25deg' }] },
  glasses: { position: 'absolute', top: 15, left: 5, flexDirection: 'row', alignItems: 'center' },
  lens: { width: 15, height: 13, borderRadius: 5, borderWidth: 2, borderColor: '#334155' },
  bridge: { width: 6, height: 2, backgroundColor: '#334155' },
  necklace: { position: 'absolute', top: 64, left: 37, width: 22, height: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#fde68a', borderBottomLeftRadius: 11, borderBottomRightRadius: 11, alignItems: 'center' },
  pendant: { position: 'absolute', top: 9, width: 5, height: 5, borderRadius: 3, backgroundColor: '#fde68a' },
  smile: { position: 'absolute', top: 31, left: 18, width: 10, height: 5, borderBottomWidth: 2, borderColor: '#7c3d3d', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  straightMouth: { position: 'absolute', top: 34, left: 18, width: 10, height: 2, borderRadius: 1, backgroundColor: '#7c3d3d' },
  openMouth: { position: 'absolute', top: 31, left: 19, width: 8, height: 7, borderRadius: 4, backgroundColor: '#7c3d3d' },
});
