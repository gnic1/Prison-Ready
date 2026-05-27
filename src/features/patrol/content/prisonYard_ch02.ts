// Prison Yard - Chapter 2: "The Lapper Makes Eye Contact"
//
// Demonstrates the Phase-1 systems end-to-end:
//   * Ledger memory: NPC 'lapper' is met, gains affinity from Ch.1 outcomes
//     (saw.tell.* and saw.tell.partial flow through knownFlags).
//   * Affinity-gated choices: a high-affinity choice exists that low-affinity
//     players will literally not see.
//   * Micro-tells: a sizeable pool fires during the longer quiet stretches.
//   * Stance memory: opening beat references the stance the player picked.
//   * RequiresChapter gate: needs prisonYardCh01 in chaptersCompleted.

import type { StoryGraph } from '../types/storyGraph';

export const prisonYardChapter2: StoryGraph = {
  id: 'prison.ch02.eyeContact',
  skin: 'prison',
  chapter: 2,
  title: 'Eye Contact',
  subtitle: 'Day 2 // The yard has noticed',
  requiresChapters: ['prison.ch01.readTheYard'],
  briefing: [
    'Second morning. You wake to the same fluorescent hum and the smell of bleach-soaked concrete. Your jumpsuit still itches in the seams. The CO running the block this morning is not the one from yesterday.',
    'You’ve been here long enough to be a face. Not long enough to be a name. The yard is going to test which one matters more.',
  ],
  targetMeters: 2000,
  targetSeconds: 1650,
  entryNodeId: 'morning',

  microTells: [
    {
      id: 'mt.cigarette',
      line: 'Someone is smoking near the wall. The cigarette is not lit. He just wants something in his hand.',
      weight: 1.0,
      minDistancePct: 0.05,
      maxDistancePct: 0.55,
    },
    {
      id: 'mt.cough',
      line: 'A cough echoes off the concrete and dies. Nobody turns toward it.',
      weight: 1.0,
      minDistancePct: 0.05,
    },
    {
      id: 'mt.shoeScuff',
      line: 'A shoe scuffs the line painted around the basketball court. The shoe belongs to a CO. He pretends he didn’t.',
      weight: 0.8,
      minDistancePct: 0.10,
    },
    {
      id: 'mt.benchOpen',
      line: 'The bench is open today. That is not nothing. Yesterday it was four men deep.',
      weight: 1.2,
      minDistancePct: 0.10,
      maxDistancePct: 0.6,
    },
    {
      id: 'mt.lapperPace',
      line: 'You catch the lapper’s pace out of the corner of your eye. Ninety-three seconds. Three seconds slower than yesterday.',
      weight: 1.4,
      minDistancePct: 0.15,
    },
    {
      id: 'mt.newGuy',
      line: 'A new guy is doing his first lap. He freezes for half a beat in the doorway. You did the same thing.',
      weight: 0.9,
      minDistancePct: 0.20,
      maxDistancePct: 0.7,
    },
    {
      id: 'mt.towerRotation',
      line: 'The south tower CO turns ninety degrees on the count. A man near the weights pivots a half-step the other way at exactly the same time.',
      weight: 1.1,
      minDistancePct: 0.25,
    },
    {
      id: 'mt.silentLaugh',
      line: 'One of the bench guys is laughing without making a sound. Nobody is talking to him.',
      weight: 0.7,
      minDistancePct: 0.30,
    },
    {
      id: 'mt.ashAgain',
      line: 'Cigarette ash on the bench again. Same spot. Same brand.',
      weight: 0.8,
      minDistancePct: 0.35,
      maxDistancePct: 0.75,
    },
    {
      id: 'mt.weatherBreak',
      line: 'A cloud passes over the yard. The temperature drops two degrees and the conversations get quieter for ten seconds.',
      weight: 0.6,
      minDistancePct: 0.40,
    },
    {
      id: 'mt.heatLine',
      line: 'Heat shimmer off the basketball court. A man at the bench keeps glancing at the same far corner.',
      weight: 0.9,
      minDistancePct: 0.45,
    },
    {
      id: 'mt.coWatching',
      line: 'A CO is watching you. Not noting you - watching. There is a difference.',
      weight: 1.5,
      minDistancePct: 0.50,
    },
  ],

  nodes: {
    // 0% - opens with stance acknowledgement
    morning: {
      id: 'morning',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'MORNING //',
        heading: 'Same door. Different room.',
        register: 'narrative',
        body: [
          'The yard door slams behind you the same way. The sound bounces three times and dies the same way.',
          'Two things are different. Your jumpsuit doesn’t squeak anymore - you’re carrying yourself like someone whose seams have worn in. And the lapper is already on the perimeter, mid-stride, watching the door.',
          'He watches it for half a second after you walk through. Half a second is still a lot.',
        ],
      },
      ledger: {
        meetNpcs: [
          { id: 'lapper', name: 'The Lapper', skin: 'prison' },
        ],
        affinity: { lapper: 1 },
        observations: [
          {
            label: 'The lapper watched the door for half a second after I came through.',
            detail: 'Yesterday it was half a second mid-pass. Today it was at the door.',
            npcId: 'lapper',
          },
        ],
      },
      flags: ['ch02.entered'],
      nextNodeId: 'firstPass',
    },

    // 12% - approaches first overlap with the lapper. Branches on prior knowledge.
    firstPass: {
      id: 'firstPass',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.12 },
      minDwellSeconds: 35,
      content: {
        eyebrow: 'OVERLAP //',
        heading: 'You are going to pass him.',
        register: 'narrative',
        body: [
          'The perimeter is tight enough that you and the lapper are about to cross. He is walking against your direction. He could look down. He could look past you. Both of those have happened to other men.',
          'Three feet of concrete between you. Two feet. One.',
        ],
      },
      onActivate: { vigilance: 1 },
      nextNodeId: 'eyeContactChoice',
    },

    // 18% - the choice. Affinity from Ch.1 gates a third option.
    eyeContactChoice: {
      id: 'eyeContactChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.18 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'He looks at you. What do you give him back?',
        register: 'narrative',
        body: [
          'It is a full look this time. No half-second pivot. He sees you. He waits for what you give him.',
          'Day two is too early to make friends. Day two is also too early to make enemies. Pick something.',
        ],
      },
      choices: [
        {
          id: 'looksAway',
          label: 'Look away',
          hint: 'Safest. He notes that you noted him.',
          voiceAliases: ['away', 'down', 'look away', 'first', 'one'],
          nextNodeId: 'afterEye',
          effects: { resolve: 1, insight: -1 },
          flags: ['lapper.lookedAway'],
          ledger: {
            affinity: { lapper: -1 },
            tagNpcs: { lapper: ['cautious'] },
          },
        },
        {
          id: 'holdsEye',
          label: 'Hold the look',
          hint: 'Reads as confident. Also reads as challenging.',
          voiceAliases: ['hold', 'eye contact', 'meet', 'second', 'two'],
          nextNodeId: 'afterEye',
          effects: { vigilance: 1, resolve: -1 },
          flags: ['lapper.heldEye'],
          ledger: {
            affinity: { lapper: 2 },
            tagNpcs: { lapper: ['acknowledged'] },
          },
        },
        {
          id: 'smallNod',
          label: 'Small nod',
          hint: 'Only available if he already trusts you a little.',
          voiceAliases: ['nod', 'small nod', 'third', 'three'],
          nextNodeId: 'lapperNods',
          effects: { insight: 1, vigilance: 1 },
          flags: ['lapper.nodded'],
          requires: { minAffinity: { npcId: 'lapper', min: 1 } },
          ledger: {
            affinity: { lapper: 3 },
            tagNpcs: { lapper: ['trusted'] },
          },
        },
      ],
    },

    afterEye: {
      id: 'afterEye',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'AFTER //',
        heading: 'He keeps walking.',
        register: 'narrative',
        body: [
          'He keeps walking. So do you. Two steps later, you both know exactly what just happened.',
          'You will pass him again in ninety seconds. You will have to decide again.',
        ],
      },
      nextNodeId: 'walkAndWatch',
    },

    lapperNods: {
      id: 'lapperNods',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'AFTER //',
        heading: 'He nods back.',
        register: 'narrative',
        body: [
          'It is one degree of head movement. Anybody watching - and somebody is always watching - would not have seen it.',
          'You saw it. He saw you see it.',
          'You are walking the same yard as everyone else and a different yard now too.',
        ],
      },
      ledger: {
        affinity: { lapper: 2 },
        observations: [
          {
            label: 'The lapper nodded back. A single degree of head movement.',
            detail: 'This is the first time anyone in this yard has acknowledged me without being forced to.',
            npcId: 'lapper',
          },
        ],
      },
      onActivate: { insight: 1, resolve: 1 },
      flags: ['lapper.rapport'],
      nextNodeId: 'walkAndWatch',
    },

    // 35% - long quiet stretch where the micro-tells live
    walkAndWatch: {
      id: 'walkAndWatch',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.35 },
      minDwellSeconds: 50,
      content: {
        eyebrow: 'QUIET //',
        heading: 'You walk and you read the room.',
        register: 'narrative',
        body: [
          'Your legs have remembered. Your breath is even. The yard is showing you its rhythm one piece at a time, and the rhythm is different from yesterday in small ways that add up.',
          'Keep walking. The yard will keep talking.',
        ],
      },
      nextNodeId: 'spotCheck2',
    },

    // 55% - the chance moment of the chapter
    spotCheck2: {
      id: 'spotCheck2',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.55 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'SOMETHING //',
        heading: 'The CO is watching the lapper.',
        register: 'narrative',
        body: [
          'You catch it because you have been counting the lapper’s pace. The CO in the south tower is also counting it. He has been counting it since you walked in.',
        ],
      },
      check: {
        stat: 'insight',
        dc: 14,
        prompt:
          'The CO’s eyes track the lapper for one full lap, then snap away to nothing in particular. He is timing something. The lapper has noticed. The lapper has not let himself look up.',
        outcomes: {
          success: {
            nextNodeId: 'caughtPattern',
            effects: { insight: 1, vigilance: 1 },
            flags: ['saw.coPattern'],
            caption:
              'You see it all at once: the CO is timing the lapper’s laps against a wristwatch he is not supposed to have. The lapper knows. The lapper has known for weeks. Whatever is about to happen has been built over weeks and you are walking into the middle of week eleven.',
            ledger: {
              affinity: { lapper: 1 },
              observations: [
                {
                  label: 'The CO in the south tower is timing the lapper.',
                  detail: 'Wristwatch he isn’t supposed to have. The lapper has known for weeks.',
                },
              ],
              meetNpcs: [{ id: 'co.southTower', name: 'South-Tower CO', skin: 'prison' }],
              tagNpcs: { 'co.southTower': ['timing', 'unauthorized-watch'] },
            },
          },
          partial: {
            nextNodeId: 'caughtPattern',
            effects: { insight: 1 },
            flags: ['saw.coPattern.partial'],
            caption:
              'You catch the CO’s eyes tracking the lapper. The wristwatch you don’t see; the eleven weeks you don’t know. But you know the watching is purposeful, and the lapper’s pace is not actually exercise.',
            ledger: {
              affinity: { lapper: 1 },
              observations: [
                {
                  label: 'The CO’s eyes track the lapper.',
                  detail: 'Purposeful watching. The lapper isn’t exercising.',
                },
              ],
              meetNpcs: [{ id: 'co.southTower', name: 'South-Tower CO', skin: 'prison' }],
            },
          },
          failure: {
            nextNodeId: 'missedPattern',
            effects: { resolve: -1 },
            flags: ['missed.coPattern'],
            caption:
              'A man near the bench coughs at exactly the wrong moment and your attention slides. By the time you look back the south tower is empty of intention and the lapper is just a lapper again.',
            ledger: {
              observations: [
                {
                  label: 'Something happened with the south-tower CO. I missed it.',
                  detail: 'A man at the bench coughed and I looked the wrong way.',
                },
              ],
            },
          },
        },
      },
    },

    caughtPattern: {
      id: 'caughtPattern',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You don’t look up.',
        register: 'narrative',
        body: [
          'The trick is to know without showing you know. You keep your eyes on the basketball court for two laps and let the picture build inside your head instead of out where the CO can see it.',
          'The yard is bigger than the yard now. Walls are thinner than they look.',
        ],
      },
      nextNodeId: 'closeLap',
    },

    missedPattern: {
      id: 'missedPattern',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'AFTER //',
        heading: 'The yard closes up.',
        register: 'narrative',
        body: [
          'Whatever was visible for a moment is now invisible again. The lapper does another lap. The CO does another sweep. You walk and you do not know what you walked past.',
          'Tomorrow you will be looking for it.',
        ],
      },
      nextNodeId: 'closeLap',
    },

    // 78% - the wind-down stretch
    closeLap: {
      id: 'closeLap',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.78 },
      minDwellSeconds: 50,
      content: {
        eyebrow: 'CLOSE //',
        heading: 'Last laps before count.',
        register: 'narrative',
        body: [
          'Eight minutes to count. Your shoulders are loose. The yard’s rhythm is yours now, at least for the next four minutes of perimeter.',
          'The lapper has slowed. You are pacing him without meaning to. He notices. He does not change his pace.',
        ],
      },
      onActivate: { stamina: 1 },
      nextNodeId: 'finalChoice2',
    },

    // 88% - final choice with stance + affinity inflections
    finalChoice2: {
      id: 'finalChoice2',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.88 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'BEFORE COUNT //',
        heading: 'One more loop.',
        register: 'narrative',
        body: [
          'You can use the last lap to settle, or to make one more pass at something you noticed. The yard will not give you the same opening tomorrow.',
        ],
      },
      choices: [
        {
          id: 'settle',
          label: 'Settle. Get in line early.',
          hint: 'You walk into count as someone uninteresting. That is a position.',
          voiceAliases: ['settle', 'line', 'first', 'one'],
          nextNodeId: 'wrapSettle',
          effects: { resolve: 1 },
          flags: ['ch02.settled'],
          ledger: {
            observations: [{ label: 'Closed Day 2 quietly. The yard hadn’t noted me by count.' }],
          },
        },
        {
          id: 'oneMore',
          label: 'One more lap. Eye the south tower.',
          hint: 'You will not be early to count. The CO will note it.',
          voiceAliases: ['lap', 'one more', 'south tower', 'tower', 'second', 'two'],
          nextNodeId: 'wrapOneMore',
          effects: { vigilance: 1, resolve: -1 },
          flags: ['ch02.lateLap'],
          ledger: {
            observations: [
              { label: 'Took a late lap to study the south tower.', detail: 'CO noted I was late to count.' },
            ],
          },
        },
        {
          id: 'walkWithLapper',
          label: 'Pace the lapper one more lap.',
          hint: 'Only if he has begun to trust you.',
          voiceAliases: ['pace', 'walk with', 'lapper', 'third', 'three'],
          nextNodeId: 'wrapLapperWalk',
          effects: { insight: 2 },
          flags: ['ch02.walkedWithLapper'],
          requires: { minAffinity: { npcId: 'lapper', min: 3 } },
          ledger: {
            affinity: { lapper: 2 },
            tagNpcs: { lapper: ['walks-with-me'] },
            observations: [
              {
                label: 'Walked one lap in tempo with the lapper. He let me.',
                detail: 'He hasn’t walked the perimeter beside anyone in five years.',
                npcId: 'lapper',
              },
            ],
          },
        },
      ],
    },

    wrapSettle: {
      id: 'wrapSettle',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'COUNT //',
        heading: 'You make the count clean.',
        register: 'narrative',
        body: [
          'Numbers called. Doors locking. You are on no one’s list today.',
        ],
      },
      debrief: {
        closingLine:
          'You walked the same yard. The yard was not the same. That is how this works.',
        nextChapterTease:
          'Chapter 3 - The wristwatch shows up where it shouldn’t.',
      },
    },

    wrapOneMore: {
      id: 'wrapOneMore',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'COUNT //',
        heading: 'You’re last in line by a step.',
        register: 'narrative',
        body: [
          'The CO marks you a heartbeat slower than the others. You see him do it. He sees you see him do it.',
        ],
      },
      debrief: {
        closingLine:
          'You bought a second look from a CO. Sometimes that costs you. Sometimes it pays.',
        nextChapterTease:
          'Chapter 3 - The CO who marked you finds a reason to talk.',
      },
    },

    wrapLapperWalk: {
      id: 'wrapLapperWalk',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'COUNT //',
        heading: 'You walked beside him.',
        register: 'narrative',
        body: [
          'You walked one lap shoulder to shoulder with the lapper. He didn’t speak. Neither did you. The CO in the south tower did not turn his head.',
          'You are not the same kind of inmate you were when you walked in two days ago.',
        ],
      },
      debrief: {
        closingLine:
          'The yard sees you differently now. Tomorrow it will test whether the difference is real.',
        nextChapterTease:
          'Chapter 3 - The lapper passes you a word during the next walk. It is the wrong word.',
      },
    },
  },

  gpsAnchors: [
    {
      id: 'opp.firstBench',
      kind: 'opportunistic',
      radiusMeters: 25,
      dwellSeconds: 30,
      minDistancePct: 0.20,
      maxDistancePct: 0.55,
      content: {
        eyebrow: 'SIT //',
        heading: 'You stop for a moment.',
        register: 'narrative',
        body: [
          'You pause near something - a bench, a wall, a doorway. The yard rearranges itself around the stopped point and one detail you had not noticed becomes visible.',
          'The bench guys are not the same bench guys as yesterday. Two faces are new. Two faces are missing.',
        ],
      },
      flags: ['anchor.firstBench.fired'],
      ledger: {
        observations: [
          {
            label: 'Two new faces on the bench this morning. Two missing.',
            detail: 'I caught this only because I stopped moving for a minute.',
          },
        ],
      },
    },
    {
      id: 'opp.secondStop',
      kind: 'opportunistic',
      radiusMeters: 30,
      dwellSeconds: 40,
      minDistancePct: 0.60,
      maxDistancePct: 0.95,
      content: {
        eyebrow: 'SIT //',
        heading: 'You stop again.',
        register: 'narrative',
        body: [
          'The yard sounds different when you are not adding to its rhythm. A radio plays from the CO break room. Somebody is whistling without realizing they are whistling.',
          'You could stay here longer. The walk is patient.',
        ],
      },
      flags: ['anchor.secondStop.fired'],
      ledger: {
        observations: [
          {
            label: 'Heard a radio from the CO break room when I stopped to listen.',
          },
        ],
      },
    },
  ],
};
