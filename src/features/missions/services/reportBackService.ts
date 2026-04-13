import { ReportBack } from '../models/reportBack.types';

let selectedOptionId: string | null = null;

export const ReportBackService = {
  selectOption(optionId: string) {
    selectedOptionId = optionId;
  },
  getSelectedOptionId() {
    return selectedOptionId;
  },
  reset() {
    selectedOptionId = null;
  },
};
