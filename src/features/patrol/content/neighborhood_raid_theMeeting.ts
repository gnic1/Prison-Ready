// Neighborhood Watch - Raid Chapter: "The Block Meeting"
//
// The weekly synchronized event for the neighborhood skin. RaidWalkService
// computes a 90-minute window per ISO-week + skin so every device opens this
// chapter at the same wall clock; while it is live, Home routes the patrol
// CTA here instead of the next regular chapter.
//
// Tone: bigger and more populated than the nightly walks. Briarwood Block
// Watch has been doing the monthly community walk for nineteen years. Half
// the block is out. Headlamps move on every street. The Sandersons are out
// in person for the first time you have seen them in days. So is the woman
// from the truck.
//
// 2.6 km / 30 min. Eighteen story nodes. Two chance moments (Vigilance +
// Resolve). Three-way sector assignment. Three-way final.
//
// Hard-requires Ch.2 completion.

import type { StoryGraph } from '../types/storyGraph';

export const neighborhoodRaidTheMeeting: StoryGraph = {
  id: 'neighborhood.raid.theMeeting',
  skin: 'neighborhood',
  chapter: 90, // raid chapters live outside the normal sequence (>=90)
  title: 'The Block Meeting',
  subtitle: 'WEEKLY RAID // The block walks together',
  requiresChapters: ['neighborhood.ch02.theCarIsGone'],
  briefing: [
    'Once a month for nineteen years, Briarwood Block Watch does the community walk. Half the neighborhood comes out. The other half watches from the porch. Tonight is one of those nights, and you are walking it three days after the last car parked outside the Sandersons’.',
    'Headlamps on every block. Forty-some people you mostly know. Two or three you do not. Walk the route. Stay with your sector. Read the room while the room is reading you back.',
  ],
  targetMeters: 2600,
  targetSeconds: 1800,
  entryNodeId: 'opening',

  microTells: [
    // universal raid-mode (8)
    { id: 'mt.headlamps', line: 'You can see four other headlamps moving on the next block. They are walking at almost your pace.', weight: 1.3, minDistancePct: 0.05 },
    { id: 'mt.greetings', line: 'A voice you cannot place calls "Evening!" from across the street and you wave back without seeing who.', weight: 1.0, minDistancePct: 0.10 },
    { id: 'mt.porchAudience', line: 'Two porches you pass are populated. People in robes, coffee mugs, watching the walkers go by. They are not waving.', weight: 1.1, minDistancePct: 0.15 },
    { id: 'mt.kidOnFolding', line: 'A kid on a folding chair at the corner is keeping count in a notebook. The count is for him.', weight: 0.9, minDistancePct: 0.20 },
    { id: 'mt.flyerOnPole', line: 'A flyer on a utility pole reads "MEETING TONIGHT 9PM" - tonight is Tuesday. The meeting is Wednesday. Wrong night posted on purpose.', weight: 1.4, minDistancePct: 0.25 },
    { id: 'mt.walkieClick', line: 'A walkie-talkie clicks twice on someone’s belt as they pass. Two clicks is the dispatch code for "stay quiet."', weight: 1.5, minDistancePct: 0.35 },
    { id: 'mt.dogsTogether', line: 'Three dogs across two yards are barking at the same time, in the same rhythm. They have synced up.', weight: 1.2, minDistancePct: 0.45 },
    { id: 'mt.streetlampsBuzz', line: 'The streetlamps along Briar are buzzing a little louder than usual. You realize you have never heard them at all before tonight.', weight: 0.8, minDistancePct: 0.55 },

    // gated on Ch.2 outcomes via ledger flags
    { id: 'mt.truckEmpty', line: 'You walk past where the pickup was parked. The spot is empty. The mud on the curb is dry.', weight: 1.4, requiresFlag: 'neighborhood.ch02.read.truck', minDistancePct: 0.20 },
    { id: 'mt.driverGone', line: 'You catch yourself scanning for the woman from the truck. You do not find her in the crowd. You should find her in the crowd.', weight: 1.3, requiresFlag: 'neighborhood.ch02.confronted', minDistancePct: 0.30 },
    { id: 'mt.recordResponse', line: 'A cruiser drifts past at the speed of someone with no urgency. They saw your call-in. They are checking the route.', weight: 1.2, requiresFlag: 'neighborhood.ch02.calledIn', minDistancePct: 0.30 },
    { id: 'mt.writtenAtNight', line: 'Your hand goes to your jacket pocket. Last night’s notebook is in there. The lights-off notebook. You can feel its corners through the fabric.', weight: 1.0, requiresFlag: 'neighborhood.ch02.withdrew', minDistancePct: 0.25 },

    // late-walk (3)
    { id: 'mt.late.crowdThins', line: 'The crowd is thinning. Half the walkers are gone, back to their porches. The block feels colder without them.', weight: 1.2, minDistancePct: 0.70 },
    { id: 'mt.late.singleHeadlamp', line: 'One headlamp on the far side of the block has stopped moving. It has been still for ninety seconds. You count.', weight: 1.5, minDistancePct: 0.78 },
    { id: 'mt.late.doorsClose', line: 'You hear three front doors close in succession down the street. The audience is going to bed. The watch is not.', weight: 1.0, minDistancePct: 0.85 },
  ],

  nodes: {
    // 0%
    opening: {
      id: 'opening',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'STEP OFF //',
        heading: 'Headlamps on every block.',
        register: 'narrative',
        body: [
          'You can see four walking parties from your front porch alone. Janelle is at the corner of Maple and Third with a clipboard and her usual headlamp on her sternum. There is a folding table set up at the church across the street with coffee in airpots.',
          'You count thirty-two walkers without trying hard. The Block Watch meeting is the cover. The walk is the meeting.',
        ],
      },
      flags: ['neighborhood.raid.entered'],
      ledger: {
        observations: [
          {
            label: 'Briarwood Block Watch community walk - thirty-two walkers visible at step-off.',
            detail: 'Folding table with coffee at the church. Janelle running it. Half the neighborhood out.',
          },
        ],
      },
      nextNodeId: 'silentDog',
    },

    // ~8% - the Mahoneys' dog DOES NOT BARK
    silentDog: {
      id: 'silentDog',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.08 },
      minDwellSeconds: 28,
      content: {
        eyebrow: 'BLOCK CLOCK //',
        heading: 'The Mahoneys’ dog is silent.',
        register: 'narrative',
        body: [
          'Three barks for eleven years. Four barks Sunday night. Five barks last night. Tonight the Mahoneys’ porch is empty and the dog is silent.',
          'You knock once on their door as you pass, the casual community-walk knock. No one answers. The lights are on inside.',
        ],
      },
      onActivate: { vigilance: 1, resolve: -1 },
      ledger: {
        affinity: { mahoneys: -1 },
        observations: [
          {
            label: 'The Mahoneys’ dog did not bark tonight. Lights on inside. No one answered the door.',
            detail: 'Eleven years of barking, broken. Their pattern is gone in a single week.',
            npcId: 'mahoneys',
          },
        ],
      },
      nextNodeId: 'janelleBriefs',
    },

    // ~16% - Janelle briefs you with the night's plan
    janelleBriefs: {
      id: 'janelleBriefs',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.16 },
      minDwellSeconds: 35,
      content: {
        eyebrow: 'BRIEF //',
        heading: 'Janelle has a clipboard.',
        register: 'fieldlog',
        body: [
          '"We split into three sectors. Center is the church and Maple. North is the construction site and the cul-de-sac. South is the meeting house and the Hwangs’ block - which is normally Mrs. Caldwell’s sector. She is not walking tonight."',
          '"You pick. Center is foot traffic and easy eyes. North is where you walked Sunday. South is where Mrs. Caldwell would be."',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        affinity: { janelle: 1 },
        observations: [
          { label: 'Janelle assigned three sectors. Mrs. Caldwell is not walking tonight.', detail: 'Center, north, south. Mrs. Caldwell’s usual sector is south.' },
        ],
      },
      nextNodeId: 'sectorChoice',
    },

    // ~22% - the three-way sector assignment
    sectorChoice: {
      id: 'sectorChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.22 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Which sector do you walk?',
        register: 'narrative',
        body: [
          'Three plausible answers. Three different chapters.',
        ],
      },
      choices: [
        {
          id: 'center',
          label: 'Center - the church and Maple.',
          hint: 'Foot traffic. Friendly eyes. Crowd-safe.',
          voiceAliases: ['center', 'church', 'maple', 'first'],
          nextNodeId: 'sectorCenter',
          effects: { resolve: 1 },
          flags: ['neighborhood.raid.sector.center'],
        },
        {
          id: 'north',
          label: 'North - construction and the cul-de-sac.',
          hint: 'Where you walked Sunday. You know the rhythm.',
          voiceAliases: ['north', 'construction', 'cul-de-sac', 'second'],
          nextNodeId: 'sectorNorth',
          effects: { vigilance: 1 },
          flags: ['neighborhood.raid.sector.north'],
        },
        {
          id: 'south',
          label: 'South - Mrs. Caldwell’s block.',
          hint: 'Nobody else is walking it tonight. Including her.',
          voiceAliases: ['south', 'caldwell', 'meeting house', 'third'],
          nextNodeId: 'sectorSouth',
          effects: { insight: 1, resolve: -1 },
          flags: ['neighborhood.raid.sector.south'],
        },
      ],
    },

    sectorCenter: {
      id: 'sectorCenter',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'CENTER //',
        heading: 'The church corner.',
        register: 'narrative',
        body: [
          'The folding table is busy. People you have nodded at for years introduce themselves to people they have nodded at for years. You take a coffee. You drink it slowly.',
          'From the church corner you can see half a mile in three directions. You are the lookout-shaped person who looks like a coffee-drinker.',
        ],
      },
      onActivate: { stamina: 1 },
      ledger: {
        observations: [{ label: 'Took center sector. Watching three directions from the church corner with a coffee.' }],
      },
      nextNodeId: 'firstSighting',
    },

    sectorNorth: {
      id: 'sectorNorth',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'NORTH //',
        heading: 'Past the construction site, again.',
        register: 'narrative',
        body: [
          'The trailer light is off tonight. The lot is empty in a way that feels arranged. Two other walkers from the meeting are doing the perimeter of the lot with their headlamps tilted at the chain-link.',
          'You take the cul-de-sac side. The Greenes’ garage is fully closed for the first time you can remember.',
        ],
      },
      onActivate: { vigilance: 1 },
      ledger: {
        observations: [
          { label: 'Construction trailer dark tonight. Two walkers checking the chain-link.', detail: 'The lot is arranged-empty, not unused-empty.' },
          { label: 'The Greenes’ garage is fully closed for the first time in days.' },
        ],
      },
      nextNodeId: 'firstSighting',
    },

    sectorSouth: {
      id: 'sectorSouth',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 40,
      content: {
        eyebrow: 'SOUTH //',
        heading: 'Mrs. Caldwell’s street, no Mrs. Caldwell.',
        register: 'narrative',
        body: [
          'The block is quieter than the others. Most walkers are clustered near the church. Down here it is you, two old hands from Block Watch, and a young couple you do not know who said they signed up "last week."',
          'Mrs. Caldwell’s porch light is on. Her kitchen window is still dark. Her blinds are still drawn.',
        ],
      },
      onActivate: { insight: 1, resolve: -1 },
      ledger: {
        meetNpcs: [{ id: 'newCouple', name: 'New couple', skin: 'neighborhood' }],
        tagNpcs: { newCouple: ['signed-up-last-week'] },
        observations: [
          { label: 'New couple walking south sector with me. Said they signed up "last week."', npcId: 'newCouple' },
          { label: 'Mrs. Caldwell’s porch light is on but her kitchen is still dark. Blinds still drawn.', npcId: 'mrsCaldwell' },
        ],
      },
      nextNodeId: 'firstSighting',
    },

    // ~38% - first chance: catch a coordinated movement (VIGILANCE)
    firstSighting: {
      id: 'firstSighting',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.38 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'A PATTERN //',
        heading: 'Walkers and not-walkers.',
        register: 'narrative',
        body: [
          'You watch the walkers move and the walkers move the way a community walks - in clusters, slow, talking. You watch the non-walkers, the people on the porches, the people in the parked cars. Something in the second group is not in the rhythm of the first.',
        ],
      },
      check: {
        stat: 'vigilance',
        dc: 14,
        prompt:
          'Three porches have people sitting on them. Two of those porches belong to families you know. One belongs to the Hwangs, who are still out of town. Whoever is on the Hwangs’ porch is sitting on a folding chair somebody brought. They have a coffee. They are watching the walkers, not the street.',
        outcomes: {
          success: {
            nextNodeId: 'afterFirst',
            effects: { vigilance: 1, insight: 1 },
            flags: ['neighborhood.raid.read.porches'],
            caption:
              'You catch it cleanly: someone is using the Hwangs’ empty porch as a watchpost. The folding chair and coffee are props. They are clocking who is on the watch tonight, not what is happening on the street. You do not pause. You do not look toward the Hwangs’ as you pass.',
            ledger: {
              meetNpcs: [{ id: 'hwangsPorchWatcher', name: 'Watcher on the Hwangs’ porch', skin: 'neighborhood' }],
              tagNpcs: { hwangsPorchWatcher: ['cataloging-walkers'] },
              observations: [
                {
                  label: 'Someone is using the Hwangs’ empty porch as a watchpost.',
                  detail: 'Folding chair, coffee, watching the walkers not the street. They are clocking who is on watch.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterFirst',
            effects: { vigilance: 1 },
            flags: ['neighborhood.raid.read.porches.partial'],
            caption:
              'Something about the Hwangs’ porch reads wrong. You cannot name the wrong. You file the porch and keep walking. The coffee and the chair will come back to you later, in the wrong order.',
            ledger: {
              observations: [{ label: 'Hwangs’ porch felt wrong. Could not name it.' }],
            },
          },
          failure: {
            nextNodeId: 'afterFirst',
            effects: { resolve: -1 },
            flags: ['neighborhood.raid.missed.porches'],
            caption:
              'You see porches with people on them. You assume the people are the residents. Briarwood lets you assume. You walk on.',
            ledger: {
              observations: [{ label: 'I walked past the Hwangs’ porch without reading it.' }],
            },
          },
        },
      },
    },

    afterFirst: {
      id: 'afterFirst',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You match the crowd.',
        register: 'narrative',
        body: [
          'You let yourself disappear back into the rhythm of forty people walking. The crowd is its own cover.',
          'You keep your eyes wide. You let the patterns come to you instead of going to them.',
        ],
      },
      nextNodeId: 'sandersonsOnFoot',
    },

    // ~52% - the Sandersons walking. First time you have seen them in days.
    sandersonsOnFoot: {
      id: 'sandersonsOnFoot',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.52 },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'SIGHTING //',
        heading: 'The Sandersons are walking.',
        register: 'narrative',
        body: [
          'You see them ahead of you on Briar Lane. Mr. Sanderson in a windbreaker. Mrs. Sanderson with a knit cap and her hands jammed into her coat pockets. They are not talking to each other. They are walking very close to each other.',
          'Mrs. Sanderson looks at you when you pass. Mr. Sanderson does not. Mrs. Sanderson nods, the way someone nods to a person they are trying to send a message to without sending one.',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        affinity: { sandersons: 1 },
        observations: [
          {
            label: 'The Sandersons are walking the route in person for the first time in days.',
            detail: 'Walking very close. Not talking. Mrs. Sanderson made eye contact with me; Mr. Sanderson did not.',
            npcId: 'sandersons',
          },
        ],
      },
      nextNodeId: 'callInCheck',
    },

    // ~62% - midwalk radio check
    callInCheck: {
      id: 'callInCheck',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.62 },
      minDwellSeconds: 32,
      content: {
        eyebrow: 'RADIO //',
        register: 'fieldlog',
        heading: 'Janelle clicks into your channel.',
        body: [
          '"Center to all sectors. Status?" - One click back from north. One click back from south. One click from you. Three clicks total means three sectors clean. None of the three is true; the radio is a head count, not a read.',
          'You glance toward the Hwangs’ porch from a block away. The folding chair is gone.',
        ],
      },
      ledger: {
        observations: [
          { label: 'Radio check. Three clicks reported clean. The folding chair on the Hwangs’ porch is gone.' },
        ],
      },
      nextNodeId: 'eyeContactCheck',
    },

    // ~72% - second chance: face-to-face with the woman from the truck (RESOLVE)
    eyeContactCheck: {
      id: 'eyeContactCheck',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.72 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'CONTACT //',
        heading: 'You see her in the crowd.',
        register: 'narrative',
        body: [
          'A woman in a quilted jacket, a knit cap, gloved hands wrapped around a paper cup. She has a Block Watch lanyard on. You have seen her face before. You saw it through a truck window two nights ago.',
        ],
      },
      check: {
        stat: 'resolve',
        dc: 15,
        prompt:
          'She is in your group now. She is doing the walk you are doing. She has decided to be one of you tonight, on paper, with a name tag. She is reading every walker she passes. She will read you in about eight seconds. You have decisions to make about whether you recognize her, and if so, how visibly.',
        outcomes: {
          success: {
            nextNodeId: 'afterContact',
            effects: { resolve: 2, insight: 1 },
            flags: ['neighborhood.raid.held.contact'],
            caption:
              'You let your eyes pass over her at exactly the rate they would pass over anyone in a coat in a coffee-clutch in a crowd. No recognition. No avoidance. She passes you without flicker. Her eyes do not change. Her stride does not change. You have already filed her face from a different angle. She has not filed yours.',
            ledger: {
              tagNpcs: { 'truck.driver': ['embedded-in-walk', 'did-not-clock-me'] },
              observations: [
                {
                  label: 'The woman from the truck is on the walk tonight. Block Watch lanyard. I did not flicker.',
                  detail: 'She read me without recognizing me. I had already filed her from Sunday.',
                  npcId: 'truck.driver',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterContact',
            effects: { resolve: 1, vigilance: -1 },
            flags: ['neighborhood.raid.partial.contact'],
            caption:
              'Your eyes catch on hers for a fraction too long. She catches them catching. She does not stop walking. She does not slow. Her stride does not change. But she now knows what your face looks like when it is trying to be calm.',
            ledger: {
              tagNpcs: { 'truck.driver': ['noticed-me'] },
              observations: [{ label: 'Held eye contact with the truck woman half a beat too long.', npcId: 'truck.driver' }],
            },
          },
          failure: {
            nextNodeId: 'afterContact',
            effects: { resolve: -2 },
            flags: ['neighborhood.raid.fail.contact'],
            caption:
              'Your face does it before your brain does. A small involuntary register. Recognition is the loudest signal a face can make. She sees it. She files it. She keeps walking.',
            ledger: {
              tagNpcs: { 'truck.driver': ['knows-I-recognized-her'] },
              observations: [{ label: 'My face flickered. The truck woman now knows that I know.', npcId: 'truck.driver' }],
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
        heading: 'The crowd absorbs the moment.',
        register: 'narrative',
        body: [
          'Whatever just happened, the crowd is the canvas it happened on. Forty walkers, four porches of audience, two airpots of coffee. The block does not slow down for what passed between two people.',
          'Adrenaline goes through your hands and out. Your fingers warm in a cold pocket.',
        ],
      },
      nextNodeId: 'finalChoice',
    },

    // ~88% - three-way final
    finalChoice: {
      id: 'finalChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.88 },
      minDwellSeconds: 20,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Hand it off, hold it, or escalate.',
        register: 'narrative',
        body: [
          'You can pull Janelle off the corner and brief her on the woman, the porch, the chair, everything. You can hold it - too many strangers on this walk, too many porches with audiences. You can escalate to a non-emergency call right now, with the crowd as cover and forty witnesses.',
        ],
      },
      choices: [
        {
          id: 'briefJanelle',
          label: 'Pull Janelle aside. Tell her everything.',
          hint: 'You stop being alone with what you saw, again.',
          voiceAliases: ['janelle', 'brief', 'tell', 'first'],
          nextNodeId: 'briefedJanelle',
          effects: { insight: 1, vigilance: 1 },
          flags: ['neighborhood.raid.briefedJanelle'],
          ledger: { affinity: { janelle: 2 }, observations: [{ label: 'Briefed Janelle in person. Told her about the truck woman.' }] },
        },
        {
          id: 'holdRaid',
          label: 'Hold it. Too many ears.',
          hint: 'You walk home and sit on it until morning.',
          voiceAliases: ['hold', 'wait', 'too many', 'second'],
          nextNodeId: 'heldRaid',
          effects: { resolve: 1, insight: -1 },
          flags: ['neighborhood.raid.heldRaid'],
          ledger: { observations: [{ label: 'Held the brief. Too many ears on the walk to hand it off in public.' }] },
        },
        {
          id: 'escalateRaid',
          label: 'Step away. Call non-emergency now.',
          hint: 'You make it official under cover of the crowd.',
          voiceAliases: ['escalate', 'call', 'non-emergency', 'third'],
          nextNodeId: 'escalatedRaid',
          effects: { resolve: 1, vigilance: 1 },
          flags: ['neighborhood.raid.escalatedRaid'],
          requires: { minStats: { resolve: 11 } },
          ledger: { observations: [{ label: 'Called non-emergency from the middle of the walk. Identified the woman with the lanyard.' }] },
        },
      ],
    },

    briefedJanelle: {
      id: 'briefedJanelle',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'HANDED OFF //',
        heading: 'Janelle absorbs it without blinking.',
        register: 'narrative',
        body: [
          'She listens with her whole face the way she did three nights ago. When you finish she nods once. She says, "She is on the roster as Karen Ellis, signed up three weeks ago. I will pull her sign-in card. Walk back with the group like nothing happened."',
          'You walk back with the group like nothing happened. Something has happened.',
        ],
      },
      onActivate: { resolve: 1 },
      ledger: {
        meetNpcs: [{ id: 'karen.ellis', name: 'Karen Ellis (alias)', skin: 'neighborhood' }],
        tagNpcs: { 'karen.ellis': ['signed-up-three-weeks-ago', 'is-truck-driver'] },
        observations: [{ label: 'The truck woman signed up to Block Watch three weeks ago as "Karen Ellis."', npcId: 'karen.ellis' }],
      },
      nextNodeId: 'wrap',
    },

    heldRaid: {
      id: 'heldRaid',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'HELD //',
        heading: 'You walk back to the church corner.',
        register: 'narrative',
        body: [
          'You take a second coffee you do not want. You make small talk with people you have known for years about subjects you will not remember tomorrow. You watch the woman with the lanyard hand in her sign-in card to Janelle. You watch Janelle smile and not write anything down.',
          'You will tell Janelle tomorrow. You hope tomorrow is in time.',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        observations: [{ label: 'Did not brief Janelle in person. Watched the truck woman sign out and leave with the crowd.' }],
      },
      nextNodeId: 'wrap',
    },

    escalatedRaid: {
      id: 'escalatedRaid',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 38,
      content: {
        eyebrow: 'ON RECORD //',
        register: 'fieldlog',
        heading: 'You step behind the church.',
        body: [
          'You dial non-emergency. You describe the woman, the lanyard, the truck from Sunday, the pickup from Monday, the hooded man from last night. You identify the porch on the Hwangs’. You give them your location at the church.',
          'They send a cruiser in eight minutes. The cruiser does not turn its lights on. The cruiser knows the difference between investigating and broadcasting.',
        ],
      },
      onActivate: { resolve: 2 },
      ledger: {
        observations: [
          { label: 'Called non-emergency from behind the church mid-walk. Identified the truck woman, the porch, the hooded man.', detail: 'They sent a cruiser quietly within eight minutes.' },
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
        eyebrow: 'AFTER THE WALK //',
        heading: 'The church corner empties.',
        register: 'narrative',
        body: [
          'Walkers peel off in twos and threes. The folding table comes down. The airpots go back into the cars they came in. Half the neighborhood remembers tonight as the community walk; a quarter remembers it as a community walk where they were also lookouts; the rest do not know they were on watch at all.',
          'You walk home. Your phone is in your pocket. It does not buzz tonight. It is too crowded a night for one quiet message to land.',
        ],
      },
      debrief: {
        closingLine:
          'The block walked together once a week for nineteen years before this week. This week the walk was the cover. Next week the walk will be the cover for what you do next.',
        nextChapterTease:
          'Chapter 3 - Mrs. Caldwell’s blinds open. She is awake. She has been awake the whole time.',
      },
    },
  },

  gpsAnchors: [
    {
      id: 'opp.raid.cluster',
      kind: 'opportunistic',
      radiusMeters: 30,
      dwellSeconds: 25,
      minDistancePct: 0.30,
      maxDistancePct: 0.70,
      content: {
        eyebrow: 'STOP //',
        heading: 'You join a cluster.',
        register: 'narrative',
        body: [
          'You stop near a knot of walkers. They are talking about a vacation, a refinance, a kid in middle school. You let the conversation happen around you. You count headlamps on the next block.',
          'You move on when the talk turns to weather. Nobody notices you leaving.',
        ],
      },
      flags: ['neighborhood.raid.anchor.cluster.fired'],
      ledger: {
        observations: [{ label: 'Stopped with a walking cluster. Counted headlamps on the next block while they talked.' }],
      },
    },
  ],
};
