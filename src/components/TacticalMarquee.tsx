import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tactical, tacticalText } from '../theme/tactical';

interface TacticalMarqueeProps {
  items: string[];
  tone?: 'orange' | 'teal';
  style?: any;
}

export function TacticalMarquee({ items, tone = 'orange', style }: TacticalMarqueeProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const strip = useMemo(() => {
    const source = items.length ? items : ['HQ STATUS: ONLINE'];
    return [...source, ...source].join('   //   ');
  }, [items]);

  useEffect(() => {
    translateX.setValue(0);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -560,
        duration: 14500,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX, strip]);

  const accent = tone === 'teal' ? tactical.colors.teal : tactical.colors.orange;

  return (
    <LinearGradient
      colors={tactical.gradient.banner}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, style]}
    >
      <View style={[styles.edgeLine, { borderTopColor: `${accent}66` }]} />
      <View style={[styles.edgeLineBottom, { borderBottomColor: `${accent}33` }]} />
      <Animated.View style={[styles.strip, { transform: [{ translateX }] }]}>
        <Text style={[styles.text, { color: accent }]} numberOfLines={1}>
          {strip}
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 26,
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  edgeLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  edgeLineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
  },
  strip: {
    paddingHorizontal: 14,
  },
  text: {
    ...tacticalText.pill,
    fontSize: 8.5,
    letterSpacing: 1.2,
  },
});
