import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { themes } from '../theme/themes';

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Missions: '🎯',
  Badges: '🏅',
  Progress: '📈',
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
      {tabs.map(tabName => {
        const isActive = activeTab === tabName;
        const icon = TAB_ICONS[tabName] || '•';
        return (
          <TouchableOpacity
            key={tabName}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(tabName)}
          >
            <Text
              style={{
                fontSize: isActive ? 30 : 24,
                color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                fontWeight: isActive ? 'bold' : 'normal',
                textShadowColor: isActive ? theme.colors.accentGlow : 'transparent',
                textShadowRadius: isActive ? 16 : 0,
                textShadowOffset: isActive ? { width: 0, height: 2 } : undefined,
                marginBottom: 2,
              }}
            >
              {icon}
            </Text>
            <Text
              style={{
                color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: isActive ? 14 : 12,
                marginTop: 2,
                textShadowColor: isActive ? theme.colors.accentGlow : 'transparent',
                textShadowRadius: isActive ? 10 : 0,
                letterSpacing: 1.2,
              }}
            >
              {tabName}
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
    height: 64,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  activeTab: {
    // Optionally add more visual cues for active tab
  },
});
