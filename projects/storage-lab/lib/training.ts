import data from "@/content/training.json";
import { PLAN_CATALOG } from "@/scripts/plan-catalog.mjs";

export type TrainingStage =
  | "awaiting_initial"
  | "initial_submitted"
  | "followup_issued"
  | "revision_submitted"
  | "reviewed"
  | "completed";
export type TrainingTrack = "stream" | "kv" | "filesystem" | "table" | "lake" | "foundation" | "capstone";
export type TrainingMode = "guided" | "independent" | "unconfirmed";
export type TimeProvenance = "conversation_span" | "user_confirmed" | "unknown";
export type AssessmentState = "unassessed" | "pending" | "assessed";
export type Assessments = Record<"scale" | "consistency" | "performance", AssessmentState>;
export type RoundTime = { minutes: number | null; provenance: TimeProvenance };
export type PublicRound = {
  id: string;
  date: string;
  track: TrainingTrack;
  stage: TrainingStage;
  mode: TrainingMode;
  time: RoundTime;
  assessments: Assessments;
};
export type ProjectStatus = "not_started" | "practicing" | "awaiting_independent_assessment" | "passed";
export type ProjectTitle = "append_log_design";
export type StrengthKey = "contract_boundary_awareness";
export type ResolvedIssueKey = "layer_distinction_clarified";
export type OpenIssueKey = "independent_reconstruction_unverified" | "boundary_reasoning_needs_verification";
export type RecommendationKey = "requirements_first" | "structured_revision" | "independent_full_submission";
export type PublicProject = {
  id: string;
  titleKey: ProjectTitle;
  track: TrainingTrack;
  status: ProjectStatus;
  roundIds: string[];
  guidedDemoCompleted: boolean;
  // Submissions includes every complete practice version; revisions is a subset.
  practice: { submissions: number; revisions: number };
  independentAssessment: { attempts: number; passedOnAttempt: number | null };
  feedback: {
    strengths: StrengthKey[];
    resolvedIssues: ResolvedIssueKey[];
    openIssues: OpenIssueKey[];
    recommendations: RecommendationKey[];
  };
};
export type PublicCurriculumItem = {
  week: number;
  titleKey: string;
  track: TrainingTrack;
  status: "not_started" | "in_progress" | "completed";
  preparation: "starter_ready" | "not_prepared" | "reviewed";
  starterProjectId: string | null;
};
export type TimeSummary = {
  confirmedMinutes: number | null;
  estimatedMinutes: number | null;
  unknownTimeRounds: number;
};
export type PublicProgress = {
  schemaVersion: 4;
  publicationId: string;
  updatedAt: string;
  summary: TimeSummary & {
    completedDemos: number;
    currentStage: TrainingStage;
    assessments: Assessments;
  };
  rounds: PublicRound[];
  projects: PublicProject[];
  curriculum: PublicCurriculumItem[];
};

// The build validator checks this public-only snapshot before generating pages.
export const progress = data as PublicProgress;
export const rounds = progress.rounds;
export const projects = progress.projects;
export const curriculum = progress.curriculum;
export const schedule = {
  blogUrl: "https://bryantchang1992.github.io/ai_memory_chang_ai_team/index.html",
  canonicalUrl: "https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab",
  repositoryUrl: "https://github.com/BryantChang1992/ai_memory_chang_ai_team",
};
export const trackLabels: Record<TrainingTrack, string> = {
  stream: "流存储",
  kv: "KV",
  filesystem: "文件系统",
  table: "表格存储",
  lake: "湖存储",
  foundation: "存储底座",
  capstone: "综合设计",
};
export const trackOrder: TrainingTrack[] = ["stream", "kv", "filesystem", "table", "lake", "foundation", "capstone"];
export const projectTitleLabels: Record<ProjectTitle, string> = {
  append_log_design: "追加日志设计",
};
export const projectStatusLabels: Record<ProjectStatus, string> = {
  not_started: "尚未开始",
  practicing: "练习中",
  awaiting_independent_assessment: "待独立考核",
  passed: "已通过独立考核",
};
// Public feedback is selected from a closed vocabulary; never render free-form records.
export const feedbackLabels: Record<StrengthKey | ResolvedIssueKey | OpenIssueKey | RecommendationKey, string> = {
  contract_boundary_awareness: "能主动澄清接口承诺与实现层次",
  layer_distinction_clarified: "已在讨论中厘清接口行为与内部写入策略",
  independent_reconstruction_unverified: "完整方案的无提示独立重建尚待验证",
  boundary_reasoning_needs_verification: "边界计算与恢复规则还需独立作答验证",
  requirements_first: "先写需求与接口承诺，再推导实现与边界",
  structured_revision: "用固定题卷整理完整方案，并逐项修订",
  independent_full_submission: "准备充分后，无提示完成整卷独立验收",
};
export const modeLabels: Record<TrainingMode, string> = {
  guided: "提示辅助",
  independent: "无提示独立作答",
  unconfirmed: "方式待确认",
};
export const provenanceLabels: Record<TimeProvenance, string> = {
  conversation_span: "对话跨度估算",
  user_confirmed: "本人确认",
  unknown: "待统计",
};
export const assessmentLabels: Record<AssessmentState, string> = {
  unassessed: "未评估",
  pending: "待评估",
  assessed: "已评估",
};
export const assessmentDimensions = [
  { key: "scale", label: "规模" },
  { key: "consistency", label: "一致性" },
  { key: "performance", label: "性能" },
] as const;

export function displayDate(value: string) {
  return value.replaceAll("-", ".");
}
export function roundLabel(id: string) {
  return `第 ${Number(id.replace("round-", ""))} 轮`;
}
export function roundPath(id: string) {
  return `/rounds/${id}/`;
}
export function projectPath(id: string) {
  return `/projects/${id}/`;
}
export function roundTimeLabel(time: RoundTime) {
  if (time.minutes === null || time.provenance === "unknown") return "待统计";
  return `${time.provenance === "conversation_span" ? "约 " : ""}${time.minutes} 分钟`;
}
export function abilityLabel(assessments: Assessments) {
  const states = Object.values(assessments);
  if (states.every((state) => state === "assessed")) return "三维能力已评估";
  if (states.some((state) => state === "assessed" || state === "pending")) return "三维能力尚待完成评估";
  return "三维能力未评估";
}
export function overviewAbilityLabel(assessments: Assessments, projectRecords: PublicProject[]) {
  if (projectRecords.every((project) => project.independentAssessment.attempts === 0)
    && Object.values(assessments).every((state) => state === "unassessed")) return "未评估，待独立考核";
  return abilityLabel(assessments);
}
export function referenceTime(summary: TimeSummary) {
  const { confirmedMinutes, estimatedMinutes } = summary;
  if (confirmedMinutes === null && estimatedMinutes === null) return "待统计";
  const total = (confirmedMinutes ?? 0) + (estimatedMinutes ?? 0);
  return `${estimatedMinutes === null ? "" : "约 "}${total} 分钟`;
}
export function recentRounds() {
  return [...rounds].sort((a, b) => b.date.localeCompare(a.date) || Number(b.id.slice(6)) - Number(a.id.slice(6)));
}
export function roundsForProject(project: PublicProject) {
  return rounds.filter((round) => project.roundIds.includes(round.id));
}
export function projectForRound(id: string) {
  return projects.find((project) => project.roundIds.includes(id));
}
export function projectTime(project: PublicProject): TimeSummary {
  const linkedRounds = roundsForProject(project);
  const sum = (provenance: TimeProvenance) => {
    const values = linkedRounds.filter((round) => round.time.provenance === provenance && round.time.minutes !== null);
    return values.length ? values.reduce((total, round) => total + (round.time.minutes ?? 0), 0) : null;
  };
  return {
    confirmedMinutes: sum("user_confirmed"),
    estimatedMinutes: sum("conversation_span"),
    unknownTimeRounds: linkedRounds.filter((round) => round.time.provenance === "unknown").length,
  };
}
export function projectIsPassed(project: PublicProject) {
  const { attempts, passedOnAttempt } = project.independentAssessment;
  return project.status === "passed" && passedOnAttempt !== null && passedOnAttempt > 0 && passedOnAttempt <= attempts;
}
export function projectProgressLabel(project: PublicProject) {
  if (projectIsPassed(project)) return "已通过项目独立考核";
  if (project.guidedDemoCompleted && project.status === "practicing") return "引导练习已完成，独立考核待完成";
  return projectStatusLabels[project.status];
}
export function independentAssessmentLabel(project: PublicProject) {
  if (projectIsPassed(project)) return `第 ${project.independentAssessment.passedOnAttempt} 次通过`;
  if (project.independentAssessment.attempts === 0) return "尚未交卷";
  return "尚未通过";
}

export function curriculumTitle(item: PublicCurriculumItem) {
  const topic = PLAN_CATALOG.find((entry) => entry.titleKey === item.titleKey);
  if (!topic) throw new Error("Missing approved curriculum title");
  return topic.title;
}
export function curriculumGroups(items: PublicCurriculumItem[] = curriculum) {
  return trackOrder.map((track) => ({
    track,
    items: items.filter((item) => item.track === track).sort((a, b) => a.week - b.week),
  })).filter((group) => group.items.length > 0);
}
export function curriculumSummary(items: PublicCurriculumItem[] = curriculum) {
  // Whole-topic completion is a separately verified curriculum state. Never
  // infer it from the linked starter project's Demo or independent exam pass.
  const completed = items.filter((item) => item.status === "completed").length;
  return {
    total: items.length,
    completed,
    incomplete: items.length - completed,
    inProgress: items.filter((item) => item.status === "in_progress").length,
    notStarted: items.filter((item) => item.status === "not_started").length,
  };
}
export function curriculumStarterProject(item: PublicCurriculumItem, projectRecords: PublicProject[] = projects) {
  return projectRecords.find((project) => project.id === item.starterProjectId);
}
export function plannedWeekLabel(week: number) {
  return `计划第 ${week} 周`;
}
export function curriculumPreparationLabel(item: PublicCurriculumItem) {
  if (item.status === "completed") return "整周主题已完成范围核验";
  if (item.preparation === "reviewed") return "已评审，待完成整周范围核验";
  if (item.preparation === "starter_ready") return "起步练习已准备";
  return "题卷待准备";
}
