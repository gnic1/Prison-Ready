// Runtime state for an in-progress or completed patrol.

import type { ChanceOutcomeKind, PatrolStats } from './storyGraph';

export interface PatrolWaypoint {
  lat: number;
  lon: number;
  /** Unix ms timestamp from the device. */
  ts: number;
  /** Cumulative meters walked at this point. */
  cumMeters: number;
}

export interface ChoiceLogEntry {
  nodeId: string;
  choiceId: string;
  label: string;
  /** Unix ms when the choice was committed. */
  ts: number;
}

export interface ChanceLogEntry {
  nodeId: string;
  stat: keyof PatrolStats;
  dc: number;
  roll: number;
  modifier: number;
  total: number;
  /** Granular outcome - debrief-only detail. */
  internal: 'critFail' | 'fail' | 'success' | 'critSuccess';
  /** Player-visible 3-tier outcome. */
  visibleOutcome: ChanceOutcomeKind;
  /** Unix ms of resolution. */
  ts: number;
}

export type PatrolStatus =
  | 'idle'
  | 'briefing'
  | 'active'
  | 'paused'
  | 'awaitingChoice'
  | 'chanceMomentPrompt'
  | 'chanceMomentReveal'
  | 'complete'
  | 'aborted';

export interface PendingChance {
  nodeId: string;
  result: ChanceLogEntry;
  caption: string;
  nextNodeId: string;
  /** Earliest absolute time (ms) the reveal may auto-show. */
  revealAtMs: number;
}

export interface PatrolSession {
  id: string;
  graphId: string;
  skinKey: string;
  startedAt: number;
  endedAt?: number;
  status: PatrolStatus;
  /** Currently active node. */
  currentNodeId: string;
  /** Cumulative distance in meters since start. */
  distanceMeters: number;
  /** Sampled waypoints (decimated). */
  waypoints: PatrolWaypoint[];
  stats: PatrolStats;
  /** Stats at start, for delta computation in debrief. */
  startStats: PatrolStats;
  /** Flags accrued from choices and skill checks. */
  flags: string[];
  choiceLog: ChoiceLogEntry[];
  chanceLog: ChanceLogEntry[];
  /** Beat ids that have already fired (so we don't re-fire). */
  visitedNodeIds: string[];
  /** When the current node became active (ms). Used for time/dwell triggers and minDwell. */
  currentNodeEnteredAt: number;
  /** Anchor lat/lon at the moment the current node became active (for dwell triggers). */
  currentNodeAnchor?: { lat: number; lon: number };
  /** When dwell first started inside the radius. */
  dwellStartedAt?: number;
  /** When a chance node has been rolled but the reveal hasn't been shown yet. */
  pendingChance?: PendingChance;
}
