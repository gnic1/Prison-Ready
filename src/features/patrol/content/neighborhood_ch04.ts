// Neighborhood Watch - Chapter 4: "Six Forty-Eight"
//
// The arc climax. Three nights and a dawn of the player reading the block.
// This morning the block reads back: a chalk surveillance mark on the
// player's own bottom step. The watcher is the watched. The role reversal
// is the whole chapter.
//
// Structurally this is a tail, not a patrol. At 6:48 the staging RV moves;
// the walk becomes a follow. Allies converge on the route - Janelle a block
// over, the detective drifting, Mrs. Caldwell on the phone at her window.
// Two hardest chance moments of the arc: Vigilance DC 15 (keeping the tail
// without being made) and Resolve DC 16 (the face-to-face when the RV stops).
//
// Endings branch on whether the player succeeded at the chances and on the
// final choice. A clean run closes the net quietly. A botched run seeds a
// Chapter 5. Either way the block is changed.
//
// Hard-requires Ch.3.

import type { StoryGraph } from '../types/storyGraph';

export const neighborhoodWatchChapter4: StoryGraph = {
  id: 'neighborhood.ch04.sixFortyEight',
  skin: 'neighborhood',
  chapter: 4,
  title: 'Six Forty-Eight',
  subtitle: 'Morning 2 // The watcher is watched',
  requiresChapters: ['neighborhood.ch03.sheHasBeenAwake'],
  briefing: [
    'You came out at 6:42 like you have every morning this week. Coffee, cold air, the porch. You almost did not look down.',
    'There is a chalk mark on your bottom step. A small triangle, the size of a quarter, drawn in the gray hour while you slept. You know what it means now because you have spent four days learning the grammar of small marks. It means: occupied, noted, confirmed. It means you.',
  ],
  targetMeters: 2400,
  targetSeconds: 1700,
  entryNodeId: 'theMark',

  microTells: [
    // climax-morning universals (7)
    { id: 'mt.heartRate', line: 'You can hear your own pulse for the first time on any of these walks. You make yourself breathe to a four-count.', weight: 1.4, minDistancePct: 0.05 },
    { id: 'mt.everyWindow', line: 'You find yourself reading every window now, not just the wrong ones. The habit has become the whole field of view.', weight: 1.2, minDistancePct: 0.10 },
    { id: 'mt.curtainTwitch', line: 'A curtain twitches at a house you have never logged. You log it now. Everyone is a node this morning.', weight: 1.0, minDistancePct: 0.18 },
    { id: 'mt.coldEngines', line: 'Two parked cars you pass have warm hoods. On a cold morning that is two cars that ran recently and are now waiting.', weight: 1.3, minDistancePct: 0.25 },
    { id: 'mt.matchingPace', line: 'A jogger across the street matches your pace for half a block, then peels off the moment you slow. You note the shoes.', weight: 1.3, minDistancePct: 0.35 },
    { id: 'mt.radioStatic', line: 'You catch a half-second of radio static from an open car window. Then the window goes up.', weight: 1.1, minDistancePct: 0.45 },
    { id: 'mt.schoolEmpty', line: 'The elementary school lot is empty. The RV is gone from where it was at dawn.', weight: 1.4, minDistancePct: 0.30, maxDistancePct: 0.70 },

    // gated on prior-chapter outcomes
    { id: 'mt.partnerPocket', line: 'Mrs. Caldwell’s three drawings are in your inside pocket. You can feel which one is the RV without looking.', weight: 1.3, requiresFlag: 'neighborhood.ch03.partnered', minDistancePct: 0.15 },
    { id: 'mt.detectiveWaiting', line: 'You think about the detective’s line - "we have been waiting for a call like this for two months." This is the call after the call.', weight: 1.2, requiresFlag: 'neighborhood.ch03.escalated', minDistancePct: 0.20 },
    { id: 'mt.caldwellPartnerCall', line: 'You picture Mrs. Caldwell on the phone with her late husband’s old partner. You hope he picked up.', weight: 1.1, requiresFlag: 'neighborhood.ch03.toldCaldwell', minDistancePct: 0.25 },
    { id: 'mt.rvKnown', line: 'You have read this RV before, at the school lot. You know its mud, its antenna, its parted curtain. It is not a stranger now.', weight: 1.4, requiresFlag: 'neighborhood.ch03.read.rv', minDistancePct: 0.30 },

    // late (3)
    { id: 'mt.late.allyHeadlamp', line: 'A headlamp moves a block over at your pace. You do not look at it directly. You are fairly sure it is Janelle.', weight: 1.4, minDistancePct: 0.62 },
    { id: 'mt.late.cruiserDrift', line: 'A sedan with municipal plates drifts down a parallel street at the speed of a car that is not in a hurry and is not lost.', weight: 1.3, minDistancePct: 0.72 },
    { id: 'mt.late.blockHolds', line: 'The whole block seems to be holding one breath. Then a sprinkler comes on somewhere and the spell does not break, it just gets a soundtrack.', weight: 1.0, minDistancePct: 0.82 },
  ],

  nodes: {
    // 0% - the mark
    theMark: {
      id: 'theMark',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 32,
      content: {
        eyebrow: 'YOUR STEP //',
        heading: 'A triangle in chalk.',
        register: 'narrative',
        body: [
          'You crouch like you are tying a shoe. The triangle is fresh - the chalk has not taken any dew yet, and there was dew at 5 AM. So it was drawn after five and before now. While you were on your own porch making coffee, someone was at your step.',
          'You stand up slow. You do not look around. Looking around is the tell. You sip your coffee like a person whose morning is normal, and you start to walk, because a person whose morning is normal goes for their walk.',
        ],
      },
      flags: ['neighborhood.ch04.entered', 'neighborhood.ch04.markedHouse'],
      ledger: {
        observations: [
          {
            label: 'A fresh chalk triangle on my own bottom step. Drawn between 5 AM and now.',
            detail: 'Occupied, noted, confirmed. They marked my house. I am on the map now.',
          },
        ],
      },
      nextNodeId: 'theDecision',
    },

    // ~12%
    theDecision: {
      id: 'theDecision',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.12 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'How do you carry this.',
        register: 'narrative',
        body: [
          'You have maybe ninety seconds before whatever happens at 6:48 happens. The mark on your step changes the math on all three of your usual moves.',
        ],
      },
      choices: [
        {
          id: 'walkNormal',
          label: 'Walk the route like nothing changed.',
          hint: 'Deny them the tell. Stay in the field.',
          voiceAliases: ['walk', 'normal', 'route', 'first'],
          nextNodeId: 'walkingIt',
          effects: { vigilance: 1, resolve: 1 },
          flags: ['neighborhood.ch04.walkedNormal'],
          ledger: { observations: [{ label: 'Walked the route like nothing changed. Denied them the tell.' }] },
        },
        {
          id: 'toCaldwell',
          label: 'Cut to Mrs. Caldwell’s first.',
          hint: 'Get to the one person who has done this longest.',
          voiceAliases: ['caldwell', 'kitchen', 'second'],
          nextNodeId: 'toCaldwellFirst',
          effects: { insight: 1 },
          flags: ['neighborhood.ch04.toCaldwellFirst'],
          ledger: { affinity: { mrsCaldwell: 1 } },
        },
        {
          id: 'callDetective',
          label: 'Call the detective from the porch. Now.',
          hint: 'Official, immediate, possibly slow.',
          voiceAliases: ['call', 'detective', 'third'],
          nextNodeId: 'calledFromPorch',
          effects: { resolve: 1, vigilance: -1 },
          flags: ['neighborhood.ch04.calledFromPorch'],
          ledger: { observations: [{ label: 'Called the detective from my own porch about the chalk mark.' }] },
        },
      ],
    },

    walkingIt: {
      id: 'walkingIt',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'COMPOSED //',
        heading: 'You walk your normal direction.',
        register: 'narrative',
        body: [
          'You go the way you always go. You wave at the paper carrier. You let your shoulders be a person’s shoulders and not a target’s shoulders. Whoever drew the triangle is somewhere watching to see if you saw it.',
          'You did not see it. As far as the chalk knows, you did not see it.',
        ],
      },
      onActivate: { resolve: 1 },
      nextNodeId: 'rvMoves',
    },

    toCaldwellFirst: {
      id: 'toCaldwellFirst',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'KITCHEN //',
        heading: 'She is already at the door.',
        register: 'narrative',
        body: [
          'Mrs. Caldwell opens her front door before you reach it. She is dressed. She has been up for hours. "They marked you," she says. It is not a question. "They marked my step in 2009. It means they think you are alone. You are not alone. Walk. I have the window."',
          'She closes the door. You feel watched in a new way - watched by someone on your side.',
        ],
      },
      onActivate: { insight: 1, resolve: 1 },
      ledger: {
        affinity: { mrsCaldwell: 2 },
        observations: [
          {
            label: 'Caldwell: "They marked my step in 2009. It means they think you are alone."',
            detail: 'She has the window. I am not alone.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'rvMoves',
    },

    calledFromPorch: {
      id: 'calledFromPorch',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'ON RECORD //',
        register: 'fieldlog',
        heading: 'The line picks up on two rings.',
        body: [
          '"Do not touch the mark. Do not photograph it standing still. Walk your normal route and narrate what you see; I am putting you on with a unit that is already in your area." A new voice comes on, calm, close. "Morning. Pretend I am a friend you are catching up with. Tell me where you are walking."',
          'You walk. You narrate. You have a professional in your ear and a chalk triangle at your back.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [{ label: 'Detective put me on a live line with a unit already in the area. Narrating the walk.' }],
      },
      nextNodeId: 'rvMoves',
    },

    // ~30% - the RV moves
    rvMoves: {
      id: 'rvMoves',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.30 },
      minDwellSeconds: 30,
      content: {
        eyebrow: '6:48 //',
        heading: 'An engine turns over three blocks east.',
        register: 'narrative',
        body: [
          'You hear it before you see it - a big motor catching, idling rough, then settling. The white RV noses out of a side street two blocks ahead of you and turns onto Briar. It is moving at the speed of a vehicle that does not want to be remembered.',
          'It is headed toward the Sandersons’. Or toward the school. Or toward you. The next thing you do decides which of those you find out.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [{ label: 'The RV moved at 6:48. Onto Briar, slow, deliberate.', detail: 'Headed toward the Sandersons or the school or me.' }],
      },
      nextNodeId: 'tailChoice',
    },

    // ~38%
    tailChoice: {
      id: 'tailChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.38 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Follow it, or anchor.',
        register: 'narrative',
        body: [
          'The RV is moving. You can keep eyes on it - a careful, parallel, never-directly-behind follow. You can let it go and put yourself between it and the Sandersons’ front door. You can signal Janelle and become a relay instead of a tail.',
        ],
      },
      choices: [
        {
          id: 'follow',
          label: 'Tail it. Parallel street, never directly behind.',
          hint: 'You keep eyes on. Hardest to do unseen.',
          voiceAliases: ['follow', 'tail', 'first'],
          nextNodeId: 'keepingTail',
          effects: { vigilance: 1 },
          flags: ['neighborhood.ch04.tailing'],
        },
        {
          id: 'anchorSandersons',
          label: 'Get between it and the Sandersons’.',
          hint: 'You protect the target, not chase the threat.',
          voiceAliases: ['sandersons', 'anchor', 'protect', 'second'],
          nextNodeId: 'anchored',
          effects: { resolve: 1 },
          flags: ['neighborhood.ch04.anchored'],
          ledger: { affinity: { sandersons: 1 } },
        },
        {
          id: 'relay',
          label: 'Signal Janelle. Become a relay.',
          hint: 'You hand the tail to the network.',
          voiceAliases: ['janelle', 'signal', 'relay', 'third'],
          nextNodeId: 'relaying',
          effects: { insight: 1 },
          flags: ['neighborhood.ch04.relaying'],
          requires: { minAffinity: { npcId: 'janelle', min: 1 } },
          ledger: { affinity: { janelle: 1 } },
        },
      ],
    },

    // tail path -> chance 1
    keepingTail: {
      id: 'keepingTail',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.46 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'THE TAIL //',
        heading: 'A block over, never behind.',
        register: 'narrative',
        body: [
          'You move to the parallel street and pace the RV by the gaps between houses, catching it in the slots where the lots do not have fences. This is the hardest thing you have done all week and you are doing it in running clothes with a coffee.',
        ],
      },
      check: {
        stat: 'vigilance',
        dc: 15,
        prompt:
          'Keep the tail without becoming one. Match its speed by feel, not by looking. Use the parked cars and the hedges. Never let it see the same person twice in its mirror. The RV slows at every cross street and someone inside checks the side mirror each time. You have to be a different shape every time that mirror swings - a person walking a dog you do not have, a person checking a phone, a person who lives here.',
        outcomes: {
          success: {
            nextNodeId: 'tailHeld',
            effects: { vigilance: 2 },
            flags: ['neighborhood.ch04.tail.held'],
            caption:
              'You hold it for six blocks and the mirror never catches the same you twice. You see the RV slow at the corner of Briar and Fanning, where the walkers always converge, and you understand before it stops that it is not headed to the Sandersons’ at all. The Sandersons’ were never the target. The block was the target. The watchers were mapping the watch.',
            ledger: {
              observations: [
                {
                  label: 'Held the tail six blocks. The Sandersons were never the target - the watch was.',
                  detail: 'They were mapping who walks, when, and how observant they are. We are the thing being surveilled.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'tailHeld',
            effects: { vigilance: 1 },
            flags: ['neighborhood.ch04.tail.held.partial'],
            caption:
              'You hold it for four blocks and then you have to drop back when the mirror lingers. You lose the RV for ninety seconds and find it again stopped at Briar and Fanning. You did not see where it slowed or why. You only know where it ended up.',
            ledger: {
              observations: [{ label: 'Tailed the RV four blocks, lost it, refound it stopped at Briar and Fanning.' }],
            },
          },
          failure: {
            nextNodeId: 'tailLost',
            effects: { resolve: -1, vigilance: -1 },
            flags: ['neighborhood.ch04.tail.lost'],
            caption:
              'The mirror catches you twice. You feel it the second time - the small adjustment inside the cab, the half-beat where the RV holds its speed to confirm you. You have been made. You peel off immediately, hard, into a side street, and by the time you dare to look back the RV is gone and so is your read on where it went.',
            ledger: {
              observations: [{ label: 'I was made tailing the RV. Peeled off. Lost it entirely.' }],
            },
          },
        },
      },
    },

    // anchor path -> goes to the convergence directly
    anchored: {
      id: 'anchored',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.46 },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'ANCHOR //',
        heading: 'You plant yourself near the Sandersons’.',
        register: 'narrative',
        body: [
          'You take a slow loop that keeps you within sight of the Sandersons’ front walk without standing on it. You water a strip of public grass with the dregs of your coffee. You become a fixture.',
          'The RV passes the Sandersons’ without slowing. It does not even look. Whatever it wanted, it was not the Sandersons’ front door this morning. It continues toward Briar and Fanning, where the walkers converge.',
        ],
      },
      onActivate: { resolve: 1, insight: 1 },
      ledger: {
        observations: [
          { label: 'Anchored near the Sandersons. The RV passed without slowing. They were not the target this morning.', npcId: 'sandersons' },
        ],
      },
      nextNodeId: 'convergence',
    },

    // relay path -> convergence
    relaying: {
      id: 'relaying',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.46 },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'RELAY //',
        register: 'fieldlog',
        heading: 'Two clicks to Janelle. She clicks back.',
        body: [
          '"On it. I have north. You hold center." Janelle’s voice is flat and fast. Within a minute you see her headlamp moving a block over, pacing the RV from the far side so neither of you is ever the one behind it for more than thirty seconds. You are a two-person tail now. The mirror cannot solve two people.',
          'The RV slows at Briar and Fanning, where the walkers converge, and stops.',
        ],
      },
      onActivate: { insight: 1, vigilance: 1 },
      ledger: {
        affinity: { janelle: 2 },
        observations: [{ label: 'Ran a two-person tail with Janelle. The mirror could not solve both of us.', npcId: 'janelle' }],
      },
      nextNodeId: 'convergence',
    },

    tailHeld: {
      id: 'tailHeld',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'AFTER //',
        heading: 'It stops at Briar and Fanning.',
        register: 'narrative',
        body: [
          'The RV pulls to the curb at the corner where the morning walkers always cross. The engine stays on. The parted curtain in the back parts another inch.',
          'You ease into the lee of a parked van, where you can see the corner without the corner seeing you.',
        ],
      },
      nextNodeId: 'convergence',
    },

    tailLost: {
      id: 'tailLost',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You walk the route you would have walked.',
        register: 'narrative',
        body: [
          'You make yourself finish the loop because stopping is its own signal. Your hands shake for two blocks and then stop. You did not get where the RV went. But the rest of the net is still up - Janelle, the detective, Caldwell at her window.',
          'You arrive at Briar and Fanning the long way, because everything converges at Briar and Fanning eventually.',
        ],
      },
      onActivate: { resolve: -1 },
      nextNodeId: 'convergence',
    },

    // ~64% - the net is real and you are a strand of it
    convergence: {
      id: 'convergence',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.64 },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'THE NET //',
        heading: 'You are not the only one here.',
        register: 'narrative',
        body: [
          'Janelle is a block north, walking a dog she does not own. A municipal sedan is drifting two streets over at the speed of nothing-in-particular. Your phone, if you called it in, is warm in your hand with a quiet professional still on the line. Mrs. Caldwell is a quarter mile back at a kitchen window with a phone to her ear and fourteen years of pages open on the table.',
          'For four days you thought you were one person noticing things alone. You were a strand. The net was always being woven. This morning you can see the other strands.',
        ],
      },
      onActivate: { resolve: 1, insight: 1 },
      ledger: {
        observations: [
          { label: 'The net was real. Janelle, the detective, Caldwell, me. I was a strand the whole time.' },
        ],
      },
      nextNodeId: 'theFace',
    },

    // ~74% - the highest-pressure chance of the arc
    theFace: {
      id: 'theFace',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.74 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'THE DOOR //',
        heading: 'The RV door opens.',
        register: 'narrative',
        body: [
          'Someone steps down out of the RV at the corner of Briar and Fanning. They scan the corner the way you have learned to scan a corner. Their scan is going to reach you in about four seconds. You are the closest face.',
        ],
      },
      check: {
        stat: 'resolve',
        dc: 16,
        prompt:
          'Hold. This is the whole week in four seconds. Do not look at the RV. Do not look at Janelle. Do not look at the municipal sedan. Be a person who is on a walk and has reached a corner and is deciding which way to go. Let their scan pass over you the way a scan passes over scenery. If your face does anything - recognition, fear, interest, the small private triumph of a person who knows they are winning - they will read it, because reading faces is the entire job they came here to do.',
        outcomes: {
          success: {
            nextNodeId: 'afterFace',
            effects: { resolve: 2, insight: 1 },
            flags: ['neighborhood.ch04.face.held'],
            caption:
              'Your face does nothing. You are scenery. The scan passes over you and keeps going and finds nothing to keep, and in that nothing you get everything: a clear three-second look at the person, the open door, the interior of the RV behind them - the monitors, the second person at a laptop, the corkboard with photographs and string. You have just witnessed the inside of the thing the whole block has been feeling for a week, and you witnessed it because your face stayed a face.',
            ledger: {
              meetNpcs: [{ id: 'rv.operator', name: 'RV operator', skin: 'neighborhood' }],
              tagNpcs: { 'rv.operator': ['saw-interior', 'monitors', 'corkboard'] },
              observations: [
                {
                  label: 'Got a three-second look inside the RV. Monitors, a second operator at a laptop, a corkboard with photos and string.',
                  detail: 'This is a surveillance operation against the neighborhood. I saw it because my face stayed a face.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterFace',
            effects: { resolve: 1, vigilance: -1 },
            flags: ['neighborhood.ch04.face.partial'],
            caption:
              'You hold most of it. Your eyes catch the open door a half-second too long and the operator catches your eyes catching. Neither of you reacts. They finish their scan. They get back in the RV. But they got a clean look at the face of someone who was looking, and you got only a glimpse of the monitors behind them.',
            ledger: {
              observations: [{ label: 'Held the corner mostly. The RV operator clocked me looking. I glimpsed monitors inside.' }],
            },
          },
          failure: {
            nextNodeId: 'afterFace',
            effects: { resolve: -2 },
            flags: ['neighborhood.ch04.face.broke'],
            caption:
              'Four days of small private triumph arrives in your face at exactly the wrong second. The operator sees it - sees recognition, sees a watcher who knows they are watching. They do not run. They simply hold your eyes for one long beat, memorizing you, and then step back into the RV without hurry. You have given them the one thing they came for: confirmation of who on this block can see them.',
            ledger: {
              tagNpcs: { 'rv.operator': ['memorized-me', 'has-my-face'] },
              observations: [{ label: 'My face broke at the corner. The RV operator memorized me. They now have confirmation I can see them.' }],
            },
          },
        },
      },
    },

    afterFace: {
      id: 'afterFace',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 34,
      content: {
        eyebrow: 'AFTER //',
        heading: 'The corner resolves.',
        register: 'narrative',
        body: [
          'The operator is back in the RV. The municipal sedan has stopped drifting and is now, very casually, parked in a way that puts it across the only exit from the corner that the RV can take. Janelle has stopped walking the dog. Mrs. Caldwell, a quarter mile back, has hung up her phone.',
          'Everyone on your side is holding very still. The morning is about to decide what kind of morning it is.',
        ],
      },
      nextNodeId: 'finalChoice',
    },

    // ~90% - the climax fork
    finalChoice: {
      id: 'finalChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.90 },
      minDwellSeconds: 20,
      content: {
        eyebrow: 'DECISION //',
        heading: 'How it ends, your part of it.',
        register: 'narrative',
        body: [
          'The professionals have the exit. The net is closed or closing. Your part is almost over and you get to choose what your part was.',
        ],
      },
      choices: [
        {
          id: 'standDown',
          label: 'Stand down. Let the professionals close it.',
          hint: 'You did your job. Theirs is the next part.',
          voiceAliases: ['stand down', 'professionals', 'first'],
          nextNodeId: 'stoodDown',
          effects: { resolve: 1, insight: 1 },
          flags: ['neighborhood.ch04.stoodDown'],
          ledger: { observations: [{ label: 'Stood down at the corner. Let the professionals close the net.' }] },
        },
        {
          id: 'witness',
          label: 'Stay visible. Be a witness they can see.',
          hint: 'A watched watcher cannot work. You end it by being seen.',
          voiceAliases: ['witness', 'visible', 'stay', 'second'],
          nextNodeId: 'becameWitness',
          effects: { resolve: 1, vigilance: 1 },
          flags: ['neighborhood.ch04.witness'],
          requires: { minStats: { resolve: 12 } },
          ledger: { observations: [{ label: 'Stayed visible at the corner. A watched watcher cannot work.' }] },
        },
        {
          id: 'goToCaldwell',
          label: 'Walk to Mrs. Caldwell. Close it together.',
          hint: 'You end where the watching began.',
          voiceAliases: ['caldwell', 'kitchen', 'together', 'third'],
          nextNodeId: 'closedTogether',
          effects: { insight: 2 },
          flags: ['neighborhood.ch04.withCaldwell'],
          ledger: { affinity: { mrsCaldwell: 2 } },
        },
      ],
    },

    stoodDown: {
      id: 'stoodDown',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'CLOSED //',
        heading: 'It ends quietly, the way real things do.',
        register: 'narrative',
        body: [
          'Two unmarked cars and the municipal sedan close the corner in a slow choreography that takes about forty seconds and involves no sirens. People in plain clothes speak to the people in the RV through the windows. Nobody runs. Nobody is dramatic. A neighborhood at 6:55 in the morning watches three vehicles have a very calm conversation and mostly does not understand what it is seeing.',
          'You keep walking, because a person whose morning is normal keeps walking. You will read about it, partially, in three weeks. You already know more than the article will.',
        ],
      },
      onActivate: { resolve: 1 },
      nextNodeId: 'wrap',
    },

    becameWitness: {
      id: 'becameWitness',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'SEEN //',
        heading: 'You stop walking. You face the RV.',
        register: 'narrative',
        body: [
          'You stand on the corner and you look at the RV the way you have spent four days teaching yourself not to. Openly. A person, on a public sidewalk, looking. You take out your phone and you do not hide that you are holding it.',
          'The thing about surveillance is that it dies in daylight. The operator sees you seeing them and sees, behind you, that you are not the only one. The RV does not wait for the professionals to finish their choreography. It would rather leave than be a photograph. It is not a victory you can put in a frame, but the RV leaves, and the corner is yours, and the block exhales.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [{ label: 'Became a visible witness. The RV chose to leave rather than be photographed. Surveillance dies in daylight.' }],
      },
      nextNodeId: 'wrap',
    },

    closedTogether: {
      id: 'closedTogether',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'KITCHEN //',
        heading: 'You walk back to her window.',
        register: 'narrative',
        body: [
          'You walk the quarter mile back to Mrs. Caldwell’s and you stand on her front walk and she opens the window instead of the door. From here you can both see the corner of Briar and Fanning, small in the distance, where the slow choreography is happening.',
          '"My husband used to say the watching is the work," she says. "Not the catching. The catching is for other people. We just have to not look away." You stand at her window and you do not look away. Neither does she. The corner resolves itself in the distance, the way corners do when enough people are not looking away.',
        ],
      },
      onActivate: { insight: 2, resolve: 1 },
      ledger: {
        affinity: { mrsCaldwell: 2 },
        observations: [
          {
            label: 'Caldwell: "The watching is the work. Not the catching. We just have to not look away."',
            detail: 'Watched the corner resolve from her window, together.',
            npcId: 'mrsCaldwell',
          },
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
        eyebrow: 'AFTER //',
        heading: 'The block goes back to being the block.',
        register: 'narrative',
        body: [
          'By 7:30 the bakery is open and the commuters are backing out of driveways and the Mahoneys’ dog is barking three times at each of them, three, three, three, the way he did before any of this. The sky is fully up. Someone is running a leaf blower. The chalk triangle is still on your step; you will scrub it off after breakfast.',
          'You made the block once at dawn and the block made you back. You are not the person who signed up for Block Watch six months ago because nothing ever happens here. You are the person who walks it now.',
        ],
      },
      debrief: {
        closingLine:
          'Four days ago you noticed a porch light. This morning you read the inside of an RV without moving your face. The block is quiet again, and quiet means something different to you now than it did on Night One.',
        nextChapterTease:
          'Chapter 5 - A new family moves into the Hwangs’ old rental. On their second night, their porch light stays on. You are the experienced one now. Someone newer is watching you walk.',
      },
    },
  },

  gpsAnchors: [
    {
      id: 'opp.ch04.cover',
      kind: 'opportunistic',
      radiusMeters: 22,
      dwellSeconds: 30,
      minDistancePct: 0.40,
      maxDistancePct: 0.85,
      content: {
        eyebrow: 'STOP //',
        heading: 'You take cover as a pause.',
        register: 'narrative',
        body: [
          'You stop in the lee of something - a van, a hedge, a mailbox cluster. From a stopped position you can watch a moving thing far better than you can while moving yourself. You let the corner come to you.',
          'You move again before stillness becomes its own signal.',
        ],
      },
      flags: ['neighborhood.ch04.anchor.cover.fired'],
      ledger: {
        observations: [{ label: 'Took cover and held still to track a moving vehicle better than I could while walking.' }],
      },
    },
  ],
};
