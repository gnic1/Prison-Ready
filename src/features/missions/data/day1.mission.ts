import { Mission } from '../models/mission.types';
import { MissionTrigger } from '../models/trigger.types';
import { Artifact } from '../models/artifact.types';
import { ReportBack } from '../models/reportBack.types';

export const DAY1_MISSION_ID = 'mission_day1';
export const DAY1_ROUTE_ID = 'route_day1';
export const DAY1_ARTIFACT_ID = 'artifact_baseline_memory';
export const DAY1_REPORTBACK_ID = 'reportback_day1';

export const day1Mission: Mission = {
  id: DAY1_MISSION_ID,
  chapterId: 'chapter1',
  dayNumber: 1,
  title: 'The Familiar Route',
  theme: 'memory',
  status: 'not_started',
  durationMin: 15,
  durationMax: 25,
  distanceMinMiles: 1.0,
  distanceMaxMiles: 1.5,
  routeId: DAY1_ROUTE_ID,
  introAudioKey: 'AUDIO_PLACEHOLDER_INTRO',
  completionAudioKey: 'AUDIO_PLACEHOLDER_COMPLETE',
  primaryArtifactId: DAY1_ARTIFACT_ID,
  reportBackId: DAY1_REPORTBACK_ID,
  triggerIds: ['trigger_start', 'trigger_artifact', 'trigger_complete'],
};

export const day1Triggers: MissionTrigger[] = [
  {
    id: 'trigger_start',
    missionId: DAY1_MISSION_ID,
    type: 'storyBeat',
    progressMin: 0,
    progressMax: 0,
    requiresSafeState: true,
    audioKey: 'AUDIO_PLACEHOLDER_INTRO',
    text: 'Begin your familiar route.',
    firesOnce: true,
    priority: 1,
  },
  {
    id: 'trigger_artifact',
    missionId: DAY1_MISSION_ID,
    type: 'artifactReveal',
    progressMin: 50,
    progressMax: 60,
    requiresSafeState: true,
    audioKey: 'AUDIO_PLACEHOLDER_ARTIFACT',
    text: 'You notice something odd about a house...',
    firesOnce: true,
    priority: 2,
  },
  {
    id: 'trigger_complete',
    missionId: DAY1_MISSION_ID,
    type: 'missionComplete',
    progressMin: 100,
    progressMax: 100,
    requiresSafeState: true,
    audioKey: 'AUDIO_PLACEHOLDER_COMPLETE',
    text: 'Mission complete. Time to report back.',
    firesOnce: true,
    priority: 3,
  },
];

export const day1Artifact: Artifact = {
  id: DAY1_ARTIFACT_ID,
  missionId: DAY1_MISSION_ID,
  chapterId: 'chapter1',
  type: 'clue',
  title: 'Baseline Memory',
  summary: 'There is a house on your route you cannot clearly remember.',
  truthLevel: 'partial',
  rarity: 1,
  isGuaranteed: true,
  unlockCondition: 'Complete Day 1 mission',
};

export const day1ReportBack: ReportBack = {
  id: DAY1_REPORTBACK_ID,
  missionId: DAY1_MISSION_ID,
  prompt: 'Anything stand out on your route?',
  options: [
    {
      id: 'opt1',
      label: 'No, everything felt normal',
      outcomeType: 'incorrect',
      outcomeBand: 'poor',
      outcomeText: 'You report nothing unusual. The opportunity to notice the anomaly slips by, and you feel a nagging sense of unease.',
    },
    {
      id: 'opt2',
      label: 'There is a house I cannot picture clearly',
      outcomeType: 'correct',
      outcomeBand: 'strong',
      outcomeText: 'You describe the house you cannot remember. HQ is impressed by your observation and sends you a clue: a photo of the house, with a note to investigate further.',
    },
    {
      id: 'opt3',
      label: 'I think I just forgot something',
      outcomeType: 'partial',
      outcomeBand: 'partial',
      outcomeText: 'You mention a vague sense of forgetting. HQ encourages you to pay closer attention next time and logs your report.',
    },
  ],
};
