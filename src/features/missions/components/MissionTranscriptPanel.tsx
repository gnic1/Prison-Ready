import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MissionTranscriptEntry } from '../models/missionEngine.types';

interface MissionTranscriptPanelProps {
  title: string;
  items: MissionTranscriptEntry[];
  accentColor: string;
  collapsedByDefault?: boolean;
}

export function MissionTranscriptPanel({
  title,
  items,
  accentColor,
  collapsedByDefault = true,
}: MissionTranscriptPanelProps) {
  const [collapsed, setCollapsed] = React.useState(collapsedByDefault);

  return (
    <View style={styles.panel}>
      <TouchableOpacity onPress={() => setCollapsed((value) => !value)} style={styles.headerRow}>
        <View>
          <Text style={[styles.label, { color: accentColor }]}>{title}</Text>
          <Text style={styles.meta}>{items.length} entries</Text>
        </View>
        <Text style={[styles.toggle, { color: accentColor }]}>{collapsed ? 'EXPAND' : 'COLLAPSE'}</Text>
      </TouchableOpacity>
      {!collapsed && items.map((item) => (
        <View key={item.id} style={styles.entry}>
          <Text style={styles.entryTitle}>{item.title}</Text>
          <Text style={styles.entryText}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(11,14,20,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  meta: {
    color: '#98A1B3',
    fontSize: 12,
    marginTop: 4,
  },
  toggle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  entry: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  entryTitle: {
    color: '#F2F3F6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  entryText: {
    color: '#C4CBD9',
    lineHeight: 20,
  },
});
