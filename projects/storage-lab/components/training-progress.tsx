import type { TrainingSession } from "@/lib/training";
import { dimensionLabels, trainingWorkflow, type Dimension } from "@/lib/training-workflow";

export function TrainingProgress({ session, compact = false }: { session: TrainingSession; compact?: boolean }) {
  const flow = trainingWorkflow(session);
  return <section className={compact ? "conversation-progress" : "conversation-progress detail-card"} aria-label="当前训练进度">
    <h2>在对话中讨论，在这里回看</h2>
    <p className="workflow-intro">初稿、追问与复盘在训练对话中完成，讨论后整理发布。这里展示已公开的记录。</p>
    <ol className="workflow-steps">{flow.steps.map((step, i) => <li key={step.label} aria-current={flow.stage === i ? "step" : undefined}>
      <span className="step-number">0{i + 1}</span><div><strong>{step.label}</strong><span>{step.detail}</span></div>
    </li>)}</ol>
    <p className="next-discussion"><strong>下一步</strong>{flow.next}</p>
    {flow.deferredQuestions > 0 && <p className="record-caption">还有 {flow.deferredQuestions} 个问题留待验证，详见评审记录。</p>}
  </section>;
}

export function TrainingAssessment({ session }: { session: TrainingSession }) {
  return <section className="detail-card assessment-card"><h2>本期能力观察</h2><p className="record-caption">根据实际回答记录证据，用于比较自己的前后变化。</p>
    {(Object.keys(dimensionLabels) as Dimension[]).map(key => <div className="assessment-dimension" key={key}>
      <div><strong>{dimensionLabels[key]}</strong><span>{session.scores[key] === null ? "未评估" : `${session.scores[key]} / 3`}</span></div>
      <p>{session.scoreEvidence[key] || "尚无评价依据，完成相关讨论后再记录。"}</p>
    </div>)}
    <p className="assessment-rubric">0 尚未体现 · 1 经提示能补充 · 2 能独立说明 · 3 能比较方案并提出验证办法。未讨论的维度保持“未评估”。</p>
  </section>;
}
