import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProjectList } from "@/components/project-list";
import { PublicationMeta } from "@/components/publication-meta";
import { curriculumSummary, overviewAbilityLabel, progress, projects, referenceTime, schedule } from "@/lib/training";

export default function Home() {
  const { summary } = progress;
  const plan = curriculumSummary();
  return (
    <div className="site-shell">
      <SiteHeader/>
      <main className="workspace project-overview">
        <header className="page-heading">
          <div><p className="eyebrow">STORAGE DESIGN · 28-WEEK PLAN</p><h1>完整学习计划，逐项记录进展。</h1><p className="intro">{plan.total} 个计划项目 / 周主题，按存储方向展开。练习与独立考核分别记录。</p></div>
        </header>
        <section className="project-summary" aria-label="项目概要">
          <p><strong>{plan.completed}</strong> 已完成 <span>/</span> <strong>{plan.incomplete}</strong> 未完成</p>
          <p>累计参考用时 <strong>{referenceTime(summary)}</strong></p>
          <p className="summary-ability">能力状态：{overviewAbilityLabel(summary.assessments, projects)}</p>
        </section>
        <p className="plan-budget">计划预算：28 周 · 168 小时 · 每周约 6 小时。周次表示学习顺序，按实际进度调整。</p>
        <ProjectList/>
        <div className="overview-footnotes">
          <p>参考用时来自已记录训练，每轮只计一次。当前{summary.estimatedMinutes !== null ? `包含约 ${summary.estimatedMinutes} 分钟对话跨度估算` : "暂无对话跨度估算"}，可能含等待或离开时间。
            {summary.confirmedMinutes !== null ? `本人确认用时为 ${summary.confirmedMinutes} 分钟。` : "尚无本人确认用时。"}
            {summary.unknownTimeRounds > 0 ? `${summary.unknownTimeRounds} 轮用时待统计，未计入合计。` : ""}</p>
          <p><ShieldCheck size={15}/>这里只展示计划、公开进展与概括性反馈。原始题目、回答和评价依据私有保存；参考答案通过后再整理发布。</p>
        </div>
        <PublicationMeta/>
      </main>
      <footer><span>Bryant · Storage Lab</span><a href={schedule.blogUrl}>阅读技术博客 <ArrowUpRight size={14}/></a></footer>
    </div>
  );
}
