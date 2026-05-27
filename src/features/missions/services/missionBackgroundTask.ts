import * as TaskManager from 'expo-task-manager';
import { MissionEngineService, MISSION_LOCATION_TASK } from './missionEngineService';

if (!TaskManager.isTaskDefined(MISSION_LOCATION_TASK)) {
  TaskManager.defineTask(MISSION_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      return;
    }

    const locations = Array.isArray((data as any)?.locations) ? (data as any).locations : [];
    if (!locations.length) {
      return;
    }
    await MissionEngineService.processLocationBatch(locations, 'background');
  });
}
