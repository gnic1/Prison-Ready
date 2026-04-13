import { day1Mission, day1Triggers, day1Artifact, day1ReportBack } from '../data/day1.mission';
import { Mission } from '../models/mission.types';
import { MissionTrigger } from '../models/trigger.types';
import { Artifact } from '../models/artifact.types';
import { ReportBack } from '../models/reportBack.types';

export const MissionRepository = {
  getMissionById(id: string): Mission | undefined {
    if (id === day1Mission.id) return day1Mission;
    return undefined;
  },
  getTriggersForMission(missionId: string): MissionTrigger[] {
    if (missionId === day1Mission.id) return day1Triggers;
    return [];
  },
  getArtifactById(id: string): Artifact | undefined {
    if (id === day1Artifact.id) return day1Artifact;
    return undefined;
  },
  getReportBackById(id: string): ReportBack | undefined {
    if (id === day1ReportBack.id) return day1ReportBack;
    return undefined;
  },
};
