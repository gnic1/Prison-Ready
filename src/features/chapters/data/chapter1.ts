import { Chapter } from '../models/chapter.types';

export const chapter1: Chapter = {
  id: 'chapter1',
  title: 'The House That Wasn\'t There',
  theme: 'memory',
  missionIds: ['mission_day1'], // Hardcoded to break circular dependency
  status: 'unlocked',
  solvePrompt: 'What is missing from your memory?',
};
