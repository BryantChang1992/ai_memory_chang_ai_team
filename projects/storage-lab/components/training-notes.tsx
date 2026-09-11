"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessagesSquare, NotebookPen } from "lucide-react";
export function TrainingNotes({design,review,reflection}:{design:string;review:string;reflection:string}){
const items=[{key:"design",title:"设计初稿",text:design,icon:FileText,empty:"设计初稿尚未提交。这里将记录需求假设、架构、读写路径与关键取舍。"},
{key:"review",title:"评审追问",text:review,icon:MessagesSquare,empty:"评审尚未开始。我们会用具体的故障时序和规模变化检验方案。"},
{key:"reflection",title:"修订与复盘",text:reflection,icon:NotebookPen,empty:"复盘尚未发布。完成讨论后，会记录修改依据、未解决问题和验证办法。"}];
return <Tabs defaultValue="design" className="notes-tabs"><TabsList variant="line" aria-label="训练记录阶段">{items.map(item=><TabsTrigger key={item.key} value={item.key}><item.icon/>{item.title}</TabsTrigger>)}</TabsList>{items.map(item=><TabsContent key={item.key} value={item.key}>{item.text?<div className="prose-note">{item.text.split("\n\n").map((p,i)=><p key={i}>{p}</p>)}</div>:<div className="empty-note"><item.icon size={30}/><p>{item.empty}</p></div>}</TabsContent>)}</Tabs>;
}
