import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const {sessions,schedule}=JSON.parse(readFileSync(new URL("../content/training.json",import.meta.url),"utf8"));
assert.equal(sessions.length,12);
let previous=null;
for(const [i,s] of sessions.entries()){
 assert.equal(s.id,i+1);assert(s.title&&s.summary&&s.outcome);assert.equal(s.focus.length,3);
 assert(["planned","drafting","review","completed"].includes(s.status));
 const day=new Date(s.date+"T21:00:00+08:00");assert(Number.isFinite(day.getTime()));assert.equal(new Date(s.date+"T00:00:00Z").getUTCDay(),0);
 if(previous)assert.equal(day.getTime()-previous,14*86400000);previous=day.getTime();
 for(const key of ["design","review","reflection"])assert.equal(typeof s[key],"string");
 for(const score of Object.values(s.scores))assert(score===null||(Number.isInteger(score)&&score>=0&&score<=3));
 if(s.status==="completed"){assert(s.reflection.trim(),"Completed sessions need a real reflection");assert(s.updatedAt,"Completed sessions need an update date");}
 for(const ref of s.references)assert.equal(new URL(ref.url).protocol,"https:");
}
assert.equal(schedule.intervalDays,14);assert.equal(schedule.time,"21:00");assert.equal(schedule.timezone,"Asia/Shanghai");
console.log("Validated 12 sessions, biweekly schedule, progress states and record structure.");
