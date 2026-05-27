import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrisonButton } from '../../../components/PrisonButton';
import { useNavigation } from '@react-navigation/native';

export default function DietTrackerPlaceholderScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A120F', '#131D19', '#16110A']} style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>FUTURE MODULE //</Text>
        <Text style={styles.title}>Diet Tracker</Text>
        <Text style={styles.body}>
          This slot is reserved for the nutrition companion. It will eventually handle meal planning, hydration nudges, and training-day food logs without feeling bolted onto the mission shell.
        </Text>
        <PrisonButton title="Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: 'rgba(18,21,24,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eyebrow: {
    color: '#7DE08C',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: '#F4F4EF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  body: {
    color: '#C4CBD9',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
});