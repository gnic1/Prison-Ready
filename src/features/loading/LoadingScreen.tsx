// LoadingScreen — full-bleed branded splash shown while the app bootstraps.
// The artwork (assets/loading/neighborhood_watch_loading.png) already contains
// the wordmark, the STAY ALERT sign, and the Prison Ready badge, so this layer
// only adds the auto-advancing progress bar near the bottom. The image is
// rendered resizeMode="cover" so it stays centered and fills any phone aspect
// ratio without distortion.
//
// NOTE: this screen renders OUTSIDE NavigationContainer (during bootstrap),
// so it must NOT depend on a SafeAreaProvider. We use a fixed bottom inset
// instead of useSafeAreaInsets() to avoid a launch crash.

import React from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ART = require('../../../assets/loading/neighborhood_watch_loading.png');

// Generous fixed inset that clears the gesture bar / nav bar on phones without
// needing a SafeAreaProvider.
const BOTTOM_INSET = 44;

interface LoadingScreenProps {
  // Called once the progress animation completes and the screen has faded out.
  onFinish: () => void;
  // How long the progress bar takes to fill, in ms.
  durationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinish,
  durationMs = 2400,
}) => {
  const progress = React.useRef(new Animated.Value(0)).current;
  const fade = React.useRef(new Animated.Value(1)).current;
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    const id = progress.addListener(({ value }) => {
      setPct(Math.round(value * 100));
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => onFinish());
    });

    return () => progress.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <ImageBackground source={ART} style={styles.bg} resizeMode="cover">
        <View style={[styles.barBlock, { paddingBottom: BOTTOM_INSET }]}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>LOADING PATROL</Text>
            <Text style={styles.pct}>{pct}%</Text>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: barWidth }]} />
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#03050c' },
  bg: { flex: 1, justifyContent: 'flex-end' },
  barBlock: { paddingHorizontal: 36 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#aeb8cc',
    fontWeight: '600',
  },
  pct: {
    fontSize: 12,
    color: '#7cc4ff',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#3b8cf0',
  },
});

export default LoadingScreen;
