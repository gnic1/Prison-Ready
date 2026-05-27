// GpsAnchorService - the "sit-and-listen" detector.
//
// While a patrol is active, the HUD pipes raw location samples here. The
// service tracks dwell time inside each authored anchor's radius. When the
// dwell threshold is met, it fires the anchor's beat content as themed TTS
// and writes the side-effects (flags, ledger) through the same channels the
// engine uses.
//
// Anchors fire at most once per session. The service resets per-patrol.
//
// Two kinds of anchor:
//   - 'explicit' anchors have lat/lon authored. The service watches for the
//     player to enter the radius.
//   - 'opportunistic' anchors are seeded from the player's first location
//     sample at chapter start, so the next ~25m of dwell anywhere creates
//     an in-fiction "sit-and-listen" moment without needing fixed POIs.

import type { GpsAnchor, StoryGraph } from '../types/storyGraph';
import { LedgerService } from './ledgerService';
import { TTSService, personaForRegister } from './ttsService';
import { AudioCueService } from './audioCueService';
import { haversineMeters } from './geo';

interface AnchorState {
  anchor: GpsAnchor;
  /** Resolved lat/lon - either explicit or opportunistic-seed. */
  lat: number;
  lon: number;
  radiusMeters: number;
  dwellSeconds: number;
  fired: boolean;
  dwellStartedAt: number | null;
}

interface BeginArgs {
  graph: StoryGraph;
  initialLat?: number;
  initialLon?: number;
}

class GpsAnchorServiceImpl {
  private states: AnchorState[] = [];
  private graph: StoryGraph | null = null;
  private muted = false;

  begin(args: BeginArgs): void {
    this.graph = args.graph;
    const anchors = args.graph.gpsAnchors ?? [];
    this.states = anchors.map((a) => {
      const radius = a.radiusMeters ?? 25;
      const dwell = a.dwellSeconds ?? 30;
      let lat: number | undefined = a.lat;
      let lon: number | undefined = a.lon;
      if (a.kind === 'opportunistic') {
        // Seed from initial location if we have one; otherwise defer until first
        // location sample comes in (handled in ingestLocation).
        lat = args.initialLat;
        lon = args.initialLon;
      }
      return {
        anchor: a,
        lat: lat ?? Number.NaN,
        lon: lon ?? Number.NaN,
        radiusMeters: radius,
        dwellSeconds: dwell,
        fired: false,
        dwellStartedAt: null,
      };
    });
  }

  end(): void {
    this.states = [];
    this.graph = null;
  }

  setMuted(m: boolean): void {
    this.muted = m;
  }

  ingestLocation(lat: number, lon: number, distancePct: number): void {
    if (!this.graph || this.states.length === 0) return;
    for (const s of this.states) {
      if (s.fired) continue;
      // Late opportunistic seeding.
      if (Number.isNaN(s.lat) || Number.isNaN(s.lon)) {
        if (s.anchor.kind === 'opportunistic') {
          s.lat = lat;
          s.lon = lon;
        }
        continue;
      }
      // Honor distance gates.
      if (s.anchor.minDistancePct !== undefined && distancePct < s.anchor.minDistancePct) continue;
      if (s.anchor.maxDistancePct !== undefined && distancePct > s.anchor.maxDistancePct) continue;

      const dist = haversineMeters({ lat, lon }, { lat: s.lat, lon: s.lon });
      const inside = dist <= s.radiusMeters;
      const now = Date.now();
      if (!inside) {
        s.dwellStartedAt = null;
        continue;
      }
      if (s.dwellStartedAt === null) {
        s.dwellStartedAt = now;
        continue;
      }
      const dwelledSec = (now - s.dwellStartedAt) / 1000;
      if (dwelledSec >= s.dwellSeconds) {
        s.fired = true;
        this.fire(s);
      }
    }
  }

  private fire(s: AnchorState): void {
    if (this.muted) return;
    const content = s.anchor.content;
    AudioCueService.play('beatArrived').catch(() => {});
    const persona = personaForRegister(content.register);
    if (content.heading) TTSService.speak(content.heading, { persona });
    if (content.body && content.body.length) {
      TTSService.speakParagraphs(content.body, { persona }).catch(() => {});
    }
    if (s.anchor.ledger && this.graph) {
      LedgerService.emit_(s.anchor.ledger, {
        skin: this.graph.skin,
        chapterId: this.graph.id,
        nodeId: `gpsAnchor:${s.anchor.id}`,
        flags: s.anchor.flags,
      }).catch(() => {});
    }
  }
}

export const GpsAnchorService = new GpsAnchorServiceImpl();
