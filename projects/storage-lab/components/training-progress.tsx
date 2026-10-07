import { progress } from "@/lib/training";
import { stageDetails, stageIndex } from "@/lib/training-workflow";
export function TrainingProgress() {
  const active = stageIndex(progress.stage);
  const steps = [
    { label: "本人初稿", detail: active === 0 ? "等待初稿" : "初稿已保存" },
    { label: "追问与修订", detail: active < 1 ? "等待实际讨论" : active === 1 ? "正在推进" : "已私有保存" },
    { label: "核对与复盘", detail: active < 2 ? "尚未核对" : active === 2 ? "待完成核对" : "Demo 已完成" },
  ];
  return <section className="conversation-progress" aria-label="当前训练进度">
    <h2>当前进展</h2><p className="workflow-intro">阶段只按真实发生的训练更新，不随日历自动推进。</p>
    <ol className="workflow-steps">{steps.map((step, i) => <li key={step.label} aria-current={active === i ? "step" : undefined}>
      <span className="step-number">0{i + 1}</span><div><strong>{step.label}</strong><span>{step.detail}</span></div>
    </li>)}</ol><p className="next-discussion">{stageDetails[progress.stage]}</p>
  </section>;
}
export function TrainingAssessment() {
  return <section className="detail-card assessment-card"><p className="eyebrow">ABILITY</p><h2>能力观察</h2>
    <p className="record-caption">本轮尚不进行能力评级。完成一次流程不等于掌握一个存储系统。</p>
    {["规模", "一致性", "性能"].map(name => <div className="assessment-dimension" key={name}><div><strong>{name}</strong><span>未评估</span></div></div>)}
  </section>;
}
