import { generatedMissionContent, RuntimeMissionContent } from '../data/generatedContent';
import { day1Mission, day1Triggers, day1Artifact, day1ReportBack } from '../data/day1.mission';
import { Mission } from '../models/mission.types';
import { MissionTrigger } from '../models/trigger.types';
import { Artifact } from '../models/artifact.types';
import { ReportBack } from '../models/reportBack.types';

const fallbackContent: RuntimeMissionContent = {
  mission: day1Mission,
  triggers: day1Triggers,
  artifact: day1Artifact,
  reportBack: day1ReportBack,
};

function getCatalog() {
  return generatedMissionContent.length ? generatedMissionContent : [fallbackContent];
}

function findBundleByMissionId(missionId: string) {
  return getCatalog().find((entry) => entry.mission.id === missionId);
}

export const MissionRepository = {
  getPrimaryBundle(): RuntimeMissionContent {
    return getCatalog()[0];
  },

  getMissionById(id: string): Mission | undefined {
    return findBundleByMissionId(id)?.mission;
  },

  getPrimaryMission(): Mission {
    return this.getPrimaryBundle().mission;
  },

  getTriggersForMission(missionId: string): MissionTrigger[] {
    return findBundleByMissionId(missionId)?.triggers ?? [];
  },

  getArtifactById(id: string): Artifact | undefined {
    return getCatalog().find((entry) => entry.artifact.id === id)?.artifact;
  },

  getPrimaryArtifact(): Artifact {
    return this.getPrimaryBundle().artifact;
  },

  getArtifactForMission(missionId: string): Artifact | undefined {
    return findBundleByMissionId(missionId)?.artifact;
  },

  getReportBackById(id: string): ReportBack | undefined {
    return getCatalog().find((entry) => entry.reportBack.id === id)?.reportBack;
  },

  getPrimaryReportBack(): ReportBack {
    return this.getPrimaryBundle().reportBack;
  },

  getReportBackForMission(missionId: string): ReportBack | undefined {
    return findBundleByMissionId(missionId)?.reportBack;
  },

  listMissions(): Mission[] {
    return getCatalog().map((entry) => entry.mission);
  },
};
