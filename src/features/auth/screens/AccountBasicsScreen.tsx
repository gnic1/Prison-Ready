import React from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { AuthStorageService } from '../services/authStorageService';

export default function AccountBasicsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode === 'signIn' ? 'signIn' : 'create';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [ageConfirmed, setAgeConfirmed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        const result = await AuthStorageService.signIn(email, password);
        if (result.ok === false) {
          Alert.alert('Sign In', result.message);
          return;
        }
        if (!result.state.onboardingCompleted) {
          navigation.navigate('ThemeSelection');
        }
        return;
      }

      const result = await AuthStorageService.createAccount({
        email,
        password,
        displayName,
        ageConfirmed,
      });
      if (result.ok === false) {
        Alert.alert('Create Account', result.message);
        return;
      }
      navigation.navigate('ThemeSelection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0B10', '#161420', '#1C120A']} style={StyleSheet.absoluteFill} />
      <Text style={styles.eyebrow}>ACCOUNT BASICS //</Text>
      <Text style={styles.title}>{mode === 'signIn' ? 'Sign in to your local field profile.' : 'Build the profile that will carry your missions.'}</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholder="you@example.com" placeholderTextColor="#6C7385" />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholder="••••••••" placeholderTextColor="#6C7385" />
        {mode === 'create' ? (
          <>
            <Text style={styles.label}>Display Name</Text>
            <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} placeholder="Agent Name" placeholderTextColor="#6C7385" />
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Age Confirmation</Text>
                <Text style={styles.helpText}>Confirm that you meet the minimum age requirement for this app.</Text>
              </View>
              <Switch value={ageConfirmed} onValueChange={setAgeConfirmed} thumbColor={ageConfirmed ? '#FF6A00' : '#D7DAE2'} />
            </View>
          </>
        ) : null}
      </View>
      <PrisonButton title={mode === 'signIn' ? 'Continue' : 'Create & Continue'} onPress={handleContinue} disabled={submitting} shimmer={mode === 'create'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 32,
    backgroundColor: '#0A0B10',
  },
  eyebrow: {
    color: '#FFD27E',
    fontSize: 12,
    letterSpacing: 2.2,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: '#F3F2EE',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 20,
  },
  formCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(14,18,28,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 22,
  },
  label: {
    color: '#E8EBF5',
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#F4F4F1',
    backgroundColor: 'rgba(6,9,16,0.72)',
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpText: {
    color: '#AFB5C4',
    fontSize: 13,
    lineHeight: 18,
  },
});
