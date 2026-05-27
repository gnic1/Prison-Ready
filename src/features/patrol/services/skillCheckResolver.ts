// Hidden-d20 chance resolver.
//
// The player never sees this math. We roll d20 + stat modifier vs DC, then
// collapse the result into one of three player-visible tiers:
//
//   failure  - total < dc, OR nat 1
//   partial  - total in [dc, dc + 4]   (squeaked it)
//   success  - total >= dc + 5         (clean), OR nat 20
//
// The 4-tier internal outcome (critFail/fail/success/critSuccess) is preserved
// for debrief logging detail, but the engine and UI branch on the 3-tier
// `visibleOutcome`.

import type {
  ChanceCheck,
  ChanceOutcomeKind,
  PatrolStats,
  StatKey,
} from '../types/storyGraph';

export type InternalOutcome = 'critFail' | 'fail' | 'success' | 'critSuccess';

export interface ChanceResolution {
  /** The raw d20 roll, 1..20. */
  roll: number;
  modifier: number;
  total: number;
  dc: number;
  stat: StatKey;
  /** Granular four-bucket outcome. Logged for debrief detail. */
  internal: InternalOutcome;
  /** Three-bucket player-visible outcome that drives branching + copy. */
  visibleOutcome: ChanceOutcomeKind;
}

export function statModifier(stat: number): number {
  return Math.floor((stat - 10) / 2);
}

export interface RollOptions {
  /** Roll twice, take higher. */
  advantage?: boolean;
  /** Roll twice, take lower. */
  disadvantage?: boolean;
  /** Custom RNG for tests; defaults to Math.random. */
  rng?: () => number;
}

function rollD20(rng: () => number): number {
  return Math.floor(rng() * 20) + 1;
}

export function resolveChance(
  check: ChanceCheck,
  stats: PatrolStats,
  options: RollOptions = {},
): ChanceResolution {
  const rng = options.rng ?? Math.random;
  let roll: number;
  if (options.advantage) {
    const a = rollD20(rng);
    const b = rollD20(rng);
    roll = Math.max(a, b);
  } else if (options.disadvantage) {
    const a = rollD20(rng);
    const b = rollD20(rng);
    roll = Math.min(a, b);
  } else {
    roll = rollD20(rng);
  }

  const modifier = statModifier(stats[check.stat]);
  const total = roll + modifier;

  // Internal four-tier
  let internal: InternalOutcome;
  if (roll === 1) internal = 'critFail';
  else if (roll === 20) internal = 'critSuccess';
  else if (total >= check.dc) internal = 'success';
  else internal = 'fail';

  // Visible three-tier
  let visibleOutcome: ChanceOutcomeKind;
  if (internal === 'critFail' || internal === 'fail') {
    visibleOutcome = 'failure';
  } else if (internal === 'critSuccess' || total >= check.dc + 5) {
    visibleOutcome = 'success';
  } else {
    visibleOutcome = 'partial';
  }

  return {
    roll,
    modifier,
    total,
    dc: check.dc,
    stat: check.stat,
    internal,
    visibleOutcome,
  };
}
