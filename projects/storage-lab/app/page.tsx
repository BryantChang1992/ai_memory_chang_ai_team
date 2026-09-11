import { Database, ArrowUpRight, ArrowRight, CalendarDays, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { sessions, schedule, completed, currentSession, sessionPath, statusLabels } from "@/lib/training";
export default function Home() {
return <div className="site-shell">
<SiteHeader/>
<main className="workspace">
<div className="page-heading"><div><p className="eyebrow">LEARNING IN PUBLIC · 第一轮</p><h1>分布式存储，逐题深入。</h1><p className="intro">从读写路径到千节点系统，记录每一次设计、追问与修订。</p></div><div className="cadence"><CalendarDays size={18}/><span>隔周日 21:00<small>北京时间 · 每期约 2 小时</small></span></div></div>
<section className="overview-strip" aria-label="训练总览"><div><span className="stat-number">{String(completed.length).padStart(2,"0")}<small> / 12</small></span><span>已完成训练</span></div><div><span className="stat-number">24<small> 周</small></span><span>一轮完整探索</span></div><div><span className="stat-number">03<small> 个维度</small></span><span>规模 · 一致性 · 性能</span></div><div className="total-progress"><span>从第一份设计开始 <b>{Math.round(completed.length/12*100)}%</b></span><Progress value={completed.length/12*100} aria-label={"训练完成度 "+Math.round(completed.length/12*100)+"%"}/></div></section>
<div className="work-grid"><section className="current-case"><div className="case-top"><span>当前训练 / {String(currentSession.id).padStart(2,"0")}</span><span className="light-badge">{currentSession.date.replaceAll("-",".")} · {statusLabels[currentSession.status]}</span></div><h2>{currentSession.id===1?<>一次写入，<br/>何时才算真正成功？</>:currentSession.title}</h2><p>{currentSession.id===1?"从三副本 KV 的写入承诺切入，沿着内存、磁盘和副本，一步步推演故障后的结果。":currentSession.summary}</p><div className="case-tags"><span>规模</span><span>一致性</span><span>性能</span></div><div className="case-footer"><Button asChild><Link href={sessionPath(currentSession.id)}>查看本期题目 <ArrowRight/></Link></Button><span>第一周设计 · 第二周复盘</span></div></section>
<aside className="method-card"><p className="eyebrow">每道题，都问三个问题</p>{["规模|数据和节点增长后，哪里先到极限？","一致性|并发与故障中，哪些结果允许发生？","性能|吞吐和尾延迟的代价，花在哪里？"].map((v,i)=><div className="dimension" key={v}><span>0{i+1}</span><div><h3>{v.split("|")[0]}</h3><p>{v.split("|")[1]}</p></div></div>)}</aside></div>
<section id="training-route" className="route-section"><div className="section-heading"><div><p className="eyebrow">THE LEARNING PATH</p><h2>12 期训练路线</h2></div><span>每两周一题 · 按实际进度推进</span></div><div className="session-grid">{sessions.map(s=><Link href={sessionPath(s.id)} key={s.id} className="session-card"><div className="session-top"><span className="session-index">{String(s.id).padStart(2,"0")}</span><span className={"status-tag status-"+s.status}>{statusLabels[s.status]}</span></div><span className="session-category">{s.category}</span><h3>{s.title}</h3><p>{s.summary}</p><div className="session-bottom"><span>{s.date.slice(5).replace("-"," / ")}</span><ArrowUpRight size={17}/></div></Link>)}</div></section>
<section className="journal-banner"><BookOpen size={27}/><div><h2>让设计留下推理过程。</h2><p>{completed.length?"已有 "+completed.length+" 期训练完成，进入每期档案阅读设计过程与复盘。":"初稿、评审、修订与复盘会随训练逐步公开。当前尚无已完成的训练记录。"}</p></div><a href={schedule.blogUrl} target="_blank" rel="noreferrer">阅读我的技术博客 <ArrowUpRight size={17}/></a></section>
</main><footer><span>Bryant · Storage Lab</span><span>持续学习，公开记录。 2026</span></footer>
</div>;
}
