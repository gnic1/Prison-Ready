export interface Chapter {
  id: string;
  title: string;
  theme: string;
  missionIds: string[];
  status: ChapterStatus;
  solvePrompt: string;
}

export type ChapterStatus = 'locked' | 'unlocked' | 'completed';
