// MicroTellService - the "dense reward density" layer.
//
// While the player is walking between major beats, this service drops short
// in-voice lines into TTS every ~30-60 seconds (with jitter). Pulled from
// graph.microTells with weighted random selection, gated by distance %, flag
// requirements, and one-shot-per-patrol semantics.
//
// Gates - we do NOT speak a tell when:
//   - a chance moment is in prompt or reveal phase
//   - the player is on a choice node awaiting input
//   - the engine is between nodes and TTS is already speaking
//   - the player has just heard a tell in the last N seconds
//
// The service is fire-and-forget. It does not mutate the session; the engine
// owns flags via the LedgerEmit pathway. If a tell has flags / ledger, the
// service still fires those side-effects through the LedgerService directly.

import type { MicroTell, StoryGraph } from '../types/storyGraph';
import type { PatrolSession } from '../types/patrolSession';
import { LedgerService } from './ledgerService';
import { TTSService } from './ttsService';
import { AudioCueService } from './audioCueService';

const MIN_GAP_SECONDS = 30;
const MAX_GAP_SECONDS = 60;
const QUIET_WINDOW_AFTER_BEAT_SECONDS = 6; // breathing room after a beat finishes

interface Schedule {
  nextEarliestMs: number;
  firedIds: Set<string>;
  rollingActive: boolean;
}

class MicroTellServiceImpl {
  private schedule: Schedule = {
    nextEarliestMs: 0,
    firedIds: new Set(),
    rollingActive: false,
  };
  private graph: StoryGraph | null = null;
  private muted = false;

  /** Begin tracking a new patrol. Resets internal state. */
  begin(graph: StoryGraph): void {
    this.graph = graph;
    this.schedule = {
      nextEarliestMs: Date.now() + this.jitteredGap(),
      firedIds: new Set(),
      rollingActive: true,
    };
  }

  end(): void {
    this.schedule.rollingActive = false;
    this.graph = null;
  }

  setMuted(m: boolean): void {
    this.muted = m;
  }

  /**
   * Called on every patrol session update from the HUD. Decides whether to
   * fire a tell. Safe to call frequently - the gap timer + status gates
   * prevent over-firing.
   */
  maybeFire(session: PatrolSession): void {
    if (this.muted) return;
    if (!this.graph || !this.schedule.rollingActive) return;
    if (!this.statusIsQuiet(session)) return;
    if (Date.now() < this.schedule.nextEarliestMs) return;
    if (TTSService.isSpeaking()) {
      // Already speaking. Slide the next earliest back a few seconds so we
      // don't pile on top of an active beat.
      this.schedule.nextEarliestMs = Date.now() + 5000;
      return;
    }

    const tells = this.graph.microTells ?? [];
    if (tells.length === 0) return;

    const pct = this.graph.targetMeters > 0
      ? session.distanceMeters / this.graph.targetMeters
      : 0;
    const candidates = tells.filter((t) => this.eligible(t, pct, session));
    if (candidates.length === 0) return;

    const pick = this.weightedPick(candidates);
    if (!pick) return;
    this.schedule.firedIds.add(pick.id);
    this.schedule.nextEarliestMs = Date.now() + this.jitteredGap();
    this.fire(pick);
  }

  // ---------------------------------------------------------------- helpers

  private statusIsQuiet(session: PatrolSession): boolean {
    if (session.status !== 'active') return false;
    // Also require the player has been on the current node for a moment so
    // the tell doesn't step on the heels of the beat narration.
    const sinceEntered = (Date.now() - session.currentNodeEnteredAt) / 1000;
    return sinceEntered >= QUIET_WINDOW_AFTER_BEAT_SECONDS;
  }

  private eligible(t: MicroTell, pct: number, session: PatrolSession): boolean {
    if (this.schedule.firedIds.has(t.id)) return false;
    if (t.minDistancePct !== undefined && pct < t.minDistancePct) return false;
    if (t.maxDistancePct !== undefined && pct > t.maxDistancePct) return false;
    if (t.requiresFlag && !session.flags.includes(t.requiresFlag)) return false;
    if (t.excludedByFlag && session.flags.includes(t.excludedByFlag)) return false;
    return true;
  }

  private weightedPick(candidates: MicroTell[]): MicroTell | null {
    const total = candidates.reduce((s, c) => s + (c.weight ?? 1), 0);
    if (total <= 0) return null;
    let r = Math.random() * total;
    for (const c of candidates) {
      r -= c.weight ?? 1;
      if (r <= 0) return c;
    }
    return candidates[candidates.length - 1] ?? null;
  }

  private fire(tell: MicroTell): void {
    AudioCueService.play('beatArrived').catch(() => {});
    TTSService.speak(tell.line, { persona: 'narrator' });
    if (tell.ledger && this.graph) {
      LedgerService.emit_(tell.ledger, {
        skin: this.graph.skin,
        chapterId: this.graph.id,
        nodeId: `microTell:${tell.id}`,
        flags: tell.flags,
      }).catch(() => {});
    }
  }

  private jitteredGap(): number {
    const base = MIN_GAP_SECONDS + Math.random() * (MAX_GAP_SECONDS - MIN_GAP_SECONDS);
    return Math.round(base * 1000);
  }
}

export const MicroTellService = new MicroTellServiceImpl();
