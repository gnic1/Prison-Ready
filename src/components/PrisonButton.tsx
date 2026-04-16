
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { tactical } from '../theme/tactical';


interface PrisonButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  shimmer?: boolean;
  icon?: string;
}


export const PrisonButton: React.FC<PrisonButtonProps> = ({ title, onPress, style, textStyle, disabled, shimmer, icon }) => {
  // Shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (shimmer) {
      shimmerAnim.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [shimmer]);

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ['#2A2D34', '#24272E'] : tactical.gradient.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topEdge} />
      <View style={styles.contentRow}>
        {icon ? <Text style={[styles.icon, textStyle]}>{icon}</Text> : null}
        <Text style={[styles.text, textStyle]}>{title.toUpperCase()}</Text>
      </View>
      {shimmer && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmerSweep,
            {
              opacity: 0.8,
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-320, 420],
                  }),
                },
                { rotate: '8deg' },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.0)", "rgba(255,240,200,0.55)", "rgba(255,255,255,0.0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: tactical.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: colors.prisonOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.34,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,186,120,0.35)',
    overflow: 'hidden',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,236,208,0.45)',
  },
  text: {
    ...typography.button,
    color: colors.text,
    textShadowColor: 'rgba(85,30,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontWeight: 'bold',
  },
  icon: {
    ...typography.button,
    color: colors.text,
    marginRight: 10,
    fontWeight: 'bold',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerSweep: {
    position: 'absolute',
    top: -6,
    bottom: -6,
    width: '58%',
  },
  shimmerGradient: {
    flex: 1,
    borderRadius: 20,
  },
  disabled: {
    borderColor: 'rgba(255,255,255,0.14)',
    opacity: 0.6,
  },
});
