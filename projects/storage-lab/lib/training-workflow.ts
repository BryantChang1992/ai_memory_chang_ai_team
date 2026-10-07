import type { TrainingMode, TrainingStage } from "@/lib/training";

export const statusLabels: Record<TrainingStage, string> = {
  awaiting_initial: "等待初稿",
  initial_submitted: "初稿已保存",
  followup_issued: "等待追问回答",
  revision_submitted: "修订待核对",
  reviewed: "核对中",
  completed: "Demo 已完成",
};
export const stageDetails: Record<TrainingStage, string> = {
  awaiting_initial: "本轮等待本人作答。",
  initial_submitted: "已记录本轮初稿，下一步进行针对性追问。",
  followup_issued: "本轮已进入追问阶段，等待回答和修订。",
  revision_submitted: "已记录本轮修订，正在核对关键要求。",
  reviewed: "已记录核对结果，未满足完成条件时继续讨论。",
  completed: "本轮 Demo 已完成。完成一次训练不代表课程周次完成，也不直接代表独立掌握。",
};
export function completionDetail(mode: TrainingMode) {
  if (mode === "guided") return "本轮在提示辅助下完成 Demo。独立掌握程度仍需后续独立练习评估。";
  if (mode === "independent") return "本轮以独立方式完成 Demo，能力评估状态按各维度单独记录。";
  return "本轮 Demo 已完成，完成方式尚待确认。能力评估状态按各维度单独记录。";
}
export function stageIndex(stage: TrainingStage) {
  return ({ awaiting_initial: 0, initial_submitted: 1, followup_issued: 1, revision_submitted: 2, reviewed: 2, completed: 3 })[stage];
}
