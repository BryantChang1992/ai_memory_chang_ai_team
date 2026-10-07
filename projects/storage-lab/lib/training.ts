import data from "@/content/training.json";
export type TrainingStage = "awaiting_initial" | "initial_submitted" | "followup_issued" | "revision_submitted" | "reviewed" | "completed";
export type PublicProgress = { schemaVersion: number; publicationId: string; updatedAt: string; stage: TrainingStage; completedCount: number; confirmedMinutes: number | null; abilityStatus: "unassessed" };
export const progress = data as PublicProgress;
export const schedule = {
  blogUrl: "https://bryantchang1992.github.io/ai_memory_chang_ai_team/index.html",
  canonicalUrl: "https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab",
  repositoryUrl: "https://github.com/BryantChang1992/ai_memory_chang_ai_team",
};
export function displayDate(value: string) { return value.replaceAll("-", "."); }
