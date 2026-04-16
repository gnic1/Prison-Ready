import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { themes } from '../theme/themes';
import { LinearGradient } from 'expo-linear-gradient';

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Missions: '⊞',
  Badges: '◈',
  Progress: '◎',
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Base',
  Missions: 'Missions',
  Badges: 'Badges',
  Progress: 'Map',
};

interface GameBottomNavProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  themeKey?: string;
}

export function GameBottomNav({ tabs, activeTab, onTabPress, themeKey = 'prison' }: GameBottomNavProps) {
  const theme = themes[themeKey];
  return (
    <View
      style={[
        styles.nav,
        {
          backgroundColor: 'rgba(24,24,28,0.98)',
          borderTopColor: 'transparent',
          shadowColor: theme.colors.prisonOrange,
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(7,10,14,0.96)', 'rgba(12,18,24,0.96)', 'rgba(7,10,14,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topRule} />
      {tabs.map(tabName => {
        const isActive = activeTab === tabName;
        const icon = TAB_ICONS[tabName] || '•';
        return (
          <TouchableOpacity
            key={tabName}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(tabName)}
          >
            {isActive ? <View style={styles.activeUnderline} /> : null}
            <Text
              style={{
                fontSize: isActive ? 23 : 20,
                color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                fontWeight: isActive ? '700' : '500',
                textShadowColor: isActive ? theme.colors.accentGlow : 'transparent',
                textShadowRadius: isActive ? 16 : 0,
                textShadowOffset: isActive ? { width: 0, height: 2 } : undefined,
                marginBottom: 1,
              }}
            >
              {icon}
            </Text>
            <Text
              style={{
                color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                fontWeight: isActive ? '700' : '500',
                fontSize: isActive ? 9 : 8,
                marginTop: 2,
                textShadowColor: isActive ? theme.colors.accentGlow : 'transparent',
                textShadowRadius: isActive ? 8 : 0,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              {TAB_LABELS[tabName] || tabName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 66,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(0,200,160,0.16)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    position: 'relative',
  },
  activeTab: {
    // Optionally add more visual cues for active tab
  },
  activeUnderline: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#FF6A00',
  },
});
