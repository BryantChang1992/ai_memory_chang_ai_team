export type Dimension = "scale" | "consistency" | "performance";
export type ReviewQuestion = {
  id: string;
  dimension: Dimension;
  question: string;
  status: "open" | "resolved" | "deferred";
  discussion: { role: "bryant" | "reviewer"; text: string; date: string }[];
  conclusion: string;
};
export type Revision = {
  id: string;
  date: string;
  before: string;
  after: string;
  reason: string;
  validation: string;
};
export const dimensionLabels: Record<Dimension, string> = {
  scale: "规模", consistency: "一致性", performance: "性能",
};
export const questionStatusLabels = { open: "待继续讨论", resolved: "已解决", deferred: "留待验证" };
export const recordTemplates = {
  design: ["需求与假设：数据量、请求量、读写比例、语义和故障范围", "规模估算：容量、副本、网络与磁盘预算", "数据路径：如何写入、何时返回成功、如何读取与恢复", "关键取舍：备选方案、选择依据、当前不确定点"],
  review: ["问题：用一个规模变化或故障时序检验设计", "Bryant 的回答：保留推理过程与不确定点", "评审反馈：指出成立的前提和需要补充的证据", "结论：已解决、待继续讨论，或留待验证"],
  reflection: ["修改前 → 修改后：保留初稿，单独记录修订", "修改原因：对应哪个追问、发现了什么问题", "验证办法：检查哪些时序、指标或实验结果", "本期复盘：收获、未解决问题和下一次重点"],
};

type WorkflowRecord = {
  status: string; brief: string; design: string; review: string; reflection: string;
  reviewQuestions: ReviewQuestion[]; revisions: Revision[];
};

export function trainingWorkflow(session: WorkflowRecord) {
  const hasDesign = Boolean(session.design.trim());
  const hasReview = Boolean(session.review.trim() || session.reviewQuestions.length);
  const hasReflection = Boolean(session.reflection.trim());
  const openQuestions = session.reviewQuestions.filter(q => q.status === "open").length;
  const deferredQuestions = session.reviewQuestions.filter(q => q.status === "deferred").length;
  const finished = session.status === "completed";
  let next: string;
  if (finished) next = "本期已归档。在训练对话中安排后续训练，也可以带着新证据回访尚待验证的结论。";
  else if (!session.brief.trim()) next = "题面尚未发布。按当前训练的实际进度安排本期，无需提前准备作业。";
  else if (!hasDesign) next = "在训练对话中给出第一版想法，先回答题面的问题即可；不确定的地方可以直接写出来。";
  else if (!hasReview) next = "初稿已收录，接下来在训练对话中选 1—2 个关键决策进行追问。";
  else if (openQuestions) next = `在训练对话中继续回答尚未解决的追问（${openQuestions} 个），每轮只深入 1—2 个。`;
  else if (!hasReflection) next = "在训练对话中说明方案改了什么、为什么改，以及如何验证，再留下简短复盘。";
  else next = "初稿、评审与复盘已收录。在训练对话中核对结论和待验证项后，将本期归档。";
  const stage = finished ? 3 : !hasDesign ? 0 : !hasReview || openQuestions ? 1 : 2;
  return {
    stage, next, openQuestions, deferredQuestions,
    steps: [
      { label: "设计初稿", detail: hasDesign ? "已收录" : "等待初稿" },
      { label: "评审追问", detail: openQuestions ? `${openQuestions} 个待讨论` : hasReview ? "已收录" : "等待评审" },
      { label: "修订与复盘", detail: hasReflection ? "复盘已收录" : session.revisions.length ? `${session.revisions.length} 次修订 · 待复盘` : "等待记录" },
    ],
  };
}
