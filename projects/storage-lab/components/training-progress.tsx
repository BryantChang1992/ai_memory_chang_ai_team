import {
  abilityLabel,
  assessmentDimensions,
  assessmentLabels,
  type Assessments,
  type TrainingMode,
  type TrainingStage,
} from "@/lib/training";
import { completionDetail, stageDetails, stageIndex } from "@/lib/training-workflow";

export function TrainingProgress({ stage, mode }: { stage: TrainingStage; mode: TrainingMode }) {
  const active = stageIndex(stage);
  const steps = [
    { label: "本人初稿", detail: active === 0 ? "等待初稿" : "初稿已记录" },
    { label: "追问与修订", detail: active < 1 ? "等待实际讨论" : active === 1 ? "正在推进" : "已记录" },
    { label: "核对与复盘", detail: active < 2 ? "尚未核对" : active === 2 ? "待完成核对" : "Demo 已完成" },
  ];
  return (
    <section className="conversation-progress" aria-label="本轮训练进度">
      <h2>本轮进展</h2>
      <p className="workflow-intro">阶段按实际训练记录更新，不随日历自动推进。</p>
      <ol className="workflow-steps">
        {steps.map((step, i) => (
          <li key={step.label} aria-current={active === i ? "step" : undefined}>
            <span className="step-number">0{i + 1}</span>
            <div><strong>{step.label}</strong><span>{step.detail}</span></div>
          </li>
        ))}
      </ol>
      <p className="next-discussion">{stage === "completed" ? completionDetail(mode) : stageDetails[stage]}</p>
    </section>
  );
}

export function TrainingAssessment({ assessments, heading = "当前能力状态" }: { assessments: Assessments; heading?: string }) {
  return (
    <section className="detail-card assessment-card" aria-label={heading}>
      <p className="eyebrow">ABILITY ASSESSMENT</p>
      <h2>{heading}</h2>
      <p className="ability-summary">{abilityLabel(assessments)}</p>
      <p className="record-caption">Demo 完成与独立掌握分开记录。以下展示各维度的评估状态。</p>
      {assessmentDimensions.map(({ key, label }) => (
        <div className="assessment-dimension" key={key}>
          <div><strong>{label}</strong><span className={`assessment-state assessment-${assessments[key]}`}>{assessmentLabels[assessments[key]]}</span></div>
        </div>
      ))}
    </section>
  );
}
