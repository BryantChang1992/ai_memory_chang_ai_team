import {
  abilityLabel,
  assessmentDimensions,
  assessmentLabels,
  type Assessments,
  type TrainingMode,
  type TrainingStage,
} from "@/lib/training";
import { completionDetail, stageDetails, stageLabel } from "@/lib/training-workflow";

export function TrainingProgress({ stage, mode }: { stage: TrainingStage; mode: TrainingMode }) {
  return (
    <section className="conversation-progress" aria-label="本轮训练进度">
      <h2>本轮进展</h2>
      <p className="workflow-intro">只展示已记录的当前阶段，不推断追问、修订等步骤是否发生。</p>
      <p className="next-discussion"><strong>当前阶段：{stageLabel(stage, mode)}</strong>{stage === "completed" ? completionDetail(mode) : stageDetails[stage]}</p>
    </section>
  );
}

export function TrainingAssessment({ assessments, heading = "三维能力状态" }: { assessments: Assessments; heading?: string }) {
  return (
    <section className="detail-card assessment-card" aria-label={heading}>
      <p className="eyebrow">ABILITY ASSESSMENT</p>
      <h2>{heading}</h2>
      <p className="ability-summary">{abilityLabel(assessments)}</p>
      <p className="record-caption">项目独立考核与三维能力分开记录。以下状态只依据各维度的专项评估，不由项目通过或 Demo 完成推断。</p>
      {assessmentDimensions.map(({ key, label }) => (
        <div className="assessment-dimension" key={key}>
          <div><strong>{label}</strong><span className={`assessment-state assessment-${assessments[key]}`}>{assessmentLabels[assessments[key]]}</span></div>
        </div>
      ))}
    </section>
  );
}
