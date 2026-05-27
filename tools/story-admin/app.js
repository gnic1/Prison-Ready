const state = {
  missions: [],
  currentMission: null,
};

const missionListEl = document.getElementById('mission-list');
const editorTitleEl = document.getElementById('editor-title');
const statusEl = document.getElementById('status');
const saveButton = document.getElementById('save-button');
const compileButton = document.getElementById('compile-button');
const newMissionButton = document.getElementById('new-mission-button');
const addBeatButton = document.getElementById('add-beat-button');
const addReportOptionButton = document.getElementById('add-report-option-button');
const addSideMissionButton = document.getElementById('add-side-mission-button');
const beatsContainer = document.getElementById('beats-container');
const reportOptionsContainer = document.getElementById('report-options');
const sideMissionsContainer = document.getElementById('side-missions');

const fields = {
  id: document.getElementById('mission-id'),
  title: document.getElementById('mission-title'),
  dayNumber: document.getElementById('mission-day'),
  routeId: document.getElementById('mission-route'),
  theme: document.getElementById('mission-theme'),
  chapterId: document.getElementById('mission-chapter'),
  story: document.getElementById('mission-story'),
};

const overviewFields = {
  targetMinutes: document.getElementById('overview-target-minutes'),
  durationMin: document.getElementById('overview-duration-min'),
  durationMax: document.getElementById('overview-duration-max'),
  distanceMinMiles: document.getElementById('overview-distance-min'),
  distanceMaxMiles: document.getElementById('overview-distance-max'),
  routeType: document.getElementById('overview-route-type'),
  difficulty: document.getElementById('overview-difficulty'),
};

const artifactFields = {
  id: document.getElementById('artifact-id'),
  type: document.getElementById('artifact-type'),
  truthLevel: document.getElementById('artifact-truth-level'),
  title: document.getElementById('artifact-title'),
  rarity: document.getElementById('artifact-rarity'),
  isGuaranteed: document.getElementById('artifact-guaranteed'),
  summary: document.getElementById('artifact-summary'),
  unlockCondition: document.getElementById('artifact-unlock-condition'),
};

const briefingTranscriptEl = document.getElementById('briefing-transcript');
const reportPromptEl = document.getElementById('report-prompt');

function setStatus(text) {
  statusEl.textContent = text;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unknown error';
}

async function runAction(action) {
  try {
    await action();
  } catch (error) {
    setStatus(getErrorMessage(error));
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

function buildEmptyMission(id, title) {
  return {
    id,
    title,
    chapterId: 'chapter1',
    dayNumber: state.missions.length + 1,
    theme: 'mystery',
    status: 'not_started',
    routeId: `route_${id}`,
    overview: {
      targetMinutes: 30,
      durationMin: 30,
      durationMax: 30,
      distanceMinMiles: 1,
      distanceMaxMiles: 1.5,
      routeType: 'loop route',
      difficulty: 'beginner',
    },
    story: '',
    briefingTranscript: [],
    artifact: {
      id: `artifact_${id}`,
      type: 'clue',
      title: `${title} Artifact`,
      summary: '',
      truthLevel: 'partial',
      rarity: 1,
      isGuaranteed: true,
      unlockCondition: 'Complete the mission.',
    },
    reportBack: {
      id: `reportback_${id}`,
      prompt: 'What changed on this run?',
      options: [
        {
          id: `${id}_strong`,
          label: 'We have a strong lead',
          outcomeType: 'correct',
          outcomeBand: 'strong',
          outcomeText: '',
        },
      ],
    },
    sideMissions: [],
    beats: [
      {
        id: `${id}_beat_001`,
        phase: 'warmup',
        kind: 'dialogue',
        speaker: '',
        title: '',
        text: '',
        trigger: { type: 'time', atSec: 10 },
      },
    ],
  };
}

function bindFieldUpdates() {
  Object.entries(fields).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      if (!state.currentMission) return;
      if (key === 'dayNumber') {
        state.currentMission.dayNumber = Number(input.value || 1);
      } else {
        state.currentMission[key] = input.value;
      }
    });
  });

  Object.entries(overviewFields).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      if (!state.currentMission) return;
      state.currentMission.overview = state.currentMission.overview || {};
      state.currentMission.overview[key] = input.type === 'number' ? Number(input.value || 0) : input.value;
    });
  });

  Object.entries(artifactFields).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      if (!state.currentMission) return;
      state.currentMission.artifact = state.currentMission.artifact || {};
      if (key === 'rarity') {
        state.currentMission.artifact[key] = Number(input.value || 1);
        return;
      }
      if (key === 'isGuaranteed') {
        state.currentMission.artifact[key] = input.value === 'true';
        return;
      }
      state.currentMission.artifact[key] = input.value;
    });
  });

  briefingTranscriptEl.addEventListener('input', () => {
    if (!state.currentMission) return;
    state.currentMission.briefingTranscript = briefingTranscriptEl.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  });

  reportPromptEl.addEventListener('input', () => {
    if (!state.currentMission) return;
    state.currentMission.reportBack = state.currentMission.reportBack || { id: '', prompt: '', options: [] };
    state.currentMission.reportBack.prompt = reportPromptEl.value;
  });
}

function renderMissionList() {
  missionListEl.innerHTML = '';
  state.missions.forEach((mission) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `mission-item${state.currentMission?.id === mission.id ? ' active' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(mission.title)}</strong><br /><span>Day ${mission.dayNumber} / ${escapeHtml(mission.id)}</span>`;
    item.addEventListener('click', () => {
      void runAction(() => loadMission(mission.id));
    });
    missionListEl.appendChild(item);
  });
}

function renderBeats() {
  beatsContainer.innerHTML = '';
  if (!state.currentMission) return;

  state.currentMission.beats.forEach((beat, index) => {
    const card = document.createElement('div');
    card.className = 'beat-card';
    card.innerHTML = `
      <div class="section-row">
        <strong>Beat ${index + 1}</strong>
        <button type="button" class="danger-button" data-action="remove-beat">Remove</button>
      </div>
      <div class="beat-grid">
        <label>Beat Id<input data-field="id" value="${escapeHtml(beat.id)}" /></label>
        <label>Phase<input data-field="phase" value="${escapeHtml(beat.phase)}" /></label>
        <label>Kind
          <select data-field="kind">
            ${['dialogue', 'objective', 'systemPrompt', 'sideMissionStart', 'audioCue', 'artifact', 'missionComplete'].map((kind) => `<option value="${kind}" ${beat.kind === kind ? 'selected' : ''}>${kind}</option>`).join('')}
          </select>
        </label>
        <label>Speaker<input data-field="speaker" value="${escapeHtml(beat.speaker)}" /></label>
        <label>Title<input data-field="title" value="${escapeHtml(beat.title)}" /></label>
        <label>Side Mission Id<input data-field="sideMissionId" value="${escapeHtml(beat.sideMissionId)}" /></label>
        <label>Trigger Type
          <select data-field="trigger.type">
            <option value="time" ${beat.trigger?.type === 'time' ? 'selected' : ''}>time</option>
            <option value="progress" ${beat.trigger?.type === 'progress' ? 'selected' : ''}>progress</option>
          </select>
        </label>
        <label>At Seconds<input data-field="trigger.atSec" type="number" value="${beat.trigger?.atSec ?? ''}" /></label>
        <label>At Percent<input data-field="trigger.atPercent" type="number" value="${beat.trigger?.atPercent ?? ''}" /></label>
      </div>
      <label>Text<textarea data-field="text" rows="3">${escapeHtml(beat.text)}</textarea></label>
    `;

    card.querySelector('[data-action="remove-beat"]').addEventListener('click', () => {
      state.currentMission.beats.splice(index, 1);
      renderBeats();
    });

    card.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.getAttribute('data-field');
        if (!field) return;
        if (field.startsWith('trigger.')) {
          beat.trigger = beat.trigger || { type: 'time', atSec: 0 };
          const triggerField = field.split('.')[1];
          beat.trigger[triggerField] = input.type === 'number' ? Number(input.value || 0) : input.value;
          return;
        }
        beat[field] = input.value;
      });
    });

    beatsContainer.appendChild(card);
  });
}

function renderReportOptions() {
  reportOptionsContainer.innerHTML = '';
  if (!state.currentMission) return;

  state.currentMission.reportBack = state.currentMission.reportBack || { id: '', prompt: '', options: [] };
  state.currentMission.reportBack.options.forEach((option, index) => {
    const card = document.createElement('div');
    card.className = 'beat-card';
    card.innerHTML = `
      <div class="section-row">
        <strong>Option ${index + 1}</strong>
        <button type="button" class="danger-button" data-action="remove-option">Remove</button>
      </div>
      <div class="beat-grid">
        <label>Option Id<input data-field="id" value="${escapeHtml(option.id)}" /></label>
        <label>Label<input data-field="label" value="${escapeHtml(option.label)}" /></label>
        <label>Outcome Band
          <select data-field="outcomeBand">
            ${['strong', 'partial', 'poor'].map((value) => `<option value="${value}" ${option.outcomeBand === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
        </label>
      </div>
      <label>Outcome Text<textarea data-field="outcomeText" rows="3">${escapeHtml(option.outcomeText)}</textarea></label>
    `;

    card.querySelector('[data-action="remove-option"]').addEventListener('click', () => {
      state.currentMission.reportBack.options.splice(index, 1);
      renderReportOptions();
    });

    card.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener('input', () => {
        option[input.getAttribute('data-field')] = input.value;
      });
    });

    reportOptionsContainer.appendChild(card);
  });
}

function renderSideMissions() {
  sideMissionsContainer.innerHTML = '';
  if (!state.currentMission) return;

  state.currentMission.sideMissions = Array.isArray(state.currentMission.sideMissions) ? state.currentMission.sideMissions : [];
  state.currentMission.sideMissions.forEach((sideMission, index) => {
    const card = document.createElement('div');
    card.className = 'beat-card';
    card.innerHTML = `
      <div class="section-row">
        <strong>Side Mission ${index + 1}</strong>
        <button type="button" class="danger-button" data-action="remove-side-mission">Remove</button>
      </div>
      <div class="beat-grid">
        <label>Side Mission Id<input data-field="id" value="${escapeHtml(sideMission.id)}" /></label>
        <label>Label<input data-field="label" value="${escapeHtml(sideMission.label)}" /></label>
      </div>
      <label>Prompt Text<textarea data-field="promptText" rows="2">${escapeHtml(sideMission.promptText)}</textarea></label>
      <label>Success Text<textarea data-field="successText" rows="2">${escapeHtml(sideMission.successText)}</textarea></label>
      <label>Failure Text<textarea data-field="failureText" rows="2">${escapeHtml(sideMission.failureText)}</textarea></label>
    `;

    card.querySelector('[data-action="remove-side-mission"]').addEventListener('click', () => {
      state.currentMission.sideMissions.splice(index, 1);
      renderSideMissions();
    });

    card.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener('input', () => {
        sideMission[input.getAttribute('data-field')] = input.value;
      });
    });

    sideMissionsContainer.appendChild(card);
  });
}

function renderEditor() {
  const mission = state.currentMission;
  saveButton.disabled = !mission;
  editorTitleEl.textContent = mission ? mission.title : 'Select a mission';
  if (!mission) {
    return;
  }

  fields.id.value = mission.id || '';
  fields.title.value = mission.title || '';
  fields.dayNumber.value = mission.dayNumber || 1;
  fields.routeId.value = mission.routeId || '';
  fields.theme.value = mission.theme || '';
  fields.chapterId.value = mission.chapterId || '';
  fields.story.value = mission.story || '';

  overviewFields.targetMinutes.value = mission.overview?.targetMinutes ?? 30;
  overviewFields.durationMin.value = mission.overview?.durationMin ?? 30;
  overviewFields.durationMax.value = mission.overview?.durationMax ?? 30;
  overviewFields.distanceMinMiles.value = mission.overview?.distanceMinMiles ?? 1;
  overviewFields.distanceMaxMiles.value = mission.overview?.distanceMaxMiles ?? 1.5;
  overviewFields.routeType.value = mission.overview?.routeType || '';
  overviewFields.difficulty.value = mission.overview?.difficulty || '';

  briefingTranscriptEl.value = Array.isArray(mission.briefingTranscript) ? mission.briefingTranscript.join('\n') : '';

  artifactFields.id.value = mission.artifact?.id || '';
  artifactFields.type.value = mission.artifact?.type || '';
  artifactFields.truthLevel.value = mission.artifact?.truthLevel || '';
  artifactFields.title.value = mission.artifact?.title || '';
  artifactFields.rarity.value = mission.artifact?.rarity ?? 1;
  artifactFields.isGuaranteed.value = String(mission.artifact?.isGuaranteed !== false);
  artifactFields.summary.value = mission.artifact?.summary || '';
  artifactFields.unlockCondition.value = mission.artifact?.unlockCondition || '';

  reportPromptEl.value = mission.reportBack?.prompt || '';

  renderBeats();
  renderReportOptions();
  renderSideMissions();
}

async function loadMissionList() {
  state.missions = await api('/api/missions');
  renderMissionList();
}

async function loadMission(missionId) {
  state.currentMission = await api(`/api/missions/${encodeURIComponent(missionId)}`);
  renderMissionList();
  renderEditor();
  setStatus(`Loaded ${missionId}.`);
}

saveButton.addEventListener('click', () => {
  void runAction(async () => {
    if (!state.currentMission) return;
    await api(`/api/missions/${encodeURIComponent(state.currentMission.id)}`, {
      method: 'PUT',
      body: JSON.stringify(state.currentMission),
    });
    await loadMissionList();
    setStatus(`Saved ${state.currentMission.id}.`);
  });
});

compileButton.addEventListener('click', () => {
  void runAction(async () => {
    const result = await api('/api/compile', { method: 'POST' });
    setStatus(`Compiled ${result.count} mission file(s).`);
  });
});

newMissionButton.addEventListener('click', () => {
  void runAction(async () => {
    const id = window.prompt('Mission id (example: mission_day3)');
    if (!id) return;
    const title = window.prompt('Mission title');
    if (!title) return;
    const mission = buildEmptyMission(id.trim(), title.trim());
    await api('/api/missions', {
      method: 'POST',
      body: JSON.stringify(mission),
    });
    await loadMissionList();
    await loadMission(mission.id);
    setStatus(`Created ${mission.id}.`);
  });
});

addBeatButton.addEventListener('click', () => {
  if (!state.currentMission) return;
  state.currentMission.beats.push({
    id: `beat_${Date.now()}`,
    phase: 'active',
    kind: 'dialogue',
    speaker: '',
    title: '',
    text: '',
    trigger: { type: 'time', atSec: 0 },
  });
  renderBeats();
});

addReportOptionButton.addEventListener('click', () => {
  if (!state.currentMission) return;
  state.currentMission.reportBack = state.currentMission.reportBack || { id: '', prompt: '', options: [] };
  state.currentMission.reportBack.options.push({
    id: `option_${Date.now()}`,
    label: '',
    outcomeType: 'partial',
    outcomeBand: 'partial',
    outcomeText: '',
  });
  renderReportOptions();
});

addSideMissionButton.addEventListener('click', () => {
  if (!state.currentMission) return;
  state.currentMission.sideMissions = Array.isArray(state.currentMission.sideMissions) ? state.currentMission.sideMissions : [];
  state.currentMission.sideMissions.push({
    id: `side_mission_${Date.now()}`,
    label: '',
    promptText: '',
    successText: '',
    failureText: '',
  });
  renderSideMissions();
});

bindFieldUpdates();

await runAction(async () => {
  await loadMissionList();
  if (state.missions.length) {
    await loadMission(state.missions[0].id);
  } else {
    setStatus('No missions found.');
  }
});
