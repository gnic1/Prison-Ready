import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '..');
export const CONTENT_DIR = path.join(PROJECT_ROOT, 'content', 'missions');
export const GENERATED_RUNTIME_PATH = path.join(PROJECT_ROOT, 'src', 'features', 'missions', 'data', 'generatedContent.ts');

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function loadAuthoringMissions() {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();

  const missions = [];
  for (const fileName of files) {
    const fullPath = path.join(CONTENT_DIR, fileName);
    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    missions.push({ fileName, fullPath, mission: parsed });
  }
  return missions;
}

export function validateMissionAuthoring(mission) {
  assert(typeof mission.id === 'string' && mission.id.trim(), 'Mission id is required.');
  assert(typeof mission.title === 'string' && mission.title.trim(), `Mission ${mission.id} needs a title.`);
  assert(typeof mission.chapterId === 'string' && mission.chapterId.trim(), `Mission ${mission.id} needs chapterId.`);
  assert(typeof mission.routeId === 'string' && mission.routeId.trim(), `Mission ${mission.id} needs routeId.`);
  assert(Array.isArray(mission.beats) && mission.beats.length > 0, `Mission ${mission.id} needs at least one beat.`);
  assert(mission.artifact?.id, `Mission ${mission.id} needs an artifact id.`);
  assert(mission.reportBack?.id, `Mission ${mission.id} needs a report-back id.`);
  assert(Array.isArray(mission.reportBack?.options) && mission.reportBack.options.length > 0, `Mission ${mission.id} needs report-back options.`);

  mission.beats.forEach((beat, index) => {
    assert(typeof beat.id === 'string' && beat.id.trim(), `Mission ${mission.id} beat ${index + 1} needs an id.`);
    assert(beat.trigger?.type === 'time' || beat.trigger?.type === 'progress', `Mission ${mission.id} beat ${beat.id} needs a valid trigger type.`);
    if (beat.trigger.type === 'time') {
      assert(typeof beat.trigger.atSec === 'number', `Mission ${mission.id} beat ${beat.id} needs trigger.atSec.`);
    }
    if (beat.trigger.type === 'progress') {
      assert(typeof beat.trigger.atPercent === 'number', `Mission ${mission.id} beat ${beat.id} needs trigger.atPercent.`);
    }
  });
}

function toMissionTriggerType(kind) {
  if (kind === 'artifact') {
    return 'artifactReveal';
  }
  if (kind === 'missionComplete') {
    return 'missionComplete';
  }
  return 'storyBeat';
}

function toTrigger(beat, missionId, priority) {
  const trigger = {
    id: beat.id,
    missionId,
    type: toMissionTriggerType(beat.kind),
    progressMin: beat.trigger.type === 'progress' ? Math.max(0, Math.min(100, beat.trigger.atPercent)) : 0,
    progressMax: beat.trigger.type === 'progress' ? Math.max(0, Math.min(100, beat.trigger.atPercent)) : 0,
    activationMode: beat.trigger.type,
    timeSec: beat.trigger.type === 'time' ? beat.trigger.atSec : undefined,
    requiresSafeState: true,
    audioKey: beat.audioKey || 'AUDIO_PLACEHOLDER',
    title: beat.speaker || beat.title || beat.kind,
    text: beat.kind === 'sideMissionStart' && beat.sideMissionId
      ? `Side Mission: ${beat.sideMissionId}. ${beat.text || ''}`.trim()
      : beat.text || '',
    firesOnce: true,
    priority
  };
  return trigger;
}

export function compileMissionAuthoring(authoringMission) {
  validateMissionAuthoring(authoringMission);

  const overview = authoringMission.overview || {};
  const mission = {
    id: authoringMission.id,
    chapterId: authoringMission.chapterId,
    dayNumber: authoringMission.dayNumber || 1,
    title: authoringMission.title,
    theme: authoringMission.theme || 'mystery',
    status: authoringMission.status || 'not_started',
    durationMin: overview.durationMin || overview.targetMinutes || 30,
    durationMax: overview.durationMax || overview.targetMinutes || 30,
    distanceMinMiles: overview.distanceMinMiles || 1,
    distanceMaxMiles: overview.distanceMaxMiles || overview.distanceMinMiles || 1.5,
    routeId: authoringMission.routeId,
    introAudioKey: authoringMission.introAudioKey || 'AUDIO_PLACEHOLDER_INTRO',
    completionAudioKey: authoringMission.completionAudioKey || 'AUDIO_PLACEHOLDER_COMPLETE',
    primaryArtifactId: authoringMission.artifact.id,
    reportBackId: authoringMission.reportBack.id,
    triggerIds: authoringMission.beats.map((beat) => beat.id),
    story: authoringMission.story || '',
    briefingTranscript: safeArray(authoringMission.briefingTranscript)
  };

  const triggers = authoringMission.beats.map((beat, index) => toTrigger(beat, authoringMission.id, index + 1));
  const hasCompletionTrigger = triggers.some((trigger) => trigger.type === 'missionComplete');
  if (!hasCompletionTrigger) {
    triggers.push({
      id: `${authoringMission.id}_auto_complete`,
      missionId: authoringMission.id,
      type: 'missionComplete',
      progressMin: 100,
      progressMax: 100,
      activationMode: 'progress',
      timeSec: undefined,
      requiresSafeState: true,
      audioKey: authoringMission.completionAudioKey || 'AUDIO_PLACEHOLDER_COMPLETE',
      title: 'Mission complete',
      text: 'Mission complete. Time to report back.',
      firesOnce: true,
      priority: triggers.length + 1
    });
    mission.triggerIds.push(`${authoringMission.id}_auto_complete`);
  }

  const artifact = {
    id: authoringMission.artifact.id,
    missionId: authoringMission.id,
    chapterId: authoringMission.chapterId,
    type: authoringMission.artifact.type || 'clue',
    title: authoringMission.artifact.title,
    summary: authoringMission.artifact.summary,
    truthLevel: authoringMission.artifact.truthLevel || 'partial',
    rarity: authoringMission.artifact.rarity || 1,
    isGuaranteed: authoringMission.artifact.isGuaranteed !== false,
    unlockCondition: authoringMission.artifact.unlockCondition || 'Complete the mission.'
  };

  const reportBack = {
    id: authoringMission.reportBack.id,
    missionId: authoringMission.id,
    prompt: authoringMission.reportBack.prompt,
    options: safeArray(authoringMission.reportBack.options)
  };

  return {
    mission,
    triggers,
    artifact,
    reportBack
  };
}

function buildRuntimeFileSource(compiledMissions) {
  return `import { Mission } from '../models/mission.types';
import { MissionTrigger } from '../models/trigger.types';
import { Artifact } from '../models/artifact.types';
import { ReportBack } from '../models/reportBack.types';

export interface RuntimeMissionContent {
  mission: Mission;
  triggers: MissionTrigger[];
  artifact: Artifact;
  reportBack: ReportBack;
}

export const generatedMissionContent: RuntimeMissionContent[] = ${JSON.stringify(compiledMissions, null, 2)} as RuntimeMissionContent[];
`;
}

export async function writeGeneratedRuntimeFile(compiledMissions) {
  const source = buildRuntimeFileSource(compiledMissions);
  await fs.mkdir(path.dirname(GENERATED_RUNTIME_PATH), { recursive: true });
  await fs.writeFile(GENERATED_RUNTIME_PATH, source, 'utf8');
}

export async function compileAllMissions() {
  const loaded = await loadAuthoringMissions();
  const compiled = loaded.map(({ mission }) => compileMissionAuthoring(mission));
  await writeGeneratedRuntimeFile(compiled);
  return compiled;
}
