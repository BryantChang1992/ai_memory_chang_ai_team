import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateTraining } from "./training-schema.mjs";

// Isolated fixtures never enter the published training records.
const original = JSON.parse(readFileSync(new URL("../content/training.json", import.meta.url), "utf8"));
function fixture() {
  const data = structuredClone(original);
  Object.assign(data.sessions[0], { status: "review", design: "测试初稿", updatedAt: "2026-09-13", review: "", reflection: "", revisions: [], scores: { scale: null, consistency: null, performance: null }, scoreEvidence: { scale: "", consistency: "", performance: "" }, reviewQuestions: [{ id: "Q1", dimension: "consistency", question: "测试故障时序？", status: "open", discussion: [], conclusion: "" }] });
  return data;
}

test("unchanged public records remain valid", () => assert.doesNotThrow(() => validateTraining(original)));
test("an unanswered question may be open, but cannot be resolved or completed", () => {
  const data = fixture();
  assert.doesNotThrow(() => validateTraining(data));
  data.sessions[0].reviewQuestions[0].status = "resolved";
  data.sessions[0].reviewQuestions[0].conclusion = "测试结论";
  assert.throws(() => validateTraining(data), /actual answer/);
  data.sessions[0].reviewQuestions[0].status = "open";
  data.sessions[0].status = "completed";
  data.sessions[0].reflection = "测试复盘";
  assert.throws(() => validateTraining(data), /open questions/);
});
test("scoring requires evidence; null remains a valid unassessed value", () => {
  const data = fixture(); data.sessions[0].scores.scale = 0;
  assert.throws(() => validateTraining(data), /evidence/);
  data.sessions[0].scoreEvidence.scale = "测试依据：回答尚未体现容量估算";
  assert.doesNotThrow(() => validateTraining(data));
});
test("a completed archive preserves the draft, answer, feedback and separate revisions", () => {
  const data = fixture(), s = data.sessions[0], q = s.reviewQuestions[0];
  q.discussion = [{ role: "bryant", text: "测试回答", date: "2026-09-13" }, { role: "reviewer", text: "测试反馈", date: "2026-09-13" }];
  q.status = "resolved"; q.conclusion = "测试结论";
  s.revisions = [{ id: "R1", date: "2026-09-13", before: "旧假设", after: "新假设", reason: "测试修改依据", validation: "测试验证计划，尚未执行" }];
  s.status = "completed"; s.reflection = "测试复盘";
  const validated = validateTraining(data).sessions[0];
  assert.equal(validated.design, "测试初稿");
  assert.deepEqual(validated.reviewQuestions[0].discussion, q.discussion);
  assert.deepEqual(validated.revisions, s.revisions);
  s.design = "";
  assert.throws(() => validateTraining(data), /design/);
});
test("deferred questions retain a reason without pretending they are solved", () => {
  const data = fixture(), s = data.sessions[0], q = s.reviewQuestions[0];
  q.status = "deferred"; s.status = "completed"; s.reflection = "测试复盘";
  assert.throws(() => validateTraining(data), /conclusion/);
  q.conclusion = "等待实验，验证计划已列入复盘";
  assert.equal(validateTraining(data).sessions[0].reviewQuestions[0].status, "deferred");
});
test("malformed or inconsistent record dates and duplicate IDs fail publication", () => {
  const data = fixture(), q = data.sessions[0].reviewQuestions[0];
  q.discussion = [{ role: "bryant", text: "测试回答", date: "2026-02-30" }];
  assert.throws(() => validateTraining(data), /calendar date/);
  q.discussion[0].date = "2026-09-14";
  assert.throws(() => validateTraining(data), /Update date/);
  q.discussion[0].date = "2026-09-13";
  data.sessions[0].reviewQuestions.push(structuredClone(q));
  assert.throws(() => validateTraining(data), /unique/);
});
