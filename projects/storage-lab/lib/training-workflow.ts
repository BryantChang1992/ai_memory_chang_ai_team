import type { TrainingMode, TrainingStage } from "@/lib/training";

export const statusLabels: Record<TrainingStage, string> = {
  awaiting_initial: "等待提交",
  initial_submitted: "提交已保存",
  followup_issued: "等待追问回答",
  revision_submitted: "修订已保存",
  reviewed: "已评审",
  completed: "本轮已完成",
};
export const stageDetails: Record<TrainingStage, string> = {
  awaiting_initial: "本轮等待本人作答。",
  initial_submitted: "已保存本轮提交，等待评审。",
  followup_issued: "本轮已进入追问阶段，等待回答和修订。",
  revision_submitted: "已保存本轮练习修订，等待评审。",
  reviewed: "已记录本轮评审结果；此阶段不表示已通过独立考核。",
  completed: "本轮已完成，具体结果按训练方式记录。",
};
export function stageLabel(stage: TrainingStage, mode: TrainingMode) {
  if (stage !== "completed") return statusLabels[stage];
  if (mode === "independent") return "独立考核通过";
  if (mode === "guided") return "Demo 已完成";
  return statusLabels.completed;
}
export function completionDetail(mode: TrainingMode) {
  if (mode === "guided") return "本轮在提示辅助下完成 Demo。独立掌握程度仍需后续独立练习评估。";
  if (mode === "independent") return "本轮已通过本项目独立考核。规模、一致性、性能三维能力另行评估，通过本项目不代表整个存储方向已掌握。";
  return "本轮已完成，完成方式尚待确认。能力评估状态按各维度单独记录。";
}
