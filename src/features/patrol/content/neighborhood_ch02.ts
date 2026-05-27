// Neighborhood Watch - Chapter 2: "The Car Is Gone"
//
// Night 2. The sedan is gone. Something has taken its place.
//
// This is the chapter that flexes the cross-chapter memory layer. It opens
// differently depending on whether the player caught the plate last night,
// whether they knocked or logged, and whether they texted Janelle for help.
// Janelle herself appears on-screen tonight, with affinity carried over from
// Ch.1 - which affects whether she trusts your read of what is happening or
// just walks alongside.
//
// Two chance moments: Insight (reading the replacement car) and Resolve (a
// face-to-face moment with someone you do not recognize). Final choice is
// three-way: confront, call non-emergency, or withdraw and document.
//
// Hard-requires Ch.1 completion. Cross-chapter flag gates use the Ledger's
// knownFlags via the engine's choiceAvailable() helper.

import type { StoryGraph } from '../types/storyGraph';

export const neighborhoodWatchChapter2: StoryGraph = {
  id: 'neighborhood.ch02.theCarIsGone',
  skin: 'neighborhood',
  chapter: 2,
  title: 'The Car Is Gone',
  subtitle: 'Night 2 // What replaced it',
  requiresChapters: ['neighborhood.ch01.wrongPorchLight'],
  briefing: [
    'You slept badly. Twice you got up and looked out the front window. Twice the Sandersons’ porch light was still on. By the time you fell asleep around 2:30, it was off.',
    'Tonight you are out fifteen minutes earlier than your usual loop. You are looking for a dark sedan with an out-of-county plate. You will not find it. You will find something else.',
  ],
  targetMeters: 2400,
  targetSeconds: 1800,
  entryNodeId: 'opening',

  microTells: [
    // universal (7)
    { id: 'mt.colderNight', line: 'It is six degrees colder than last night. The porch lights have halos.', weight: 1.0, minDistancePct: 0.05 },
    { id: 'mt.mahoneyFour', line: 'The Mahoneys’ dog barks four times again. Then four again. Then five. He is updating something.', weight: 1.4, minDistancePct: 0.08 },
    { id: 'mt.silentTrash', line: 'A garbage bin lid closes very slowly across the street. You hear it because you are listening for it.', weight: 1.1, minDistancePct: 0.20 },
    { id: 'mt.sirensFar', line: 'A siren cycles up two blocks east, then cuts off. Then cycles up. Then cuts off.', weight: 1.0, minDistancePct: 0.25 },
    { id: 'mt.sandersonsBlinds', line: 'A second-floor blind at the Sandersons’ shifts a finger-width and stays open.', weight: 1.5, minDistancePct: 0.30, maxDistancePct: 0.75 },
    { id: 'mt.unfamiliarFootstep', line: 'You hear a footstep behind you that matches your pace. You take three quick steps. The footstep takes three quick steps.', weight: 1.3, minDistancePct: 0.45 },
    { id: 'mt.helicopterDistant', line: 'A helicopter is making slow circles half a mile away. It is not a police helicopter. You have heard police helicopters.', weight: 0.9, minDistancePct: 0.55 },

    // gated on Ch.1 outcomes via ledger flags
    { id: 'mt.tracedBackPath', line: 'You catch yourself walking yesterday’s route in reverse. You did not mean to. The plate is back in your head.', weight: 1.2, requiresFlag: 'neighborhood.saw.car', minDistancePct: 0.20 },
    { id: 'mt.knockMemory', line: 'You hear the click the Sandersons’ door made last night when it closed. Your body remembers it before your mind does.', weight: 1.1, requiresFlag: 'neighborhood.knocked', minDistancePct: 0.25 },
    { id: 'mt.logShortcut', line: 'You open the log app on your phone. Last night’s four lines are still at the top. You read them twice.', weight: 0.9, requiresFlag: 'neighborhood.logged', minDistancePct: 0.20 },
    { id: 'mt.janelleHorizon', line: 'You can see Janelle’s headlamp moving on the far end of the block.', weight: 1.3, requiresFlag: 'neighborhood.called.dispatch', minDistancePct: 0.30 },

    // late-walk (3)
    { id: 'mt.late.dogStops', line: 'The Mahoneys’ dog has not barked in four minutes. He has never not barked for four minutes.', weight: 1.5, minDistancePct: 0.70 },
    { id: 'mt.late.engineWarmth', line: 'You walk past a parked car and the hood is warm. It is two in the morning cold and the hood is warm.', weight: 1.4, minDistancePct: 0.72 },
    { id: 'mt.late.shadowAtGarage', line: 'A shadow passes inside a garage where the door has been cracked open the same six inches all night.', weight: 1.3, minDistancePct: 0.80 },
  ],

  nodes: {
    // 0%
    opening: {
      id: 'opening',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'NIGHT TWO //',
        heading: 'The porch light is off.',
        register: 'narrative',
        body: [
          'You step off your porch and the first thing you check is the Sandersons’. The light is off. That is also wrong. Two nights it was on, tonight it is off. Things change for reasons.',
          'You have your phone in your jacket pocket. The log app is one swipe down. You feel the shape of last night through your sleeve.',
        ],
      },
      flags: ['neighborhood.ch02.entered'],
      ledger: {
        observations: [
          {
            label: 'The Sandersons’ porch light is off tonight after two nights on.',
            detail: 'Whoever turned it on for two nights either stopped, or no longer needs it on.',
            npcId: 'sandersons',
          },
        ],
      },
      nextNodeId: 'mahoneyAgain',
    },

    // ~8%
    mahoneyAgain: {
      id: 'mahoneyAgain',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.08 },
      minDwellSeconds: 28,
      content: {
        eyebrow: 'BLOCK CLOCK //',
        heading: 'Four barks. Four. Then five.',
        register: 'narrative',
        body: [
          'The Mahoneys’ dog barks four times as you pass. Same wrong count as last night. Then he barks four again at nothing, then five, then stops.',
          'You file it. Five is new. Five means somebody else passed since you did.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [
          {
            label: 'The Mahoneys’ dog barked five times tonight, on top of the fours.',
            detail: 'Five means somebody else passed. Not me. Not on the route I am walking.',
            npcId: 'mahoneys',
          },
        ],
      },
      nextNodeId: 'caldwellAgain',
    },

    // ~14%
    caldwellAgain: {
      id: 'caldwellAgain',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.14 },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'STILL DARK //',
        heading: 'Mrs. Caldwell’s window has been dark thirty-six hours.',
        register: 'narrative',
        body: [
          'You count back. Last night her kitchen was dark. The morning was overcast and you did not see her on her front step like you usually do at 7:15.',
          'Thirty-six hours is the length of a stomach bug. It is also other things.',
        ],
      },
      ledger: {
        affinity: { mrsCaldwell: -1 },
        observations: [
          {
            label: 'Mrs. Caldwell’s kitchen has been dark for thirty-six hours.',
            detail: 'I did not see her on the step at 7:15 this morning either.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'janelleMeet',
    },

    // ~24% - Janelle meets the player (varies by Ch.1 flag)
    janelleMeet: {
      id: 'janelleMeet',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.24 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'MEET //',
        heading: 'Janelle is on the corner.',
        register: 'narrative',
        body: [
          'You round Maple and Third and there she is, headlamp at her sternum, jacket zipped to her chin. She nods at you the way someone nods who has been doing this longer than you have.',
          'She has been here a while. She has been waiting for you.',
        ],
      },
      ledger: {
        meetNpcs: [{ id: 'janelle', name: 'Janelle (dispatch)', skin: 'neighborhood' }],
      },
      choices: [
        {
          id: 'pickUpFromText',
          label: '"Did you find the car?"',
          hint: 'Resume last night’s thread directly.',
          voiceAliases: ['car', 'found', 'sedan', 'first option'],
          nextNodeId: 'janelleBriefed',
          requires: { hasFlag: 'neighborhood.called.dispatch' },
          effects: { insight: 1 },
          flags: ['neighborhood.ch02.briefedByJanelle'],
          ledger: { affinity: { janelle: 1 } },
        },
        {
          id: 'reportFresh',
          label: 'Tell her what you saw last night.',
          hint: 'You did not text her. You catch her up now.',
          voiceAliases: ['tell', 'last night', 'caught up', 'second option'],
          nextNodeId: 'janelleCaughtUp',
          effects: { resolve: 1 },
          flags: ['neighborhood.ch02.caughtUpJanelle'],
          ledger: { affinity: { janelle: 1 } },
        },
        {
          id: 'hangBack',
          label: '"Nothing to report yet."',
          hint: 'Keep your read close. Walk with her.',
          voiceAliases: ['nothing', 'walk', 'with her', 'third option'],
          nextNodeId: 'janelleQuiet',
          effects: { vigilance: 1, resolve: -1 },
          flags: ['neighborhood.ch02.heldFromJanelle'],
        },
      ],
    },

    janelleBriefed: {
      id: 'janelleBriefed',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'BRIEF //',
        heading: 'She nods at every line.',
        register: 'narrative',
        body: [
          '"Plate Echo-Four-One-Seven. We saw the same car. I drove the loop after we hung up — gone by midnight." She walks while she talks, the way runners pace people who do not run. "Whatever they came for, they came back for it. Or they finished."',
          'You walk together for thirty seconds without speaking. The block is quieter than it was a minute ago.',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        affinity: { janelle: 2 },
        observations: [
          {
            label: 'Janelle confirmed plate Echo-Four-One-Seven. Car gone by midnight.',
            detail: 'Same car. Independent corroboration. Whatever they came for, they completed it or returned for it.',
            npcId: 'janelle',
          },
        ],
      },
      nextNodeId: 'newCar',
    },

    janelleCaughtUp: {
      id: 'janelleCaughtUp',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'BRIEF //',
        heading: 'She listens with her whole face.',
        register: 'narrative',
        body: [
          'You tell it lean. Sandersons’ light, Caldwell’s window, the unfamiliar sedan. Janelle does not interrupt. When you finish she says, "I wish you’d texted. We could have had eyes on it last night."',
          'You agree with her without saying so. She does not press. "Walk with me. Tell me what you see tonight first."',
        ],
      },
      onActivate: { resolve: 1 },
      ledger: {
        affinity: { janelle: 1 },
        observations: [{ label: 'Caught Janelle up on last night. She wished I had texted.' }],
      },
      nextNodeId: 'newCar',
    },

    janelleQuiet: {
      id: 'janelleQuiet',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'PARALLEL //',
        heading: 'You walk a half-step ahead.',
        register: 'narrative',
        body: [
          'Janelle does not pry. She matches your pace and lets you set the topic, which tonight is nothing. The silence becomes its own observation.',
          'You will tell her when you have something solid. You hope you have something solid before she stops walking with you.',
        ],
      },
      ledger: {
        observations: [{ label: 'Walked with Janelle. Did not catch her up. I will when I have more.' }],
      },
      nextNodeId: 'newCar',
    },

    // ~38% - first chance: read the replacement car (INSIGHT)
    newCar: {
      id: 'newCar',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.38 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'PARKED //',
        heading: 'Same spot. Different vehicle.',
        register: 'narrative',
        body: [
          'Two doors down from the Sandersons’, a different car sits in the same spot the sedan held last night. Compact pickup, in-county plates, mud splash up the fenders that does not match the dry asphalt.',
        ],
      },
      check: {
        stat: 'insight',
        dc: 14,
        prompt:
          'Read the truck. The plate is in-county - the kind that does not get noticed. The mud is suspicious only if you know the streets have been dry for nine days. The rearview mirror is angled to watch the Sandersons’ front door, not the street. The driver seat is empty. The truck has been sitting cold for at least an hour.',
        outcomes: {
          success: {
            nextNodeId: 'afterNewCar',
            effects: { insight: 1, vigilance: 1 },
            flags: ['neighborhood.ch02.read.truck'],
            caption:
              'You read it in three layers: the plate is local cover, the mud is fresh from somewhere not here, and the mirror is aimed exactly where the sedan’s headrest was last night. The car changed. The watcher did not. You walk past it the same speed you walked past everything else.',
            ledger: {
              meetNpcs: [{ id: 'truck.maple', name: 'Maple Street pickup', skin: 'neighborhood' }],
              tagNpcs: { 'truck.maple': ['watching', 'local-plate-cover', 'mud-from-elsewhere'] },
              observations: [
                {
                  label: 'The car is gone. A pickup is in the same spot, watching the same door.',
                  detail: 'Local plate as cover. Mud not from this neighborhood. Mirror aimed at the Sandersons’.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterNewCar',
            effects: { insight: 1 },
            flags: ['neighborhood.ch02.read.truck.partial'],
            caption:
              'You catch enough to keep walking - the mirror, the cold engine, the wrongness of mud on a dry week. The plate does not register as cover. You note the truck the way you would note a car you have not seen before.',
            ledger: {
              meetNpcs: [{ id: 'truck.maple', name: 'Maple Street pickup', skin: 'neighborhood' }],
              observations: [{ label: 'New truck where the sedan was. Mirror angled at the Sandersons. Cold engine.' }],
            },
          },
          failure: {
            nextNodeId: 'afterNewCar',
            effects: { resolve: -1 },
            flags: ['neighborhood.ch02.missed.truck'],
            caption:
              'You see a truck. You see a local plate. You assume neighbor and walk on. The night gets quieter around you.',
            ledger: {
              observations: [{ label: 'A truck was parked where the sedan had been. I did not read it.' }],
            },
          },
        },
      },
    },

    afterNewCar: {
      id: 'afterNewCar',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 32,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You and Janelle walk past it together.',
        register: 'narrative',
        body: [
          'You do not stop. You do not turn your head. If Janelle is with you, she does what you do. If she is not, you walk the truck-shaped wrongness alone.',
          'Whoever sits inside the next thing that parks here will be doing the same job. The car is gone. The job is not.',
        ],
      },
      nextNodeId: 'gardenShed',
    },

    // ~52% - NPC reveal: the Sandersons' shed has a new padlock
    gardenShed: {
      id: 'gardenShed',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.52 },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'SIDE YARD //',
        heading: 'A new padlock on the Sandersons’ shed.',
        register: 'narrative',
        body: [
          'The Sandersons’ garden shed has had the same green-and-rust hasp lock for the eleven years you have walked past it. Tonight there is a fresh brass padlock above it. Two locks.',
          'The bottom one is open.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [
          {
            label: 'A fresh brass padlock has been added above the Sandersons’ old shed lock.',
            detail: 'The old lock is hanging open. Two locks, one new.',
            npcId: 'sandersons',
          },
        ],
      },
      nextNodeId: 'thirdPartyPass',
    },

    // ~60% - someone you do not recognize, walking the block
    thirdPartyPass: {
      id: 'thirdPartyPass',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.60 },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'PEDESTRIAN //',
        heading: 'A man crosses the street ahead of you.',
        register: 'narrative',
        body: [
          'He is in a dark windbreaker, hood up, hands in pockets. Walking pace. He crosses the street at exactly the angle that puts a parked van between himself and the Sandersons’ front door before you can read his face.',
          'He is going somewhere. He is going somewhere on this block at half past midnight in the cold.',
        ],
      },
      ledger: {
        meetNpcs: [{ id: 'hoodedMan', name: 'Hooded man', skin: 'neighborhood' }],
        tagNpcs: { hoodedMan: ['evasive', 'used-van-cover'] },
        observations: [
          {
            label: 'A man in a dark windbreaker crossed to use a parked van as cover.',
            detail: 'Going somewhere on the block at 12:30. Face not visible.',
          },
        ],
      },
      nextNodeId: 'composureCheck',
    },

    // ~70% - second chance: a face-to-face moment (RESOLVE)
    composureCheck: {
      id: 'composureCheck',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.70 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'CONTACT //',
        heading: 'He sees you and adjusts.',
        register: 'narrative',
        body: [
          'The hooded man comes back around the front of the van and is now on your sidewalk, ten yards ahead, walking toward you. He is making it look like coincidence. It is not coincidence.',
        ],
      },
      check: {
        stat: 'resolve',
        dc: 14,
        prompt:
          'Hold your composure. Do not slow. Do not speed up. Keep your hands visible. Make eye contact for the half-second a friendly stranger would, no longer. Say a generic "evening" exactly the way you would to any neighbor. If he stops to ask you something, you have already prepared a reason to keep walking.',
        outcomes: {
          success: {
            nextNodeId: 'afterContact',
            effects: { resolve: 2 },
            flags: ['neighborhood.ch02.held.contact'],
            caption:
              'You walk through the encounter like he is nobody. "Evening." Half-second of eye contact - long enough to register a face but not long enough to register interest. He says "evening" back and his eyes go past your shoulder, not into yours. You are still walking. He is still walking. The block does not know what just happened.',
            ledger: {
              tagNpcs: { hoodedMan: ['acknowledged', 'no-recognition'] },
              observations: [
                {
                  label: 'Made composed eye contact with the hooded man. Held. He registered me but did not look at me.',
                  detail: 'I got a face. He did not get me reacting.',
                  npcId: 'hoodedMan',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterContact',
            effects: { resolve: 1, vigilance: -1 },
            flags: ['neighborhood.ch02.partial.contact'],
            caption:
              'You hold most of it. Your eyes catch on his for a beat too long. He holds yours back. Nobody says anything. You walk past each other and the silence is louder than either of you would have liked.',
            ledger: {
              observations: [{ label: 'Eye contact with the hooded man held a beat too long. He noticed I noticed.', npcId: 'hoodedMan' }],
            },
          },
          failure: {
            nextNodeId: 'afterContact',
            effects: { resolve: -2 },
            flags: ['neighborhood.ch02.fail.contact'],
            caption:
              'Your eyes drop a moment before he reaches you. You stiffen. You walk too fast for two steps and recover. He passes without speaking. You feel him watching the back of your jacket for twenty yards before you trust it to stop.',
            ledger: {
              tagNpcs: { hoodedMan: ['noticed-me'] },
              observations: [{ label: 'I broke first with the hooded man. He watched the back of my jacket for twenty yards.', npcId: 'hoodedMan' }],
            },
          },
        },
      },
    },

    afterContact: {
      id: 'afterContact',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You keep walking.',
        register: 'narrative',
        body: [
          'Adrenaline goes through your hands and out. Your fingers are warm in a cold pocket. You keep your pace. You keep your line.',
          'Whoever that was, he is now somewhere on the block behind you. The Sandersons’ door is still locked. The shed has two locks. The truck is still cold.',
        ],
      },
      nextNodeId: 'finalChoice',
    },

    // ~85% - final three-way choice
    finalChoice: {
      id: 'finalChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.85 },
      minDwellSeconds: 20,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Three roads home.',
        register: 'narrative',
        body: [
          'You can call the non-emergency line and put what you saw on a record. You can confront - walk up to the truck and knock on the window. You can withdraw, lock your front door, write it all down with the lights off.',
          'Different costs. Different blocks tomorrow.',
        ],
      },
      choices: [
        {
          id: 'callNonEmergency',
          label: 'Call non-emergency. Put it on record.',
          hint: 'Slow, official, public.',
          voiceAliases: ['call', 'non-emergency', 'record', 'first'],
          nextNodeId: 'calledIn',
          effects: { resolve: 1, vigilance: 1 },
          flags: ['neighborhood.ch02.calledIn'],
          ledger: { observations: [{ label: 'Called non-emergency. Put the truck and the hooded man on record.' }] },
        },
        {
          id: 'confront',
          label: 'Knock on the truck window.',
          hint: 'You will know one way or another. Risky.',
          voiceAliases: ['knock', 'truck', 'confront', 'second'],
          nextNodeId: 'confrontTruck',
          effects: { vigilance: 1, resolve: -1 },
          flags: ['neighborhood.ch02.confronted'],
          requires: { minStats: { resolve: 11 } },
          ledger: { observations: [{ label: 'Walked up to the truck and knocked.' }] },
        },
        {
          id: 'withdraw',
          label: 'Go home. Write it down. Lights off.',
          hint: 'You are not done; you are pacing.',
          voiceAliases: ['withdraw', 'home', 'document', 'third'],
          nextNodeId: 'withdrew',
          effects: { insight: 1 },
          flags: ['neighborhood.ch02.withdrew'],
          ledger: { observations: [{ label: 'Withdrew. Wrote it down with the lights off.' }] },
        },
      ],
    },

    calledIn: {
      id: 'calledIn',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'ON RECORD //',
        register: 'fieldlog',
        heading: 'You dial. They pick up in two rings.',
        body: [
          'You describe the truck, the mirror angle, the hooded man, the new padlock on the shed. The dispatcher repeats key facts back to you. A cruiser will roll through within the hour. They take your name. They take your number.',
          'You hang up and your hands are steadier than they were three minutes ago. The decision was the relief.',
        ],
      },
      onActivate: { resolve: 1 },
      nextNodeId: 'wrap',
    },

    confrontTruck: {
      id: 'confrontTruck',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'KNOCK //',
        heading: 'The window comes down two inches.',
        register: 'narrative',
        body: [
          'A woman in the driver’s seat. Not the hooded man. She has been there the whole walk. She has been the watcher behind the watcher.',
          'She does not look angry. She looks tired. She says, "I think you should keep walking, neighbor." She says it the way someone gives a real warning by being polite about it. You keep walking.',
        ],
      },
      onActivate: { resolve: -1, vigilance: 1 },
      ledger: {
        meetNpcs: [{ id: 'truck.driver', name: 'Truck driver', skin: 'neighborhood' }],
        tagNpcs: { 'truck.driver': ['watcher', 'polite-warning'] },
        observations: [
          {
            label: 'There was a woman in the truck. She told me to keep walking, politely.',
            detail: 'Not the hooded man. The watcher behind the watcher.',
            npcId: 'truck.driver',
          },
        ],
      },
      nextNodeId: 'wrap',
    },

    withdrew: {
      id: 'withdrew',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'WITHDRAW //',
        register: 'fieldlog',
        heading: 'You walk home the long way.',
        body: [
          'You add two blocks so the truck does not see you turn onto your street. You unlock your front door, do not turn on lights, and sit at the kitchen table in the dark with a notebook and the log app.',
          'You write everything. The padlock. The truck. The plate. The hooded man’s walk. The warning your gut gave you. Then you sleep, badly.',
        ],
      },
      onActivate: { insight: 1 },
      nextNodeId: 'wrap',
    },

    // 100%
    wrap: {
      id: 'wrap',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'HOME //',
        heading: 'Your phone buzzes once.',
        register: 'narrative',
        body: [
          'You take your boots off in the entry and your phone buzzes once on the counter. Janelle, 1:12 AM:',
          '"Saw the truck go past the firehouse at 12:58. Different driver than the one you described. They’re working in shifts."',
          'You write the time down. You close the curtain on the kitchen window even though the kitchen window does not face the Sandersons’.',
        ],
      },
      debrief: {
        closingLine:
          'You walked your block twice. Twice the block has shown you something. You will walk it again tomorrow, and tomorrow the block will know what you walked it for.',
        nextChapterTease:
          'Chapter 3 - Mrs. Caldwell’s blinds open. She is awake. She has been awake the whole time.',
      },
    },
  },

  gpsAnchors: [
    {
      id: 'opp.streetCorner',
      kind: 'opportunistic',
      radiusMeters: 25,
      dwellSeconds: 30,
      minDistancePct: 0.20,
      maxDistancePct: 0.55,
      content: {
        eyebrow: 'STOP //',
        heading: 'You stop and listen.',
        register: 'narrative',
        body: [
          'Stopped, the block makes more sense. You can hear the difference between a refrigerator hum, a streetlight ballast, and an engine at idle one street over.',
          'You let the sounds sort themselves. You walk on with one more shape in your head than you had a minute ago.',
        ],
      },
      flags: ['neighborhood.ch02.anchor.corner.fired'],
      ledger: {
        observations: [{ label: 'Stopped and listened. Engine at idle one street over.' }],
      },
    },
    {
      id: 'opp.parkedVehicle',
      kind: 'opportunistic',
      radiusMeters: 22,
      dwellSeconds: 35,
      minDistancePct: 0.60,
      maxDistancePct: 0.95,
      content: {
        eyebrow: 'STOP //',
        heading: 'You stop near a parked car.',
        register: 'narrative',
        body: [
          'You stop for a moment near a parked vehicle. You do not look at it. You look past it.',
          'From this angle three windows are visible that were not visible from the sidewalk. One is open six inches at the bottom on a night nobody else has their window open.',
        ],
      },
      flags: ['neighborhood.ch02.anchor.window.fired'],
      ledger: {
        observations: [{ label: 'A window on the block is open six inches on a cold night.' }],
      },
    },
  ],
};
