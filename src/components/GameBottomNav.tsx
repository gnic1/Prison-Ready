// GameBottomNav — Neighborhood Watch styled bottom tab bar.
// Vertical icon + uppercase label, blue ramp on the active tab,
// dark panel chrome above with a subtle top border.

import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NW from '../theme/uiTokens';
import {
  HomeIcon,
  ProfileIcon,
  LedgerIcon,
  SettingsIcon,
} from './TabIcons';

interface GameBottomNavProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  themeKey?: string;
}

const LABEL: Record<string, string> = {
  Home: 'HOME',
  Profile: 'PROFILE',
  Ledger: 'LEDGER',
  Settings: 'SETTINGS',
};

const ICON: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Home: HomeIcon,
  Profile: ProfileIcon,
  Ledger: LedgerIcon,
  Settings: SettingsIcon,
};

export const GameBottomNav: React.FC<GameBottomNavProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  let insetsBottom = 0;
  try {
    insetsBottom = useSafeAreaInsets().bottom;
  } catch {
    insetsBottom = Platform.OS === 'ios' ? 24 : 8;
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insetsBottom, 6) }]}>
      <View style={styles.row}>
        {tabs.map((tab) => {
          const Icon = ICON[tab];
          const active = tab === activeTab;
          if (!Icon) {
            return null;
          }
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab)}
              style={[styles.tab, active ? styles.tabActive : null]}
            >
              <Icon size={22} color={active ? NW.text : NW.blueLight} />
              <Text style={[styles.label, active ? styles.labelActive : null]}>
                {LABEL[tab] ?? tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(7,16,29,0.97)',
    borderTopWidth: 1,
    borderTopColor: NW.strokeSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: NW.radSm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(30,144,255,0.18)',
    borderColor: NW.blue,
  },
  label: {
    color: NW.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 4,
  },
  labelActive: {
    color: NW.text,
  },
});

export default GameBottomNav;
