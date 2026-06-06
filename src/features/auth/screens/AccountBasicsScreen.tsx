// AccountBasicsScreen — Neighborhood Watch reskin.
// Sign in / create account form on top of the night-suburb backdrop, using
// NW chrome and the pill CTA pattern.

import React from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import { AuthStorageService } from '../services/authStorageService';

const BG = require('../../../../assets/backgrounds/main_background.png');

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
          navigation.navigate('MissionPreferences');
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
      navigation.navigate('MissionPreferences');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.55)', 'rgba(7,16,29,0.95)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>{'‹'} BACK</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>
            {mode === 'signIn' ? 'WELCOME BACK //' : 'NEW WATCHER //'}
          </Text>
          <Text style={styles.title}>
            {mode === 'signIn'
              ? 'Sign in to your watch.'
              : 'Build the profile that carries your patrol.'}
          </Text>

          <View style={styles.formPanel}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={NW.textDim}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={NW.textDim}
            />

            {mode === 'create' ? (
              <>
                <Text style={styles.label}>DISPLAY NAME</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.input}
                  placeholder="Watcher name"
                  placeholderTextColor={NW.textDim}
                />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>AGE CONFIRMATION</Text>
                    <Text style={styles.helpText}>
                      You meet the minimum age requirement for this app.
                    </Text>
                  </View>
                  <Switch
                    value={ageConfirmed}
                    onValueChange={setAgeConfirmed}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={ageConfirmed ? NW.blueLight : '#cfd6e2'}
                  />
                </View>
              </>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={submitting}
            style={[styles.cta, submitting ? styles.ctaBusy : null]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {submitting
                ? 'WORKING…'
                : mode === 'signIn'
                ? 'CONTINUE'
                : 'CREATE & CONTINUE'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  scroll: { padding: 22, paddingTop: 56, paddingBottom: 40 },
  back: { paddingVertical: 6, alignSelf: 'flex-start' },
  backText: {
    color: NW.blueLight,
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  eyebrow: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },
  title: {
    color: NW.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 28,
    marginBottom: 18,
  },
  formPanel: {
    backgroundColor: 'rgba(16,27,41,0.78)',
    borderRadius: NW.radLg,
    borderWidth: 1,
    borderColor: NW.stroke,
    padding: 18,
    marginBottom: 22,
  },
  label: {
    color: NW.blueLight,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(7,16,29,0.55)',
    borderRadius: NW.radSm,
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: NW.text,
    fontSize: 14,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  helpText: {
    color: NW.textMuted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  cta: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  ctaBusy: { opacity: 0.6 },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
