import { compileAllMissions } from './story-tools.mjs';

const compiled = await compileAllMissions();
console.log(`Compiled ${compiled.length} mission file(s) into runtime content.`);
