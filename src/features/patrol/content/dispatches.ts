// Off-day dispatches - one or two-sentence "the world is still here" lines
// in each skin's voice. Author 4+ per skin so they do not repeat fast.

import type { Dispatch } from '../services/offDayDispatchService';

export const dispatches: Dispatch[] = [
  // ----- Prison -----
  {
    skin: 'prison',
    eyebrow: 'YARD //',
    heading: 'The lapper did his lap.',
    body: 'The lapper did his lap. The ash on the bench has been brushed off. The yard is still there when you are ready.',
    minDaysOff: 1,
  },
  {
    skin: 'prison',
    eyebrow: 'YARD //',
    heading: 'A new face was processed.',
    body: 'A new face was processed at dawn. The east-side weights crew watched him the same way they watched you. He froze in the doorway.',
    minDaysOff: 1,
  },
  {
    skin: 'prison',
    eyebrow: 'YARD //',
    heading: 'The CO rotated towers.',
    body: 'The CO rotated towers. Whatever was about to happen yesterday did not happen today. Whatever was about to happen today is waiting.',
    minDaysOff: 2,
  },
  {
    skin: 'prison',
    eyebrow: 'YARD //',
    heading: 'A week is a long time inside.',
    body: 'A week is a long time inside. The yard has rearranged itself without you. The lapper has a new pace.',
    minDaysOff: 7,
  },

  // ----- Neighborhood -----
  {
    skin: 'neighborhood',
    eyebrow: 'BLOCK //',
    heading: 'The Sandersons left their porch light on.',
    body: 'The Sandersons left their porch light on for the second night in a row. Nobody knocked. The newspaper is still on the step.',
    minDaysOff: 1,
  },
  {
    skin: 'neighborhood',
    eyebrow: 'BLOCK //',
    heading: 'A sprinkler ran an hour past its schedule.',
    body: 'A sprinkler at the corner of Maple and Third ran an hour past its schedule. No one came out to shut it off. The lawn looks fine.',
    minDaysOff: 1,
  },
  {
    skin: 'neighborhood',
    eyebrow: 'BLOCK //',
    heading: 'Mrs. Caldwell\u2019s blinds stayed down.',
    body: 'Mrs. Caldwell\u2019s blinds stayed down all day. She has not missed her four-thirty walk in eleven years. The block is wearing the absence.',
    minDaysOff: 2,
  },
  {
    skin: 'neighborhood',
    eyebrow: 'BLOCK //',
    heading: 'A car you did not log has been on the street four nights.',
    body: 'A car you did not log has been parked outside the Hwangs\u2019 for four nights now. Nobody else has noticed. Nobody else is walking.',
    minDaysOff: 4,
  },

  // ----- They're Here -----
  {
    skin: 'theyreHere',
    eyebrow: 'BAND //',
    heading: 'The carrier wave held.',
    body: 'The carrier wave held all night. No voice rode in on it. The repeater is still warm.',
    minDaysOff: 1,
  },
  {
    skin: 'theyreHere',
    eyebrow: 'BAND //',
    heading: 'A pattern formed in the static.',
    body: 'A pattern formed in the static at 03:14 local. It did not repeat. You were not there to log it.',
    minDaysOff: 2,
  },
  {
    skin: 'theyreHere',
    eyebrow: 'BAND //',
    heading: 'A compass drifted six degrees.',
    body: 'Three phones on your block reported a compass drift of six degrees at the same moment last night. Then they recovered. Nothing on the news.',
    minDaysOff: 3,
  },

  // ----- Neighborhood Watch · stance-gated side quests -----
  {
    skin: 'neighborhood',
    eyebrow: 'WORD ON THE BLOCK //',
    heading: 'Mrs. Caldwell wants a second walker tonight.',
    body: 'You walked routine last time. People noticed. Mrs. Caldwell left a note in your mailbox asking if you would do the loop with her tomorrow at the same hour.',
    minDaysOff: 1,
    requiresStance: 'stance.routine',
  },
  {
    skin: 'neighborhood',
    eyebrow: 'CASE NOTE //',
    heading: 'Janelle wants what you saw at the Petrovs’.',
    body: 'You walked watchful. Janelle texted twice: she wants the exact angle of the head behind the Petrovs’ blinds before she logs it with the second walker.',
    minDaysOff: 1,
    requiresStance: 'stance.watchful',
  },
  {
    skin: 'neighborhood',
    eyebrow: 'DOORSTEP //',
    heading: 'Mr. Sanderson left coffee on your porch.',
    body: 'You walked visible. Mr. Sanderson saw you. There is a thermos of coffee on your front step this morning and a note: "Walk with us Saturday."',
    minDaysOff: 1,
    requiresStance: 'stance.visible',
  },
];
