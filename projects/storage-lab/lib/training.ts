import data from "@/content/training.json";

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
export type PublicProgress = {
  schemaVersion: 2;
  publicationId: string;
  updatedAt: string;
  summary: {
    completedDemos: number;
    confirmedMinutes: number | null;
    estimatedMinutes: number | null;
    unknownTimeRounds: number;
    currentStage: TrainingStage;
    assessments: Assessments;
  };
  rounds: PublicRound[];
};

// The build validator checks this public-only snapshot before generating pages.
export const progress = data as PublicProgress;
export const rounds = progress.rounds;
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
export const modeLabels: Record<TrainingMode, string> = {
  guided: "提示辅助",
  independent: "独立练习",
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
export function roundTimeLabel(time: RoundTime) {
  if (time.minutes === null || time.provenance === "unknown") return "待统计";
  return `${time.provenance === "conversation_span" ? "约" : ""}${time.minutes}分钟`;
}
export function abilityLabel(assessments: Assessments) {
  const states = Object.values(assessments);
  if (states.every((state) => state === "assessed")) return "各维度已评估";
  if (states.some((state) => state === "assessed")) return "待完成独立评估";
  return "待独立评估";
}
export function referenceTime(summary: PublicProgress["summary"]) {
  const { confirmedMinutes, estimatedMinutes } = summary;
  if (confirmedMinutes === null && estimatedMinutes === null) return "待统计";
  const total = (confirmedMinutes ?? 0) + (estimatedMinutes ?? 0);
  return `${estimatedMinutes === null ? "" : "约"}${total}分钟`;
}
export function recentRounds() {
  return [...rounds].sort((a, b) => b.date.localeCompare(a.date) || Number(b.id.slice(6)) - Number(a.id.slice(6)));
}
