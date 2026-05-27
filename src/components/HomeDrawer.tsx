// HomeDrawer — left slide-out drawer with the game's main navigation.
// Pattern follows the style-guide "vertical tabs" treatment: a list of
// pill-rows down the left, with the active item highlighted blue.
//
// Pure RN Animated + react-native-svg. No extra deps.

import React from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export interface DrawerItem {
  label: string;
  route: string;
  params?: any;
  current?: boolean;
}

interface HomeDrawerProps {
  open: boolean;
  onClose: () => void;
  items: DrawerItem[];
}

const DRAWER_WIDTH = 260;

export const HomeDrawer: React.FC<HomeDrawerProps> = ({ open, onClose, items }) => {
  const navigation = useNavigation<any>();
  const value = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(value, {
      toValue: open ? 1 : 0,
      duration: open ? 260 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, value]);

  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });
  const backdropOpacity = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
  });

  const onPick = (item: DrawerItem) => {
    if (item.current) {
      onClose();
      return;
    }
    onClose();
    setTimeout(() => {
      if (item.params) {
        navigation.navigate(item.route, item.params);
      } else {
        navigation.navigate(item.route);
      }
    }, 180);
  };

  return (
    <>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.drawer, { transform: [{ translateX }] }]}
      >
        <Text style={styles.title}>MENU</Text>
        <View style={styles.titleUnderline} />
        {items.map((it) => (
          <TouchableOpacity
            key={it.label}
            activeOpacity={0.8}
            onPress={() => onPick(it)}
            style={[styles.item, it.current ? styles.itemActive : null]}
          >
            <Text
              style={[styles.itemText, it.current ? styles.itemTextActive : null]}
            >
              {it.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={styles.footer}>PRISON READY</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: 'rgba(10,15,20,0.97)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(138,191,255,0.28)',
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  title: {
    color: '#a8c8ff',
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '800',
    paddingLeft: 6,
  },
  titleUnderline: {
    height: 1,
    backgroundColor: 'rgba(138,191,255,0.22)',
    marginVertical: 14,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(138,191,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  itemActive: {
    borderColor: '#1e90ff',
    backgroundColor: 'rgba(30,144,255,0.20)',
  },
  itemText: {
    color: '#a8b6c8',
    fontSize: 14,
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  itemTextActive: {
    color: '#ffffff',
  },
  footer: {
    color: 'rgba(168,184,200,0.55)',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default HomeDrawer;
