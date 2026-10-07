import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TrainingAssessment, TrainingProgress } from "@/components/training-progress";
import { PublicationMeta } from "@/components/publication-meta";
import { abilityLabel, displayDate, modeLabels, provenanceLabels, projectForRound, projectPath, projectTitleLabels, roundLabel, roundPath, rounds, roundTimeLabel, schedule, trackLabels } from "@/lib/training";
import { statusLabels } from "@/lib/training-workflow";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return rounds.map(({ id }) => ({ id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const round = rounds.find((item) => item.id === id);
  if (!round) notFound();
  const title = `${roundLabel(round.id)} · ${trackLabels[round.track]}训练明细`;
  const description = `查看${roundLabel(round.id)}的训练阶段、本人用时来源及规模、一致性、性能评估状态。`;
  const url = schedule.canonicalUrl + roundPath(round.id);
  return { title, description, alternates: { canonical: url }, openGraph: { title: `${title} · Storage Lab`, description, url, siteName: "Bryant · Storage Lab", locale: "zh_CN", type: "website" } };
}

export default async function RoundDetail({ params }: Props) {
  const { id } = await params;
  const round = rounds.find((item) => item.id === id);
  if (!round) notFound();
  const project = projectForRound(round.id);
  const index = rounds.findIndex((item) => item.id === id);
  const previousRound = rounds[index - 1];
  const nextRound = rounds[index + 1];
  return (
    <div className="site-shell">
      <SiteHeader/>
      <main className="workspace detail-workspace">
        <Link className="back-link" href={project ? projectPath(project.id) : "/#projects"}><ArrowLeft size={16}/>{project ? "返回设计项目" : "返回项目总览"}</Link>
        <header className="detail-heading">
          <div>
            <p className="eyebrow">ROUND DETAIL · {round.id.toUpperCase()}</p>
            <h1>{roundLabel(round.id)} · {trackLabels[round.track]}</h1>
            <p className="intro">本轮实际训练记录与能力评估状态</p>
            <div className="detail-meta"><span><CalendarDays size={16}/><time dateTime={round.date}>{displayDate(round.date)}</time></span><span className={`status-tag ${round.stage === "completed" ? "status-completed" : ""}`}>{statusLabels[round.stage]}</span><span className="mode-tag">{modeLabels[round.mode]}</span></div>
            {project && <Link className="round-project-link" href={projectPath(project.id)}>所属项目：{projectTitleLabels[project.titleKey]}<ArrowRight size={14}/></Link>}
          </div>
          <span className="large-index" aria-hidden="true">{round.id.slice(6)}</span>
        </header>
        {project && <p className="round-project-note">本页记录实际训练过程。固定题卷的正式提交、正式修订与独立考核次数在项目页分别统计，对话中的追问和修订不计为考核次数。</p>}
        <div className="detail-grid round-detail-grid">
          <div>
            <section className="detail-card time-detail-card" aria-labelledby="round-time-heading">
              <p className="eyebrow">TIME RECORD</p>
              <h2 id="round-time-heading">本人用时：<span className="detail-time-value">{roundTimeLabel(round.time)}</span>{round.time.provenance !== "unknown" && <small>（{provenanceLabels[round.time.provenance]}）</small>}</h2>
              <dl className="round-facts"><div><dt>训练日期</dt><dd><time dateTime={round.date}>{displayDate(round.date)}</time></dd></div><div><dt>训练方式</dt><dd>{modeLabels[round.mode]}</dd></div><div><dt>用时来源</dt><dd>{provenanceLabels[round.time.provenance]}</dd></div></dl>
              <p className="time-explanation">
                {round.time.provenance === "conversation_span"
                  ? "按本轮训练对话从首次参与到技术边界确认的跨度估算，可能包含等待或离开时间，不等同于精确专注时长。后续文档和站点整理时间不计入。"
                  : round.time.provenance === "user_confirmed"
                    ? "本轮用时由本人确认。累计参考用时只计入这一份记录，不与本轮对话估算重复累计。"
                    : "本轮用时尚待统计，暂不计入累计参考用时。未知用时不会按 0 分钟展示。"}
              </p>
            </section>
            <TrainingProgress stage={round.stage} mode={round.mode}/>
          </div>
          <aside className="detail-aside">
            <TrainingAssessment assessments={round.assessments} heading="本轮能力状态"/>
            <p className="round-assessment-note">能力状态：{abilityLabel(round.assessments)}。评估状态不代表数值分数，完成 Demo 不直接代表独立掌握。</p>
          </aside>
        </div>
        <p className="detail-privacy-note">本页仅包含公开统计。训练题目、本人回答、逐轮追问、复盘及评价依据私有保存。</p>
        <nav className="detail-next" aria-label="轮次导航">
          {previousRound ? <Link href={roundPath(previousRound.id)}><ArrowLeft size={16}/>上一轮：{roundLabel(previousRound.id)}</Link> : <Link href={project ? projectPath(project.id) : "/#projects"}><ArrowLeft size={16}/>{project ? "返回所属项目" : "返回设计项目"}</Link>}
          {nextRound && <Link href={roundPath(nextRound.id)}>下一轮：{roundLabel(nextRound.id)}<ArrowRight size={16}/></Link>}
        </nav>
        <PublicationMeta/>
      </main>
      <footer><span>Bryant · Storage Lab</span><Link href="/">项目总览 <ArrowRight size={15}/></Link></footer>
    </div>
  );
}
