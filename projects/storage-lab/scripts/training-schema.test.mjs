import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, promises as fs } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { validatePublic, publicationIdFor, summaryForRounds, PUBLIC_STAGES, PUBLIC_TRACKS, PUBLIC_MODES } from './public-schema.mjs';
const snapshot = JSON.parse(readFileSync(new URL('../content/training.json', import.meta.url), 'utf8'));
const CANARY = 'SYNTHETIC_PRIVATE_CANARY';
const clone = value => JSON.parse(JSON.stringify(value));
const fields = value => { const { publicationId, ...rest } = value; void publicationId; return rest; };
function round(overrides={}) { return {...clone(snapshot.rounds[0]),...overrides}; }
function pack(rounds) {
  const independent = rounds.filter(round => round.mode === 'independent' && round.stage !== 'awaiting_initial');
  const firstPass = independent.findIndex(round => round.stage === 'completed');
  const projects = rounds.length ? [{...clone(snapshot.projects[0]),
    status: firstPass >= 0 ? 'passed' : rounds.some(round => round.stage !== 'awaiting_initial') ? 'practicing' : 'not_started',
    roundIds: rounds.map(round => round.id).sort(), guidedDemoCompleted: rounds.some(round => round.mode === 'guided' && round.stage === 'completed'),
    independentAssessment: {attempts:independent.length,passedOnAttempt:firstPass >= 0 ? firstPass+1 : null},
  }] : [];
  const value={schemaVersion:3,updatedAt:'2026-10-07',summary:summaryForRounds(rounds),rounds,projects};return {...value,publicationId:publicationIdFor(value)};
}
test('published v3 snapshot is allowlisted with one guided estimated demo', () => {
  assert.equal(validatePublic(snapshot),true);assert.equal(snapshot.schemaVersion,3);
  assert.deepEqual(snapshot.summary,{completedDemos:1,confirmedMinutes:null,estimatedMinutes:110,unknownTimeRounds:0,currentStage:'completed',assessments:{scale:'unassessed',consistency:'unassessed',performance:'unassessed'}});
  assert.deepEqual(snapshot.rounds[0],{id:'round-001',date:'2026-10-07',track:'stream',stage:'completed',mode:'guided',time:{minutes:110,provenance:'conversation_span'},assessments:{scale:'unassessed',consistency:'unassessed',performance:'unassessed'}});
});
test('strict allowlist rejects freeform, scores and private fields at every object level', () => {
  const paths=[[],['summary'],['summary','assessments'],['rounds',0],['rounds',0,'time'],['rounds',0,'assessments'],['projects',0],['projects',0,'practice'],['projects',0,'independentAssessment'],['projects',0,'feedback']];
  for(const path of paths) for(const key of ['question','answer','review','source_ref','privateUrl','evidence','roundId','score','evaluation','extra']) {
    const value=clone(snapshot);let target=value;for(const segment of path)target=target[segment];target[key]=CANARY;
    assert.throws(()=>validatePublic(value),error=>error.message==='PUBLIC_SCHEMA_INVALID');
    assert.throws(()=>publicationIdFor(fields(value)),error=>error.message==='PUBLIC_SCHEMA_INVALID');
  }
});
test('missing keys, symbols, nonenumerable fields, getters and altered prototypes are rejected',()=>{
  const paths=[[],['summary'],['summary','assessments'],['rounds',0],['rounds',0,'time'],['rounds',0,'assessments'],['projects',0],['projects',0,'practice'],['projects',0,'independentAssessment'],['projects',0,'feedback']];
  for(const path of paths){
    const at=value=>path.reduce((target,key)=>target[key],value);const template=at(snapshot);
    for(const key of Object.keys(template)){const value=clone(snapshot);delete at(value)[key];assert.throws(()=>validatePublic(value),/PUBLIC_SCHEMA_INVALID/);}
    for(const alter of [target=>Object.defineProperty(target,'hidden',{value:CANARY}),target=>target[Symbol('private')]=CANARY,target=>Object.setPrototypeOf(target,{privateUrl:CANARY}),target=>Object.defineProperty(target,Object.keys(target)[0],{get(){throw new Error(CANARY);},enumerable:true})]){
      const value=clone(snapshot);alter(at(value));assert.throws(()=>validatePublic(value),error=>error.message==='PUBLIC_SCHEMA_INVALID');
    }
  }
  for(const alter of [rounds=>rounds.extra=CANARY,rounds=>delete rounds[0],rounds=>Object.defineProperty(rounds,'0',{get(){throw new Error(CANARY);},enumerable:true}),rounds=>rounds.push(...Array(1000).fill(round()))]){const value=clone(snapshot);alter(value.rounds);assert.throws(()=>validatePublic(value),error=>error.message==='PUBLIC_SCHEMA_INVALID');}
});
test('time categories derive separately with null for absent category and real zero retained',()=>{
  const unknown=round({id:'round-003',time:{minutes:null,provenance:'unknown'}});
  const confirmed=round({id:'round-002',time:{minutes:0,provenance:'user_confirmed'}});
  const mixed=pack([round(),confirmed,unknown]);assert.equal(validatePublic(mixed),true);
  assert.equal(mixed.summary.confirmedMinutes,0);assert.equal(mixed.summary.estimatedMinutes,110);assert.equal(mixed.summary.unknownTimeRounds,1);assert.equal(mixed.summary.completedDemos,3);
  const onlyConfirmed=pack([confirmed]);assert.equal(onlyConfirmed.summary.estimatedMinutes,null);
  const onlyUnknown=pack([unknown]);assert.equal(onlyUnknown.summary.confirmedMinutes,null);assert.equal(onlyUnknown.summary.estimatedMinutes,null);
  const empty=pack([]);assert.equal(empty.summary.currentStage,'awaiting_initial');assert.equal(empty.summary.unknownTimeRounds,0);assert.equal(validatePublic(empty),true);
});
test('invalid time provenance, null mismatches, decimals, negatives and unbounded totals fail',()=>{
  for(const time of [{minutes:null,provenance:'conversation_span'},{minutes:null,provenance:'user_confirmed'},{minutes:0,provenance:'unknown'},{minutes:110,provenance:'focused'},{minutes:-1,provenance:'conversation_span'},{minutes:1.5,provenance:'user_confirmed'},{minutes:525601,provenance:'conversation_span'},{minutes:Infinity,provenance:'user_confirmed'},{minutes:'110',provenance:'conversation_span'}])assert.throws(()=>pack([round({time})]),/PUBLIC_SCHEMA_INVALID/);
});
test('public identifiers are unique and rounds are chronologically ordered',()=>{
  for(const id of ['round-000','round-1','round-1000','training-record-001','https://private.invalid'])assert.throws(()=>pack([round({id})]),/PUBLIC_SCHEMA_INVALID/);
  assert.throws(()=>pack([round(),round()]),/PUBLIC_SCHEMA_INVALID/);
  assert.throws(()=>pack([round({id:'round-002'}),round()]),/PUBLIC_SCHEMA_INVALID/);
  assert.throws(()=>pack([round(),round({id:'round-002',date:'2026-10-06'})]),/PUBLIC_SCHEMA_INVALID/);
  const sorted=pack([round({date:'2026-10-06'}),round({id:'round-002',stage:'initial_submitted'})]);assert.equal(sorted.summary.currentStage,'initial_submitted');
});
test('all closed enums validate and malformed dates or stages cannot publish',()=>{
  for(const stage of PUBLIC_STAGES) assert.equal(validatePublic(pack([round({stage,time:{minutes:null,provenance:'unknown'}})])),true);
  for(const track of PUBLIC_TRACKS) assert.equal(summaryForRounds([round({track})]).completedDemos,1);
  for(const mode of PUBLIC_MODES) assert.equal(validatePublic(pack([round({mode})])),true);
  for(const value of [{stage:'mastered'},{track:'private_track'},{mode:'self-taught'},{date:'2026-02-30'},{date:'2026-10-08'},{date:'not-a-date'}])assert.throws(()=>pack([round(value)]),/PUBLIC_SCHEMA_INVALID/);
  const bad=fields(snapshot);bad.updatedAt='2026-02-30';assert.throws(()=>publicationIdFor(bad),/PUBLIC_SCHEMA_INVALID/);
});
test('assessment summary is conservative and never turns status into numeric scores',()=>{
  const assessed={scale:'assessed',consistency:'assessed',performance:'assessed'};
  const all=pack([round({assessments:assessed})]);assert.deepEqual(all.summary.assessments,assessed);
  const mixed=pack([round(),round({id:'round-002',assessments:assessed})]);assert.deepEqual(mixed.summary.assessments,{scale:'pending',consistency:'pending',performance:'pending'});
  for(const value of [0,10,null,'mastered',{},CANARY])assert.throws(()=>pack([round({assessments:{scale:value,consistency:'unassessed',performance:'unassessed'}})]),/PUBLIC_SCHEMA_INVALID/);
});
test('summary inconsistencies fail even when recomputing the publication identifier',()=>{
  for(const [key,value] of Object.entries({completedDemos:2,confirmedMinutes:0,estimatedMinutes:220,unknownTimeRounds:1,currentStage:'reviewed',assessments:{scale:'assessed',consistency:'unassessed',performance:'unassessed'}})){
    const bad=clone(snapshot);bad.summary[key]=value;assert.throws(()=>publicationIdFor(fields(bad)),/PUBLIC_SCHEMA_INVALID/);assert.throws(()=>validatePublic(bad),/PUBLIC_SCHEMA_INVALID/);
  }
});
test('hash is deterministic across key order, bound to public values and rejects old schemas',()=>{
  const reversed=value=>Array.isArray(value)?value.map(reversed):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reversed(v)])):value;
  assert.equal(validatePublic(reversed(snapshot)),true);assert.equal(publicationIdFor(fields(reversed(snapshot))),snapshot.publicationId);
  const changed=pack([round({time:{minutes:111,provenance:'conversation_span'}})]);assert.notEqual(changed.publicationId,snapshot.publicationId);
  for(const change of [{publicationId:'pub-deadbeefdeadbeef'},{schemaVersion:1},{publicationId:'pub-ABCDEF1234567890'}])assert.throws(()=>validatePublic({...snapshot,...change}),/PUBLIC_SCHEMA_INVALID/);
  assert.equal(JSON.stringify(snapshot).includes(CANARY),false);
});


test('artifact checker verifies new routes, legacy aliases and synthetic canary rejection without logging input', async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'public-statistics-test-'));
  const script=new URL('./check-public-output.mjs',import.meta.url);
  const run=()=>spawnSync(process.execPath,[script.pathname,dir],{encoding:'utf8'});
  const pages=['index.html',...snapshot.projects.map(project=>`projects/${project.id}/index.html`),...snapshot.rounds.map(round=>`rounds/${round.id}/index.html`),...Array.from({length:12},(_,i)=>`sessions/${String(i+1).padStart(2,'0')}/index.html`)];
  try {
    for(const page of pages){const file=path.join(dir,page);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,`<p>${snapshot.publicationId} 未评估</p>`);}
    await fs.writeFile(path.join(dir,'counter.json'),JSON.stringify({practice:{submissions:0,revisions:0}}));
    assert.equal(run().status,0);
    for(const revisions of [[{text:'private answer'}],{answer:'private answer'},'private answer',null,true]){
      await fs.writeFile(path.join(dir,'rejected.json'),JSON.stringify({revisions}));
      assert.equal(run().stderr,'PUBLIC_OUTPUT_BOUNDARY_FAILED\n');
    }
    await fs.unlink(path.join(dir,'rejected.json'));
    await fs.writeFile(path.join(dir,'canary.js'),CANARY);const leaked=run();assert.equal(leaked.status,1);assert.equal(leaked.stderr,'PUBLIC_OUTPUT_BOUNDARY_FAILED\n');assert.equal((leaked.stdout+leaked.stderr).includes(CANARY),false);
    await fs.unlink(path.join(dir,'canary.js'));await fs.unlink(path.join(dir,`rounds/${snapshot.rounds[0].id}/index.html`));assert.equal(run().stderr,'PUBLIC_OUTPUT_ROUTE_MISSING\n');
    await fs.writeFile(path.join(dir,`rounds/${snapshot.rounds[0].id}/index.html`),'<p>stale-publication 未评估</p>');assert.equal(run().stderr,'PUBLIC_OUTPUT_VERSION_FAILED\n');
  } finally {await fs.rm(dir,{recursive:true,force:true});}
});

test('current project is practicing with guided history and zero formal work', () => {
  assert.deepEqual(snapshot.projects,[{id:'project-001',titleKey:'append_log_design',track:'stream',status:'practicing',roundIds:['round-001'],guidedDemoCompleted:true,practice:{submissions:0,revisions:0},independentAssessment:{attempts:0,passedOnAttempt:null},feedback:{strengths:['contract_boundary_awareness'],resolvedIssues:['layer_distinction_clarified'],openIssues:['independent_reconstruction_unverified','boundary_reasoning_needs_verification'],recommendations:['requirements_first','structured_revision','independent_full_submission']}}]);
});
test('every round maps to exactly one real project and guided completion is derived', () => {
  for(const mutate of [
    value=>value.projects=[],value=>value.projects[0].roundIds=[],value=>value.projects[0].roundIds.push('round-999'),
    value=>value.projects[0].roundIds.push('round-001'),value=>value.projects.push({...clone(value.projects[0]),id:'project-002'}),
    value=>value.projects[0].guidedDemoCompleted=false,value=>value.projects[0].track='kv',
    value=>value.projects[0].titleKey='https://private.invalid',value=>value.projects[0].id='STREAM-001',
  ]) {const value=clone(snapshot);mutate(value);assert.throws(()=>publicationIdFor(fields(value)),/PUBLIC_SCHEMA_INVALID/);}
});
test('forged passes, positive exam counts without independent evidence and contradictory states are rejected', () => {
  for(const mutate of [
    p=>p.status='passed',p=>p.status='not_started',p=>p.status='awaiting_independent_assessment',
    p=>p.independentAssessment={attempts:0,passedOnAttempt:1},p=>p.independentAssessment={attempts:1,passedOnAttempt:1},
    p=>{p.status='passed';p.independentAssessment={attempts:1,passedOnAttempt:1};},
    p=>p.independentAssessment.attempts=1,p=>p.practice.revisions=1,
    p=>p.practice.submissions=-1,p=>p.practice.submissions=1.5,p=>p.practice.submissions=10001,
    p=>p.independentAssessment.attempts=Infinity,
  ]) {const value=clone(snapshot);mutate(value.projects[0]);assert.throws(()=>publicationIdFor(fields(value)),/PUBLIC_SCHEMA_INVALID/);}
  const begun=pack([round({mode:'independent',stage:'initial_submitted'})]);assert.equal(begun.projects[0].independentAssessment.attempts,1);
  const passed=pack([round({mode:'independent'})]);assert.equal(passed.projects[0].status,'passed');
  for(const attempt of [0,2,1.5,'1',-1]){const bad=clone(passed);bad.projects[0].independentAssessment.passedOnAttempt=attempt;assert.throws(()=>publicationIdFor(fields(bad)),/PUBLIC_SCHEMA_INVALID/);}
  const unsubmitted=pack([round({mode:'independent',stage:'awaiting_initial',time:{minutes:null,provenance:'unknown'}})]);
  unsubmitted.projects[0].independentAssessment.attempts=1;assert.throws(()=>publicationIdFor(fields(unsubmitted)),/PUBLIC_SCHEMA_INVALID/);
});
test('feedback is category-specific, enum-only, canonical, unique and accessor-safe', () => {
  for(const category of ['strengths','resolvedIssues','openIssues','recommendations']) {
    for(const codes of [[CANARY],[{code:'contract_boundary_awareness'}],['requirements_first','requirements_first'],['requirements_first']]) {
      if(category==='recommendations'&&codes.length===1&&codes[0]==='requirements_first')continue;
      const value=clone(snapshot);value.projects[0].feedback[category]=codes;assert.throws(()=>publicationIdFor(fields(value)),/PUBLIC_SCHEMA_INVALID/);
    }
  }
  const reversed=clone(snapshot);reversed.projects[0].feedback.openIssues.reverse();assert.throws(()=>publicationIdFor(fields(reversed)),/PUBLIC_SCHEMA_INVALID/);
  for(const arrayPath of [['projects'],['projects',0,'roundIds'],...['strengths','resolvedIssues','openIssues','recommendations'].map(key=>['projects',0,'feedback',key])]) {
    const at=value=>arrayPath.reduce((target,key)=>target[key],value);
    for(const alter of [target=>target.extra=CANARY,target=>target[Symbol('secret')]=CANARY,target=>delete target[0],target=>Object.setPrototypeOf(target,{}),target=>Object.defineProperty(target,'0',{get(){throw new Error(CANARY);},enumerable:true})]) {
      const value=clone(snapshot);alter(at(value));assert.throws(()=>validatePublic(value),error=>error.message==='PUBLIC_SCHEMA_INVALID');
    }
  }
});
test('publication hash covers reviewed project enums but no arbitrary narrative extension can enter it',()=>{
  const value=clone(snapshot);value.projects[0].feedback.recommendations=[];
  assert.notEqual(publicationIdFor(fields(value)),snapshot.publicationId);
  const legacy=fields(snapshot);legacy.schemaVersion=2;delete legacy.projects;assert.throws(()=>publicationIdFor(legacy),/PUBLIC_SCHEMA_INVALID/);
});
