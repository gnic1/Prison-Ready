// MVP XP reward logic for Day 1 mission
let xp = 0;

export const RewardService = {
  getXP() {
    return xp;
  },
  addXP(amount: number) {
    xp += amount;
    return xp;
  },
  reset() {
    xp = 0;
  },
};
