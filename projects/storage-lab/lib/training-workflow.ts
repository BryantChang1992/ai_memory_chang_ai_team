import type { TrainingStage } from "@/lib/training";
export const statusLabels: Record<TrainingStage, string> = {
  awaiting_initial: "等待初稿", initial_submitted: "初稿已保存", followup_issued: "等待追问回答",
  revision_submitted: "修订待核对", reviewed: "核对中", completed: "Demo 已完成",
};
export const stageDetails: Record<TrainingStage, string> = {
  awaiting_initial: "题目已在训练对话中给出，等待本人独立作答。",
  initial_submitted: "原始回答已私有保存，下一步进行一次针对性的追问。",
  followup_issued: "本轮追问已给出，等待本人回答和修订。",
  revision_submitted: "本人修订已私有保存，正在核对关键要求。",
  reviewed: "已记录核对结果，未满足完成条件时继续讨论。",
  completed: "本轮在提示、纠正和修订下完成 Demo。原始设计与教练整理的参考答案分别私有保存；独立掌握程度仍待后续验证。",
};
export function stageIndex(stage: TrainingStage) {
  return ({ awaiting_initial: 0, initial_submitted: 1, followup_issued: 1, revision_submitted: 2, reviewed: 2, completed: 3 })[stage];
}
