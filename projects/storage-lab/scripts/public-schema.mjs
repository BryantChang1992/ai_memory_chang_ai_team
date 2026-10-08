import { createHash } from 'node:crypto';
import { PLAN_CATALOG } from './plan-catalog.mjs';

// Shared verbatim by the PRIVATE exporter and the PUBLIC build. This module has
// no access to private records. All accepted text is an enum, date or public ID.
export const PUBLIC_STAGES = Object.freeze([
  'awaiting_initial', 'initial_submitted', 'followup_issued',
  'revision_submitted', 'reviewed', 'completed',
]);
export const PUBLIC_TRACKS = Object.freeze(['stream', 'kv', 'filesystem', 'table', 'lake', 'foundation', 'capstone']);
export const PUBLIC_MODES = Object.freeze(['guided', 'independent', 'unconfirmed']);
export const PUBLIC_ASSESSMENTS = Object.freeze(['unassessed', 'pending', 'assessed']);
export const PUBLIC_TIME_PROVENANCE = Object.freeze(['conversation_span', 'user_confirmed', 'unknown']);
export const PUBLIC_PROJECT_TITLES = Object.freeze(['append_log_design']);
export const PUBLIC_PROJECT_STATUSES = Object.freeze(['not_started', 'practicing', 'awaiting_independent_assessment', 'passed']);
export const PUBLIC_FEEDBACK = Object.freeze({
  strengths: Object.freeze(['contract_boundary_awareness']),
  resolvedIssues: Object.freeze(['layer_distinction_clarified']),
  openIssues: Object.freeze(['independent_reconstruction_unverified', 'boundary_reasoning_needs_verification']),
  recommendations: Object.freeze(['requirements_first', 'structured_revision', 'independent_full_submission']),
});
export const MAX_ROUND_MINUTES = 525600;
const MAX_ROUNDS = 999;
const ASSESSMENT_KEYS = ['scale', 'consistency', 'performance'];
const ROUND_KEYS = ['id', 'date', 'track', 'stage', 'mode', 'time', 'assessments'];
const SUMMARY_KEYS = ['completedDemos', 'confirmedMinutes', 'estimatedMinutes', 'unknownTimeRounds', 'currentStage', 'assessments'];
const PROJECT_KEYS = ['id', 'titleKey', 'track', 'status', 'roundIds', 'guidedDemoCompleted', 'practice', 'independentAssessment', 'feedback'];
const FEEDBACK_KEYS = ['strengths', 'resolvedIssues', 'openIssues', 'recommendations'];
const FIELD_KEYS = ['schemaVersion', 'updatedAt', 'summary', 'rounds', 'projects', 'curriculum'];
const ROOT_KEYS = ['schemaVersion', 'publicationId', 'updatedAt', 'summary', 'rounds', 'projects', 'curriculum'];
function invalid() { throw new Error('PUBLIC_SCHEMA_INVALID'); }
function requireThat(condition) { if (!condition) invalid(); }
function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}
function exactObject(value, names) {
  requireThat(value && typeof value === 'object' && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)));
  const keys = Reflect.ownKeys(value);
  requireThat(keys.length === names.length && keys.every(key => names.includes(key)));
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    requireThat(descriptor && Object.hasOwn(descriptor, 'value') && descriptor.enumerable);
  }
}
function exactArray(value) {
  requireThat(Array.isArray(value) && value.length <= MAX_ROUNDS);
  requireThat(Object.getPrototypeOf(value) === Array.prototype);
  requireThat(Reflect.ownKeys(value).length === value.length + 1);
  for (let i = 0; i < value.length; i++) {
    const d = Object.getOwnPropertyDescriptor(value, String(i));
    requireThat(d && Object.hasOwn(d, 'value') && d.enumerable);
  }
}
function boundedInteger(value, max) { return Number.isSafeInteger(value) && value >= 0 && value <= max; }
function validateAssessments(value) {
  exactObject(value, ASSESSMENT_KEYS);
  for (const key of ASSESSMENT_KEYS) requireThat(PUBLIC_ASSESSMENTS.includes(value[key]));
}
function validateRounds(rounds) {
  exactArray(rounds);
  const ids = new Set(); let previous = null;
  for (const round of rounds) {
    exactObject(round, ROUND_KEYS);
    requireThat(typeof round.id === 'string' && /^round-\d{3}$/.test(round.id) && round.id !== 'round-000' && !ids.has(round.id));
    ids.add(round.id);
    requireThat(isDate(round.date) && PUBLIC_TRACKS.includes(round.track) && PUBLIC_STAGES.includes(round.stage) && PUBLIC_MODES.includes(round.mode));
    if (previous) requireThat(previous.date < round.date || (previous.date === round.date && previous.id < round.id));
    previous = round;
    exactObject(round.time, ['minutes', 'provenance']);
    requireThat(PUBLIC_TIME_PROVENANCE.includes(round.time.provenance));
    requireThat(round.time.provenance === 'unknown' ? round.time.minutes === null : boundedInteger(round.time.minutes, MAX_ROUND_MINUTES));
    if (round.stage === 'awaiting_initial') requireThat(round.time.provenance === 'unknown');
    validateAssessments(round.assessments);
  }
}
function validateProjects(projects, rounds) {
  exactArray(projects);
  const ids = new Set(); const assignedRounds = new Set(); const roundById = new Map(rounds.map(round => [round.id, round]));
  let previous = null;
  for (const project of projects) {
    exactObject(project, PROJECT_KEYS);
    requireThat(typeof project.id === 'string' && /^project-\d{3}$/.test(project.id) && project.id !== 'project-000' && !ids.has(project.id));
    if (previous !== null) requireThat(previous < project.id);
    previous = project.id; ids.add(project.id);
    requireThat(PUBLIC_PROJECT_TITLES.includes(project.titleKey) && PUBLIC_TRACKS.includes(project.track));
    // The first public title is a static catalog entry, not user-supplied text.
    requireThat(project.titleKey !== 'append_log_design' || project.track === 'stream');
    requireThat(PUBLIC_PROJECT_STATUSES.includes(project.status) && typeof project.guidedDemoCompleted === 'boolean');
    exactArray(project.roundIds); let previousRound = null;
    const linkedRounds = [];
    for (const id of project.roundIds) {
      requireThat(typeof id === 'string' && roundById.has(id) && !assignedRounds.has(id));
      if (previousRound !== null) requireThat(previousRound < id);
      previousRound = id; assignedRounds.add(id);
      const linked = roundById.get(id); requireThat(linked.track === project.track); linkedRounds.push(linked);
    }
    requireThat(project.guidedDemoCompleted === linkedRounds.some(round => round.stage === 'completed' && round.mode === 'guided'));
    exactObject(project.practice, ['submissions', 'revisions']);
    requireThat(boundedInteger(project.practice.submissions, 10000) && boundedInteger(project.practice.revisions, 10000));
    requireThat(project.practice.revisions <= project.practice.submissions);
    requireThat(project.practice.submissions > 0 || project.practice.revisions === 0);
    exactObject(project.independentAssessment, ['attempts', 'passedOnAttempt']);
    const { attempts, passedOnAttempt } = project.independentAssessment;
    requireThat(boundedInteger(attempts, 10000));
    requireThat(passedOnAttempt === null || (Number.isSafeInteger(passedOnAttempt) && passedOnAttempt >= 1 && passedOnAttempt <= attempts));
    requireThat((project.status === 'passed') === (passedOnAttempt !== null));
    const startedIndependent = linkedRounds.filter(round => round.mode === 'independent' && round.stage !== 'awaiting_initial');
    const completedIndependent = startedIndependent.filter(round => round.stage === 'completed');
    requireThat(attempts >= startedIndependent.length && (attempts === 0) === (startedIndependent.length === 0));
    requireThat((passedOnAttempt !== null) === (completedIndependent.length > 0));
    if (project.status === 'not_started') {
      requireThat(!project.guidedDemoCompleted && project.practice.submissions === 0 && attempts === 0);
      requireThat(linkedRounds.every(round => round.stage === 'awaiting_initial'));
    }
    if (project.status === 'practicing') requireThat(project.practice.submissions > 0 || attempts > 0 || linkedRounds.some(round => round.stage !== 'awaiting_initial'));
    if (project.status === 'awaiting_independent_assessment') requireThat(project.practice.submissions > 0);
    exactObject(project.feedback, FEEDBACK_KEYS);
    for (const category of FEEDBACK_KEYS) {
      exactArray(project.feedback[category]);
      const seen = new Set(); let previousCodeIndex = -1;
      for (const code of project.feedback[category]) {
        const index = PUBLIC_FEEDBACK[category].indexOf(code);
        requireThat(typeof code === 'string' && index >= 0 && index > previousCodeIndex && !seen.has(code));
        seen.add(code); previousCodeIndex = index;
      }
    }
  }
  requireThat(assignedRounds.size === rounds.length);
}
function validateCurriculum(curriculum, projects) {
  exactArray(curriculum); requireThat(curriculum.length === PLAN_CATALOG.length);
  for (let i = 0; i < PLAN_CATALOG.length; i++) {
    const item = curriculum[i]; const catalog = PLAN_CATALOG[i];
    exactObject(item, ['week', 'titleKey', 'track', 'status', 'preparation', 'starterProjectId']);
    requireThat(item.week === catalog.week && item.titleKey === catalog.titleKey && item.track === catalog.track);
    // Only the explicitly mapped narrower starter is linked. Its pass cannot
    // complete this full-week plan. Full-scope review evidence stays private.
    const starter = i === 0 ? projects.find(project => project.id === 'project-001') : undefined;
    requireThat(!starter || (starter.titleKey === 'append_log_design' && starter.track === 'stream'));
    requireThat(item.starterProjectId === (starter?.id ?? null));
    requireThat(['not_started', 'in_progress', 'completed'].includes(item.status));
    const reviewed = item.preparation === 'reviewed';
    requireThat(reviewed || item.preparation === (starter ? 'starter_ready' : 'not_prepared'));
    if (reviewed) requireThat(item.status === 'in_progress' || item.status === 'completed');
    else requireThat(item.status === (starter && starter.status !== 'not_started' ? 'in_progress' : 'not_started'));
    if (item.status === 'completed') requireThat(reviewed);
  }
}
function derivedSummary(rounds) {
  let confirmedMinutes = null; let estimatedMinutes = null; let unknownTimeRounds = 0;
  for (const { time } of rounds) {
    if (time.provenance === 'user_confirmed') confirmedMinutes = (confirmedMinutes ?? 0) + time.minutes;
    else if (time.provenance === 'conversation_span') estimatedMinutes = (estimatedMinutes ?? 0) + time.minutes;
    else unknownTimeRounds++;
  }
  const assessments = Object.fromEntries(ASSESSMENT_KEYS.map(key => [key,
    rounds.length > 0 && rounds.every(round => round.assessments[key] === 'assessed') ? 'assessed' :
    rounds.some(round => round.assessments[key] !== 'unassessed') ? 'pending' : 'unassessed',
  ]));
  return {
    completedDemos: rounds.filter(round => round.stage === 'completed' && round.mode !== 'independent').length,
    confirmedMinutes, estimatedMinutes, unknownTimeRounds,
    currentStage: rounds.at(-1)?.stage ?? 'awaiting_initial', assessments,
  };
}
export function summaryForRounds(rounds) { validateRounds(rounds); return derivedSummary(rounds); }
function orderedAssessments(value) { return Object.fromEntries(ASSESSMENT_KEYS.map(key => [key, value[key]])); }
function orderedFields(value) {
  return {
    schemaVersion: value.schemaVersion, updatedAt: value.updatedAt,
    summary: {
      completedDemos: value.summary.completedDemos,
      confirmedMinutes: value.summary.confirmedMinutes,
      estimatedMinutes: value.summary.estimatedMinutes,
      unknownTimeRounds: value.summary.unknownTimeRounds,
      currentStage: value.summary.currentStage,
      assessments: orderedAssessments(value.summary.assessments),
    },
    rounds: value.rounds.map(round => ({
      id: round.id, date: round.date, track: round.track, stage: round.stage, mode: round.mode,
      time: { minutes: round.time.minutes, provenance: round.time.provenance },
      assessments: orderedAssessments(round.assessments),
    })),
    projects: value.projects.map(project => ({
      id: project.id, titleKey: project.titleKey, track: project.track, status: project.status,
      roundIds: [...project.roundIds], guidedDemoCompleted: project.guidedDemoCompleted,
      practice: { submissions: project.practice.submissions, revisions: project.practice.revisions },
      independentAssessment: { attempts: project.independentAssessment.attempts, passedOnAttempt: project.independentAssessment.passedOnAttempt },
      feedback: Object.fromEntries(FEEDBACK_KEYS.map(key => [key, [...project.feedback[key]]])),
    })),
    curriculum: value.curriculum.map(item => ({
      week: item.week, titleKey: item.titleKey, track: item.track, status: item.status,
      preparation: item.preparation, starterProjectId: item.starterProjectId,
    })),
  };
}
function validateFields(value) {
  requireThat(value.schemaVersion === 4 && isDate(value.updatedAt));
  validateRounds(value.rounds);
  validateProjects(value.projects, value.rounds);
  validateCurriculum(value.curriculum, value.projects);
  requireThat(value.rounds.every(round => round.date <= value.updatedAt));
  exactObject(value.summary, SUMMARY_KEYS); validateAssessments(value.summary.assessments);
  requireThat(boundedInteger(value.summary.completedDemos, MAX_ROUNDS) && boundedInteger(value.summary.unknownTimeRounds, MAX_ROUNDS));
  for (const key of ['confirmedMinutes', 'estimatedMinutes']) requireThat(value.summary[key] === null || boundedInteger(value.summary[key], MAX_ROUND_MINUTES * MAX_ROUNDS));
  requireThat(PUBLIC_STAGES.includes(value.summary.currentStage));
  const expected = derivedSummary(value.rounds);
  for (const key of SUMMARY_KEYS.filter(key => key !== 'assessments')) requireThat(value.summary[key] === expected[key]);
  for (const key of ASSESSMENT_KEYS) requireThat(value.summary.assessments[key] === expected.assessments[key]);
}
export function publicationIdFor(fields) {
  exactObject(fields, FIELD_KEYS); validateFields(fields);
  return `pub-${createHash('sha256').update(JSON.stringify(orderedFields(fields))).digest('hex').slice(0, 16)}`;
}
export function validatePublic(value) {
  exactObject(value, ROOT_KEYS); validateFields(value);
  requireThat(typeof value.publicationId === 'string' && /^pub-[a-f0-9]{16}$/.test(value.publicationId));
  requireThat(value.publicationId === publicationIdFor(orderedFields(value)));
  return true;
}
