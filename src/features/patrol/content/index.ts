// Registry of all available story graphs. Adding a new chapter is a matter of
// importing it here and including it in the array.

import type { StoryGraph } from '../types/storyGraph';
import { prisonYardChapter1 } from './prisonYard_ch01';
import { prisonYardChapter2 } from './prisonYard_ch02';
import { prisonYardRaidDrill } from './prisonYard_raid_theDrill';
import { neighborhoodWatchChapter1 } from './neighborhood_ch01';
import { neighborhoodWatchChapter2 } from './neighborhood_ch02';
import { neighborhoodWatchChapter3 } from './neighborhood_ch03';
import { neighborhoodWatchChapter4 } from './neighborhood_ch04';
import { neighborhoodRaidTheMeeting } from './neighborhood_raid_theMeeting';

export const STORY_GRAPHS: StoryGraph[] = [
  prisonYardChapter1,
  prisonYardChapter2,
  prisonYardRaidDrill,
  neighborhoodWatchChapter1,
  neighborhoodWatchChapter2,
  neighborhoodWatchChapter3,
  neighborhoodWatchChapter4,
  neighborhoodRaidTheMeeting,
];

export function findGraph(id: string): StoryGraph | undefined {
  return STORY_GRAPHS.find((g) => g.id === id);
}

export function graphsForSkin(skin: StoryGraph['skin']): StoryGraph[] {
  return STORY_GRAPHS.filter((g) => g.skin === skin).sort(
    (a, b) => a.chapter - b.chapter,
  );
}
