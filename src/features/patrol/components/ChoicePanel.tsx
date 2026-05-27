// ChoicePanel - stacked choice cards rendered when the engine is on a
// ChoiceNode.

import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Choice } from '../types/storyGraph';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });

interface ChoicePanelProps {
  choices: Choice[];
  isAvailable: (c: Choice) => boolean;
  onPick: (choiceId: string) => void;
  accent: string;
  onVoiceTry?: () => void;
}

export const ChoicePanel: React.FC<ChoicePanelProps> = ({
  choices,
  isAvailable,
  onPick,
  accent,
  onVoiceTry,
}) => (
  <View style={styles.wrap}>
    {choices.map((c) => {
      const enabled = isAvailable(c);
      return (
        <TouchableOpacity
          key={c.id}
          activeOpacity={0.85}
          disabled={!enabled}
          onPress={() => onPick(c.id)}
          style={[
            styles.card,
            {
              borderColor: enabled ? accent : 'rgba(255,255,255,0.12)',
              opacity: enabled ? 1 : 0.45,
            },
          ]}
        >
          <Text style={[styles.label, { color: enabled ? '#F2F2F0' : '#888' }]}>
            {c.label}
          </Text>
          {c.hint ? (
            <Text style={[styles.hint, { color: enabled ? accent : '#666' }]}>
              {c.hint}
            </Text>
          ) : null}
        </TouchableOpacity>
      );
    })}
    {onVoiceTry ? (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onVoiceTry}
        style={[styles.voiceBtn, { borderColor: `${accent}88` }]}
      >
        <Text style={[styles.voiceLabel, { color: accent }]}>SAY IT</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    backgroundColor: 'rgba(12,14,18,0.95)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: { fontSize: 16, fontWeight: '600', lineHeight: 21 },
  hint: { marginTop: 6, fontSize: 11, letterSpacing: 1.1, fontFamily: MONO, fontWeight: '700' },
  voiceBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(8,10,14,0.7)',
  },
  voiceLabel: { fontSize: 12, letterSpacing: 1.6, fontFamily: MONO, fontWeight: '800' },
});
