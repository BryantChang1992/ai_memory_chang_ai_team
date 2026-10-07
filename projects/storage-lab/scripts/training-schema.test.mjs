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
function pack(rounds) { const value={schemaVersion:2,updatedAt:'2026-10-07',summary:summaryForRounds(rounds),rounds};return {...value,publicationId:publicationIdFor(value)}; }
test('published v2 snapshot is allowlisted with one guided estimated demo', () => {
  assert.equal(validatePublic(snapshot),true);assert.equal(snapshot.schemaVersion,2);
  assert.deepEqual(snapshot.summary,{completedDemos:1,confirmedMinutes:null,estimatedMinutes:110,unknownTimeRounds:0,currentStage:'completed',assessments:{scale:'unassessed',consistency:'unassessed',performance:'unassessed'}});
  assert.deepEqual(snapshot.rounds[0],{id:'round-001',date:'2026-10-07',track:'stream',stage:'completed',mode:'guided',time:{minutes:110,provenance:'conversation_span'},assessments:{scale:'unassessed',consistency:'unassessed',performance:'unassessed'}});
});
test('strict allowlist rejects freeform, scores and private fields at every object level', () => {
  const paths=[[],['summary'],['summary','assessments'],['rounds',0],['rounds',0,'time'],['rounds',0,'assessments']];
  for(const path of paths) for(const key of ['question','answer','review','source_ref','privateUrl','evidence','roundId','score','evaluation','extra']) {
    const value=clone(snapshot);let target=value;for(const segment of path)target=target[segment];target[key]=CANARY;
    assert.throws(()=>validatePublic(value),error=>error.message==='PUBLIC_SCHEMA_INVALID');
    assert.throws(()=>publicationIdFor(fields(value)),error=>error.message==='PUBLIC_SCHEMA_INVALID');
  }
});
test('missing keys, symbols, nonenumerable fields, getters and altered prototypes are rejected',()=>{
  const paths=[[],['summary'],['summary','assessments'],['rounds',0],['rounds',0,'time'],['rounds',0,'assessments']];
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
  for(const track of PUBLIC_TRACKS) assert.equal(validatePublic(pack([round({track})])),true);
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
  const pages=['index.html',...snapshot.rounds.map(round=>`rounds/${round.id}/index.html`),...Array.from({length:12},(_,i)=>`sessions/${String(i+1).padStart(2,'0')}/index.html`)];
  try {
    for(const page of pages){const file=path.join(dir,page);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,`<p>${snapshot.publicationId} 未评估</p>`);}
    assert.equal(run().status,0);
    await fs.writeFile(path.join(dir,'canary.js'),CANARY);const leaked=run();assert.equal(leaked.status,1);assert.equal(leaked.stderr,'PUBLIC_OUTPUT_BOUNDARY_FAILED\n');assert.equal((leaked.stdout+leaked.stderr).includes(CANARY),false);
    await fs.unlink(path.join(dir,'canary.js'));await fs.unlink(path.join(dir,`rounds/${snapshot.rounds[0].id}/index.html`));assert.equal(run().stderr,'PUBLIC_OUTPUT_ROUTE_MISSING\n');
    await fs.writeFile(path.join(dir,`rounds/${snapshot.rounds[0].id}/index.html`),'<p>stale-publication 未评估</p>');assert.equal(run().stderr,'PUBLIC_OUTPUT_VERSION_FAILED\n');
  } finally {await fs.rm(dir,{recursive:true,force:true});}
});
