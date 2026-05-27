// Prison Yard - Chapter 1: "Read the Yard"
//
// Premise: You\'ve just been processed into a max-security facility. Your first
// hour in the yard determines who notices you and who tries to get to you first.
// The patrol covers roughly a 1.8 km / 25-minute walk. Beats unfold at
// percentage-of-distance checkpoints; one choice forks the chapter mid-walk;
// one chance moment (hidden Vigilance check) decides whether you spot something
// the other inmates have already learned to ignore.

import type { StoryGraph } from '../types/storyGraph';

export const prisonYardChapter1: StoryGraph = {
  id: 'prison.ch01.readTheYard',
  skin: 'prison',
  chapter: 1,
  title: 'Read the Yard',
  subtitle: 'Day 1 // Intake to first count',
  briefing: [
    'They process you in twenty minutes flat. The paper jumpsuit smells like industrial bleach and someone else\u2019s nerves. The CO points you toward a steel door with the word YARD bolted above it in letters the size of your hand.',
    'You have one hour before the next count. That\u2019s how long you have to learn the room before the room learns you.',
  ],
  targetMeters: 1800,
  targetSeconds: 1500,
  entryNodeId: 'intake',

  nodes: {
    intake: {
      id: 'intake',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'INTAKE //',
        heading: 'Steel door. Sodium light. Yard.',
        register: 'narrative',
        body: [
          'The door slams behind you and the sound bounces three times before it dies. Concrete on three sides, fence on the fourth. About sixty men out here. Maybe more.',
          'Nobody looks at you directly. Everybody knows you\u2019re here.',
          'Walk. Don\u2019t freeze in the doorway. Freezing is the first thing they note.',
        ],
      },
      flags: ['intake.complete'],
      nextNodeId: 'firstSteps',
    },

    firstSteps: {
      id: 'firstSteps',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.10 },
      minDwellSeconds: 35,
      content: {
        eyebrow: 'BASELINE //',
        heading: 'You start counting.',
        register: 'narrative',
        body: [
          'Three groups along the west wall. Two on the bench by the basketball court. One man alone, doing slow laps around the perimeter. He looks at you for half a second when you pass and then looks away.',
          'Half a second is a lot.',
        ],
      },
      onActivate: { vigilance: 1 },
      nextNodeId: 'firstChoice',
    },

    firstChoice: {
      id: 'firstChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.25 },
      minDwellSeconds: 20,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Which way around the yard?',
        register: 'narrative',
        body: [
          'The perimeter splits two ways. East side runs past the weights, where the loud men live. West side runs past the bench and the man doing slow laps.',
          'Either route puts you on someone\u2019s map. Your call which.',
        ],
      },
      choices: [
        {
          id: 'east',
          label: 'East - past the weights',
          hint: 'Direct, loud, you get rated.',
          voiceAliases: ['east', 'weights', 'past the weights', 'right'],
          nextNodeId: 'eastWeights',
          effects: { stamina: 1 },
          flags: ['route.east'],
        },
        {
          id: 'west',
          label: 'West - past the lapper',
          hint: 'Quieter, slower, more reading time.',
          voiceAliases: ['west', 'lapper', 'past the lapper', 'left'],
          nextNodeId: 'westLapper',
          effects: { insight: 1 },
          flags: ['route.west'],
        },
      ],
    },

    eastWeights: {
      id: 'eastWeights',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'EAST PASSAGE //',
        heading: 'They watch the new chest.',
        register: 'narrative',
        body: [
          'The bench press creaks like a freight bogie. Three of them stop counting reps when you pass. Not eyes-up stop - chest-up stop. They\u2019re measuring whether you carry yourself like someone who has been here before.',
          'Don\u2019t hold your breath. Hold your shoulders.',
        ],
      },
      onActivate: { resolve: -1, vigilance: 1 },
      nextNodeId: 'spotCheck',
    },

    westLapper: {
      id: 'westLapper',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'WEST PASSAGE //',
        heading: 'The lapper\u2019s rhythm.',
        register: 'narrative',
        body: [
          'He does a lap every ninety seconds, near as you can count. Always against the wall, always the same pace. He\u2019s not exercising. He\u2019s timing something. Or watching something. Or both.',
          'You match his pace for half a circuit, then drop back. Don\u2019t let him notice you noticing.',
        ],
      },
      onActivate: { insight: 1 },
      nextNodeId: 'spotCheck',
    },

    spotCheck: {
      id: 'spotCheck',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.50 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'SOMETHING //',
        heading: 'A wrong note.',
        register: 'narrative',
        body: [
          'Halfway through the lap, your stomach does a small drop you can\u2019t explain. The yard hasn\u2019t changed. The yard has changed.',
        ],
      },
      check: {
        stat: 'vigilance',
        dc: 13,
        prompt:
          'You let your eyes settle without locking on anything. Cigarette ash on the bench, but the men on the bench haven\u2019t smoked in twenty minutes. The CO in the south tower is looking the wrong direction. Two men are standing closer than they were three laps ago.',
        outcomes: {
          success: {
            nextNodeId: 'caughtTell',
            effects: { vigilance: 1, insight: 1 },
            flags: ['saw.tell'],
            caption:
              'You catch all three things at once \u2014 the ash, the tower, the closing distance \u2014 and your body slows half a step before your mind does. Something is about to happen, and you have time to be somewhere else when it does.',
          },
          partial: {
            nextNodeId: 'caughtTell',
            effects: { vigilance: 1 },
            flags: ['saw.tell.partial'],
            caption:
              'You catch the men closing the distance. The ash, the tower \u2014 those land later, in pieces. It\u2019s enough. You shift your route to put a wall between you and them, and your shoulders thank you for it.',
          },
          failure: {
            nextNodeId: 'missedTell',
            effects: { vigilance: -1, resolve: -1 },
            flags: ['missed.tell'],
            caption:
              'Your eyes drift to the basketball court at the wrong second. By the time you look back, the ash has burned out, the tower\u2019s rotated, and the two men have separated like they were never standing together. You won\u2019t know what you missed until tomorrow.',
          },
        },
      },
    },

    caughtTell: {
      id: 'caughtTell',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'AFTER //',
        heading: 'The yard exhales.',
        register: 'narrative',
        body: [
          'Whatever was about to happen \u2014 doesn\u2019t. The two men split. The CO turns back. The ash is still on the bench. You are still walking.',
          'Whatever you just saw, you\u2019re going to have to learn how it works. Not today.',
        ],
      },
      nextNodeId: 'longLap',
    },

    missedTell: {
      id: 'missedTell',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You feel it pass.',
        register: 'narrative',
        body: [
          'Something happened. You can\u2019t name what. The yard\u2019s rhythm hiccupped and steadied again, and you were three steps off-tempo through the whole thing.',
          'The lapper walks past you and his face is the same as it was the first time. Yours isn\u2019t.',
        ],
      },
      nextNodeId: 'longLap',
    },

    longLap: {
      id: 'longLap',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.75 },
      minDwellSeconds: 45,
      content: {
        eyebrow: 'LONG LAP //',
        heading: 'The quiet part.',
        register: 'narrative',
        body: [
          'Twenty more minutes to count. Your legs have started to remember they\u2019re yours. Your breath has come down. The men along the wall haven\u2019t turned to watch you in two laps.',
          'You\u2019re not invisible yet. But you\u2019re not new anymore either.',
        ],
      },
      onActivate: { stamina: 1, resolve: 1 },
      nextNodeId: 'finalChoice',
    },

    finalChoice: {
      id: 'finalChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.85 },
      minDwellSeconds: 20,
      content: {
        eyebrow: 'BEFORE COUNT //',
        heading: 'One more thing before they call it.',
        register: 'narrative',
        body: [
          'Five minutes to count. You can use them two ways.',
        ],
      },
      choices: [
        {
          id: 'observeWall',
          label: 'Watch the wall',
          hint: 'Read who lines up first, last, where.',
          voiceAliases: ['watch the wall', 'wall', 'watch', 'observe', 'first option'],
          nextNodeId: 'observeWall',
          effects: { insight: 1, vigilance: 1 },
          flags: ['observed.wall'],
        },
        {
          id: 'firstIn',
          label: 'Be first to the line',
          hint: 'Get inside before the count is loud.',
          voiceAliases: ['first', 'first to the line', 'be first', 'second option', 'go in'],
          nextNodeId: 'firstIn',
          effects: { resolve: 1, stamina: 1 },
          flags: ['first.to.count'],
        },
      ],
    },

    observeWall: {
      id: 'observeWall',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'YOU WATCH //',
        heading: 'The lineup is a map.',
        register: 'narrative',
        body: [
          'They line up by group. The east-side weights crew goes first, in a clump. The bench guys are second, slow. The lapper waits until the very last second and then folds himself in like a closing parenthesis.',
          'Now you know where everyone sleeps in the count. That\u2019s a map you can use.',
        ],
      },
      nextNodeId: 'wrap',
    },

    firstIn: {
      id: 'firstIn',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'YOU MOVE //',
        heading: 'Inside before the noise.',
        register: 'narrative',
        body: [
          'You\u2019re third in line by the time the count call goes up. The CO eyes you, doesn\u2019t flag you, marks you on his clipboard.',
          'You\u2019re not on his interesting list. That is exactly where you want to be on day one.',
        ],
      },
      nextNodeId: 'wrap',
    },

    wrap: {
      id: 'wrap',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'COUNT //',
        heading: 'You make the count.',
        register: 'narrative',
        body: [
          'Numbers called. Doors locking. Day one closed.',
        ],
      },
      debrief: {
        closingLine:
          'You walked the yard once. Tomorrow you walk it again, and the yard will have changed because you walked it.',
        nextChapterTease:
          'Chapter 2 - Day 2. The lapper makes eye contact this time. You decide what to do with it.',
      },
    },
  },
};
