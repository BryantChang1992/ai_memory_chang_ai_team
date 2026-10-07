import { ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TrainingProgress, TrainingAssessment } from "@/components/training-progress";
import { progress, schedule, displayDate } from "@/lib/training";
import { statusLabels } from "@/lib/training-workflow";
export default function Home() {
  return <div className="site-shell"><SiteHeader/><main className="workspace">
    <header className="page-heading"><div><p className="eyebrow">STORAGE DESIGN · PROGRESS</p><h1>分布式存储，逐步深入。</h1><p className="intro">在训练对话中推演，在这里查看真实进展。</p></div><div className="cadence"><CalendarDays size={18}/><span>每周约 6 小时<small>按实际进度调整</small></span></div></header>
    <section className="overview-strip progress-overview" aria-label="训练统计">
      <div><span className="stat-number">{progress.completedCount}<small> 轮</small></span><span>已完成 Demo</span></div>
      <div><span className="stat-number">{progress.confirmedMinutes === null ? "未确认" : progress.confirmedMinutes}<small>{progress.confirmedMinutes === null ? "" : " 分钟"}</small></span><span>本人确认的累计用时</span></div>
      <div><span className="stat-number">未评估</span><span>当前能力状态</span></div>
      <div><span className="stat-number">{statusLabels[progress.stage]}</span><span>当前训练阶段</span></div>
    </section>
    <div className="work-grid"><section className="current-case"><div className="case-top"><span>当前主线 · 流存储</span><span className="light-badge">{statusLabels[progress.stage]}</span></div><h2>{progress.stage === "completed" ? "一轮 Demo，留下完整过程。" : "从第一份独立思考开始。"}</h2><p>{progress.stage === "completed" ? "本轮经过提示、纠正和修订完成。本人设计原文与教练参考答案分别保留，方便对照回看。" : "通过本人作答、针对性追问和修订，逐步检查理解与推理过程。"}</p><div className="case-tags"><span>独立设计</span><span>真实反馈</span><span>保留修订</span></div><p className="case-footnote">尚未确认的用时保留为未知；计划预算不计入实际投入。</p></section><TrainingAssessment/></div>
    <TrainingProgress/>
    <p className="record-caption">Demo 完成不代表课程周次完成；独立掌握程度需要后续练习证据，当前仍为未评估。</p>
    <section className="detail-card curriculum-card"><p className="eyebrow">LEARNING PLAN</p><h2>训练方向</h2><p>流存储 → KV → 文件系统 → 表格存储 → 湖存储 → 存储底座 → 综合设计</p><p className="record-caption">计划预算为 28 周、168 小时，每周约 6 小时。必要的共性机制随题学习，存储底座放在湖存储后集中归纳。以上为计划，不代表已完成进度。</p></section>
    <section className="journal-banner privacy-banner"><ShieldCheck size={27}/><div><h2>训练内容私有保存。</h2><p>题目、回答、追问、修订和评价依据保存在私有训练档案中。这里仅展示本轮允许的进展统计。</p></div><a href={schedule.blogUrl}>阅读技术博客 <ArrowUpRight size={17}/></a></section>
    <p className="publication-meta">数据更新：<time dateTime={progress.updatedAt}>{displayDate(progress.updatedAt)}</time><span>发布标识：<code data-publication-id={progress.publicationId}>{progress.publicationId}</code></span></p>
  </main><footer><span>Bryant · Storage Lab</span><span>真实进展，逐步积累。</span></footer></div>;
}
