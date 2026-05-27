// Story graph data model for the Patrol mechanic.
//
// A Patrol is a walked playthrough of a StoryGraph. The player begins at the
// graph's `entryNodeId` and advances through nodes by satisfying their
// `trigger` conditions in the real world (distance walked, time elapsed, dwell
// at a location). Some nodes are passive narrative beats; others demand a
// Choice or a hidden Chance Moment (skill check) before the graph can advance.
//
// This file is the contract between content authors and the engine. Authors
// only touch `content/*.ts`. The engine in `services/patrolEngine.ts` only
// reads the shapes defined here.

import type { AppThemeKey } from '../../../theme/themes';

// ---- Stat sheet (D&D-flavoured but never surfaced as "D&D" or "d20") ------

export type StatKey = 'insight' | 'vigilance' | 'stamina' | 'resolve';

export interface PatrolStats {
  /** Reading the room - clues, motives, anomalies. */
  insight: number;
  /** Spotting motion, pattern breaks, things-out-of-place. */
  vigilance: number;
  /** Endurance under exertion. */
  stamina: number;
  /** Composure under pressure. */
  resolve: number;
}

export const DEFAULT_STATS: PatrolStats = {
  insight: 10,
  vigilance: 10,
  stamina: 10,
  resolve: 10,
};

// ---- Triggers - conditions the engine evaluates each tick ------------------

export type Trigger =
  | { kind: 'immediate' }
  | { kind: 'distance'; meters: number }
  | { kind: 'distancePct'; pct: number }
  | { kind: 'timeElapsed'; seconds: number }
  | { kind: 'dwell'; seconds: number; radiusMeters: number }
  | { kind: 'steps'; count: number }
  | { kind: 'manual' };

// ---- Beat content ---------------------------------------------------------

export interface BeatContent {
  eyebrow?: string;
  heading: string;
  body: string[];
  speaker?: string;
  register?: 'narrative' | 'fieldlog' | 'transmission';
  accentOverride?: string;
  voicePersona?: string;
}

// ---- Choices --------------------------------------------------------------

export interface Choice {
  id: string;
  label: string;
  hint?: string;
  voiceAliases?: string[];
  nextNodeId: string;
  effects?: Partial<PatrolStats>;
  flags?: string[];
  requires?: ChoiceRequirement;
  /** Ledger side-effects (affinity / observations) applied on commit. */
  ledger?: LedgerEmitSpec;
}

export interface ChoiceRequirement {
  minStats?: Partial<PatrolStats>;
  hasFlag?: string;
  lacksFlag?: string;
  /** Require an NPC affinity threshold. */
  minAffinity?: { npcId: string; min: number };
  /** Require the player to have completed a prior chapter. */
  requiresChapter?: string;
}

// ---- Chance Moment (the hidden d20) ---------------------------------------

export type ChanceOutcomeKind = 'failure' | 'partial' | 'success';

export interface ChanceCheck {
  stat: StatKey;
  dc: number;
  prompt: string;
  outcomes: Record<ChanceOutcomeKind, ChanceOutcome>;
}

export interface ChanceOutcome {
  nextNodeId: string;
  effects?: Partial<PatrolStats>;
  flags?: string[];
  caption: string;
  /** Ledger side-effects applied on this outcome. */
  ledger?: LedgerEmitSpec;
}

// ---- Ledger emit spec (authored on nodes / choices / outcomes) ------------
//
// Mirror of LedgerEmit on LedgerService, but kept in the schema so authors
// can declare them inside content/*.ts without importing the service.

export interface LedgerObservationSpec {
  label: string;
  detail?: string;
  npcId?: string;
}

export interface LedgerNpcSpec {
  id: string;
  name: string;
  skin?: string;
}

export interface LedgerEmitSpec {
  affinity?: Record<string, number>;
  meetNpcs?: LedgerNpcSpec[];
  observations?: LedgerObservationSpec[];
  tagNpcs?: Record<string, string[]>;
}

// ---- Nodes ----------------------------------------------------------------

export type StoryNode = BeatNode | ChoiceNode | ChanceNode | EndNode;

interface NodeBase {
  id: string;
  trigger: Trigger;
  minDwellSeconds?: number;
  onActivate?: Partial<PatrolStats>;
  flags?: string[];
  /** Ledger side-effects applied when this node activates. */
  ledger?: LedgerEmitSpec;
}

export interface BeatNode extends NodeBase {
  type: 'beat';
  content: BeatContent;
  nextNodeId: string;
}

export interface ChoiceNode extends NodeBase {
  type: 'choice';
  content: BeatContent;
  choices: Choice[];
  timeoutSeconds?: number;
}

export interface ChanceNode extends NodeBase {
  type: 'chance';
  content: BeatContent;
  check: ChanceCheck;
  revealDelaySeconds?: number;
}

export interface EndNode extends NodeBase {
  type: 'end';
  content: BeatContent;
  debrief: {
    closingLine: string;
    nextChapterTease?: string;
  };
}

// ---- Micro-tells (in-walk audio drops between major beats) ----------------
//
// Authored as a pool per chapter. The MicroTellService picks one every
// 30-60s during quiet stretches (no choice/chance/beat firing). Each tell
// is short (5-15 seconds spoken).

export interface MicroTell {
  id: string;
  /** Short spoken line, narrative voice. */
  line: string;
  /** Weight in the random pick - higher = more common. Defaults to 1. */
  weight?: number;
  /** Optional flags set when this tell fires (rarely used). */
  flags?: string[];
  /** Optional ledger emit when this tell fires. */
  ledger?: LedgerEmitSpec;
  /** Don't fire this tell before the player has walked this fraction of the chapter. */
  minDistancePct?: number;
  /** Don't fire this tell after the player has walked this fraction. */
  maxDistancePct?: number;
  /** Gate this tell behind a flag. */
  requiresFlag?: string;
  /** Don't fire if this flag is set. */
  excludedByFlag?: string;
}

// ---- Stances --------------------------------------------------------------

export interface Stance {
  id: string;
  /** Short label rendered on the ritual screen. */
  label: string;
  /** One-line description shown beneath the label. */
  hint: string;
  /** Stat modifiers applied at patrol start. */
  effects: Partial<PatrolStats>;
  /** Flag written into the session log. */
  flag: string;
  /** Short in-voice TTS line spoken once the player picks this stance. */
  spokenAffirmation: string;
}



// ---- GPS sit-and-listen anchors ------------------------------------------
//
// Real-world anchors the engine can detect from waypoints. When the player
// lingers within `radiusMeters` of the anchor for `dwellSeconds`, the engine
// fires an Anchor moment - a side-channel beat that speaks themed copy
// without leaving the current node. Each anchor fires once per session.
//
// Two anchor sources are supported:
//   1. Explicit lat/lon - precise pin (used when an author wants a specific
//      bench near a known training route).
//   2. Tag-based - radiusMeters from the player's current location at the
//      time the chapter begins, used to surface "the next bench you find"
//      type beats that work anywhere.

export type GpsAnchorKind = 'explicit' | 'opportunistic';

export interface GpsAnchor {
  id: string;
  kind: GpsAnchorKind;
  /** Required if kind === 'explicit'. */
  lat?: number;
  lon?: number;
  /** Trigger radius. Defaults to 25m. */
  radiusMeters?: number;
  /** Seconds the player must be inside the radius. Defaults to 30. */
  dwellSeconds?: number;
  /** Beat copy spoken when the anchor fires. */
  content: BeatContent;
  /** Optional ledger emit. */
  ledger?: LedgerEmitSpec;
  /** Optional flags written when the anchor fires. */
  flags?: string[];
  /** Don't fire before this fraction of chapter completion. */
  minDistancePct?: number;
  /** Don't fire after this fraction. */
  maxDistancePct?: number;
}

// ---- Graph ----------------------------------------------------------------

export interface StoryGraph {
  id: string;
  skin: AppThemeKey;
  chapter: number;
  title: string;
  subtitle: string;
  briefing: string[];
  targetMeters: number;
  targetSeconds: number;
  entryNodeId: string;
  nodes: Record<string, StoryNode>;
  /** Optional pool of in-walk micro-tells. */
  microTells?: MicroTell[];
  /** Optional stance options for this chapter; if omitted, uses skin defaults. */
  stances?: Stance[];
  /** Chapter ids that must be completed before this chapter unlocks on Home. */
  requiresChapters?: string[];
  /** Sit-and-listen anchors detected from real-world location. */
  gpsAnchors?: GpsAnchor[];
}
