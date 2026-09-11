import data from "@/content/training.json";
export const schedule = data.schedule;
export const sessions = data.sessions;
export type TrainingSession = (typeof sessions)[number];
export const statusLabels: Record<string,string> = {planned:"未开始",drafting:"设计中",review:"评审中",completed:"已完成"};
export const completed = sessions.filter(s => s.status === "completed");
export const currentSession = sessions.find(s => s.status === "drafting" || s.status === "review") ?? sessions.find(s => s.status !== "completed") ?? sessions[sessions.length - 1];
export function sessionPath(id:number){return "/sessions/"+String(id).padStart(2,"0")+"/";}
export function displayDate(value:string){return value.replaceAll("-",".");}
