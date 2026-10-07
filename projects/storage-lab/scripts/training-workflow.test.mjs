import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const snapshot = JSON.parse(readFileSync(new URL('../content/training.json', import.meta.url), 'utf8'));

async function loadHelpers(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  // Node does not resolve Next's alias. Inject the unchanged public snapshot only
  // into this in-memory test module; production data and source stay untouched.
  const executable = stripTypeScriptTypes(source.replace('import data from "@/content/training.json";', `const data = ${JSON.stringify(snapshot)};`));
  return import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`);
}

const workflow = await loadHelpers('../lib/training-workflow.ts');
const training = await loadHelpers('../lib/training.ts');

test('completed stage labels distinguish guided Demo from independent pass', () => {
  assert.equal(workflow.stageLabel('completed', 'guided'), 'Demo 已完成');
  assert.equal(workflow.stageLabel('completed', 'independent'), '独立考核通过');
  assert.equal(workflow.stageLabel('completed', 'unconfirmed'), '本轮已完成');
  assert.equal(workflow.stageLabel('initial_submitted', 'independent'), '提交已保存');
  assert.equal(workflow.stageLabel('revision_submitted', 'guided'), '修订已保存');
  for (const mode of ['guided', 'independent', 'unconfirmed']) {
    assert.equal(workflow.stageLabel('reviewed', mode), '已评审');
    assert.doesNotMatch(workflow.stageLabel('reviewed', mode), /通过|待评审|核对中/);
  }
});

test('current stages do not assert that unrecorded earlier steps occurred', () => {
  assert.match(workflow.stageDetails.initial_submitted, /等待评审/);
  assert.doesNotMatch(workflow.stageDetails.initial_submitted, /初稿|追问|修订/);
  assert.match(workflow.stageDetails.reviewed, /不表示已通过独立考核/);
  assert.doesNotMatch(workflow.completionDetail('independent'), /Demo|追问|修订/);
  assert.match(workflow.completionDetail('independent'), /已通过本项目独立考核/);
  assert.match(workflow.completionDetail('independent'), /三维能力另行评估/);
  assert.match(workflow.completionDetail('independent'), /不代表整个存储方向已掌握/);
  assert.match(workflow.completionDetail('guided'), /提示辅助下完成 Demo/);
});

test('project pass does not turn separate ability dimensions into assessed states', () => {
  const unassessed = { scale: 'unassessed', consistency: 'unassessed', performance: 'unassessed' };
  const passed = { ...snapshot.projects[0], status: 'passed', independentAssessment: { attempts: 1, passedOnAttempt: 1 } };
  const reviewed = { ...snapshot.projects[0], independentAssessment: { attempts: 1, passedOnAttempt: null } };
  assert.equal(training.abilityLabel(unassessed), '三维能力未评估');
  assert.equal(training.overviewAbilityLabel(unassessed, snapshot.projects), '未评估，待独立考核');
  assert.equal(training.overviewAbilityLabel(unassessed, [passed]), '三维能力未评估');
  assert.equal(training.overviewAbilityLabel(unassessed, [reviewed]), '三维能力未评估');
  assert.equal(training.abilityLabel({ ...unassessed, scale: 'pending' }), '三维能力尚待完成评估');
  assert.equal(training.abilityLabel({ scale: 'assessed', consistency: 'assessed', performance: 'assessed' }), '三维能力已评估');
  assert.deepEqual(unassessed, { scale: 'unassessed', consistency: 'unassessed', performance: 'unassessed' });
});

test('formal progress respects verified project status and complete independent submissions', () => {
  const current = snapshot.projects[0];
  const ready = { ...current, status: 'awaiting_independent_assessment' };
  const passed = { ...current, status: 'passed', independentAssessment: { attempts: 2, passedOnAttempt: 2 } };
  assert.equal(training.projectProgressLabel(current), '引导练习已完成，独立考核待完成');
  assert.equal(training.projectProgressLabel(ready), '待独立考核');
  assert.equal(training.projectProgressLabel(passed), '已通过项目独立考核');
  assert.equal(training.independentAssessmentLabel(current), '尚未交卷');
  assert.equal(training.independentAssessmentLabel(passed), '第 2 次通过');
  assert.equal(training.projectIsPassed({ ...passed, independentAssessment: { attempts: 0, passedOnAttempt: 2 } }), false);
});

test('legacy estimated time, confirmed zero and unknown time remain distinct', () => {
  assert.equal(training.roundTimeLabel(snapshot.rounds[0].time), '约 110 分钟');
  assert.equal(training.roundTimeLabel({ minutes: 0, provenance: 'user_confirmed' }), '0 分钟');
  assert.equal(training.roundTimeLabel({ minutes: null, provenance: 'unknown' }), '待统计');
  assert.equal(training.referenceTime(snapshot.summary), '约 110 分钟');
  assert.equal(snapshot.publicationId, 'pub-1725dd329d793770');
  assert.deepEqual(snapshot.projects[0].practice, { submissions: 0, revisions: 0 });
  assert.deepEqual(snapshot.projects[0].independentAssessment, { attempts: 0, passedOnAttempt: null });
});
