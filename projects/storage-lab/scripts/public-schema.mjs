import { createHash } from 'node:crypto';

// This exact dependency-free Node helper is shared by private export and public build.
// There are deliberately no identifiers, questions, scores, evidence or private links.
export const PUBLIC_STAGES = Object.freeze([
  'awaiting_initial', 'initial_submitted', 'followup_issued',
  'revision_submitted', 'reviewed', 'completed',
]);
const FIELDS = Object.freeze([
  'schemaVersion', 'publicationId', 'updatedAt', 'stage',
  'completedCount', 'confirmedMinutes', 'abilityStatus',
]);
function invalid() { throw new Error('PUBLIC_SCHEMA_INVALID'); }
function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}
function exactObject(value, names) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) invalid();
  const keys = Reflect.ownKeys(value);
  if (keys.length !== names.length || keys.some(key => !names.includes(key))) invalid();
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (!descriptor || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) invalid();
  }
}
function publicFields(value) {
  return {
    schemaVersion: value.schemaVersion,
    updatedAt: value.updatedAt,
    stage: value.stage,
    completedCount: value.completedCount,
    confirmedMinutes: value.confirmedMinutes,
    abilityStatus: value.abilityStatus,
  };
}
function validateFields(value) {
  if (value.schemaVersion !== 1 || !isDate(value.updatedAt) ||
      !PUBLIC_STAGES.includes(value.stage) || value.abilityStatus !== 'unassessed') invalid();
  if (value.completedCount !== (value.stage === 'completed' ? 1 : 0)) invalid();
  if (value.confirmedMinutes !== null &&
      (!Number.isSafeInteger(value.confirmedMinutes) || value.confirmedMinutes < 0 || value.confirmedMinutes > 525600)) invalid();
  if (value.stage === 'awaiting_initial' && value.confirmedMinutes !== null) invalid();
}
export function publicationIdFor(fields) {
  exactObject(fields, FIELDS.filter(name => name !== 'publicationId'));
  validateFields(fields);
  return `pub-${createHash('sha256').update(JSON.stringify(publicFields(fields))).digest('hex').slice(0, 16)}`;
}
export function validatePublic(value) {
  exactObject(value, FIELDS);
  validateFields(value);
  if (typeof value.publicationId !== 'string' || !/^pub-[a-f0-9]{16}$/.test(value.publicationId) ||
      value.publicationId !== publicationIdFor(publicFields(value))) invalid();
  return true;
}
