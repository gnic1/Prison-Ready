// GhostWalkerService - "you are not alone in the yard."
//
// Periodically polls RemoteSyncService for anonymized other-player pings near
// the current patrol location. With the default LocalOnlyBackend this always
// returns an empty list, so the overlay simply does not appear until a real
// networked backend is plugged in. When it is, the contract is:
//
//   - pings are coarse-grained (snapped to ~50m grid) - no personal identifiers
//   - the array reflects "seen within the last hour" - no live tracking
//   - the UI never names anyone - it draws faint translucent markers only
//
// The service caches the last result and notifies subscribers on every
// successful poll so consumers don't have to manage their own polling loop.

import { RemoteSyncService, type GhostWalkerPing } from './remoteSyncService';

type Listener = (pings: GhostWalkerPing[]) => void;

interface PollArgs {
  lat: number;
  lon: number;
  radiusMeters: number;
  skin?: string;
}

const DEFAULT_POLL_INTERVAL_MS = 90_000;

class GhostWalkerServiceImpl {
  private latest: GhostWalkerPing[] = [];
  private listeners: Set<Listener> = new Set();
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private currentArgs: PollArgs | null = null;
  private intervalMs = DEFAULT_POLL_INTERVAL_MS;

  /** Begin polling for ghosts near a location. Safe to call repeatedly to update location. */
  start(args: PollArgs): void {
    this.currentArgs = args;
    this.pollOnce();
    if (!this.pollHandle) {
      this.pollHandle = setInterval(() => this.pollOnce(), this.intervalMs);
    }
  }

  stop(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    this.currentArgs = null;
    this.latest = [];
    this.emit();
  }

  /** Update only the location without restarting the poll cycle. */
  updateLocation(lat: number, lon: number): void {
    if (!this.currentArgs) return;
    this.currentArgs = { ...this.currentArgs, lat, lon };
  }

  setPollInterval(ms: number): void {
    this.intervalMs = Math.max(15_000, ms);
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = setInterval(() => this.pollOnce(), this.intervalMs);
    }
  }

  getLatest(): GhostWalkerPing[] {
    return this.latest;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.latest);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async pollOnce(): Promise<void> {
    if (!this.currentArgs) return;
    try {
      const pings = await RemoteSyncService.current.fetchGhostWalkers(this.currentArgs);
      this.latest = pings;
      this.emit();
    } catch {
      // Best-effort. Empty stays empty.
    }
  }

  private emit(): void {
    for (const l of this.listeners) {
      try {
        l(this.latest);
      } catch {}
    }
  }
}

export const GhostWalkerService = new GhostWalkerServiceImpl();
