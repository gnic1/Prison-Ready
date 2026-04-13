
export interface ReportBackOption {
  id: string;
  label: string;
  outcomeType: 'correct' | 'incorrect' | 'partial';
  outcomeBand: 'strong' | 'partial' | 'poor';
  outcomeText: string;
}


export interface ReportBack {
  id: string;
  missionId: string;
  prompt: string;
  options: ReportBackOption[];
}
