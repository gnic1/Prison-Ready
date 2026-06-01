// PatrolHUDScreen - the live patrol experience.

import React from 'react';
import {
  Modal,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';

// Lazy-require expo-keep-awake so the module can be missing in dev without
// failing the type-check. On device it's installed (peer dep of expo).
let useKeepAwake: () => void = () => {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useKeepAwake = require('expo-keep-awake').useKeepAwake;
} catch {
  // module not present — no-op so the screen still renders
}
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themes } from '../../../theme/themes';
import { PatrolMap } from '../components/PatrolMap';
import { PatrolChyron } from '../components/PatrolChyron';
import { PatrolStatBar } from '../components/PatrolStatBar';
import { BeatCard } from '../components/BeatCard';
import { ChoicePanel } from '../components/ChoicePanel';
import { ChanceMomentPanel } from '../components/ChanceMomentPanel';
import { patrolEngine } from '../services/patrolEngine';
import { TTSService, personaForRegister } from '../services/ttsService';
import { AudioCueService } from '../services/audioCueService';
import { VoiceCommandService } from '../services/voiceCommandService';
import { MicroTellService } from '../services/microTellService';
import { GpsAnchorService } from '../services/gpsAnchorService';
import { GhostWalkerService } from '../services/ghostWalkerService';
import type { GhostWalkerPing } from '../services/remoteSyncService';
import { findGraph } from '../content';
import type { PatrolSession } from '../types/patrolSession';
import type { StoryNode } from '../types/storyGraph';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });

interface PatrolHUDRouteParams {
  graphId: string;
}

export const PatrolHUDScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as PatrolHUDRouteParams;
  const graph = findGraph(params.graphId);

  const [session, setSession] = React.useState<PatrolSession | null>(
    patrolEngine.getSession(),
  );
  useKeepAwake();
  const [now, setNow] = React.useState<number>(Date.now());
  const [permError, setPermError] = React.useState<string | null>(null);
  const [muted, setMuted] = React.useState<boolean>(TTSService.isMuted());
  const watchRef = React.useRef<Location.LocationSubscription | null>(null);
  const ghostsStartedRef = React.useRef<boolean>(false);
  const narratedNodeIdRef = React.useRef<string | null>(null);
  const narratedPhaseRef = React.useRef<string | null>(null);
  const [ghosts, setGhosts] = React.useState<GhostWalkerPing[]>([]);

  React.useEffect(() => GhostWalkerService.subscribe(setGhosts), []);

  React.useEffect(() => {
    const unsub = patrolEngine.subscribe((s) => setSession({ ...s }));
    return unsub;
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const startWatch = async () => {
        if (Platform.OS === 'web') return;
        try {
          const fg = await Location.requestForegroundPermissionsAsync();
          if (fg.status !== 'granted') {
            setPermError(
              'Location permission is required for the patrol to track distance and trigger story beats.',
            );
            return;
          }
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 2000,
              distanceInterval: 4,
            },
            (loc) => {
              patrolEngine.ingestLocation({
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
                ts: loc.timestamp,
              });
              const sess = patrolEngine.getSession();
              const g = patrolEngine.getGraph();
              if (sess && g && g.targetMeters > 0) {
                const pct = sess.distanceMeters / g.targetMeters;
                GpsAnchorService.ingestLocation(loc.coords.latitude, loc.coords.longitude, pct);
                GhostWalkerService.updateLocation(loc.coords.latitude, loc.coords.longitude);
              }
              if (!ghostsStartedRef.current && g) {
                ghostsStartedRef.current = true;
                GhostWalkerService.start({
                  lat: loc.coords.latitude,
                  lon: loc.coords.longitude,
                  radiusMeters: 500,
                  skin: g.skin,
                });
              }
            },
          );
          if (cancelled) {
            sub.remove();
            return;
          }
          watchRef.current = sub;
        } catch (err: any) {
          setPermError(err?.message ?? 'Could not start location tracking.');
        }
      };
      startWatch();
      if (graph) {
        MicroTellService.begin(graph);
        MicroTellService.setMuted(TTSService.isMuted());
        GpsAnchorService.begin({ graph });
        GpsAnchorService.setMuted(TTSService.isMuted());
      }
      return () => {
        cancelled = true;
        if (watchRef.current) {
          watchRef.current.remove();
          watchRef.current = null;
        }
        TTSService.cancelAll();
        MicroTellService.end();
        GpsAnchorService.end();
        GhostWalkerService.stop();
        ghostsStartedRef.current = false;
      };
    }, [graph]),
  );

  // Drive the micro-tell scheduler every time the session updates.
  React.useEffect(() => {
    if (!session) return;
    MicroTellService.maybeFire(session);
  }, [session?.distanceMeters, session?.status, session?.currentNodeId, session]);

  React.useEffect(() => {
    if (session?.status === 'complete' && graph) {
      AudioCueService.play('patrolEnd');
      navigation.replace('PatrolDebrief', {
        graphId: graph.id,
        sessionId: session.id,
      });
    }
  }, [session?.status, navigation, graph, session?.id]);

  React.useEffect(() => {
    if (!session || !graph || muted) return;
    const node = graph.nodes[session.currentNodeId];
    if (!node) return;
    if (node.type === 'chance') return;
    const key = node.id;
    if (narratedNodeIdRef.current === key) return;
    narratedNodeIdRef.current = key;
    AudioCueService.play('beatArrived');
    const persona = personaForRegister(node.content.register);
    const heading = node.content.heading;
    const body = node.content.body;
    TTSService.speak(heading, { persona });
    TTSService.speakParagraphs(body, { persona }).then(() => {
      if (node.type === 'choice') {
        for (const c of node.choices) {
          if (!patrolEngine.choiceAvailable(c)) continue;
          TTSService.speak(`Option: ${c.label}.`, { persona });
        }
        AudioCueService.play('attentionNeeded');
      }
    });
  }, [session?.currentNodeId, session?.status, graph, muted]);

  React.useEffect(() => {
    if (!session || !graph || muted) return;
    const node = graph.nodes[session.currentNodeId];
    if (!node || node.type !== 'chance') return;
    const status = session.status;
    const phaseKey = `${node.id}::${status}`;
    if (narratedPhaseRef.current === phaseKey) return;
    if (status === 'chanceMomentPrompt') {
      narratedPhaseRef.current = phaseKey;
      AudioCueService.play('chanceIncoming');
      const persona = personaForRegister(node.content.register);
      TTSService.speak(node.content.heading, { persona });
      TTSService.speak(node.check.prompt, { persona });
    } else if (status === 'chanceMomentReveal') {
      narratedPhaseRef.current = phaseKey;
      const cue =
        session.pendingChance?.result.visibleOutcome === 'success'
          ? 'outcomeSuccess'
          : session.pendingChance?.result.visibleOutcome === 'failure'
          ? 'outcomeFailure'
          : 'outcomePartial';
      AudioCueService.play(cue);
      const persona = personaForRegister(node.content.register);
      const caption = session.pendingChance?.caption ?? '';
      TTSService.speak(caption, { persona });
    }
  }, [session?.currentNodeId, session?.status, session?.pendingChance, graph, muted]);

  if (!graph) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Story graph not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorBtn}>
            <Text style={styles.errorBtnLabel}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const theme = themes[graph.skin];
  const accent = '#1e90ff';
  const accentGlow = '#a8c8ff';
  const borderColor = `${accent}40`;

  const elapsedSeconds = session ? (now - session.startedAt) / 1000 : 0;

  // Length-mode handling: if the player chose a TIME goal on the length
  // picker, we count down and end the patrol when the timer hits 0.
  const routeParams: any = (route?.params ?? {}) as any;
  const isTimeMode = routeParams.lengthMode === 'minutes' && typeof routeParams.lengthMinutes === 'number';
  const totalSeconds = isTimeMode ? (routeParams.lengthMinutes as number) * 60 : 0;
  const remainingSeconds = isTimeMode ? Math.max(0, totalSeconds - elapsedSeconds) : 0;

  React.useEffect(() => {
    if (!isTimeMode || !session || session.status !== 'active') return;
    if (remainingSeconds > 0) return;
    // Time is up — close the patrol.
    TTSService.cancelAll();
    patrolEngine.complete().catch(() => {});
    navigation.replace('PatrolDebrief', { graphId: graph.id });
  }, [isTimeMode, remainingSeconds, session, graph.id, navigation]);

  const node: StoryNode | undefined = session
    ? graph.nodes[session.currentNodeId]
    : undefined;

  const [showAbortModal, setShowAbortModal] = React.useState(false);
  const handleAbort = () => setShowAbortModal(true);
  const confirmAbort = async () => {
    setShowAbortModal(false);
    TTSService.cancelAll();
    await patrolEngine.abort();
    navigation.popToTop();
  };

  const handleVoiceTry = async () => {
    if (!session || !graph) return;
    const cur = graph.nodes[session.currentNodeId];
    if (!cur || cur.type !== 'choice') return;
    const candidates = cur.choices
      .filter((c) => patrolEngine.choiceAvailable(c))
      .map((c) => ({ id: c.id, label: c.label, aliases: c.voiceAliases }));
    const result = await VoiceCommandService.listen({ candidates });
    if (result.matchedId) {
      patrolEngine.commitChoice(result.matchedId);
    } else {
      AudioCueService.play('attentionNeeded');
      Alert.alert(
        'Voice not configured yet',
        'Tap your choice on screen for now. Voice input will be enabled when we move to a dev build or wire up a transcription key.',
      );
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    TTSService.setMuted(next);
    MicroTellService.setMuted(next);
  };

  const renderOverlay = () => {
    if (!session || !node) return null;
    if (node.type === 'choice') {
      return (
        <View style={styles.overlayStack}>
          <BeatCard content={node.content} accent={accent} />
          <ChoicePanel
            choices={node.choices}
            isAvailable={(c) => patrolEngine.choiceAvailable(c)}
            onPick={(id) => {
              TTSService.cancelAll();
              patrolEngine.commitChoice(id);
            }}
            accent={accent}
            onVoiceTry={handleVoiceTry}
          />
        </View>
      );
    }
    if (node.type === 'chance') {
      const phase = session.status === 'chanceMomentReveal' ? 'reveal' : 'prompt';
      return (
        <ChanceMomentPanel
          check={node.check}
          phase={phase}
          accent={accent}
          outcomeCaption={session.pendingChance?.caption}
          visibleOutcome={session.pendingChance?.result.visibleOutcome}
          onContinue={
            phase === 'reveal'
              ? () => {
                  TTSService.cancelAll();
                  patrolEngine.acknowledgeChance();
                }
              : undefined
          }
        />
      );
    }
    if (node.type === 'beat') {
      return <BeatCard content={node.content} accent={accent} />;
    }
    if (node.type === 'end') {
      return (
        <BeatCard
          content={node.content}
          accent={accent}
          cta={{
            label: 'CLOSE OUT',
            onPress: () => {
              TTSService.cancelAll();
              patrolEngine.complete();
            },
          }}
        />
      );
    }
    return null;
  };

  const eyebrow = node?.content?.eyebrow;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <PatrolMap
          waypoints={session?.waypoints ?? []}
          accent={accent}
          glow={accentGlow}
          ghosts={ghosts}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.78)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.92)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <PatrolChyron
              eyebrow={eyebrow}
              distanceMeters={session?.distanceMeters ?? 0}
              elapsedSeconds={elapsedSeconds}
              countdownSeconds={isTimeMode ? remainingSeconds : undefined}
              accent={accent}
              borderColor={borderColor}
            />
          </View>
          <TouchableOpacity
            onPress={toggleMute}
            style={[styles.iconBtn, { borderColor }]}
            accessibilityLabel={muted ? 'Unmute narration' : 'Mute narration'}
          >
            <Text style={styles.iconBtnLabel}>{muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAbort}
            style={[styles.iconBtn, { borderColor }]}
            accessibilityLabel="Abort patrol"
          >
            <Text style={styles.abortLabel}>x</Text>
          </TouchableOpacity>
        </View>

        {permError ? (
          <View style={[styles.permBanner, { borderColor: '#FFA060' }]}>
            <Text style={styles.permBannerText}>{permError}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        <ScrollView
          style={styles.overlayScroll}
          contentContainerStyle={styles.overlayContent}
          showsVerticalScrollIndicator={false}
        >
          {renderOverlay()}
        </ScrollView>

        {session ? (
          <PatrolStatBar
            stats={session.stats}
            accent={accent}
            borderColor={borderColor}
          />
        ) : null}
      
      <Modal
        visible={showAbortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAbortModal(false)}
      >
        <View style={hudModalStyles.backdrop}>
          <View style={hudModalStyles.card}>
            <Text style={hudModalStyles.eyebrow}>END PATROL? //</Text>
            <Text style={hudModalStyles.title}>Abort the walk?</Text>
            <Text style={hudModalStyles.body}>
              You’ll keep the distance you’ve walked, but the chapter
              will close unfinished.
            </Text>
            <View style={hudModalStyles.row}>
              <TouchableOpacity
                style={hudModalStyles.btnKeep}
                onPress={() => setShowAbortModal(false)}
                activeOpacity={0.85}
              >
                <Text style={hudModalStyles.btnKeepLabel}>KEEP WALKING</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={hudModalStyles.btnAbort}
                onPress={confirmAbort}
                activeOpacity={0.85}
              >
                <Text style={hudModalStyles.btnAbortLabel}>ABORT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#03050c' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  safeFill: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'stretch', gap: 8, marginTop: 6 },
  iconBtn: {
    width: 44,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(7,16,29,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnLabel: { color: '#EAE6DA', fontSize: 18 },
  abortLabel: { color: '#EAE6DA', fontSize: 22, fontWeight: '600' },
  permBanner: {
    marginTop: 8,
    backgroundColor: 'rgba(20,12,5,0.88)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  permBannerText: { color: '#FFD8B0', fontSize: 12, fontFamily: MONO },
  overlayScroll: { maxHeight: '60%' },
  overlayStack: { flex: 1, justifyContent: 'flex-end', paddingBottom: 12 },
  overlayContent: { paddingBottom: 12, gap: 12 },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#EAE6DA', fontSize: 16, marginBottom: 12 },
  errorBtn: {
    borderWidth: 1,
    borderColor: '#888',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorBtnLabel: { color: '#EAE6DA', letterSpacing: 1 },
});

const hudModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,5,12,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(16,27,41,0.97)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(138,191,255,0.45)',
    padding: 22,
  },
  eyebrow: {
    color: '#a8c8ff',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 6,
  },
  title: {
    color: '#f3f6fb',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  body: {
    color: '#a8b6c8',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  row: { flexDirection: 'row', gap: 10 },
  btnKeep: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(138,191,255,0.22)',
    alignItems: 'center',
  },
  btnKeepLabel: {
    color: '#f3f6fb',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  btnAbort: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#ff3b30',
    borderWidth: 1,
    borderColor: '#ff6259',
    alignItems: 'center',
  },
  btnAbortLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
});
