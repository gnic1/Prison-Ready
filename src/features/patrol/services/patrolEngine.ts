// Patrol engine - orchestrator that turns a StoryGraph into a real-world
// playthrough.

import * as Haptics from 'expo-haptics';

import type {
  ChanceLogEntry,
  ChoiceLogEntry,
  PatrolSession,
  PatrolWaypoint,
  PendingChance,
} from '../types/patrolSession';
import type {
  Choice,
  LedgerEmitSpec,
  PatrolStats,
  StoryGraph,
  StoryNode,
  Trigger,
} from '../types/storyGraph';
import { DEFAULT_STATS } from '../types/storyGraph';
import { haversineMeters, metersToSteps } from './geo';
import { resolveChance, type ChanceResolution } from './skillCheckResolver';
import { PatrolStorage } from './patrolStorage';
import { LedgerService } from './ledgerService';
import { PlayerProfileService } from './playerProfileService';

type Listener = (session: PatrolSession) => void;

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function applyStatDelta(
  stats: PatrolStats,
  delta?: Partial<PatrolStats>,
): PatrolStats {
  if (!delta) return stats;
  return {
    insight: clamp(stats.insight + (delta.insight ?? 0), 1, 30),
    vigilance: clamp(stats.vigilance + (delta.vigilance ?? 0), 1, 30),
    stamina: clamp(stats.stamina + (delta.stamina ?? 0), 1, 30),
    resolve: clamp(stats.resolve + (delta.resolve ?? 0), 1, 30),
  };
}

function defaultMinDwellFor(node: StoryNode): number {
  if (node.minDwellSeconds !== undefined) return node.minDwellSeconds;
  switch (node.type) {
    case 'beat':
      return 25;
    case 'choice':
      return 15;
    case 'chance':
      return 0;
    case 'end':
      return 0;
  }
}

export class PatrolEngine {
  private session: PatrolSession | null = null;
  private graph: StoryGraph | null = null;
  private listeners: Set<Listener> = new Set();
  private lastWaypoint: PatrolWaypoint | null = null;
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  async start(graph: StoryGraph, baseStats: PatrolStats = DEFAULT_STATS, opts?: { stanceFlag?: string; extraFlags?: string[] }): Promise<PatrolSession> {
    const now = Date.now();
    const initialFlags: string[] = [];
    if (opts?.stanceFlag) initialFlags.push(opts.stanceFlag);
    if (opts?.extraFlags?.length) initialFlags.push(...opts.extraFlags);
    const session: PatrolSession = {
      id: uid(),
      graphId: graph.id,
      skinKey: graph.skin,
      startedAt: now,
      status: 'active',
      currentNodeId: graph.entryNodeId,
      distanceMeters: 0,
      waypoints: [],
      stats: { ...baseStats },
      startStats: { ...baseStats },
      flags: initialFlags,
      choiceLog: [],
      chanceLog: [],
      visitedNodeIds: [],
      currentNodeEnteredAt: now,
    };
    this.graph = graph;
    this.session = session;
    this.lastWaypoint = null;
    this.activateCurrentNodeIfReady();
    this.startTickLoop();
    await this.persist();
    PlayerProfileService.notePatrolStarted().catch(() => {});
    return session;
  }

  async resume(graph: StoryGraph, session: PatrolSession): Promise<void> {
    this.graph = graph;
    this.session = session;
    this.lastWaypoint = session.waypoints.length
      ? session.waypoints[session.waypoints.length - 1] ?? null
      : null;
    if (
      session.status === 'active' ||
      session.status === 'awaitingChoice' ||
      session.status === 'chanceMomentPrompt' ||
      session.status === 'chanceMomentReveal'
    ) {
      this.startTickLoop();
    }
    this.emit();
  }

  async abort(): Promise<void> {
    if (!this.session) return;
    this.session = { ...this.session, status: 'aborted', endedAt: Date.now() };
    this.stopTickLoop();
    await PatrolStorage.appendHistory(this.session);
    await PatrolStorage.clearActive();
    this.emit();
  }

  async complete(): Promise<void> {
    if (!this.session || !this.graph) return;
    const completedAt = Date.now();
    this.session = { ...this.session, status: 'complete', endedAt: completedAt };
    this.stopTickLoop();
    await PatrolStorage.appendHistory(this.session);
    await PatrolStorage.clearActive();
    PlayerProfileService.notePatrolCompleted({
      chapterId: this.graph.id,
      distanceMeters: this.session.distanceMeters,
      finalStats: this.session.stats,
      startStats: this.session.startStats,
    }).catch(() => {});
    this.emit();
  }

  private startTickLoop() {
    this.stopTickLoop();
    this.tickHandle = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopTickLoop() {
    if (this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  private tick() {
    if (!this.session || !this.graph) return;
    if (
      this.session.status === 'chanceMomentPrompt' &&
      this.session.pendingChance &&
      Date.now() >= this.session.pendingChance.revealAtMs
    ) {
      this.session.status = 'chanceMomentReveal';
      this.persist();
      this.emit();
      return;
    }
    this.evaluateTriggers();
  }

  ingestLocation(coords: { lat: number; lon: number; ts?: number }) {
    if (!this.session) return;
    const ts = coords.ts ?? Date.now();
    const wp: PatrolWaypoint = {
      lat: coords.lat,
      lon: coords.lon,
      ts,
      cumMeters: this.session.distanceMeters,
    };

    if (this.lastWaypoint) {
      const delta = haversineMeters(this.lastWaypoint, wp);
      const dt = Math.max(1, (ts - this.lastWaypoint.ts) / 1000);
      const speed = delta / dt;
      if (delta < 3 || speed > 50) {
        return;
      }
      this.session.distanceMeters += delta;
      wp.cumMeters = this.session.distanceMeters;
    }

    this.lastWaypoint = wp;
    const last = this.session.waypoints[this.session.waypoints.length - 1];
    if (!last || haversineMeters(last, wp) > 10 || ts - last.ts > 5000) {
      this.session.waypoints.push(wp);
    }
    this.evaluateTriggers();
    this.persist();
  }

  acknowledgeBeat(): void {
    if (!this.session || !this.graph) return;
    const node = this.graph.nodes[this.session.currentNodeId];
    if (!node) return;
    if (node.type === 'beat' && node.trigger.kind === 'manual') {
      this.advanceTo(node.nextNodeId);
    }
  }

  commitChoice(choiceId: string): { rejected?: string } | void {
    if (!this.session || !this.graph) return;
    const node = this.graph.nodes[this.session.currentNodeId];
    if (!node || node.type !== 'choice') return;
    const choice = node.choices.find((c) => c.id === choiceId);
    if (!choice) return { rejected: 'Choice not found' };
    if (!this.choiceAvailable(choice)) {
      return { rejected: 'Choice unavailable' };
    }
    if (choice.effects) {
      this.session.stats = applyStatDelta(this.session.stats, choice.effects);
    }
    if (choice.flags) {
      this.session.flags = [...this.session.flags, ...choice.flags];
    }
    if (choice.ledger) {
      this.emitLedger(choice.ledger, node.id, choice.flags);
    }
    const entry: ChoiceLogEntry = {
      nodeId: node.id,
      choiceId: choice.id,
      label: choice.label,
      ts: Date.now(),
    };
    this.session.choiceLog = [...this.session.choiceLog, entry];
    this.advanceTo(choice.nextNodeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }

  choiceAvailable(choice: Choice): boolean {
    if (!this.session) return false;
    const req = choice.requires;
    if (!req) return true;
    if (req.minStats) {
      for (const k of Object.keys(req.minStats) as Array<keyof PatrolStats>) {
        if (this.session.stats[k] < (req.minStats[k] ?? 0)) return false;
      }
    }
    // hasFlag / lacksFlag look at the current session first, then fall back
    // to LedgerService.knownFlags so chapters can branch on prior chapters.
    if (req.hasFlag) {
      const inSession = this.session.flags.includes(req.hasFlag);
      const inLedger = LedgerService.hasFlag(req.hasFlag);
      if (!inSession && !inLedger) return false;
    }
    if (req.lacksFlag) {
      const inSession = this.session.flags.includes(req.lacksFlag);
      const inLedger = LedgerService.hasFlag(req.lacksFlag);
      if (inSession || inLedger) return false;
    }
    if (req.minAffinity) {
      const aff = LedgerService.affinityFor(req.minAffinity.npcId);
      if (aff < req.minAffinity.min) return false;
    }
    if (req.requiresChapter) {
      if (!PlayerProfileService.get().chaptersCompleted.includes(req.requiresChapter)) {
        return false;
      }
    }
    return true;
  }

  acknowledgeChance(): void {
    if (!this.session) return;
    const pending = this.session.pendingChance;
    if (!pending) return;
    this.session.pendingChance = undefined;
    this.advanceTo(pending.nextNodeId);
  }

  private advanceTo(nodeId: string) {
    if (!this.session || !this.graph) return;
    const next = this.graph.nodes[nodeId];
    if (!next) {
      this.session.status = 'complete';
      this.emit();
      return;
    }
    this.session.currentNodeId = nodeId;
    this.session.currentNodeEnteredAt = Date.now();
    this.session.currentNodeAnchor = this.lastWaypoint
      ? { lat: this.lastWaypoint.lat, lon: this.lastWaypoint.lon }
      : undefined;
    this.session.dwellStartedAt = undefined;
    this.persist();
    this.activateCurrentNodeIfReady();
    this.emit();
  }

  private activateCurrentNodeIfReady() {
    if (!this.session || !this.graph) return;
    const node = this.graph.nodes[this.session.currentNodeId];
    if (!node) return;
    if (this.session.visitedNodeIds.includes(node.id)) {
      this.applyStatusForNode(node);
      return;
    }
    if (this.triggerSatisfied(node)) {
      this.fireNode(node);
    } else {
      this.session.status = 'active';
    }
  }

  private fireNode(node: StoryNode) {
    if (!this.session) return;
    if (node.onActivate) {
      this.session.stats = applyStatDelta(this.session.stats, node.onActivate);
    }
    if (node.flags?.length) {
      this.session.flags = [...this.session.flags, ...node.flags];
    }
    if (node.ledger) {
      this.emitLedger(node.ledger, node.id, node.flags);
    }
    this.session.visitedNodeIds = [...this.session.visitedNodeIds, node.id];

    if (node.type === 'chance') {
      this.resolveChanceNow(node);
    } else {
      this.applyStatusForNode(node);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    this.persist();
    this.emit();
  }

  private resolveChanceNow(node: Extract<StoryNode, { type: 'chance' }>) {
    if (!this.session) return;
    const result: ChanceResolution = resolveChance(node.check, this.session.stats);
    const branch = node.check.outcomes[result.visibleOutcome];
    if (branch.effects) {
      this.session.stats = applyStatDelta(this.session.stats, branch.effects);
    }
    if (branch.flags) {
      this.session.flags = [...this.session.flags, ...branch.flags];
    }
    if (branch.ledger) {
      this.emitLedger(branch.ledger, node.id, branch.flags);
    }
    const log: ChanceLogEntry = {
      nodeId: node.id,
      stat: result.stat,
      dc: result.dc,
      roll: result.roll,
      modifier: result.modifier,
      total: result.total,
      internal: result.internal,
      visibleOutcome: result.visibleOutcome,
      ts: Date.now(),
    };
    this.session.chanceLog = [...this.session.chanceLog, log];
    const revealDelay = (node.revealDelaySeconds ?? 4) * 1000;
    const pending: PendingChance = {
      nodeId: node.id,
      result: log,
      caption: branch.caption,
      nextNodeId: branch.nextNodeId,
      revealAtMs: Date.now() + revealDelay,
    };
    this.session.pendingChance = pending;
    this.session.status = 'chanceMomentPrompt';

    const haptic =
      result.visibleOutcome === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : result.visibleOutcome === 'failure'
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning;
    Haptics.notificationAsync(haptic).catch(() => {});
  }

  private applyStatusForNode(node: StoryNode) {
    if (!this.session) return;
    if (node.type === 'choice') {
      this.session.status = 'awaitingChoice';
    } else if (node.type === 'chance') {
      this.session.status = this.session.pendingChance
        ? this.session.status
        : 'active';
    } else if (node.type === 'end') {
      this.session.status = 'complete';
    } else {
      this.session.status = 'active';
    }
  }

  private evaluateTriggers() {
    if (!this.session || !this.graph) return;
    if (
      this.session.status === 'awaitingChoice' ||
      this.session.status === 'chanceMomentPrompt' ||
      this.session.status === 'chanceMomentReveal' ||
      this.session.status === 'complete' ||
      this.session.status === 'aborted'
    ) {
      return;
    }
    const currentNode = this.graph.nodes[this.session.currentNodeId];
    if (!currentNode) return;
    if (this.session.visitedNodeIds.includes(currentNode.id)) return;

    const minDwell = defaultMinDwellFor(currentNode);
    const sinceEntered = (Date.now() - this.session.currentNodeEnteredAt) / 1000;
    if (sinceEntered < minDwell) return;

    if (this.triggerSatisfied(currentNode)) {
      this.fireNode(currentNode);
    }
  }

  private triggerSatisfied(node: StoryNode): boolean {
    if (!this.session || !this.graph) return false;
    return triggerSatisfied(node.trigger, this.session, this.lastWaypoint, this.graph);
  }

  private emitLedger(spec: LedgerEmitSpec, nodeId: string, flags?: string[]) {
    if (!this.session || !this.graph) return;
    LedgerService.emit_(spec, {
      skin: this.graph.skin,
      chapterId: this.graph.id,
      nodeId,
      flags,
    }).catch(() => {});
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.session) listener(this.session);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    if (!this.session) return;
    for (const l of this.listeners) {
      try {
        l(this.session);
      } catch {}
    }
  }

  private async persist() {
    if (this.session) {
      await PatrolStorage.saveActive(this.session);
    }
  }

  getSession(): PatrolSession | null {
    return this.session;
  }

  getGraph(): StoryGraph | null {
    return this.graph;
  }
}

export function triggerSatisfied(
  trigger: Trigger,
  session: PatrolSession,
  lastWaypoint: PatrolWaypoint | null,
  graph?: StoryGraph,
): boolean {
  switch (trigger.kind) {
    case 'immediate':
      return true;
    case 'distance':
      return session.distanceMeters >= trigger.meters;
    case 'distancePct': {
      const target = graph?.targetMeters ?? 1000;
      return session.distanceMeters >= target * trigger.pct;
    }
    case 'timeElapsed':
      return (Date.now() - session.startedAt) / 1000 >= trigger.seconds;
    case 'steps':
      return metersToSteps(session.distanceMeters) >= trigger.count;
    case 'manual':
      return false;
    case 'dwell': {
      if (!lastWaypoint || !session.currentNodeAnchor) return false;
      const inside =
        haversineMeters(lastWaypoint, session.currentNodeAnchor) <=
        trigger.radiusMeters;
      if (!inside) {
        if (session.dwellStartedAt) session.dwellStartedAt = undefined;
        return false;
      }
      if (!session.dwellStartedAt) {
        session.dwellStartedAt = Date.now();
        return false;
      }
      return (Date.now() - session.dwellStartedAt) / 1000 >= trigger.seconds;
    }
  }
}

export const patrolEngine = new PatrolEngine();
