import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProjectList } from "@/components/project-list";
import { PublicationMeta } from "@/components/publication-meta";
import { overviewAbilityLabel, progress, projectIsPassed, projects, referenceTime, schedule } from "@/lib/training";

export default function Home() {
  const { summary } = progress;
  const completed = projects.filter(projectIsPassed).length;
  return (
    <div className="site-shell">
      <SiteHeader/>
      <main className="workspace project-overview">
        <header className="page-heading">
          <div><p className="eyebrow">STORAGE DESIGN · PROJECTS</p><h1>一个项目，练到独立完成。</h1><p className="intro">按设计项目看进展，练习过程与独立考核分别记录。</p></div>
        </header>
        <section className="project-summary" aria-label="项目概要">
          <p><strong>{completed}</strong> 已完成 <span>/</span> <strong>{projects.length - completed}</strong> 待完成</p>
          <p>累计参考用时 <strong>{referenceTime(summary)}</strong></p>
          <p className="summary-ability">能力状态：{overviewAbilityLabel(summary.assessments, projects)}</p>
        </section>
        <ProjectList/>
        <details className="learning-plan">
          <summary><span>学习计划</span><span className="plan-summary">六类存储方向 + 综合设计</span></summary>
          <div>
            <p>流存储 → KV → 文件系统 → 表格存储 → 湖存储 → 存储底座</p>
            <p>六类方向之后进行综合设计。方向用于组织学习，一个方向可以包含多个实际设计项目。</p>
            <p className="record-caption">计划预算为 28 周、168 小时，每周约 6 小时，按实际进度调整。计划方向与预算不计为已完成项目或已投入用时。</p>
          </div>
        </details>
        <div className="overview-footnotes">
          <p>参考用时来自已记录训练，每轮只计一次。当前{summary.estimatedMinutes !== null ? `包含约 ${summary.estimatedMinutes} 分钟对话跨度估算` : "暂无对话跨度估算"}，可能含等待或离开时间。
            {summary.confirmedMinutes !== null ? `本人确认用时为 ${summary.confirmedMinutes} 分钟。` : "尚无本人确认用时。"}
            {summary.unknownTimeRounds > 0 ? `${summary.unknownTimeRounds} 轮用时待统计，未计入合计。` : ""}</p>
          <p><ShieldCheck size={15}/>这里只展示公开进展与概括性反馈。题目、回答和评价依据私有保存。</p>
        </div>
        <PublicationMeta/>
      </main>
      <footer><span>Bryant · Storage Lab</span><a href={schedule.blogUrl}>阅读技术博客 <ArrowUpRight size={14}/></a></footer>
    </div>
  );
}
