import Link from "next/link";
import { ArrowRight, Check, Clock3 } from "lucide-react";
import {
  curriculumGroups,
  curriculum,
  curriculumPreparationLabel,
  curriculumStarterProject,
  curriculumSummary,
  curriculumTitle,
  independentAssessmentLabel,
  plannedWeekLabel,
  projectIsPassed,
  projectPath,
  projectProgressLabel,
  projectTime,
  projectTitleLabels,
  referenceTime,
  trackLabels,
  trackOrder,
  type PublicCurriculumItem,
  type PublicProject,
} from "@/lib/training";

function StarterProject({ project }: { project: PublicProject }) {
  const passed = projectIsPassed(project);
  return (
    <Link className="starter-project" href={projectPath(project.id)} aria-label={`查看起步练习：${projectTitleLabels[project.titleKey]}`}>
      <div className="starter-project-heading">
        <div><span className="starter-label">已记录的起步练习</span><strong>{projectTitleLabels[project.titleKey]}</strong></div>
        <span className={`status-tag ${passed ? "status-completed" : "status-practicing"}`}>{passed ? <><Check size={13}/> 独立考核通过</> : "练习中"}</span>
      </div>
      <p>{projectProgressLabel(project)}</p>
      <div className="project-card-facts">
        <span>独立考核 <strong>{project.independentAssessment.attempts}</strong> 次<small> · {independentAssessmentLabel(project)}</small></span>
        <span><Clock3 size={14}/>{referenceTime(projectTime(project))}<small>参考用时</small></span>
      </div>
      <div className="project-card-bottom"><span>查看练习、考核与反馈</span><ArrowRight size={17}/></div>
    </Link>
  );
}

function PlannedProject({ item }: { item: PublicCurriculumItem }) {
  const starter = curriculumStarterProject(item);
  const completed = item.status === "completed";
  return (
    <li className={`curriculum-item${starter ? " curriculum-item-active" : ""}`}>
      <article aria-labelledby={`plan-week-${item.week}-title`}>
        <div className="curriculum-item-meta"><span>{plannedWeekLabel(item.week)}</span><span className={`status-tag ${completed ? "status-completed" : item.status === "in_progress" ? "status-practicing" : "status-not-started"}`}>{completed ? <><Check size={12}/>已完成</> : item.status === "in_progress" ? "进行中" : "未开始"}</span></div>
        <h4 id={`plan-week-${item.week}-title`}>{curriculumTitle(item)}</h4>
        {starter ? <>
          <p className="curriculum-scope-note">起步练习单独记录，计划第 {item.week} 周{completed ? "已通过完整范围验收" : "尚未整体完成"}。</p>
          <StarterProject project={starter}/>
        </> : <p className="curriculum-preparation">{curriculumPreparationLabel(item)}</p>}
      </article>
    </li>
  );
}

function CurriculumFamilies({ items, completed = false }: { items: PublicCurriculumItem[]; completed?: boolean }) {
  const groups = curriculumGroups(items);
  const allGroups = curriculumGroups();
  const prefix = completed ? "completed-plan" : "plan";
  return <div className="curriculum-families">{groups.map(({ track, items }) => {
    const family = allGroups.find((group) => group.track === track)!;
    return <section className="curriculum-family" id={`${prefix}-${track}`} aria-labelledby={`${prefix}-${track}-heading`} key={track}>
      <div className="curriculum-family-heading"><div><span className="family-number">{String(trackOrder.indexOf(track) + 1).padStart(2, "0")}</span><h3 id={`${prefix}-${track}-heading`}>{trackLabels[track]}</h3></div><span>计划第 {family.items[0].week}–{family.items[family.items.length - 1].week} 周 · {items.length} 项</span></div>
      <ul className="curriculum-grid">{items.map((item) => <PlannedProject item={item} key={item.week}/>)}</ul>
    </section>;
  })}</div>;
}

export function ProjectList() {
  const incomplete = curriculum.filter((item) => item.status !== "completed");
  const completed = curriculum.filter((item) => item.status === "completed");
  const groups = curriculumGroups(incomplete);
  const plan = curriculumSummary();
  return (
    <section className="project-collection" id="projects" aria-label="完整设计项目计划">
      <section className="project-group" aria-labelledby="incomplete-heading">
        <div className="section-heading"><h2 id="incomplete-heading">未完成项目 <span className="list-count">{plan.incomplete}</span></h2><span>{plan.inProgress} 项进行中 · {plan.notStarted} 项未开始</span></div>
        <nav className="curriculum-nav" aria-label="按存储方向跳转">{groups.map(({ track }) => <a key={track} href={`#plan-${track}`}>{trackLabels[track]}</a>)}</nav>
        {incomplete.length ? <CurriculumFamilies items={incomplete}/> : <p className="project-empty">所有计划项目均已通过完整范围验收。</p>}
      </section>
      <section className="project-group completed-projects" aria-labelledby="completed-heading">
        <div className="section-heading"><h2 id="completed-heading">已完成项目 <span className="list-count">{plan.completed}</span></h2><span>以对应周主题的完整范围验收为准</span></div>
        {completed.length ? <CurriculumFamilies items={completed} completed/> : <p className="project-empty">尚无通过整周范围验收的计划项目。起步练习的 Demo 或独立考核结果单独记录，不代表整周主题已完成。</p>}
      </section>
    </section>
  );
}
