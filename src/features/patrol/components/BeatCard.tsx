// BeatCard — narrative card slid up from the bottom when a story node fires.
// Renders BeatContent in three registers: narrative (Georgia serif), fieldlog
// (Courier mono, all caps), transmission (Courier with cyan tint by default).

import React from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BeatContent } from '../types/storyGraph';

interface BeatCardProps {
  content: BeatContent;
  accent: string;
  /** Optional CTA button row at the bottom. */
  cta?: { label: string; onPress: () => void };
  /** Static — render without slide animation (used in launch/debrief). */
  static?: boolean;
}

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });

export const BeatCard: React.FC<BeatCardProps> = ({ content, accent, cta, static: isStatic }) => {
  const slide = React.useRef(new Animated.Value(isStatic ? 0 : 40)).current;
  const fade = React.useRef(new Animated.Value(isStatic ? 1 : 0)).current;

  React.useEffect(() => {
    if (isStatic) return;
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [content.heading, fade, isStatic, slide]);

  const register = content.register ?? 'narrative';
  const headingFont = register === 'fieldlog' || register === 'transmission' ? MONO : SERIF;
  const bodyFont = register === 'fieldlog' || register === 'transmission' ? MONO : SERIF;
  const accentColor = content.accentOverride ?? accent;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { borderColor: accentColor, opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      {content.eyebrow ? (
        <Text style={[styles.eyebrow, { color: accentColor }]}>{content.eyebrow}</Text>
      ) : null}
      <Text style={[styles.heading, { fontFamily: headingFont }]}>
        {content.heading}
      </Text>
      {content.speaker ? (
        <Text style={[styles.speaker, { color: accentColor }]}>{content.speaker}</Text>
      ) : null}
      <View style={{ marginTop: 8 }}>
        {content.body.map((p, i) => (
          <Text
            key={i}
            style={[
              styles.body,
              {
                fontFamily: bodyFont,
                color: register === 'fieldlog' ? '#D8DDE0' : '#EAE6DA',
                letterSpacing: register === 'fieldlog' ? 0.6 : 0,
              },
              i > 0 && { marginTop: 10 },
            ]}
          >
            {register === 'fieldlog' ? p.toUpperCase() : p}
          </Text>
        ))}
      </View>
      {cta ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.cta, { borderColor: accentColor }]}
          onPress={cta.onPress}
        >
          <Text style={[styles.ctaLabel, { color: accentColor }]}>{cta.label}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(10,12,16,0.95)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    fontFamily: MONO,
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    color: '#F2F2F0',
    fontWeight: '700',
    lineHeight: 28,
  },
  speaker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: MONO,
    marginTop: 4,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
  cta: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    fontFamily: MONO,
  },
});
