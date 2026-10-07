import { createHash } from 'node:crypto';

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
export const MAX_ROUND_MINUTES = 525600;
const MAX_ROUNDS = 999;
const ASSESSMENT_KEYS = ['scale', 'consistency', 'performance'];
const ROUND_KEYS = ['id', 'date', 'track', 'stage', 'mode', 'time', 'assessments'];
const SUMMARY_KEYS = ['completedDemos', 'confirmedMinutes', 'estimatedMinutes', 'unknownTimeRounds', 'currentStage', 'assessments'];
const FIELD_KEYS = ['schemaVersion', 'updatedAt', 'summary', 'rounds'];
const ROOT_KEYS = ['schemaVersion', 'publicationId', 'updatedAt', 'summary', 'rounds'];
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
    completedDemos: rounds.filter(round => round.stage === 'completed').length,
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
  };
}
function validateFields(value) {
  requireThat(value.schemaVersion === 2 && isDate(value.updatedAt));
  validateRounds(value.rounds);
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
