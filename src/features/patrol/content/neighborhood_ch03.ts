// Neighborhood Watch - Chapter 3: "She Has Been Awake"
//
// Morning walk. The time-of-day shift is the arc signal: three nights of
// reading the block in the dark, and now you are walking it in the gray
// hours before sunrise. The Caldwell house has been the negative space of
// every prior chapter - dark kitchen window, drawn blinds, missing eighty-
// four-year-old. Today the blinds are open.
//
// Structurally the chapter is a walk with a long kitchen interlude in the
// middle. The interlude is authored as a sequence of immediate-trigger beats
// with high minDwellSeconds so the player keeps walking in real life while
// the dialogue plays in their ear. Two chance moments (Insight reading her
// hand-kept ledger, Vigilance spotting the truck driver's RV three blocks
// over). Three-way final: escalate to police / partner with Caldwell /
// hold and develop quietly.
//
// Hard-requires Ch.2. Many beats inflect on Ch.1 + Ch.2 ledger flags.

import type { StoryGraph } from '../types/storyGraph';

export const neighborhoodWatchChapter3: StoryGraph = {
  id: 'neighborhood.ch03.sheHasBeenAwake',
  skin: 'neighborhood',
  chapter: 3,
  title: 'She Has Been Awake',
  subtitle: 'Morning 1 // The window that was dark',
  requiresChapters: ['neighborhood.ch02.theCarIsGone'],
  briefing: [
    'You did not sleep well again. By 5:40 you gave up. By 6:05 you were on your porch with a coffee and the cold air.',
    'You walk in the gray hour before sunrise because you have something to look at that night could not show you. Briarwood at dawn is a different room. Mrs. Caldwell’s blinds are open for the first time in four mornings.',
  ],
  targetMeters: 1800,
  targetSeconds: 1500,
  entryNodeId: 'opening',

  microTells: [
    // morning-walk universals (7)
    { id: 'mt.frost', line: 'There is frost on three lawns but not the fourth. The fourth lawn has been walked on within the hour.', weight: 1.4, minDistancePct: 0.05 },
    { id: 'mt.coffeeSteam', line: 'You can see your coffee steam in the air. The block has not turned its furnaces over yet.', weight: 0.8, minDistancePct: 0.10 },
    { id: 'mt.runnerEarly', line: 'A runner passes you in expensive shoes and a vest that does not fit them. They do not nod.', weight: 1.2, minDistancePct: 0.15 },
    { id: 'mt.newspaperToss', line: 'The paper carrier rolls past and tosses one paper to a porch that has been collecting them.', weight: 1.0, minDistancePct: 0.20 },
    { id: 'mt.foxOrCat', line: 'Something dog-sized crosses Briar Lane two blocks ahead. Wrong gait for a dog. Wrong size for a cat. Probably a fox. Probably.', weight: 0.9, minDistancePct: 0.30 },
    { id: 'mt.sandersonsCurtain', line: 'The Sandersons’ curtain is fully drawn for the first time you can remember.', weight: 1.3, minDistancePct: 0.40, maxDistancePct: 0.80 },
    { id: 'mt.streetlightOff', line: 'The streetlamps cut out one by one as the sky lightens. The block sheds its night skin.', weight: 0.7, minDistancePct: 0.50 },

    // gated on prior-chapter outcomes
    { id: 'mt.knockMemoryMorning', line: 'You hear the click of the Sandersons’ door from two nights ago. The morning quiet brings it back uninvited.', weight: 1.0, requiresFlag: 'neighborhood.knocked', minDistancePct: 0.15 },
    { id: 'mt.calledInRecord', line: 'A patrol car parked at the corner of Briar and Third has its engine cold. It has been there since before you started walking.', weight: 1.3, requiresFlag: 'neighborhood.ch02.calledIn', minDistancePct: 0.25 },
    { id: 'mt.confrontedMemory', line: 'You catch yourself looking at every pickup with mud splash. There are three in the four blocks you have walked. None of them are the right one.', weight: 1.1, requiresFlag: 'neighborhood.ch02.confronted', minDistancePct: 0.20 },
    { id: 'mt.withdrewNotes', line: 'Your jacket pocket weighs more than usual. Two notebooks now.', weight: 0.9, requiresFlag: 'neighborhood.ch02.withdrew', minDistancePct: 0.20 },
    { id: 'mt.briefedMemory', line: 'You wonder how Janelle slept. Her clipboard is bigger than yours.', weight: 1.0, requiresFlag: 'neighborhood.raid.briefedJanelle', minDistancePct: 0.30 },

    // late (3)
    { id: 'mt.late.bakeryOpen', line: 'The bakery on Briar opens at 6:30. The lights are on at 6:18.', weight: 1.0, minDistancePct: 0.70 },
    { id: 'mt.late.commuterFirst', line: 'The first commuter car of the day passes you, headlights still on. The driver yawns.', weight: 0.8, minDistancePct: 0.78 },
    { id: 'mt.late.birdsStart', line: 'The birds start. All at once, like somebody flipped a switch. Then they will not stop.', weight: 1.1, minDistancePct: 0.85 },
  ],

  nodes: {
    // 0%
    opening: {
      id: 'opening',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'DAWN //',
        heading: 'Blinds open.',
        register: 'narrative',
        body: [
          'You walk south first because you cannot help it. Mrs. Caldwell’s house sits at the bend of Briar where the lots turn from rectangles into wedges, and the kitchen window faces the sidewalk.',
          'The blinds are up. The kitchen light is on. A coffeepot is on the counter. Mrs. Caldwell is in her blue cardigan at the sink, looking out. She sees you immediately.',
        ],
      },
      flags: ['neighborhood.ch03.entered'],
      ledger: {
        observations: [
          {
            label: 'Mrs. Caldwell’s blinds are open. She is at the kitchen window in her blue cardigan.',
            detail: 'First time her window has been lit in four mornings. She saw me immediately.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'theWave',
    },

    // ~8%
    theWave: {
      id: 'theWave',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.08 },
      minDwellSeconds: 28,
      content: {
        eyebrow: 'SIGNAL //',
        heading: 'She waves you in.',
        register: 'narrative',
        body: [
          'It is not a casual wave. She uses two fingers, points at her front door, then at her coffeepot, then at you. The whole sequence takes about two seconds. The whole sequence is a sentence.',
          'You have a decision to make in about twelve more steps.',
        ],
      },
      onActivate: { insight: 1 },
      nextNodeId: 'invitationChoice',
    },

    // ~14% - go in / wave back / pretend not to see
    invitationChoice: {
      id: 'invitationChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.14 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Cross her walk, or keep walking.',
        register: 'narrative',
        body: [
          'Twelve steps. The walk-up to her porch. The cardigan in the window. The coffeepot.',
        ],
      },
      choices: [
        {
          id: 'goIn',
          label: 'Cross her walk. Sit for one cup.',
          hint: 'You step inside the chapter.',
          voiceAliases: ['go in', 'cross', 'kitchen', 'first'],
          nextNodeId: 'acceptedInvite',
          effects: { insight: 1 },
          flags: ['neighborhood.ch03.acceptedInvite'],
          ledger: { affinity: { mrsCaldwell: 2 } },
        },
        {
          id: 'waveBack',
          label: 'Wave back. Keep walking.',
          hint: 'You acknowledge. You do not commit.',
          voiceAliases: ['wave', 'keep walking', 'second'],
          nextNodeId: 'waveOnly',
          effects: { resolve: 1, insight: -1 },
          flags: ['neighborhood.ch03.waved'],
        },
        {
          id: 'pretendNotToSee',
          label: 'Pretend you did not see her.',
          hint: 'You leave her at the window. You walk it alone.',
          voiceAliases: ['pretend', 'ignore', 'third'],
          nextNodeId: 'walkedPast',
          effects: { resolve: 1, insight: -2 },
          flags: ['neighborhood.ch03.ignoredCaldwell'],
          ledger: { affinity: { mrsCaldwell: -2 } },
        },
      ],
    },

    // path A - went in
    acceptedInvite: {
      id: 'acceptedInvite',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 45,
      content: {
        eyebrow: 'KITCHEN //',
        heading: 'The door is unlocked.',
        register: 'narrative',
        body: [
          'You cross her walk and try the door without knocking. It opens. The house smells like coffee and old books and the faint rosewater of someone who has been in the same house for forty years.',
          '"In here, dear," she calls from the kitchen. She is not surprised it is you. She is not surprised it is morning.',
        ],
      },
      onActivate: { resolve: 1 },
      ledger: {
        tagNpcs: { mrsCaldwell: ['hosted-me'] },
      },
      nextNodeId: 'theTable',
    },

    theTable: {
      id: 'theTable',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 60,
      content: {
        eyebrow: 'KITCHEN //',
        heading: 'She has two mugs out.',
        register: 'narrative',
        body: [
          '"Sit down," she says, in the voice teachers use. "You take it black?" She knew you took it black. She has known the people who walk this block since most of them were five.',
          'She slides a paper napkin across the table and a small bound notebook the size of a passport. The notebook’s cover is leather and has the shape of being handled for a long time.',
        ],
      },
      ledger: {
        observations: [
          {
            label: 'Mrs. Caldwell put a small leather notebook on the table.',
            detail: 'The size of a passport. Handled for a long time.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'theNotebook',
    },

    // ~30% - first chance: read her ledger (INSIGHT)
    theNotebook: {
      id: 'theNotebook',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.30 },
      revealDelaySeconds: 6,
      content: {
        eyebrow: 'A LEDGER //',
        heading: 'She slides it across the table.',
        register: 'narrative',
        body: [
          '"It’s not in any order you would recognize. You will have to read it the way I write it." She is testing you, kindly. The cardigan does not change the test.',
        ],
      },
      check: {
        stat: 'insight',
        dc: 14,
        prompt:
          'You open it. Dates down the left margin going back fourteen years. Plate numbers, partial. House numbers without street names. A small drawing of a car shape with a notation: "rt mirror, ptd over." Initials of people you sort of know, then numbers that are not phone numbers. The pages are not in chronological order. The pages are in the order she revisited them.',
        outcomes: {
          success: {
            nextNodeId: 'afterNotebook',
            effects: { insight: 2 },
            flags: ['neighborhood.ch03.read.notebook'],
            caption:
              'You read it in three layers: the dates are timestamps of arrival, the partial plates are surveillance abbreviations, and the page order is access order - the pages she opens are the active cases. Three pages are dog-eared. One is Echo-Four-One-Seven. One is the pickup. One is a third vehicle you have never seen, with a date from two months ago.',
            ledger: {
              tagNpcs: { mrsCaldwell: ['hand-kept-ledger', 'surveillance-trained'] },
              observations: [
                {
                  label: 'Mrs. Caldwell has been keeping a hand-written surveillance log for fourteen years.',
                  detail: 'Three active pages today: the sedan, the pickup, and a third vehicle from two months ago.',
                  npcId: 'mrsCaldwell',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterNotebook',
            effects: { insight: 1 },
            flags: ['neighborhood.ch03.read.notebook.partial'],
            caption:
              'You can read about half. The plates make sense. The "rt mirror, ptd over" makes sense. The page order does not. She watches you try and smiles small. "That part takes a while."',
            ledger: {
              observations: [{ label: 'Caldwell’s notebook is a surveillance log. I could read half of it.', npcId: 'mrsCaldwell' }],
            },
          },
          failure: {
            nextNodeId: 'afterNotebook',
            effects: { resolve: -1 },
            flags: ['neighborhood.ch03.missed.notebook'],
            caption:
              'You flip through politely. You do not see what she wants you to see. She closes it gently after a minute. "Take a sip," she says. "We will get there."',
            ledger: {
              observations: [{ label: 'Mrs. Caldwell showed me her notebook. I did not read it.', npcId: 'mrsCaldwell' }],
            },
          },
        },
      },
    },

    afterNotebook: {
      id: 'afterNotebook',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 60,
      content: {
        eyebrow: 'KITCHEN //',
        heading: 'She closes the notebook. She tells you.',
        register: 'narrative',
        body: [
          '"My husband was a county investigator. He retired in 1981 and ran his own work out of this kitchen until 2006. I watched. I asked. He answered. After he died I kept watching."',
          '"You and Janelle and the truck and the man in the hood - this is the third time in fourteen years I have seen them set up here. The first two times nothing happened. The third time is now."',
        ],
      },
      onActivate: { insight: 1 },
      ledger: {
        tagNpcs: { mrsCaldwell: ['retired-investigator-spouse', 'has-precedent'] },
        observations: [
          {
            label: 'Caldwell: this is the third time in fourteen years she has seen "them" set up here.',
            detail: 'Her late husband was a county investigator. She trained beside him.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'partnerOffer',
    },

    // ~48% - partner with her / refuse
    partnerOffer: {
      id: 'partnerOffer',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.48 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'OFFER //',
        heading: '"I would like a partner."',
        register: 'narrative',
        body: [
          '"You have a young face and you walk every night. I have a kitchen window and fourteen years of pages. Neither of us is enough alone. Together we are roughly one whole watcher."',
          'She looks at you over her cup. The offer is exactly as serious as she is making it sound.',
        ],
      },
      choices: [
        {
          id: 'accept',
          label: '"I am in."',
          hint: 'You become a partnership.',
          voiceAliases: ['in', 'partner', 'yes', 'first'],
          nextNodeId: 'partnered',
          effects: { insight: 1, resolve: 1 },
          flags: ['neighborhood.ch03.partnered'],
          ledger: { affinity: { mrsCaldwell: 3 }, tagNpcs: { mrsCaldwell: ['partner'] } },
        },
        {
          id: 'consider',
          label: '"Let me think on it."',
          hint: 'You buy a day. You are not refusing.',
          voiceAliases: ['think', 'consider', 'day', 'second'],
          nextNodeId: 'considering',
          effects: { vigilance: 1 },
          flags: ['neighborhood.ch03.considering'],
          ledger: { affinity: { mrsCaldwell: 1 } },
        },
        {
          id: 'decline',
          label: '"I cannot. Not formally."',
          hint: 'You decline the partnership. The conversation does not end.',
          voiceAliases: ['decline', 'no', 'cannot', 'third'],
          nextNodeId: 'declined',
          effects: { resolve: 1, insight: -1 },
          flags: ['neighborhood.ch03.declined'],
        },
      ],
    },

    partnered: {
      id: 'partnered',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 50,
      content: {
        eyebrow: 'PARTNERED //',
        heading: 'She nods once.',
        register: 'narrative',
        body: [
          '"Good. You walk. I write. We compare on Sunday afternoons at this table." She hands you a folded piece of paper with three pencil drawings of cars on it, including the third one you have not seen. "Look for this one. It will come."',
          'You finish the coffee. You step back out into the cold morning with three drawings in your inside pocket and a partner who has more pages than you.',
        ],
      },
      onActivate: { resolve: 1 },
      ledger: {
        observations: [
          {
            label: 'Caldwell handed me drawings of three vehicles. Third one I have not seen yet.',
            detail: 'Partnered. Sunday afternoons at her kitchen table.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'backToWalk',
    },

    considering: {
      id: 'considering',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 50,
      content: {
        eyebrow: 'CONSIDERING //',
        heading: 'She does not push.',
        register: 'narrative',
        body: [
          '"Of course, dear. I will be here." She does not give you the drawings. She does give you a sheet she has copied from the back of her notebook - dates only. "You will know whether the dates mean something to you by tomorrow."',
          'You fold it twice and step back out. The morning is colder than when you went in.',
        ],
      },
      ledger: {
        observations: [{ label: 'Caldwell gave me a sheet of dates from her notebook. Said I would know by tomorrow whether they meant something.', npcId: 'mrsCaldwell' }],
      },
      nextNodeId: 'backToWalk',
    },

    declined: {
      id: 'declined',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 50,
      content: {
        eyebrow: 'DECLINED //',
        heading: '"I understand. Sit a minute anyway."',
        register: 'narrative',
        body: [
          'She does not look offended. She looks like she has been declined before. "You do not have to say yes to be useful, dear. You only have to keep walking and tell Janelle what you see. You are already useful."',
          'She tops up your coffee. You stay for one more minute. You step out into the cold morning with no drawings and an understanding of what you said no to.',
        ],
      },
      onActivate: { resolve: 1 },
      ledger: {
        observations: [{ label: 'Declined Caldwell’s partnership. She was not surprised.', npcId: 'mrsCaldwell' }],
      },
      nextNodeId: 'backToWalk',
    },

    // path B - waved back only
    waveOnly: {
      id: 'waveOnly',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'WAVE //',
        heading: 'She watches you walk past.',
        register: 'narrative',
        body: [
          'You wave. She nods. You keep walking. You feel her watch you for the next fifty yards as you turn the corner.',
          'Whatever was on offer in that kitchen, you said maybe-later to. The morning is colder.',
        ],
      },
      onActivate: { insight: -1 },
      ledger: {
        observations: [{ label: 'Mrs. Caldwell waved me in. I waved and kept walking.', npcId: 'mrsCaldwell' }],
      },
      nextNodeId: 'backToWalk',
    },

    // path C - pretended not to see
    walkedPast: {
      id: 'walkedPast',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'PASSED //',
        heading: 'You keep your eyes ahead.',
        register: 'narrative',
        body: [
          'You walk past her front walk like the windows are unlit. You hear her step away from the sink when you reach her property line. You do not look. The blinds stay open. You do not look.',
          'You are sure she saw you not look. You are sure she filed it.',
        ],
      },
      onActivate: { insight: -1, resolve: -1 },
      ledger: {
        observations: [{ label: 'Pretended not to see Mrs. Caldwell. She knew.', npcId: 'mrsCaldwell' }],
      },
      nextNodeId: 'backToWalk',
    },

    // ~62% - rejoin the walk loop
    backToWalk: {
      id: 'backToWalk',
      type: 'beat',
      trigger: { kind: 'distancePct', pct: 0.62 },
      minDwellSeconds: 30,
      content: {
        eyebrow: 'RESUMING //',
        heading: 'The block looks different.',
        register: 'narrative',
        body: [
          'Whatever you carried out of that kitchen (notebook, drawings, dates, nothing, the weight of having pretended not to see her) - the block looks different now. The same yards. The same sidewalks. The lighting has shifted by ten degrees since you started walking and you can see things you could not see in the dark.',
        ],
      },
      onActivate: { insight: 1 },
      nextNodeId: 'rvSighting',
    },

    // ~78% - second chance: spotting the RV (VIGILANCE)
    rvSighting: {
      id: 'rvSighting',
      type: 'chance',
      trigger: { kind: 'distancePct', pct: 0.78 },
      revealDelaySeconds: 5,
      content: {
        eyebrow: 'PARKED //',
        heading: 'An RV at the back of the school lot.',
        register: 'narrative',
        body: [
          'You round the corner of the elementary school and there is an RV in the back of the parking lot. White, mid-sized, curtains pulled across every window. Mud splash up the sides. Two folding chairs leaned against the wheel well.',
        ],
      },
      check: {
        stat: 'vigilance',
        dc: 14,
        prompt:
          'Read the RV. The plate is the same county as the sedan. The mud is consistent with the pickup. The curtain in the back window is parted half an inch on one side. The two folding chairs are not weathered - they were brought here recently. The roof rack has a small antenna that is not part of any factory package. The school parking lot is officially empty until 6:50 when the principal arrives. The RV has been here at least an hour and will be gone before 6:50.',
        outcomes: {
          success: {
            nextNodeId: 'afterRv',
            effects: { vigilance: 2 },
            flags: ['neighborhood.ch03.read.rv'],
            caption:
              'You read it cleanly: this is the staging vehicle. The sedan and the pickup are watchers; the RV is the base. Antenna for comms, parted curtain for line of sight on the back-lot exit, two chairs for rotating operators. They will be gone in twenty minutes. You walk past at the rate of a person walking. You memorize the plate. You add the make and model to the photo your eyes are taking.',
            ledger: {
              meetNpcs: [{ id: 'rv.school', name: 'School-lot RV', skin: 'neighborhood' }],
              tagNpcs: { 'rv.school': ['staging-vehicle', 'comms-antenna', 'parted-curtain', 'two-chairs'] },
              observations: [
                {
                  label: 'White RV in the elementary school parking lot. Comms antenna, parted curtain, two folding chairs.',
                  detail: 'This is the base. The sedan and pickup were watchers. They will be gone by 6:50.',
                },
              ],
            },
          },
          partial: {
            nextNodeId: 'afterRv',
            effects: { vigilance: 1 },
            flags: ['neighborhood.ch03.read.rv.partial'],
            caption:
              'You catch the RV is not a parent’s RV. The mud, the chairs, the curtain. You do not catch the antenna or the timing. You file the RV. You will be looking for it tomorrow.',
            ledger: {
              meetNpcs: [{ id: 'rv.school', name: 'School-lot RV', skin: 'neighborhood' }],
              observations: [{ label: 'White RV in the school lot. Suspicious. Did not catch all details.' }],
            },
          },
          failure: {
            nextNodeId: 'afterRv',
            effects: { resolve: -1 },
            flags: ['neighborhood.ch03.missed.rv'],
            caption:
              'You see an RV. You see a school. You assume someone is dropping off and walk on. The morning gets quieter behind you.',
            ledger: {
              observations: [{ label: 'An RV was in the school lot at dawn. I walked past without reading it.' }],
            },
          },
        },
      },
    },

    afterRv: {
      id: 'afterRv',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 32,
      content: {
        eyebrow: 'AFTER //',
        heading: 'You keep the same pace home.',
        register: 'narrative',
        body: [
          'You do not look back at the RV. You do not slow. The walk home is sixty seconds and you spend it deciding what you do with what you have.',
          'Three things go in your pocket today: the morning, the kitchen, and the school lot. They weigh different amounts.',
        ],
      },
      nextNodeId: 'finalChoice',
    },

    // ~92% - three-way final
    finalChoice: {
      id: 'finalChoice',
      type: 'choice',
      trigger: { kind: 'distancePct', pct: 0.92 },
      minDwellSeconds: 18,
      content: {
        eyebrow: 'DECISION //',
        heading: 'Tell whom.',
        register: 'narrative',
        body: [
          'You are forty feet from your own porch. Three numbers in your phone. Three ways forward.',
        ],
      },
      choices: [
        {
          id: 'escalate',
          label: 'Call detective non-emergency. Cite the RV and the network.',
          hint: 'Official. Loud. Real consequences possible today.',
          voiceAliases: ['call', 'detective', 'escalate', 'first'],
          nextNodeId: 'escalated',
          effects: { resolve: 1, vigilance: 1 },
          flags: ['neighborhood.ch03.escalated'],
          ledger: { observations: [{ label: 'Called detective non-emergency. Cited the RV, the staging, the network.' }] },
        },
        {
          id: 'partnerUp',
          label: 'Walk back to Mrs. Caldwell. Tell her about the RV.',
          hint: 'You hand it to her. Sunday afternoon comes early.',
          voiceAliases: ['caldwell', 'walk back', 'kitchen', 'second'],
          nextNodeId: 'backToCaldwell',
          requires: { hasFlag: 'neighborhood.ch03.partnered' },
          effects: { insight: 2 },
          flags: ['neighborhood.ch03.toldCaldwell'],
          ledger: { affinity: { mrsCaldwell: 2 } },
        },
        {
          id: 'holdHome',
          label: 'Go home. Write it down. Tell Janelle at 7:30.',
          hint: 'You schedule the disclosure. You do not improvise.',
          voiceAliases: ['home', 'write', 'janelle', 'third'],
          nextNodeId: 'heldHome',
          effects: { insight: 1 },
          flags: ['neighborhood.ch03.heldHome'],
          ledger: { observations: [{ label: 'Went home. Wrote it down. Plan to brief Janelle at 7:30.' }] },
        },
      ],
    },

    escalated: {
      id: 'escalated',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'ON RECORD //',
        register: 'fieldlog',
        heading: 'A detective calls you back in eleven minutes.',
        body: [
          'You describe the RV, the antenna, the parted curtain, the two folding chairs, the timing, the cross-references to the sedan and the pickup, the woman with the Block Watch lanyard, and the hooded man.',
          'The detective takes notes audibly. He asks you twice for the plate. He thanks you. He says, "We have been waiting for a call like this for two months." He does not say from whom else.',
        ],
      },
      onActivate: { resolve: 2 },
      ledger: {
        observations: [
          {
            label: 'A detective said: "We have been waiting for a call like this for two months."',
            detail: 'He did not say from whom else. There are other walkers calling in.',
          },
        ],
      },
      nextNodeId: 'wrap',
    },

    backToCaldwell: {
      id: 'backToCaldwell',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'KITCHEN //',
        heading: 'You walk back to the kitchen.',
        register: 'narrative',
        body: [
          'She is in the same cardigan, in the same chair, with a second pot of coffee on. You describe the RV. Halfway through, she pulls open the notebook to the page she had dog-eared and writes the plate beside the drawing.',
          '"That is what was missing," she says quietly. "I will call my husband’s old partner this morning. He will know what to do."',
        ],
      },
      onActivate: { insight: 2 },
      ledger: {
        tagNpcs: { mrsCaldwell: ['has-late-husbands-partner'] },
        observations: [
          {
            label: 'Mrs. Caldwell knew about the third vehicle before I described it. She wrote the plate beside her drawing.',
            detail: 'She is calling her late husband’s old partner this morning. He will know what to do.',
            npcId: 'mrsCaldwell',
          },
        ],
      },
      nextNodeId: 'wrap',
    },

    heldHome: {
      id: 'heldHome',
      type: 'beat',
      trigger: { kind: 'immediate' },
      minDwellSeconds: 36,
      content: {
        eyebrow: 'HOME //',
        register: 'fieldlog',
        heading: 'You sit at the kitchen table with both phones face down.',
        body: [
          'You write the morning out longhand first, then transcribe it into the log app. The RV. The drawings. The kitchen. The cardigan. The dates.',
          'At 7:30 sharp you call Janelle. She picks up on the first ring. "I was about to call you."',
        ],
      },
      onActivate: { insight: 1, resolve: 1 },
      ledger: {
        observations: [{ label: 'Janelle: "I was about to call you." She had information I did not have yet.' }],
      },
      nextNodeId: 'wrap',
    },

    wrap: {
      id: 'wrap',
      type: 'end',
      trigger: { kind: 'distancePct', pct: 1.0 },
      minDwellSeconds: 0,
      content: {
        eyebrow: 'HOME //',
        heading: 'The sun is up.',
        register: 'narrative',
        body: [
          'You take your boots off and your kitchen is full of light for the first time this week. You can hear birds. You can hear your refrigerator. You can hear the morning settle into being the morning.',
          'Something is going to happen on this block in the next twenty-four hours. You have decided what part of it you are.',
        ],
      },
      debrief: {
        closingLine:
          'You walked the block at dawn. The block walked you back. The Caldwells have been walking it together for fifty years and only one of them is still walking it.',
        nextChapterTease:
          'Chapter 4 - The RV moves at 6:48. You are on the porch with a coffee. Mrs. Caldwell is at her window. So is somebody on yours.',
      },
    },
  },

  gpsAnchors: [
    {
      id: 'opp.morning.bench',
      kind: 'opportunistic',
      radiusMeters: 22,
      dwellSeconds: 35,
      minDistancePct: 0.60,
      maxDistancePct: 0.95,
      content: {
        eyebrow: 'STOP //',
        heading: 'You stop to think.',
        register: 'narrative',
        body: [
          'You pause near something - a tree, a bench, a corner. The morning has changed direction since you started walking, and the block has gone from monochrome to color. Three things you would not have seen in the dark become visible.',
          'You will not write them down here. You will write them down at the kitchen table.',
        ],
      },
      flags: ['neighborhood.ch03.anchor.morning.fired'],
      ledger: {
        observations: [{ label: 'Stopped at dawn. Three details became visible that would not have been visible in the dark.' }],
      },
    },
  ],
};
