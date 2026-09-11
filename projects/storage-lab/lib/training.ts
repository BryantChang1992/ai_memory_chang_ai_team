import data from "@/content/training.json";
import type { Dimension, ReviewQuestion, Revision } from "@/lib/training-workflow";
export const schedule = data.schedule;
export type TrainingSession = Omit<(typeof data.sessions)[number], "reviewQuestions" | "revisions" | "scoreEvidence"> & {
  reviewQuestions: ReviewQuestion[];
  revisions: Revision[];
  scoreEvidence: Record<Dimension, string>;
};
// validate-content checks the public JSON, including these literal unions, before export.
export const sessions = data.sessions as TrainingSession[];
export const statusLabels: Record<string,string> = {planned:"未开始",drafting:"设计中",review:"评审中",revising:"修订中",completed:"已完成"};
export const completed = sessions.filter(s => s.status === "completed");
export const currentSession = sessions.find(s => ["drafting", "review", "revising"].includes(s.status)) ?? sessions.find(s => s.status !== "completed") ?? sessions[sessions.length - 1];
export function sessionPath(id:number){return "/sessions/"+String(id).padStart(2,"0")+"/";}
export function displayDate(value:string){return value.replaceAll("-",".");}
