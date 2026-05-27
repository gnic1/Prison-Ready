// LedgerService - the player's persistent "what I have learned about this
// world" memory. Two things live here:
//
//   1. NPC affinity sheet (npcId -> integer score, clamped). Story authors
//      emit affinity deltas via beats / choices / chance outcomes. Future
//      chapters branch on these so the world "remembers" you.
//
//   2. Observations dossier - timestamped facts the player has noticed.
//      Surfaced in the LedgerScreen as a timeline. Used to backfill flavor
//      ("you noted that the lapper times his lap to the south-tower rotation")
//      and to support future detective-y mechanics where the player assembles
//      conclusions from accumulated clues.
//
// Authoring API: LedgerEmit on a node fires when the node activates. Choice
// effects fire when the choice is committed. ChanceOutcome.effects fire on
// reveal. All three are unified into a single emit() call site in the engine.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ledger.v1';
const AFFINITY_MIN = -10;
const AFFINITY_MAX = 10;

export interface NpcRecord {
  id: string;
  /** Display name shown in the LedgerScreen. */
  name: string;
  /** Skin this NPC belongs to (prison/agent/transmission). Optional. */
  skin?: string;
  /** Affinity score, clamped to [-10, 10]. Negative = hostile, positive = trusted. */
  affinity: number;
  /** Last time this NPC's record changed (ms). */
  updatedAt: number;
  /** Free-form tags the engine has noted: 'met', 'spoken-to', 'helped', etc. */
  tags: string[];
}

export interface ObservationEntry {
  id: string;
  /** Skin context (for filtering in UI). */
  skin?: string;
  /** Chapter that produced this observation. */
  chapterId?: string;
  /** Node that produced it. */
  nodeId?: string;
  /** Short label shown in the timeline. */
  label: string;
  /** Optional longer-form note. */
  detail?: string;
  /** Unix ms. */
  ts: number;
  /** Optional NPC linkage. */
  npcId?: string;
}

export interface LedgerState {
  schema: 1;
  npcs: Record<string, NpcRecord>;
  observations: ObservationEntry[];
  /** Flags ever seen by the ledger. Useful for cross-chapter gating. */
  knownFlags: string[];
  updatedAt: number;
}

export interface LedgerEmit {
  /** NPC affinity deltas to apply. Keyed by npc id. */
  affinity?: Record<string, number>;
  /** NPC records to upsert (creates if missing). */
  meetNpcs?: Array<Pick<NpcRecord, 'id' | 'name' | 'skin'>>;
  /** New observations to record. */
  observations?: Array<Omit<ObservationEntry, 'id' | 'ts'>>;
  /** Tags to add to NPC records (keyed by npc id, value = tag list). */
  tagNpcs?: Record<string, string[]>;
}

type Listener = (state: LedgerState) => void;

function clampAffinity(n: number): number {
  return Math.max(AFFINITY_MIN, Math.min(AFFINITY_MAX, n));
}

function uid(): string {
  return `obs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultState(): LedgerState {
  return {
    schema: 1,
    npcs: {},
    observations: [],
    knownFlags: [],
    updatedAt: Date.now(),
  };
}

class LedgerServiceImpl {
  private state: LedgerState = defaultState();
  private loaded = false;
  private listeners: Set<Listener> = new Set();

  async load(): Promise<LedgerState> {
    if (this.loaded) return this.state;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LedgerState;
        if (parsed && parsed.schema === 1) {
          this.state = parsed;
        }
      }
    } catch {
      // Best-effort.
    }
    this.loaded = true;
    this.emit();
    return this.state;
  }

  get(): LedgerState {
    return this.state;
  }

  affinityFor(npcId: string): number {
    return this.state.npcs[npcId]?.affinity ?? 0;
  }

  hasMet(npcId: string): boolean {
    return Boolean(this.state.npcs[npcId]);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * The single entry point that the engine calls. Idempotent except for the
   * observations array, which always appends.
   */
  async emit_(emit: LedgerEmit, ctx?: { skin?: string; chapterId?: string; nodeId?: string; flags?: string[] }): Promise<void> {
    let npcs = { ...this.state.npcs };

    if (emit.meetNpcs) {
      for (const m of emit.meetNpcs) {
        const existing = npcs[m.id];
        if (!existing) {
          npcs[m.id] = {
            id: m.id,
            name: m.name,
            skin: m.skin ?? ctx?.skin,
            affinity: 0,
            updatedAt: Date.now(),
            tags: ['met'],
          };
        }
      }
    }

    if (emit.affinity) {
      for (const [npcId, delta] of Object.entries(emit.affinity)) {
        const cur = npcs[npcId];
        if (!cur) {
          npcs[npcId] = {
            id: npcId,
            name: npcId,
            skin: ctx?.skin,
            affinity: clampAffinity(delta),
            updatedAt: Date.now(),
            tags: ['met'],
          };
        } else {
          npcs[npcId] = {
            ...cur,
            affinity: clampAffinity(cur.affinity + delta),
            updatedAt: Date.now(),
          };
        }
      }
    }

    if (emit.tagNpcs) {
      for (const [npcId, tags] of Object.entries(emit.tagNpcs)) {
        const cur = npcs[npcId];
        if (cur) {
          const merged = Array.from(new Set([...cur.tags, ...tags]));
          npcs[npcId] = { ...cur, tags: merged, updatedAt: Date.now() };
        }
      }
    }

    let observations = this.state.observations;
    if (emit.observations && emit.observations.length) {
      const newOnes: ObservationEntry[] = emit.observations.map((o) => ({
        id: uid(),
        skin: o.skin ?? ctx?.skin,
        chapterId: o.chapterId ?? ctx?.chapterId,
        nodeId: o.nodeId ?? ctx?.nodeId,
        label: o.label,
        detail: o.detail,
        npcId: o.npcId,
        ts: Date.now(),
      }));
      observations = [...newOnes, ...observations].slice(0, 500);
    }

    let knownFlags = this.state.knownFlags;
    if (ctx?.flags && ctx.flags.length) {
      const merged = Array.from(new Set([...knownFlags, ...ctx.flags]));
      knownFlags = merged;
    }

    this.state = {
      ...this.state,
      npcs,
      observations,
      knownFlags,
      updatedAt: Date.now(),
    };
    await this.persist();
    this.emit();
  }

  hasFlag(flag: string): boolean {
    return this.state.knownFlags.includes(flag);
  }

  /** Dev/test reset. */
  async reset(): Promise<void> {
    this.state = defaultState();
    await this.persist();
    this.emit();
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(this.state));
    } catch {
      // Best-effort.
    }
  }

  private emit(): void {
    for (const l of this.listeners) {
      try {
        l(this.state);
      } catch {}
    }
  }
}

export const LedgerService = new LedgerServiceImpl();
