import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import {
  abilityLabel,
  displayDate,
  modeLabels,
  provenanceLabels,
  recentRounds,
  roundLabel,
  roundPath,
  roundTimeLabel,
  trackLabels,
} from "@/lib/training";
import { stageLabel } from "@/lib/training-workflow";

export function RoundList() {
  const rounds = recentRounds();
  return (
    <section className="route-section" id="rounds" aria-labelledby="rounds-heading">
      <div className="section-heading">
        <div><p className="eyebrow">TRAINING ROUNDS</p><h2 id="rounds-heading">每轮训练明细</h2></div>
        <span>已记录 {rounds.length} 轮 · 点击查看用时与评估</span>
      </div>
      {rounds.length === 0 ? (
        <p className="record-empty">暂无已记录的训练轮次。实际开始训练后，将在这里展示每轮进展。</p>
      ) : (
        <div className="round-grid">
          {rounds.map((round) => (
            <Link className="round-card" href={roundPath(round.id)} key={round.id} aria-label={`查看${roundLabel(round.id)} · ${trackLabels[round.track]}训练明细`}>
              <div className="round-card-top"><span className="round-number">{roundLabel(round.id)}</span><span className={`status-tag ${round.stage === "completed" ? "status-completed" : ""}`}>{stageLabel(round.stage, round.mode)}</span></div>
              <h3>{trackLabels[round.track]}</h3>
              <div className="round-card-meta"><span><CalendarDays size={15}/><time dateTime={round.date}>{displayDate(round.date)}</time></span><span>{modeLabels[round.mode]}</span></div>
              <div className="round-time"><Clock3 size={17}/><span>本人用时：<strong>{roundTimeLabel(round.time)}</strong>{round.time.provenance !== "unknown" && <small>（{provenanceLabels[round.time.provenance]}）</small>}</span></div>
              <p className="round-ability">能力状态：{abilityLabel(round.assessments)}</p>
              <div className="round-card-bottom"><span>查看本轮明细</span><ArrowRight size={17}/></div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
