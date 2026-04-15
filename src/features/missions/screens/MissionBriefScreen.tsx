import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { themes } from '../../../theme/themes';

export default function MissionBriefScreen({ navigation }) {
  const theme = themes.prison;
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }] }>
        <Text style={[styles.title, { color: theme.colors.accent }]}>Mission Brief</Text>
        <Text style={[styles.summary, { color: theme.colors.textSecondary }]}>Story so far: You are about to begin your first mission. The world outside is familiar, but today, everything changes. Stay sharp, and remember: every step counts.</Text>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.gold }]}>Objective</Text>
          <Text style={{ color: theme.colors.text }}>Complete your route and return safely. Watch for clues and keep your pace steady.</Text>
        </View>
        <TouchableOpacity style={[styles.cta, { backgroundColor: theme.colors.accent }]} onPress={() => navigation.navigate('MissionDay1')}>
          <Text style={[styles.ctaText, { color: theme.colors.text }]}>Start Mission</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
    width: '90%',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  summary: { fontSize: 15, marginBottom: 18 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cta: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF6A00',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: { fontSize: 17, fontWeight: 'bold' },
});
