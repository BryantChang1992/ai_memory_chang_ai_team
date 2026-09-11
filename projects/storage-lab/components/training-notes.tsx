"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, MessagesSquare, NotebookPen } from "lucide-react";
import { dimensionLabels, questionStatusLabels, recordTemplates, type ReviewQuestion, type Revision } from "@/lib/training-workflow";

function Note({ text }: { text: string }) {
  return <div className="prose-note">{text.split("\n\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>;
}

function Template({ stage }: { stage: keyof typeof recordTemplates }) {
  return <Accordion type="single" collapsible className="record-template">
    <AccordionItem value="template">
      <AccordionTrigger>记录模板 · 讨论提纲</AccordionTrigger>
      <AccordionContent><p>这是讨论提纲，尚未填写的内容不计入训练进度。可以在训练对话中逐步补充，无需一次填完。</p><ol>{recordTemplates[stage].map(line => <li key={line}>{line}</li>)}</ol></AccordionContent>
    </AccordionItem>
  </Accordion>;
}

export function TrainingNotes({ design, review, reflection, reviewQuestions, revisions }: {
  design: string; review: string; reflection: string; reviewQuestions: ReviewQuestion[]; revisions: Revision[];
}) {
  const tabs = [
    { key: "design", title: "设计初稿", icon: FileText },
    { key: "review", title: "评审追问", icon: MessagesSquare },
    { key: "reflection", title: "修订与复盘", icon: NotebookPen },
  ];
  return <Tabs defaultValue="design" className="notes-tabs">
    <TabsList variant="line" aria-label="训练记录阶段">{tabs.map(item => <TabsTrigger key={item.key} value={item.key}><item.icon/>{item.title}</TabsTrigger>)}</TabsList>
    <TabsContent value="design">
      {design ? <><p className="record-caption">保留最初的设计与假设，后续修改见“修订与复盘”。</p><Note text={design}/></> : <p className="record-empty">尚无初稿。先在训练对话中回答本期问题，零散想法也可以成为第一版。</p>}
      <Template stage="design"/>
    </TabsContent>
    <TabsContent value="review">
      {review && <Note text={review}/>}
      {reviewQuestions.length > 0 ? <div className="review-list">{reviewQuestions.map(q => <article className="review-question" key={q.id}>
        <div className="record-meta"><span>{q.id} · {dimensionLabels[q.dimension]}</span><span className={`question-status question-${q.status}`}>{questionStatusLabels[q.status]}</span></div>
        <h3>{q.question}</h3>
        {q.discussion.length ? <ol className="discussion-list">{q.discussion.map((entry, i) => <li key={i}><div className="record-meta"><strong>{entry.role === "bryant" ? "Bryant 的回答" : "评审反馈"}</strong><time dateTime={entry.date}>{entry.date}</time></div><Note text={entry.text}/></li>)}</ol> : <p className="record-empty">等待在训练对话中继续回答。</p>}
        {q.conclusion && <div className="review-conclusion"><strong>{q.status === "open" ? "当前观察" : q.status === "deferred" ? "待验证事项" : "讨论结论"}</strong><Note text={q.conclusion}/></div>}
      </article>)}</div> : !review && <p className="record-empty">尚无评审记录。收到初稿后，每轮选 1—2 个问题，在训练对话中继续追问。</p>}
      <Template stage="review"/>
    </TabsContent>
    <TabsContent value="reflection">
      {revisions.length > 0 && <div className="revision-list">{revisions.map(revision => <article className="revision-entry" key={revision.id}>
        <div className="record-meta"><strong>{revision.id} · 方案修订</strong><time dateTime={revision.date}>{revision.date}</time></div>
        <div className="revision-comparison"><div><h3>修改前</h3><Note text={revision.before}/></div><div><h3>修改后</h3><Note text={revision.after}/></div></div>
        <h3>修改原因</h3><Note text={revision.reason}/><h3>验证办法与结果</h3><Note text={revision.validation}/>
      </article>)}</div>}
      {reflection ? <div className="reflection-note"><h3>本期复盘</h3><Note text={reflection}/></div> : <p className="record-empty">尚无复盘。讨论后记录修改依据、未解决问题和验证办法；修订会单独保留，不覆盖初稿。</p>}
      <Template stage="reflection"/>
    </TabsContent>
  </Tabs>;
}
