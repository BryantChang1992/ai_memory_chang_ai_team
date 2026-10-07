import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PublicationMeta } from "@/components/publication-meta";
import {
  displayDate,
  feedbackLabels,
  independentAssessmentLabel,
  modeLabels,
  projectIsPassed,
  projectPath,
  projectProgressLabel,
  projects,
  projectTime,
  projectTitleLabels,
  provenanceLabels,
  referenceTime,
  roundLabel,
  roundPath,
  roundsForProject,
  roundTimeLabel,
  schedule,
  trackLabels,
} from "@/lib/training";
import { statusLabels } from "@/lib/training-workflow";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ id }) => ({ id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();
  const title = `${projectTitleLabels[project.titleKey]} · 项目进展`;
  const description = "查看设计项目的引导练习、正式提交与修订、独立考核次数、用时及概括性反馈。";
  const url = schedule.canonicalUrl + projectPath(project.id);
  return { title, description, alternates: { canonical: url }, openGraph: { title: `${title} · Storage Lab`, description, url, siteName: "Bryant · Storage Lab", locale: "zh_CN", type: "website" } };
}

export default async function ProjectDetail({ params }: Props) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();
  const linkedRounds = roundsForProject(project);
  const time = projectTime(project);
  const passed = projectIsPassed(project);
  const fixedPaperStarted = project.practice.submissions > 0;
  const feedbackGroups = [
    { title: "训练中观察到的优点", kind: "strength", items: project.feedback.strengths },
    { title: "讨论中已澄清", kind: "resolved", items: project.feedback.resolvedIssues },
    { title: "仍需验证的问题", kind: "open", items: project.feedback.openIssues },
    { title: "接下来的建议", kind: "next", items: project.feedback.recommendations },
  ];
  return (
    <div className="site-shell">
      <SiteHeader/>
      <main className="workspace detail-workspace project-detail">
        <Link className="back-link" href="/#projects"><ArrowLeft size={16}/>返回设计项目</Link>
        <header className="detail-heading project-detail-heading">
          <div>
            <p className="eyebrow">DESIGN PROJECT · {trackLabels[project.track]}</p>
            <h1>{projectTitleLabels[project.titleKey]}</h1>
            <p className="intro">{projectProgressLabel(project)}</p>
          </div>
          <span className={`project-detail-status ${passed ? "project-detail-passed" : ""}`}>{passed ? <Check size={17}/> : <span className="status-dot"/>}{passed ? "已完成" : "未完成"}</span>
        </header>

        <section className="project-records" aria-label="练习与考核记录">
          <div className="detail-card practice-record">
            <p className="eyebrow">GUIDED PRACTICE</p><h2>引导练习与修订</h2>
            <p className="practice-status">{project.guidedDemoCompleted ? <><Check size={16}/> 引导 Demo 已完成</> : "引导 Demo 尚未完成"}</p>
            <dl className="practice-counts"><div><dt>正式练习提交</dt><dd>{project.practice.submissions}<small> 次</small></dd></div><div><dt>正式修订</dt><dd>{project.practice.revisions}<small> 次</small></dd></div></dl>
            <p className="count-explanation">{fixedPaperStarted ? "仅统计已记录的固定题卷正式提交与修订。" : "固定题卷尚未开始。"}此前对话中的初稿、追问与修订不计入这里的正式次数。</p>
          </div>
          <div className="detail-card exam-record">
            <p className="eyebrow">INDEPENDENT ASSESSMENT</p><h2>独立考核</h2>
            <p className={`exam-status${passed ? " exam-passed" : ""}`}>{project.independentAssessment.attempts === 0 ? "尚未开始 · 独立掌握未评估" : passed ? "已通过本项目独立考核" : "尚未通过本项目独立考核"}</p>
            <dl className="practice-counts"><div><dt>实际考核</dt><dd>{project.independentAssessment.attempts}<small> 次</small></dd></div><div><dt>第几次通过</dt><dd className="pass-attempt">{passed ? independentAssessmentLabel(project) : <><span>—</span><small>{project.independentAssessment.attempts === 0 ? "尚未考核" : "尚未通过"}</small></>}</dd></div></dl>
            <p className="count-explanation">无提示完成同一份空白题卷的整卷作答后，才记录一次独立考核。引导练习完成不代表独立考核通过。</p>
          </div>
        </section>

        {!passed && <section className="next-step-note" aria-labelledby="next-step-heading"><div className="next-step-number">NEXT</div><div><h2 id="next-step-heading">{fixedPaperStarted ? "继续完整作答与逐项修订" : "下一步：固定题卷训练"}</h2><p>先用固定题卷反复练习和修订；准备充分后，再用同一份空白题卷完成无提示整卷验收。</p></div></section>}

        <section className="feedback-section" aria-labelledby="feedback-heading">
          <div className="section-heading"><div><p className="eyebrow">PRACTICE FEEDBACK</p><h2 id="feedback-heading">反馈与建议</h2></div><span>仅概括已有训练观察</span></div>
          <div className="feedback-grid">{feedbackGroups.map((group) => <section className={`feedback-card feedback-${group.kind}`} key={group.kind}><h3><span/>{group.title}</h3>{group.items.length ? <ul>{group.items.map((key) => <li key={key}>{feedbackLabels[key]}</li>)}</ul> : <p>暂无已记录的概括性反馈。</p>}</section>)}</div>
          <p className="feedback-note">讨论中澄清的问题仍需在独立作答中验证。项目通过只表示本项目的独立考核结果，不代表整个存储方向已掌握。</p>
        </section>

        <section className="detail-card project-time-card" aria-labelledby="project-time-heading">
          <div className="project-time-heading"><div><p className="eyebrow">TIME & TRAINING RECORDS</p><h2 id="project-time-heading">用时与实际训练记录</h2></div><span><Clock3 size={18}/><small>本人用时</small>{referenceTime(time)}</span></div>
          <div className="project-time-sources"><span>本人确认：{time.confirmedMinutes === null ? "暂无" : `${time.confirmedMinutes} 分钟`}</span><span>对话跨度估算：{time.estimatedMinutes === null ? "暂无" : `约 ${time.estimatedMinutes} 分钟`}</span>{time.unknownTimeRounds > 0 && <span>{time.unknownTimeRounds} 轮用时待统计</span>}</div>
          {linkedRounds.length ? <ul className="project-rounds">{linkedRounds.map((round) => <li key={round.id}><Link href={roundPath(round.id)}><div><strong>{roundLabel(round.id)} · {modeLabels[round.mode]}</strong><span><time dateTime={round.date}>{displayDate(round.date)}</time> · {statusLabels[round.stage]}</span></div><div><strong>{roundTimeLabel(round.time)}</strong><span>{provenanceLabels[round.time.provenance]}</span></div><ArrowRight size={17}/></Link></li>)}</ul> : <p className="record-empty">暂无实际训练记录，用时待统计。</p>}
          <p className="time-explanation">用时来自以上实际训练记录，每轮只计一次。对话跨度可能包含等待或离开时间，不等同于专注时长；后续文档和站点整理时间不计入。</p>
        </section>
        <p className="detail-privacy-note">本页仅包含公开统计与固定措辞的概括性反馈。训练题目、本人回答、逐轮追问、复盘及评价依据私有保存。</p>
        <PublicationMeta/>
      </main>
      <footer><span>Bryant · Storage Lab</span><Link href="/#projects">全部设计项目 <ArrowRight size={15}/></Link></footer>
    </div>
  );
}
