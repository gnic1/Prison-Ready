import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { themes } from '../theme/themes';

const TABS = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Missions', label: 'Missions', icon: '🎯' },
  { key: 'Badges', label: 'Badges', icon: '🏅' },
  { key: 'Progress', label: 'Progress', icon: '📈' },
  { key: 'Profile', label: 'Profile', icon: '👤' },
];

export function GameBottomNav({ activeTab, onTabPress, themeKey = 'prison' }) {
  const theme = themes[themeKey];
  return (
    <View style={[styles.nav, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.accent }] }>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          <Text style={{
            fontSize: 24,
            textShadowColor: activeTab === tab.key ? theme.colors.accentGlow : 'transparent',
            textShadowRadius: activeTab === tab.key ? 8 : 0,
            color: activeTab === tab.key ? theme.colors.accent : theme.colors.textSecondary,
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
          }}>{tab.icon}</Text>
          <Text style={{
            color: activeTab === tab.key ? theme.colors.accent : theme.colors.textSecondary,
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            fontSize: 12,
            marginTop: 2,
          }}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    borderTopWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
});
