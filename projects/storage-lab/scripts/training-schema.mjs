import { z } from "zod";

const text = z.string().refine(value => value.trim().length > 0, "Cannot be blank");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Invalid calendar date");
const dimensions = ["scale", "consistency", "performance"];
const question = z.object({
  id: text, dimension: z.enum(dimensions), question: text,
  status: z.enum(["open", "resolved", "deferred"]),
  discussion: z.array(z.object({ role: z.enum(["bryant", "reviewer"]), text, date }).strict()),
  conclusion: z.string(),
}).strict().superRefine((q, ctx) => {
  if (q.status !== "open" && !q.conclusion.trim()) ctx.addIssue({ code: "custom", message: "Closed or deferred questions need a conclusion" });
  if (q.status === "resolved" && !q.discussion.some(entry => entry.role === "bryant")) ctx.addIssue({ code: "custom", message: "Resolved questions need Bryant's actual answer" });
  for (let i = 1; i < q.discussion.length; i++) {
    if (q.discussion[i].date < q.discussion[i - 1].date) ctx.addIssue({ code: "custom", message: "Discussion must remain chronological" });
  }
});
const revision = z.object({ id: text, date, before: text, after: text, reason: text, validation: text }).strict();
const score = z.number().int().min(0).max(3).nullable();

export const sessionSchema = z.object({
  id: z.number().int().positive(), date, category: text, title: text, summary: text, outcome: text,
  status: z.enum(["planned", "drafting", "review", "revising", "completed"]),
  focus: z.array(text).length(3), brief: z.string(), questions: z.array(text),
  design: z.string(), review: z.string(), reflection: z.string(),
  reviewQuestions: z.array(question), revisions: z.array(revision),
  takeaways: z.array(text), scores: z.object({ scale: score, consistency: score, performance: score }).strict(),
  scoreEvidence: z.object({ scale: z.string(), consistency: z.string(), performance: z.string() }).strict(),
  updatedAt: date.nullable(), minutes: z.number().int().nonnegative(),
  references: z.array(z.object({ title: text, url: z.string().url().startsWith("https://") }).strict()),
}).strict().superRefine((s, ctx) => {
  const check = (condition, message) => { if (!condition) ctx.addIssue({ code: "custom", message }); };
  const hasDesign = Boolean(s.design.trim());
  const hasReview = Boolean(s.review.trim() || s.reviewQuestions.length);
  const hasReflection = Boolean(s.reflection.trim());
  const hasRecords = hasDesign || hasReview || hasReflection || s.revisions.length || s.takeaways.length || s.minutes > 0 || dimensions.some(key => s.scores[key] !== null || s.scoreEvidence[key].trim());
  check(!hasRecords || s.status !== "planned", "Real records require an actual in-progress or completed status");
  check(!hasRecords || Boolean(s.updatedAt), "Records require an update date");
  check(s.status === "planned" || Boolean(s.brief.trim()), "Training needs a published brief");
  check(!hasReview || hasDesign, "Review requires the original design");
  check(!(s.revisions.length || hasReflection) || hasReview, "Revisions and reflection require a review");
  check(!["review", "revising", "completed"].includes(s.status) || hasDesign, "This stage needs a design");
  check(!["revising", "completed"].includes(s.status) || hasReview, "This stage needs a review");
  if (s.status === "completed") {
    check(hasReflection, "Completed sessions need a real reflection");
    check(!s.reviewQuestions.some(q => q.status === "open"), "Resolve or explicitly defer open questions before completing");
  }
  for (const key of dimensions) {
    check(s.scores[key] === null || Boolean(s.scoreEvidence[key].trim()), `${key}: scored observations need evidence`);
    check(s.scores[key] === null || hasDesign, `${key}: scores need a real answer`);
  }
  for (const entries of [s.reviewQuestions, s.revisions]) check(new Set(entries.map(entry => entry.id)).size === entries.length, "Record IDs must be unique within each list");
  const recordDates = [...s.revisions.map(r => r.date), ...s.reviewQuestions.flatMap(q => q.discussion.map(entry => entry.date))];
  check(recordDates.every(value => s.updatedAt && value <= s.updatedAt), "Update date cannot precede a record");
  for (let i = 1; i < s.revisions.length; i++) check(s.revisions[i].date >= s.revisions[i - 1].date, "Revisions must remain chronological");
});

export function validateTraining(data) {
  const parsed = z.object({
    schedule: z.object({ startDate: date, intervalDays: z.literal(14), time: z.literal("21:00"), timezone: z.literal("Asia/Shanghai"), blogUrl: z.string().url(), canonicalUrl: z.string().url(), repositoryUrl: z.string().url(), author: text }).strict(),
    sessions: z.array(sessionSchema).length(12),
  }).strict().parse(data);
  for (let i = 0; i < parsed.sessions.length; i++) {
    const s = parsed.sessions[i];
    const day = new Date(s.date + "T00:00:00Z");
    if (s.id !== i + 1 || day.getUTCDay() !== 0) throw new Error("Expected sequential sessions on Sundays");
    const expected = new Date(parsed.schedule.startDate + "T00:00:00Z").getTime() + i * 14 * 86400000;
    if (day.getTime() !== expected) throw new Error("Expected a biweekly schedule from startDate");
  }
  return parsed;
}
