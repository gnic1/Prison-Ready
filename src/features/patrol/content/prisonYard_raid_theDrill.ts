// Prison Yard - Raid Chapter: "The Drill"
//
// A flagship synchronized chapter, available only during the weekly raid
// window. The whole player community walks this together once per week. The
// in-fiction conceit: a drill has been called in the yard. The yard's rhythm
// breaks. The lapper's pattern shatters. Everything you have learned in
// chapters 1-2 is tested at higher stakes.
//
// Required state to unlock: prisonYardChapter2 in chaptersCompleted, AND a
// raid window must currently be active for the prison skin. Home gates this.
//
// Stakes: two chance moments (Vigilance + Resolve). Three endings tied to
// stance + ledger affinity.

import type { StoryGraph } from '../types/storyGraph';

export const prisonYardRaidDrill: StoryGraph = {
  id: 'prison.raid.theDrill',
  skin: 'prison',
  chapter: 99, // raid chapters live outside the normal sequence
  title: 'The Drill',
  subtitle: 'WEEKLY RAID // Yard goes loud',
  requiresChapters: ['prison.ch02.eyeContact'],
  briefing: [
    'Sirens cut through the yard at 14:00. Not the alarm - the drill horn. Every cell block is being pulled into the yard at once. Two hundred men, four directions, one square.',
    'The CO shouting orders over the PA is reading off a clipboard. The lapper has stopped walking. That is the part that matters.',
  ],
  targetMeters: 2400,
  targetSeconds: 1800,
  entryNodeId: 'sirens',

  microTells: [
    {
      id: 'mt.barkedOrder',
      line: 'A CO barks an order across the yard. Half the men move; half pretend not to hear.',
      weight: 1.2,
      minDistancePct: 0.05,
    },
    {
      id: 'mt.lapperFrozen',
      line: 'The lapper is standing perfectly still by the east wall. He has not moved in three minutes.',
      weight: 1.5,
      minDistancePct: 0.10,
      maxDistancePct: 0.55,
    },
    {
      id: 'mt.helicopterRing',
      line: 'Somewhere above the wall, a helicopter is making lazy circles. Not landing. Just watching.',
      weight: 0.9,
      minDistancePct: 0.15,
    },
    {
      id: 'mt.benchEmpty',
      line: 'The bench is empty for the first time you have seen. Even the smoker is on his feet.',
      weight: 1.0,
      minDistancePct: 0.20,
    },
    {
      id: 'mt.coCount',
      line: 'A CO is counting heads with his finger in the air. He counts wrong twice in a row.',
      weight: 1.1,
      minDistancePct: 0.30,
    },
    {
      id: 'mt.handOnElbow',
      line: 'Someone touches your elbow. Not threatening - placing. You do not look back to see who.',
      weight: 1.4,
      minDistancePct: 0.40,
      maxDistancePct: 0.70,
    },
    {
      id: 'mt.silenceDrop',
      line: 'A second of total silence opens up. Then the yard sound rushes back in like water.',
      weight: 0.8,
      minDistancePct: 0.50,
    },
    {
      id: 'mt.warden',
      line: 'The warden is standing at the south gate. He is wearing the suit he wears for press, not the one he wears for routine.',
      weight: 1.3,
      minDistancePct: 0.55,
    },
  ],

  nodes: {
    sirens: {
      id: 'sirens',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'DRILL //',
        heading: 'The horn calls everyone out.',
        register: 'narrative',
        body: [
          'The horn is a flat A. It does not mean evacuate. It does not mean stay. It means everyone in the yard inside three minutes.',
          'You are already in the yard. That puts you at the front of the line. That is a place to be careful from.',
        ],
      },
      flags: ['raid.entered'],
      nextNodeId: 'lapperFrozen',
    },

    lapperFrozen: {
      id: 'lapperFrozen',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.15 },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'PATTERN BREAK //',
        heading: 'The lapper has stopped walking.',
        register: 'narrative',
        body: [
          'Five years of laps. Every day you have ever seen him. And today, with the horn going, he is stopped against the east wall like he forgot which direction the perimeter ran.',
          'Either something is about to happen to him, or he is about to let something happen to somebody else.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [
          {
            label: 'The lapper stopped walking for the first time today. During the drill.',
            detail: 'Five years of consistency, broken on a drill day.',
            npcId: 'lapper',
          },
        ],
      },
      nextNodeId: 'firstCheckpoint',
    },

    firstCheckpoint: {
      id: 'firstCheckpoint',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.30 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'MOMENT //',
        heading: 'A line is forming. Where do you stand in it?',
        register: 'narrative',
        body: [
          'The CO is sorting men into rows by cell block. You are an unknown line on his clipboard. The two men ahead of you are old hands.',
        ],
      },
      check: {
        stat: 'vigilance',
        dc: 15,
        prompt:
          'The man directly in front of you is shifting his weight from his left foot to his right and back. Both old hands. Both watching the CO. Neither breathing the way he should be.',
        outcomes: {
          success: {
            nextNodeId: 'thirdSlot',
            effects: { vigilance: 1, insight: 1 },
            flags: ['raid.read.line'],
            caption:
              'You read it in three seconds. Both of them are positioning themselves to be on either side of the CO’s blind spot when he turns to check the next row. Whatever is going to happen, happens when his head moves.',
            ledger: {
              observations: [
                {
                  label: 'Two old hands positioned themselves around the CO’s blind spot.',
                  detail: 'They were waiting for his head to turn. I saw it before they moved.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'thirdSlot',
            effects: { vigilance: 1 },
            flags: ['raid.read.line.partial'],
            caption:
              'Something is off about how the men in front of you are breathing. You cannot name it. You feel it. You take a half-step back without meaning to.',
            ledger: {
              observations: [
                { label: 'Something was wrong with the breathing in the line. I felt it but did not name it.' },
              ],
            },
          },
          failure: {
            nextNodeId: 'missedSecond',
            effects: { resolve: -1, vigilance: -1 },
            flags: ['raid.missed.line'],
            caption:
              'You miss the cue entirely. By the time the CO turns and turns back, the rhythm has shifted in some way you cannot reconstruct. You will hear about whatever you missed later.',
            ledger: {
              observations: [
                { label: 'Something happened in the line. I did not see it. I will hear about it.' },
              ],
            },
          },
        },
      },
    },

    thirdSlot: {
      id: 'thirdSlot',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'POSITION //',
        heading: 'You step back. The CO never knows.',
        register: 'narrative',
        body: [
          'Whatever was going to happen, you removed yourself from. The line closed up around the space you opened. Neither old hand looks at you. That is its own kind of look.',
          'The lapper, across the yard, has started walking again. Slow.',
        ],
      },
      onActivate: { insight: 1 },
      nextNodeId: 'secondCheckpoint',
    },

    missedSecond: {
      id: 'missedSecond',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'TURBULENCE //',
        heading: 'A scuffle. Then nothing.',
        register: 'narrative',
        body: [
          'Two men move. The CO’s shoulder twitches. A whistle. The whole yard tightens for one second and then the yard exhales and the two men are back in line and you do not know what just happened.',
          'You are still in the line. That is the thing you came here to be.',
        ],
      },
      onActivate: { resolve: -1 },
      nextNodeId: 'secondCheckpoint',
    },

    secondCheckpoint: {
      id: 'secondCheckpoint',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.60 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'NAMED //',
        heading: 'The PA calls your name.',
        register: 'narrative',
        body: [
          'It calls four names. Yours is third. None of the other three are anyone you have met. They are calling you to step out of the line and stand by the south gate.',
        ],
      },
      check: {
        stat: 'resolve',
        dc: 14,
        prompt:
          'Walk to the gate. Keep your hands visible. Do not look at the lapper as you pass him - even though he is going to look at you. The other three men called are doing it differently than you. Two are too fast. One is too slow. Speed matters.',
        outcomes: {
          success: {
            nextNodeId: 'gateClean',
            effects: { resolve: 2 },
            flags: ['raid.passed.gate'],
            caption:
              'You walk at exactly the speed of a man who has nothing in his pockets and nothing on his mind. The CO at the gate looks at your face for a full second and then looks past you. You are in.',
            ledger: {
              observations: [
                { label: 'The PA called my name during the drill. I walked the right speed. The gate let me through.' },
              ],
            },
          },
          partial: {
            nextNodeId: 'gateClean',
            effects: { resolve: 1 },
            flags: ['raid.passed.gate.partial'],
            caption:
              'You are a half-second slow. The CO at the gate notes it. He does not flag it. He puts a small mark on his clipboard next to your name. You will see that mark again in a different week.',
          },
          failure: {
            nextNodeId: 'gateMarked',
            effects: { resolve: -2, vigilance: -1 },
            flags: ['raid.flagged.gate'],
            caption:
              'You walk too fast. Your hands close into fists at your sides and the CO at the gate sees that and his eyes go from your face to your hands and back. He waves you through. The mark on his clipboard is bigger this time.',
            ledger: {
              observations: [
                { label: 'I was visibly nervous at the gate during the drill. The CO noted it.' },
              ],
            },
          },
        },
      },
    },

    gateClean: {
      id: 'gateClean',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'INSIDE //',
        heading: 'They put you in a side hall.',
        register: 'narrative',
        body: [
          'The side hall has fluorescent light and a bench. They tell you to wait. They do not tell you why. They take the man behind you instead.',
          'You wait. You count the ceiling tiles. You note the camera in the corner. You do not look up.',
        ],
      },
      nextNodeId: 'wrap',
    },

    gateMarked: {
      id: 'gateMarked',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'INSIDE //',
        heading: 'They take you straight to a small room.',
        register: 'narrative',
        body: [
          'The room has a table and two chairs and a recorder that is already running. The CO sits across from you and does not say his name. He asks you what you saw in the yard at 14:07.',
          'You did not see anything at 14:07. The trick is going to be saying that in a way he believes.',
        ],
      },
      flags: ['raid.interview'],
      nextNodeId: 'wrap',
    },

    wrap: {
      id: 'wrap',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'AFTER //',
        heading: 'They let you back into the block.',
        register: 'narrative',
        body: [
          'The drill ends at 15:30. By 16:00 you are back in the block and three of the men who were called with you are not.',
          'You are. That is information.',
        ],
      },
      debrief: {
        closingLine:
          'You walked the raid with the rest of them. The yard will look at you differently tomorrow. So will the lapper.',
        nextChapterTease:
          'Next week’s drill is already on someone’s calendar. You are on someone else’s.',
      },
    },
  },
};
