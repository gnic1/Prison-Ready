
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { day1ReportBack } from '../../missions/data/day1.mission';
import { ReportBackService } from '../../missions/services/reportBackService';
import { SessionService } from '../../missions/services/sessionService';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';

export const ReportBackScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const session = SessionService.getSession();

  // Only allow Report Back if session is completed (not paused/abandoned)
  if (!session || session.status !== 'completed') {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#b77' }}>Mission incomplete or not available for Report Back.</Text>
        <Button title="Back to Mission" onPress={() => navigation.navigate('MissionDay1')} />
      </View>
    );
  }

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
  };

  const handleSubmit = () => {
    if (!selected) return;
    ReportBackService.selectOption(selected);
    // Find the selected option for outcome band and text
    const option = day1ReportBack.options.find(opt => opt.id === selected);
    if (option) {
      // Recap entry for story so far
      const recapEntry = `Last time: ${option.outcomeText} (Result: ${option.outcomeBand})`;
      SessionService.completeSession(
        SessionService.getSession()?.artifactIdsEarned[0] || '',
        selected,
        option.outcomeBand,
        recapEntry
      );
    }
    setSubmitted(true);
  };

  const handleNarrate = () => {
    if (!selected) return;
    const option = day1ReportBack.options.find(opt => opt.id === selected);
    if (option) {
      Speech.speak(option.outcomeText);
    }
  };

  if (submitted && selected) {
    const option = day1ReportBack.options.find(opt => opt.id === selected);
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Mission Outcome</Text>
        <Text style={{ marginVertical: 16 }}>{option?.outcomeText}</Text>
        <Button title="🔊 Read Aloud" onPress={handleNarrate} />
        <Button title="Continue" onPress={() => navigation.navigate('Artifacts')} />
      </View>
    );
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{day1ReportBack.prompt}</Text>
      {day1ReportBack.options.map(opt => (
        <Button
          key={opt.id}
          title={opt.label}
          onPress={() => handleSelect(opt.id)}
          color={selected === opt.id ? 'green' : undefined}
        />
      ))}
      <Button title="Submit" onPress={handleSubmit} disabled={!selected} />
    </View>
  );
};
