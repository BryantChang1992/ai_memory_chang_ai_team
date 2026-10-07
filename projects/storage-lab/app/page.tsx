import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TrainingAssessment } from "@/components/training-progress";
import { RoundList } from "@/components/round-list";
import { PublicationMeta } from "@/components/publication-meta";
import { abilityLabel, modeLabels, progress, recentRounds, referenceTime, roundLabel, roundPath, schedule, trackLabels } from "@/lib/training";
import { completionDetail, stageDetails, statusLabels } from "@/lib/training-workflow";

export default function Home() {
  const { summary } = progress;
  const latestRound = recentRounds()[0];
  return (
    <div className="site-shell">
      <SiteHeader/>
      <main className="workspace">
        <header className="page-heading">
          <div><p className="eyebrow">STORAGE DESIGN · OVERVIEW</p><h1>分布式存储，逐步深入。</h1><p className="intro">总览训练积累，逐轮查看本人用时与能力评估。</p></div>
          <div className="cadence"><CalendarDays size={18}/><span>每周约 6 小时<small>计划预算 · 按实际进度调整</small></span></div>
        </header>
        <section className="overview-strip progress-overview" aria-label="训练概要">
          <div><span className="stat-label">已完成 Demo</span><strong className="stat-number">{summary.completedDemos}<small> 轮</small></strong><p className="stat-note">完成轮次不等于独立掌握</p></div>
          <div><span className="stat-label">累计参考用时</span><strong className="stat-number">{referenceTime(summary)}</strong><div className="time-breakdown">
            {summary.confirmedMinutes !== null && <span>本人确认：{summary.confirmedMinutes} 分钟</span>}
            {summary.estimatedMinutes !== null && <span>对话跨度估算：约 {summary.estimatedMinutes} 分钟</span>}
            {summary.confirmedMinutes === null && <span>尚无本人确认用时</span>}
            {summary.unknownTimeRounds > 0 && <span>{summary.unknownTimeRounds} 轮用时待统计，未计入合计</span>}
          </div></div>
          <div><span className="stat-label">当前训练阶段</span><strong className="stat-number stat-text">{statusLabels[summary.currentStage]}</strong><p className="stat-note">{latestRound ? `${roundLabel(latestRound.id)} · ${modeLabels[latestRound.mode]}` : "等待首轮训练记录"}</p></div>
          <div><span className="stat-label">当前能力状态</span><strong className="stat-number stat-text">{abilityLabel(summary.assessments)}</strong><p className="stat-note">规模 · 一致性 · 性能</p></div>
        </section>
        <p className="overview-time-note">参考用时按轮累计，本人确认与对话估算分别展示，同一轮不重复计入。对话跨度可能包含等待或离开时间，不等同于专注时长；后续文档和站点整理不计入。</p>
        <div className="work-grid">
          <section className="current-case">
            <div className="case-top"><span>{latestRound ? `最近一轮 · ${trackLabels[latestRound.track]}` : "开始训练"}</span><span className="light-badge">{statusLabels[summary.currentStage]}</span></div>
            <h2>{latestRound ? `${roundLabel(latestRound.id)}，记录真实进展。` : "从第一份思考开始。"}</h2>
            <p>{latestRound ? latestRound.stage === "completed" ? completionDetail(latestRound.mode) : stageDetails[latestRound.stage] : "每一轮实际训练都会记录日期、阶段、用时来源和能力评估状态。"}</p>
            <div className="case-tags"><span>逐轮记录</span><span>用时注明来源</span><span>能力单独评估</span></div>
            {latestRound && <div className="case-footer"><Link href={roundPath(latestRound.id)}>查看本轮明细 <ArrowRight size={16}/></Link><span>{modeLabels[latestRound.mode]} · {roundLabel(latestRound.id)}</span></div>}
          </section>
          <TrainingAssessment assessments={summary.assessments}/>
        </div>
        <RoundList/>
        <p className="record-caption round-list-caption">这里只列出实际记录的训练轮次。Demo 完成不代表课程周次完成，能力状态以各维度评估记录为准。</p>
        <section className="detail-card curriculum-card"><p className="eyebrow">LEARNING PLAN</p><h2>训练方向</h2><p>流存储 → KV → 文件系统 → 表格存储 → 湖存储 → 存储底座 → 综合设计</p><p className="record-caption">计划预算为 28 周、168 小时，每周约 6 小时。必要的共性机制随题学习，存储底座放在湖存储后集中归纳。以上为计划，不代表已完成进度或已投入用时。</p></section>
        <section className="journal-banner privacy-banner"><ShieldCheck size={27}/><div><h2>训练内容私有保存。</h2><p>这里仅展示公开进展统计。题目、回答、复盘与评价依据不在公开页面展示。</p></div><a href={schedule.blogUrl}>阅读技术博客 <ArrowUpRight size={17}/></a></section>
        <PublicationMeta/>
      </main>
      <footer><span>Bryant · Storage Lab</span><span>真实进展，逐步积累。</span></footer>
    </div>
  );
}
