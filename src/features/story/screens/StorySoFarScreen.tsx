import React from 'react';
import { View, Text, Button } from 'react-native';
import { SessionService } from '../../missions/services/sessionService';
import * as Speech from 'expo-speech';

export const StorySoFarScreen = ({ navigation }: any) => {
  const session = SessionService.getSession();

  if (!session || !session.recapEntry) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Story So Far</Text>
        <Text>No recap available yet. Complete a mission to see your story so far.</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleNarrate = () => {
    Speech.speak(session.recapEntry!);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Story So Far</Text>
      <Text style={{ marginVertical: 16 }}>{session.recapEntry}</Text>
      <Button title="🔊 Read Aloud" onPress={handleNarrate} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};
