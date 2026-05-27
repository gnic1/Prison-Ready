// Neighborhood Watch - Chapter 1: "The Wrong Porch Light" (MVP)
//
// The flagship chapter. Tone: suburban realism with a Twin Peaks edge.
// Friendly streets, strange signals. The narrator is a thoughtful resident
// who has walked this loop two hundred times and feels - tonight - that
// several things are off.
//
// 2.2 km / 30 min target. Eighteen story nodes. Two chance moments (Insight
// at the Petrovs' window, Vigilance at the Maple Street sedan). Route fork
// at 22%. Dispatch-call decision at 78%. Final knock-or-log moral choice at
// 88%. Wrap with a text message that seeds Chapter 2.
//
// Twenty-three micro-tells, eight universal, six gated to the north route,
// six to the south route, three late-walk only. Two opportunistic GPS
// anchors so any real-world dwell becomes a sit-and-listen moment.

import type { StoryGraph } from '../types/storyGraph';

export const neighborhoodWatchChapter1: StoryGraph = {
  id: 'neighborhood.ch01.wrongPorchLight',
  skin: 'neighborhood',
  chapter: 1,
  title: 'The Wrong Porch Light',
  subtitle: 'Night 1 // Twenty laps and a question',
  briefing: [
    'You signed up for Block Watch six months ago because nothing ever happens in Briarwood. You have walked this loop maybe two hundred times. The streetlights make the same sodium puddles. The same three dogs bark from the same three back yards.',
    'Tonight one thing is different and you do not know what yet. Walk the route. Find the wrong note. Decide what to do with it.',
  ],
  targetMeters: 2200,
  targetSeconds: 1800,
  entryNodeId: 'opening',

  microTells: [
    // ---- universal (8) ----
    { id: 'mt.porchSwing', line: 'A porch swing at 1142 is moving without wind. Somebody just got up off it.', weight: 1.0, minDistancePct: 0.05, maxDistancePct: 0.55 },
    { id: 'mt.mailbox', line: 'A mailbox flag is up at the wrong end of the day.', weight: 0.8, minDistancePct: 0.10 },
    { id: 'mt.kidsBike', line: 'A kid’s bike is on its side in the middle of a driveway. It has been there since you started the loop.', weight: 1.1, minDistancePct: 0.20 },
    { id: 'mt.scentTrail', line: 'You smell cigarette smoke for ten steps. No one is smoking on any porch you can see.', weight: 0.9, minDistancePct: 0.25 },
    { id: 'mt.recyclingBin', line: 'The Caldwells’ recycling bin is at the curb. Pickup is Thursday. Tonight is Saturday.', weight: 1.3, minDistancePct: 0.30 },
    { id: 'mt.idlingCar', line: 'A car is idling on the cross street with its lights off. You can hear the engine for a block.', weight: 1.4, minDistancePct: 0.40, maxDistancePct: 0.75 },
    { id: 'mt.upstairsLight', line: 'A second-floor light at 1226 just came on, then off, then on again. Like someone is looking for something they cannot find.', weight: 1.0, minDistancePct: 0.45 },
    { id: 'mt.tvFlicker', line: 'A TV flickers in a front room. No one is watching it from the chair you can see through the window.', weight: 1.0, minDistancePct: 0.15, maxDistancePct: 0.65 },

    // ---- north-route only (6): construction-site themed ----
    { id: 'mt.n.trailerHum', line: 'You hear the construction trailer’s compressor hum. It is supposed to be off at this hour.', weight: 1.4, requiresFlag: 'neighborhood.route.north', minDistancePct: 0.30 },
    { id: 'mt.n.chainlinkGap', line: 'A section of chain-link at the back of the lot is bent low and stays bent. Foot-shaped.', weight: 1.2, requiresFlag: 'neighborhood.route.north', minDistancePct: 0.30 },
    { id: 'mt.n.drywallStack', line: 'A pallet of drywall is covered in plastic. One corner of the plastic is pulled back like someone was checking.', weight: 1.0, requiresFlag: 'neighborhood.route.north', minDistancePct: 0.35 },
    { id: 'mt.n.tireMarks', line: 'Fresh tire marks in the gravel of the construction lot. They lead to the trailer and not back.', weight: 1.3, requiresFlag: 'neighborhood.route.north', minDistancePct: 0.40 },
    { id: 'mt.n.spotlightArc', line: 'The motion light at the framework triggers as you pass and lingers a beat longer than the spec says it should.', weight: 1.1, requiresFlag: 'neighborhood.route.north', minDistancePct: 0.45 },
    { id: 'mt.n.lowMotor', line: 'A low motor sound that is not the trailer compressor. It is closer to the ground. It moves when you do.', weight: 0.9, requiresFlag: 'neighborhood.route.north', minDistancePct: 0.50 },

    // ---- south-route only (6): cul-de-sac themed ----
    { id: 'mt.s.bakerLights', line: 'Every lamp in Mrs. Baker’s house is on. Mrs. Baker only ever uses one.', weight: 1.4, requiresFlag: 'neighborhood.route.south', minDistancePct: 0.30 },
    { id: 'mt.s.jameelaTrash', line: 'Jameela’s trash bins were moved overnight. Same exact spots, two feet closer to the curb than this morning.', weight: 1.0, requiresFlag: 'neighborhood.route.south', minDistancePct: 0.30 },
    { id: 'mt.s.petrovTV', line: 'The Petrovs’ TV is playing the same channel as it was on your first lap.', weight: 0.9, requiresFlag: 'neighborhood.route.south', minDistancePct: 0.35 },
    { id: 'mt.s.hwangSensor', line: 'The Hwangs’ motion light is triggering on a slow pulse. They are not home and there is no wind tonight.', weight: 1.3, requiresFlag: 'neighborhood.route.south', minDistancePct: 0.40 },
    { id: 'mt.s.greeneGarage', line: 'You check the Greenes’ garage on the way past. Still cracked six inches. Still nothing moving behind it.', weight: 1.2, requiresFlag: 'neighborhood.route.south', minDistancePct: 0.45 },
    { id: 'mt.s.caldwellShape', line: 'A shape passes behind Mrs. Caldwell’s blinds. The shape is not Mrs. Caldwell.', weight: 1.5, requiresFlag: 'neighborhood.route.south', minDistancePct: 0.50 },

    // ---- late-walk only (3) ----
    { id: 'mt.late.nightBird', line: 'A bird is singing in the wrong key for the hour. Not a mockingbird trick. A real bird, awake on the wrong shift.', weight: 0.7, minDistancePct: 0.65 },
    { id: 'mt.late.porchBreath', line: 'You pass a darkened porch and somebody on it exhales. You hear them hold the next breath when they see you.', weight: 1.3, minDistancePct: 0.70 },
    { id: 'mt.late.streetlightFlicker', line: 'A streetlight ahead of you flickers twice in a row. Then again twenty seconds later. Not on the same pattern.', weight: 0.9, minDistancePct: 0.75 },
  ],

  nodes: {
    // 0% - opener
    opening: {
      id: 'opening',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 28,
      content: {
        eyebrow: 'STEP OFF //',
        heading: 'Sodium light. Dog barking. Sandersons.',
        register: 'narrative',
        body: [
          'Cold night. Damp on the sidewalk. The Mahoneys’ dog is going at it again, three barks and a pause, like clockwork.',
          'You glance up the street out of habit. The Sandersons’ porch light is on. Second night in a row. They never leave it on overnight.',
          'Probably nothing. Probably one of them got home late and forgot. Walk the loop. See what else the block has to tell you.',
        ],
      },
      flags: ['neighborhood.ch01.entered'],
      ledger: {
        meetNpcs: [{ id: 'sandersons', name: 'The Sandersons', skin: 'neighborhood' }],
        observations: [
          {
            label: 'The Sandersons’ porch light has been on two nights running.',
            detail: 'They never leave it on. Either someone is coming home, or someone is hoping someone is coming home.',
            npcId: 'sandersons',
          },
        ],
      },
      nextNodeId: 'mahoneyDog',
    },

    // ~8% - NPC reveal: the Mahoneys' dog as block timekeeper
    mahoneyDog: {
      id: 'mahoneyDog',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.08 },
      minDwellSeconds: 28,
      content: {
        eyebrow: 'BLOCK CLOCK //',
        heading: 'Three barks. Pause. Three barks.',
        register: 'narrative',
        body: [
          'The Mahoneys’ dog tells the block what time it is. Three barks at every passing car. Three barks at every passing walker. Three barks at the mailman, the Amazon driver, you.',
          'Tonight he barks four times when you pass. Then stops. Then four times again at nothing you can see.',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        meetNpcs: [{ id: 'mahoneys', name: 'The Mahoneys', skin: 'neighborhood' }],
        observations: [
          {
            label: 'The Mahoneys’ dog barked four times tonight, not three.',
            detail: 'He has barked three for eleven years. He barked four tonight. Then four again at nothing.',
            npcId: 'mahoneys',
          },
        ],
      },
      nextNodeId: 'firstSteps',
    },

    // ~14% - Mrs. Caldwell's missing window
    firstSteps: {
      id: 'firstSteps',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.14 },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'BASELINE //',
        heading: 'Mrs. Caldwell’s kitchen is dark.',
        register: 'narrative',
        body: [
          'Mrs. Caldwell’s kitchen light is off. Mrs. Caldwell’s kitchen light is never off at this hour. She is eighty-four and washes her single dinner plate at 8:45 like she is paid to do it.',
          'Maybe she went to bed early. Maybe she is at her sister’s. Maybe the kitchen window faces the wrong way and you have never actually known where her light is.',
          'You keep walking. You file the dark window.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        meetNpcs: [{ id: 'mrsCaldwell', name: 'Mrs. Caldwell', skin: 'neighborhood' }],
        observations: [
          {
            label: 'Mrs. Caldwell’s kitchen light was off at the wrong hour.',
            detail: 'She washes her dinner plate at 8:45 every night.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'firstChoice',
    },

    // ~22% - route fork
    firstChoice: {
      id: 'firstChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.22 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Which way around the loop?',
        register: 'narrative',
        body: [
          'You’re at the corner of Maple and Third. North runs you past the construction site at 1140 - half-finished, fenced, supposedly idle at night. South runs you through the cul-de-sac where you actually know everyone.',
          'Both routes get you home. Different things are visible from each.',
        ],
      },
      choices: [
        {
          id: 'north',
          label: 'North - past the construction site',
          hint: 'Quieter. Less people. Stranger.',
          voiceAliases: ['north', 'construction', 'site', 'right'],
          nextNodeId: 'northSite',
          effects: { stamina: 1 },
          flags: ['neighborhood.route.north'],
        },
        {
          id: 'south',
          label: 'South - through the cul-de-sac',
          hint: 'Familiar. More to read.',
          voiceAliases: ['south', 'cul-de-sac', 'cul de sac', 'left'],
          nextNodeId: 'southCulDeSac',
          effects: { insight: 1 },
          flags: ['neighborhood.route.south'],
        },
      ],
    },

    northSite: {
      id: 'northSite',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'NORTH PASSAGE //',
        heading: 'Plywood, chain-link, one light on.',
        register: 'narrative',
        body: [
          'The construction site at 1140 was supposed to be a small medical office, then a coffee shop, then a small medical office again. The framing has been up for six months. Tonight there is a single bulb burning in the trailer at the back of the lot.',
          'There is not supposed to be anyone in the trailer at this hour. You note the bulb. You keep walking. You note that you are walking faster.',
        ],
      },
      onActivate: { vigilance: 1, resolve: -1 },
      ledger: {
        observations: [
          { label: 'Light on in the construction trailer at 1140. Site has been idle.', detail: 'Someone is in there at night and there should not be.' },
        ],
      },
      nextNodeId: 'windowGlimpse',
    },

    southCulDeSac: {
      id: 'southCulDeSac',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'SOUTH PASSAGE //',
        heading: 'The cul-de-sac is too quiet.',
        register: 'narrative',
        body: [
          'Six houses on the cul-de-sac. You know the rhythm of every one. The Hwangs are out of town. The Petrovs have their TV on. The Greenes’ garage door has been cracked open six inches since you started the loop, which is six inches more than it should be.',
          'You walk the cul-de-sac like you are doing a count. Because you are.',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        meetNpcs: [
          { id: 'hwangs', name: 'The Hwangs', skin: 'neighborhood' },
          { id: 'petrovs', name: 'The Petrovs', skin: 'neighborhood' },
          { id: 'greenes', name: 'The Greenes', skin: 'neighborhood' },
        ],
        observations: [
          { label: 'Greenes’ garage door was open six inches all night.', detail: 'They close it. They always close it.' },
        ],
      },
      nextNodeId: 'windowGlimpse',
    },

    // ~38% - first chance moment: the Petrovs' window (INSIGHT)
    windowGlimpse: {
      id: 'windowGlimpse',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.38 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'A WINDOW //',
        heading: 'A gap in the blinds.',
        register: 'narrative',
        body: [
          'You are passing the Petrovs’. Their living room curtain hangs half-closed. There is a face inside the gap. You only get a one-step look.',
        ],
      },
      check: {
        stat: 'insight',
        dc: 13,
        prompt:
          'Read what you are seeing. The face is turned three-quarters toward the door, not the TV. The Petrovs always sit facing the TV - it is bolted to the back wall, they would have to swivel to look at the door. The shape of the head is wrong for either Petrov. The light is the TV’s flicker, but the face is too still for someone watching.',
        outcomes: {
          success: {
            nextNodeId: 'afterWindowSuccess',
            effects: { insight: 1, vigilance: 1 },
            flags: ['neighborhood.read.window'],
            caption:
              'You read it in a single step: the Petrovs are not the people in their living room tonight. Whoever is in there is watching the door, not the TV, and the TV is on as cover. You do not slow your pace. You do not turn your head. You write the face inside your head as a list of shapes you can describe later.',
            ledger: {
              meetNpcs: [{ id: 'unknownVisitor', name: 'Unknown visitor', skin: 'neighborhood' }],
              tagNpcs: { unknownVisitor: ['petrov-house', 'door-watcher'] },
              observations: [
                {
                  label: 'Someone is in the Petrovs’ living room who is not a Petrov.',
                  detail: 'Facing the door, not the TV. TV running as cover.',
                  npcId: 'petrovs',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterWindowSuccess',
            effects: { insight: 1 },
            flags: ['neighborhood.read.window.partial'],
            caption:
              'You catch the wrongness without catching the shape. Something about the angle of the head, the stillness, the fact that the TV is on but no one is reacting to it. You do not have a description. You have a feeling that will keep you up.',
            ledger: {
              observations: [
                { label: 'Something is wrong at the Petrovs’. Could not name the wrong.', detail: 'TV on. Stillness in the wrong direction.', npcId: 'petrovs' },
              ],
            },
          },
          failure: {
            nextNodeId: 'afterWindowFail',
            effects: { resolve: -1 },
            flags: ['neighborhood.missed.window'],
            caption:
              'You glance at the window because everyone glances at windows. You see flicker, you see a head, you assume Petrov, you walk on. The neighborhood lets you assume.',
            ledger: {
              observations: [{ label: 'I walked past the Petrovs’ window without reading it.' }],
            },
          },
        },
      },
    },

    afterWindowSuccess: {
      id: 'afterWindowSuccess',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You keep your face calm.',
        register: 'narrative',
        body: [
          'You do not look back at the Petrovs’. You do not stop. The trick to seeing something at night is to keep not-seeing-things at the same rate you were already not-seeing-things. Your pace does not change.',
          'Two facts are now in the same paragraph: the Sandersons’ porch light, and somebody at the Petrovs’ who is not a Petrov.',
        ],
      },
      nextNodeId: 'sandersonsSidewalk',
    },

    afterWindowFail: {
      id: 'afterWindowFail',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'AFTER //',
        heading: 'The block keeps humming.',
        register: 'narrative',
        body: [
          'You walk on. Something in your chest insists you should have looked harder, and something in your head says you are imagining things, and the two voices argue politely for half a block.',
          'You will think about the Petrovs’ window again tomorrow.',
        ],
      },
      nextNodeId: 'sandersonsSidewalk',
    },

    // ~50% - the Sandersons up close
    sandersonsSidewalk: {
      id: 'sandersonsSidewalk',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.50 },
      minDwellSeconds: 35,
      content: {
        eyebrow: 'WALK-UP //',
        heading: 'Two newspapers on the step.',
        register: 'narrative',
        body: [
          'You slow your pace passing the Sandersons’. The porch light is still on. Two folded newspapers on the step - this morning’s and yesterday’s, both still in their plastic sleeves.',
          'Mr. Sanderson reads the paper at six every morning with his coffee. Mrs. Sanderson reads the paper at lunch. Two unpicked papers is two skipped mornings.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [
          { label: 'Two unpicked newspapers on the Sandersons’ step.', detail: 'They read the paper every morning and every lunch. Two papers means two skipped reads.', npcId: 'sandersons' },
        ],
      },
      nextNodeId: 'spotCheck',
    },

    // ~58% - second chance: the Maple Street sedan (VIGILANCE)
    spotCheck: {
      id: 'spotCheck',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.58 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'SOMETHING //',
        heading: 'You almost walk past it.',
        register: 'narrative',
        body: [
          'There is a car on Maple two doors down from the Sandersons’ that you do not recognize. You are not sure you would have caught it if you had not been looking. You are not sure you were looking.',
        ],
      },
      check: {
        stat: 'vigilance',
        dc: 14,
        prompt:
          'You slow your pace without making it obvious. Dark sedan, dealer plate frame, no front plate. Tags from a county two counties over. The driver’s seat is reclined - not empty. Someone is in there waiting for something, and not waiting comfortably enough to be expected back inside.',
        outcomes: {
          success: {
            nextNodeId: 'caughtPlate',
            effects: { vigilance: 1, insight: 1 },
            flags: ['neighborhood.saw.car'],
            caption:
              'You catch the plate, the county, the dealer frame, the angle of the seat, and the way the headrest is tipped a half-inch toward the Sandersons’ house. You write it all down in your head in the rhythm you walk to. Whoever is in that car does not know you saw any of it.',
            ledger: {
              meetNpcs: [{ id: 'sedan.maple', name: 'Maple Street sedan', skin: 'neighborhood' }],
              tagNpcs: { 'sedan.maple': ['watching', 'out-of-county'] },
              observations: [
                {
                  label: 'Unfamiliar sedan two doors down from the Sandersons.',
                  detail: 'Out-of-county plate, dealer frame, reclined driver, headrest aimed at the Sandersons’ door.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'caughtPlate',
            effects: { vigilance: 1 },
            flags: ['neighborhood.saw.car.partial'],
            caption:
              'You catch the car. The plate, the county, the precise angle of the seat - those land later, in pieces, as you walk. You file the car. You will be looking for it again tomorrow.',
            ledger: {
              meetNpcs: [{ id: 'sedan.maple', name: 'Maple Street sedan', skin: 'neighborhood' }],
              observations: [{ label: 'Unfamiliar car near the Sandersons’. I caught the shape but not the details.' }],
            },
          },
          failure: {
            nextNodeId: 'missedPlate',
            effects: { vigilance: -1, resolve: -1 },
            flags: ['neighborhood.missed.car'],
            caption:
              'You walk past the car and notice it the way you notice a parked car. By the time your brain says wait, the angle is wrong now and the car looks like a car. You will hear about it later. You will wish you had not.',
            ledger: {
              observations: [{ label: 'A car was parked near the Sandersons. I walked past it without registering.' }],
            },
          },
        },
      },
    },

    caughtPlate: {
      id: 'caughtPlate',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You keep your pace.',
        register: 'narrative',
        body: [
          'You do not look back at the car. You do not change your stride. You walk like a person who is walking, and you mentally rehearse the plate twice before the next streetlight so you do not lose it.',
          'The Sandersons’ porch light is still on. The car is still there. Two facts in the same frame.',
        ],
      },
      nextNodeId: 'longLap',
    },

    missedPlate: {
      id: 'missedPlate',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'AFTER //',
        heading: 'The block hums.',
        register: 'narrative',
        body: [
          'Something just slipped past you. You feel it as a small wrong note in your chest more than anything else. The block keeps humming. The dog keeps barking.',
          'Tomorrow you will walk the loop knowing what you missed tonight. Or wishing you knew.',
        ],
      },
      nextNodeId: 'longLap',
    },

    // ~70% - the long quiet stretch
    longLap: {
      id: 'longLap',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.70 },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'LONG LAP //',
        heading: 'Half the block is asleep. Half is not.',
        register: 'narrative',
        body: [
          'The back half of the loop is where the houses get bigger and the porches get darker. Half the windows are warm-lit, half are blue with TV light, a few are pitch black behind drawn blinds.',
          'You have walked far enough that your shoulders have come down. The block has accepted you as part of its sound tonight. Whatever else is happening here, you are inside it now.',
        ],
      },
      onActivate: { stamina: 1, resolve: 1 },
      nextNodeId: 'callChoice',
    },

    // ~80% - the dispatch-call decision point
    callChoice: {
      id: 'callChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.80 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Reach out, or hold it.',
        register: 'narrative',
        body: [
          'You could text Janelle - she runs Block Watch dispatch on Tuesdays and Saturdays. A car, a porch light, a face in the wrong window - that is enough for her to send a second walker through here tonight.',
          'You could also hold it. Sleep on it. Walk it again in the morning when the block looks different.',
        ],
      },
      choices: [
        {
          id: 'callDispatch',
          label: 'Text Janelle. Get a second walker.',
          hint: 'You stop being alone in what you saw.',
          voiceAliases: ['call', 'text', 'janelle', 'dispatch', 'first option'],
          nextNodeId: 'calledDispatch',
          effects: { resolve: 1, vigilance: 1 },
          flags: ['neighborhood.called.dispatch'],
          ledger: {
            meetNpcs: [{ id: 'janelle', name: 'Janelle (dispatch)', skin: 'neighborhood' }],
            affinity: { janelle: 1 },
            tagNpcs: { janelle: ['briefed'] },
            observations: [{ label: 'Texted Janelle. Asked for a second walker tonight.' }],
          },
        },
        {
          id: 'hold',
          label: 'Hold it. Walk it again tomorrow.',
          hint: 'You stay quiet until you have more.',
          voiceAliases: ['hold', 'wait', 'tomorrow', 'second option'],
          nextNodeId: 'heldOff',
          effects: { insight: 1 },
          flags: ['neighborhood.held.off'],
          ledger: {
            observations: [{ label: 'Did not text dispatch. Holding it until tomorrow.' }],
          },
        },
      ],
    },

    calledDispatch: {
      id: 'calledDispatch',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 32,
      content: {
        eyebrow: 'OUTREACH //',
        heading: 'Janelle replies in nine seconds.',
        register: 'fieldlog',
        body: [
          '"Got it. Walking from the other end. We meet at Maple in twenty."',
          'You put the phone away. You feel the block shift around you in the way it does when you are not alone in noticing what you are noticing.',
        ],
      },
      onActivate: { stamina: 1 },
      ledger: {
        affinity: { janelle: 1 },
        observations: [{ label: 'Janelle is walking the other half of the loop tonight. We meet at Maple.' }],
      },
      nextNodeId: 'finalChoice',
    },

    heldOff: {
      id: 'heldOff',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 32,
      content: {
        eyebrow: 'HELD //',
        heading: 'Your hand stops on the phone.',
        register: 'narrative',
        body: [
          'You almost text. You do not. The argument against is that you have nothing yet, only a series of small wrong things, and Janelle has enough on her plate. The argument for is that small wrong things are how big wrong things look at hour zero.',
          'You decide you would rather be embarrassed tomorrow than alarmist tonight. You walk on.',
        ],
      },
      ledger: {
        observations: [{ label: 'Considered texting Janelle. Decided not to. I would rather be embarrassed tomorrow than alarmist tonight.' }],
      },
      nextNodeId: 'finalChoice',
    },

    // ~88% - the moral choice: knock or log
    finalChoice: {
      id: 'finalChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.88 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'BEFORE BED //',
        heading: 'One thing left before you call it.',
        register: 'narrative',
        body: [
          'You are two houses from your own. The Sandersons’ light is still on. The car is still there.',
          'You could knock. You could write it in the log and walk the rest home. Different kinds of right.',
        ],
      },
      choices: [
        {
          id: 'knock',
          label: 'Knock on the Sandersons’ door',
          hint: 'You will know one way or the other.',
          voiceAliases: ['knock', 'sandersons', 'door', 'first option'],
          nextNodeId: 'knockResult',
          effects: { resolve: 1, vigilance: 1 },
          flags: ['neighborhood.knocked'],
          ledger: {
            affinity: { sandersons: 1 },
            tagNpcs: { sandersons: ['visited'] },
            observations: [{ label: 'I knocked on the Sandersons’ door.' }],
          },
        },
        {
          id: 'log',
          label: 'Log it. Finish the loop.',
          hint: 'Tomorrow you will know more than tonight.',
          voiceAliases: ['log', 'finish', 'walk home', 'second option'],
          nextNodeId: 'logResult',
          effects: { insight: 1, stamina: 1 },
          flags: ['neighborhood.logged'],
          ledger: {
            observations: [{ label: 'Logged the night. Held the knock.' }],
          },
        },
      ],
    },

    knockResult: {
      id: 'knockResult',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'YOU KNOCK //',
        heading: 'The door cracks two inches.',
        register: 'narrative',
        body: [
          'Mr. Sanderson is on the other side of it. He looks at you like he is trying to remember if it is Tuesday. He says his wife is upstairs with a migraine and he is sorry about the porch light.',
          'Everything he is saying is true. None of it is the whole truth. You make a small joke about the block being quiet, you wish him a good night, you walk away. The light goes off behind you a beat too late.',
        ],
      },
      ledger: {
        affinity: { sandersons: 1 },
        observations: [
          {
            label: 'Mr. Sanderson answered. Said his wife had a migraine.',
            detail: 'The porch light went off after I walked away. Not before.',
            npcId: 'sandersons',
          },
        ],
      },
      onActivate: { insight: 1 },
      nextNodeId: 'wrap',
    },

    logResult: {
      id: 'logResult',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'YOU LOG //',
        heading: 'You write four lines in the app.',
        register: 'fieldlog',
        body: [
          'Porch light. Recycling bin. Dark sedan, out-of-county plate. Caldwell’s window. You hit save. The block does not know you noticed any of this.',
          'Whatever is being prepared on your street is being prepared either way. You will be walking it again tomorrow with sharper eyes for it.',
        ],
      },
      onActivate: { vigilance: 1 },
      nextNodeId: 'wrap',
    },

    // 100% - home. The text from Janelle either confirms or independently corroborates.
    wrap: {
      id: 'wrap',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'HOME //',
        heading: 'Your phone buzzes on the counter.',
        register: 'narrative',
        body: [
          'Keys on the hook. Boots off. You set your phone down on the kitchen counter and it buzzes against the granite.',
          '"Hey. Was up walking Briar Lane. Saw a dark sedan, no front plate, sitting outside the Sandersons. Did you see it?" - Janelle, 11:42 PM.',
          'Two people, two ends of the block, saw the same car. The block keeps going on the other side of the front door. So do you.',
        ],
      },
      debrief: {
        closingLine:
          'You walked your block once. Tomorrow you walk it again, and the block will have changed because you walked it.',
        nextChapterTease:
          'Chapter 2 - The car you saw tonight is gone in the morning. Something else has taken its place.',
      },
    },
  },

  gpsAnchors: [
    {
      id: 'opp.porchLight',
      kind: 'opportunistic',
      radiusMeters: 25,
      dwellSeconds: 30,
      minDistancePct: 0.15,
      maxDistancePct: 0.55,
      content: {
        eyebrow: 'STOP //',
        heading: 'You stop near a porch.',
        register: 'narrative',
        body: [
          'You pause near someone’s walk-up. From the stopped point you can see things you cannot see while walking: a curtain that is not quite closed, a security light that has not turned itself off, a hose coiled in a way that does not match the house.',
          'You file the details. You start moving again before the porch starts to notice you.',
        ],
      },
      flags: ['neighborhood.anchor.porch.fired'],
      ledger: {
        observations: [{ label: 'Stopped near a porch. Small details came in that I would have walked past.' }],
      },
    },
    {
      id: 'opp.intersection',
      kind: 'opportunistic',
      radiusMeters: 30,
      dwellSeconds: 40,
      minDistancePct: 0.60,
      maxDistancePct: 0.95,
      content: {
        eyebrow: 'STOP //',
        heading: 'You stop at a corner.',
        register: 'narrative',
        body: [
          'Three directions of streetlight. You can hear a refrigerator humming through a screen window thirty feet away. You can hear an engine cooling somewhere you cannot quite point at.',
          'A corner is a good place to be on Block Watch. You linger one beat longer than a passer-by would. You move on.',
        ],
      },
      flags: ['neighborhood.anchor.corner.fired'],
      ledger: {
        observations: [{ label: 'Stopped at a corner. Heard an engine cooling on a street I had already cleared.' }],
      },
    },
  ],
};
