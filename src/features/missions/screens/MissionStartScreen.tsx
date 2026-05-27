import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { MissionTranscriptPanel } from '../components/MissionTranscriptPanel';
import { MissionRepository } from '../services/missionRepository';

export default function MissionStartScreen() {
  const navigation = useNavigation<any>();
  const mission = MissionRepository.getPrimaryMission();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#09090B', '#171119', '#211406']} style={StyleSheet.absoluteFill} />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>MISSION START //</Text>
        <Text style={styles.title}>{mission.title}</Text>
        <Text style={styles.subtitle}>{mission.story}</Text>
      </View>
      <MissionTranscriptPanel
        title="Read-along briefing"
        items={mission.briefingTranscript.map((line, index) => ({
          id: `brief_${index}`,
          title: `Brief ${index + 1}`,
          text: line,
          createdAt: new Date().toISOString(),
          kind: 'brief',
          progressPercent: 0,
        }))}
        accentColor="#FF6A00"
        collapsedByDefault={false}
      />
      <PrisonButton title="Choose Mission Length" onPress={() => navigation.navigate('MissionLength')} shimmer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 68,
    paddingBottom: 34,
    gap: 18,
  },
  hero: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: 'rgba(21,17,17,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eyebrow: {
    color: '#FFB36B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  title: {
    color: '#F2F2EE',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#CBD0DB',
    fontSize: 15,
    lineHeight: 22,
  },
});
