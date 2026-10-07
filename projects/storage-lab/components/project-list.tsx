import Link from "next/link";
import { ArrowRight, Check, Clock3 } from "lucide-react";
import {
  independentAssessmentLabel,
  projectIsPassed,
  projectPath,
  projectProgressLabel,
  projects,
  projectTime,
  projectTitleLabels,
  referenceTime,
  trackLabels,
  type PublicProject,
} from "@/lib/training";

function ProjectCard({ project }: { project: PublicProject }) {
  const passed = projectIsPassed(project);
  return (
    <Link className={`project-card${passed ? " project-card-passed" : ""}`} href={projectPath(project.id)} aria-label={`查看${projectTitleLabels[project.titleKey]}项目明细`}>
      <div className="project-card-heading">
        <div><span className="project-track">{trackLabels[project.track]} · 设计项目</span><h3>{projectTitleLabels[project.titleKey]}</h3></div>
        <span className={`status-tag ${passed ? "status-completed" : "status-practicing"}`}>{passed ? <><Check size={13}/> 已完成</> : "未完成"}</span>
      </div>
      <p className="project-card-progress">{projectProgressLabel(project)}</p>
      <div className="project-card-facts">
        <span>独立考核 <strong>{project.independentAssessment.attempts}</strong> 次<small> · {independentAssessmentLabel(project)}</small></span>
        <span><Clock3 size={14}/>{referenceTime(projectTime(project))}<small>参考用时</small></span>
      </div>
      <div className="project-card-bottom"><span>查看练习、考核与反馈</span><ArrowRight size={17}/></div>
    </Link>
  );
}

export function ProjectList() {
  const incomplete = projects.filter((project) => !projectIsPassed(project));
  const completed = projects.filter(projectIsPassed);
  return (
    <section className="project-collection" id="projects" aria-label="设计项目">
      <section className="project-group" aria-labelledby="incomplete-heading">
        <div className="section-heading"><h2 id="incomplete-heading">未完成项目 <span className="list-count">{incomplete.length}</span></h2><span>继续练习，直到完成独立考核</span></div>
        {incomplete.length ? <div className="project-grid">{incomplete.map((project) => <ProjectCard key={project.id} project={project}/>)}</div> : <p className="project-empty">暂无未完成的设计项目。</p>}
      </section>
      <section className="project-group completed-projects" aria-labelledby="completed-heading">
        <div className="section-heading"><h2 id="completed-heading">已完成项目 <span className="list-count">{completed.length}</span></h2><span>以实际通过独立考核为准</span></div>
        {completed.length ? <div className="project-grid">{completed.map((project) => <ProjectCard key={project.id} project={project}/>)}</div> : <p className="project-empty">还没有通过独立考核的项目。已完成的引导练习保留在对应项目中。</p>}
      </section>
    </section>
  );
}
