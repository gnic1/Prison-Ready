// PillImageButton — wide pill-shaped CTA backed by an image (suburb/fence art).
// The art is loaded with resizeMode="cover" so the full pill renders at any
// width while preserving the artwork's center band.

import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface PillImageButtonProps {
  source: ImageSourcePropType;
  label: string;
  sublabel?: string;
  onPress: () => void;
  tone?: 'light' | 'dark';
  disabled?: boolean;
}

export const PillImageButton: React.FC<PillImageButtonProps> = ({
  source,
  label,
  sublabel,
  onPress,
  tone = 'light',
  disabled,
}) => {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      android_ripple={
        disabled ? undefined : { color: 'rgba(255,255,255,0.18)', borderless: false }
      }
      style={({ pressed }) => [
        styles.wrap,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <ImageBackground
        source={source}
        resizeMode="cover"
        imageStyle={styles.image}
        style={styles.bg}
      >
        <View style={styles.overlay}>
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              tone === 'dark' ? styles.labelDark : styles.labelLight,
            ]}
          >
            {label}
          </Text>
          {sublabel ? (
            <Text
              numberOfLines={1}
              style={[
                styles.sublabel,
                tone === 'dark' ? styles.sublabelDark : styles.sublabelLight,
              ]}
            >
              {sublabel}
            </Text>
          ) : null}
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 40,
    overflow: 'hidden',
    marginVertical: 8,
  },
  bg: {
    width: '100%',
    aspectRatio: 4.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { borderRadius: 40 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.85,
  },
  labelLight: {
    color: '#f3f6fb',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  sublabelLight: {
    color: '#a8c8ff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 3,
  },
  labelDark: {
    color: '#0a0f14',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowRadius: 4,
  },
  sublabelDark: {
    color: '#1f2630',
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  disabled: { opacity: 0.45 },
});

export default PillImageButton;
