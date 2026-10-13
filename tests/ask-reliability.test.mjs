import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerQuery} from '../src/features/ask-ladimus/service.ts';
import {askBudget} from '../src/features/ask-ladimus/budget.ts';
import {AskProviderError} from '../src/features/ask-ladimus/provider-error.ts';
import {prepareEvidence} from '../src/features/ask-ladimus/evidence-packet.ts';
import {retrieveEvidence} from '../src/features/ask-ladimus/retrieval.ts';
import {groundAnswer,verifyVerdict} from '../src/features/ask-ladimus/grounding.ts';
import {recordAskTelemetry} from '../src/features/ask-ladimus/telemetry.ts';
import {options,chunks,hints,skills,guards,guarded,output,verdict,acceptanceQuestions} from './ask-fixtures.mjs';

export const reliabilityQuestions=[
 'Would you trust Luis to design an AI system that can modify production code autonomously? Explain your answer using his documented work, and be precise about what level of autonomy his experience actually supports.',
 'A company is considering Luis for an AI platform engineer role. Based only on documented evidence, where does his experience strongly align with that role, and where would you expect him to need additional ramp-up?',
 'Compare Luis’s PR Assistant, Android Test Agent, and Ladimus Review. What engineering philosophy appears consistently across all three, and what evidence supports that conclusion?',
];
const packet=q=>prepareEvidence(q,chunks,hints.intents,skills,guards,guarded).packet;
const author=(p,text,kind='assessment',ids=p.items.map(i=>i.id))=>({...output(p),answer:[{text,kind,evidence_ids:ids}]});
const logsOptions=overrides=>{const logs=[];return {logs,config:options({...overrides,telemetry:{record:e=>logs.push(e)}})};};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

test('production stage budgets retain route and client headroom and reserve the entire corrective pair',()=>{
 assert.ok(askBudget.generationMs+askBudget.verificationMs+askBudget.reserveMs<askBudget.totalMs);
 assert.ok(askBudget.correctionGenerationMs+askBudget.correctionVerificationMs+askBudget.reserveMs<askBudget.totalMs);
 assert.ok(askBudget.totalMs<askBudget.clientMs&&askBudget.clientMs<30000);
 assert.match(readFileSync('src/app/api/ask/route.ts','utf8'),/maxDuration = 30/);
 assert.match(readFileSync('src/features/ask-ladimus/ask-console.tsx','utf8'),/askBudget.clientMs/);
});

test('generation and verification time out independently and abort even stalled providers',async()=>{
 for(const stage of ['generation','verification']) {
  let seen,verifications=0;const {logs,config}=logsOptions({timeoutMs:200,stageBudget:{generationMs:25,verificationMs:25},
   generate:stage==='generation'?async(_p,s)=>{seen=s;return new Promise(()=>{});}:async p=>output(p),
   verify:async(p,c,s)=>{verifications++;seen=s;return stage==='verification'?new Promise(()=>{}):verdict(p,c);}});
  const start=performance.now(),result=await answerQuery(reliabilityQuestions[1],config);
  assert.equal(result.outcome,'unavailable');assert.equal(result.claims.length,0);assert.ok(seen.aborted);assert.ok(performance.now()-start<500);
  assert.equal(logs.at(-1).failure,`${stage}_timeout`);assert.equal(verifications,stage==='verification'?1:0);
 }
});

test('the exact recruiter query may use both explicit stage budgets and is not limited by one generation stage',async()=>{
 const {logs,config}=logsOptions({timeoutMs:300,stageBudget:{generationMs:100,verificationMs:100},
  generate:async p=>{await pause(35);return author(p,'The documented work supports alignment with AI engineering delivery and operational reliability; the role-specific scope still needs assessment.');},
  verify:async(p,c)=>{await pause(35);return verdict(p,c);}});
 const result=await answerQuery(reliabilityQuestions[1],config);assert.equal(result.outcome,'answered');assert.equal(result.claims[0].kind,'assessment');assert.equal(logs.at(-1).failure,undefined);
});

test('correction is skipped unless both corrective stages plus headroom fit',async()=>{
 let generations=0,verifications=0;const {logs,config}=logsOptions({timeoutMs:80,
  generate:async p=>{generations++;return output(p);},verify:async(_p,c)=>{verifications++;return {claims:c.map((x,index)=>({index,supported:false,evidence_ids:x.evidence_ids}))};}});
 const result=await answerQuery('Azure',config);assert.equal(result.outcome,'unavailable');assert.equal(generations,1);assert.equal(verifications,1);
 assert.ok(logs.some(e=>e.failure==='verification_rejected'));assert.equal(logs.at(-1).failure,'correction_skipped');
});

test('a reserved correction can succeed and a stalled correction aborts without a third attempt',async()=>{
 for(const stall of [false,true]) {
  let generations=0,verifications=0,seen;const {logs,config}=logsOptions({timeoutMs:300,stageBudget:{correctionGenerationMs:25,correctionVerificationMs:25,reserveMs:5},
   generate:async(p,s)=>{generations++;seen=s;return generations===2&&stall?new Promise(()=>{}):output(p);},
   verify:async(p,c)=>++verifications===1?{claims:c.map((x,index)=>({index,supported:false,evidence_ids:x.evidence_ids}))}:verdict(p,c)});
  const result=await answerQuery('Azure',config);assert.equal(generations,2);assert.ok(seen.aborted);assert.equal(verifications,stall?1:2);
  assert.equal(result.outcome,stall?'unavailable':'answered');assert.equal(logs.at(-1).failure,stall?'correction_timeout':undefined);
 }
});

test('disconnect cancels generation, verification and correction immediately',async()=>{
 for(const target of ['generation','verification','correction']) {
  const controller=new AbortController();let signal,generations=0;
  const stall=s=>{signal=s;queueMicrotask(()=>controller.abort());return new Promise(()=>{});};
  const {logs,config}=logsOptions({signal:controller.signal,
   generate:async(p,s)=>{generations++;return target==='generation'||target==='correction'&&generations===2?stall(s):output(p);},
   verify:async(p,c,s)=>target==='verification'?stall(s):target==='correction'&&generations===1?{claims:c.map((x,index)=>({index,supported:false,evidence_ids:x.evidence_ids}))}:verdict(p,c)});
  const result=await answerQuery('Azure',config);assert.equal(result.outcome,'unavailable');assert.ok(signal.aborted);assert.equal(logs.at(-1).failure,'request_cancelled');
 }
});

test('provider and incomplete-generation errors are finite categories without sensitive payloads',async()=>{
 for(const [overrides,expected] of [
  [{generate:async()=>{throw new AskProviderError('incomplete');}},'generation_incomplete'],
  [{generate:async()=>{throw Error('SECRET MODEL RESPONSE');}},'generation_provider_error'],
  [{verify:async()=>{throw Error('SECRET VERIFIER RESPONSE');}},'verification_provider_error'],
 ]) {
  const {logs,config}=logsOptions(overrides),result=await answerQuery('Azure',config);
  assert.equal(logs.at(-1).failure,expected);assert.ok(!JSON.stringify({logs,result}).includes('SECRET'));
 }
 const events=[];recordAskTelemetry({query:'Azure',intent:'career',evidenceIds:[],status:'provider_error',latencyMs:1,failure:'raw private response'},{record:e=>events.push(e)});assert.equal(events[0].failure,undefined);
});

test('exact comparison reserves each named system before depth, even with reordered names or crowded ranking',()=>{
 const expected=['system-pr-assistant','system-android-test-agent','project-ladimus-review'];
 for(const q of [reliabilityQuestions[2],'Compare Ladimus Review, Android Test Agent and PR Assistant; explain PR Assistant validation and PR Assistant immutable previews.']) {
  const selected=retrieveEvidence(q,chunks,hints.intents,skills),p=packet(q);
  assert.ok(selected.length<=5&&p.items.length<=5);
  for(const id of expected) {assert.ok(selected.some(c=>c.recordId===id));assert.ok(p.entities.some(e=>e.record_id===id));assert.ok(p.items.some(i=>i.id===`${id}--1`));}
  assert.equal(p.analysis_mode,'comparison');assert.equal(new Set(p.items.map(i=>i.id)).size,p.items.length);
 }
});

test('false Android packet-absence claims are rejected, including when their citations name a different system',async()=>{
 const p=packet(reliabilityQuestions[2]),ids=['system-pr-assistant--1'];
 for(const text of ['Android Test Agent is not in the supplied evidence.','Android Test Agent is not separately described in the supplied evidence.','There is no evidence for Android Test Agent.','The packet does not contain Android Test Agent.']) {
  assert.throws(()=>groundAnswer(author(p,text,'limitation',ids),p),e=>e.code==='packet_absence_contradiction');
 }
 const {logs,config}=logsOptions({generate:async p=>author(p,'Android Test Agent is not separately described in the supplied evidence.','limitation',ids)});
 const result=await answerQuery(reliabilityQuestions[2],config);assert.equal(result.outcome,'unavailable');assert.deepEqual(result.claims,[]);assert.ok(logs.some(e=>e.failure==='grounding_rejected'));
});

test('packet skill contradictions are rejected without blocking valid capability gaps or scope limitations',()=>{
 const p=packet(acceptanceQuestions[1]);assert.throws(()=>groundAnswer(author(p,'GitHub Actions is not in the supplied evidence.','limitation',['system-ai-code-gating--3']),p),e=>e.code==='packet_absence_contradiction');
 const gap=packet(acceptanceQuestions[0]);assert.equal(groundAnswer(author(gap,'Professional Pulumi experience is not established.','limitation',['system-azure-environments--1']),gap).claims.length,1);
 const comparison=packet(reliabilityQuestions[2]);assert.equal(groundAnswer(author(comparison,'The Android Test Agent evidence does not establish company-wide adoption.','limitation',['system-android-test-agent--1']),comparison).claims.length,1);
});

test('exact autonomy, recruiter and comparison queries use authored analysis and independent verification',async()=>{
 for(const [index,q] of reliabilityQuestions.entries()) {
  let generated=0,verified=0;
  const generate=async p=>{generated++;const ids=index===0?['system-pr-assistant--1','system-android-test-agent--1','system-ai-code-gating--1']:index===2?['system-pr-assistant--1','system-android-test-agent--1','project-ladimus-review--1']:p.items.map(i=>i.id);
   const text=index===0?'Approval and deterministic validation support confidence in designing bounded-autonomy code-modification workflows. Unrestricted autonomous modification of production code is not established.':index===2?'The shared emphasis on evidence, validation and bounded authority supports a consistent engineering philosophy, while each system retains its own maturity limits.':'The documented AI engineering and delivery work supports role alignment; ramp-up depends on the employer’s scope and competencies that remain unestablished in this record.';
   return author(p,text,index===2?'synthesis':'assessment',ids);};
  const result=await answerQuery(q,options({generate,verify:async(p,c)=>{verified++;return verdict(p,c);}}));
  assert.ok(['answered','partial'].includes(result.outcome));assert.equal(generated,1);assert.equal(verified,1);assert.ok(result.claims.length);assert.equal(result.claims[0].kind,index===2?'synthesis':'assessment');
 }
});

test('assessment kind neither grants autonomous deployment facts nor lets a verifier rewrite its kind',async()=>{
 const p=packet(reliabilityQuestions[0]),ids=['system-pr-assistant--1'];
 const accepted=groundAnswer(author(p,'The safeguards support confidence in bounded-autonomy workflow design.','assessment',ids),p);
 assert.ok(!p.items.some(i=>i.facts.includes(accepted.claims[0].text)));
 for(const text of ['Luis has deployed fully autonomous production-code agents.','Luis uses unrestricted autonomous agents to modify production code.','Luis has 4 years of production-agent experience.','Luis is a Senior Platform Engineer.','Luis uses Pulumi professionally.','Luis achieved ROI from company-wide deployment.']) assert.throws(()=>groundAnswer(author(p,text,'assessment',ids),p));
 const v=await verdict(p,accepted.claims);verifyVerdict(v,accepted.claims);assert.throws(()=>verifyVerdict({claims:v.claims.map(c=>({...c,kind:'direct'}))},accepted.claims));
});

test('a packet contradiction can be corrected only through fresh grounding and verification',async()=>{
 let generations=0,verifications=0,correction;
 const result=await answerQuery(reliabilityQuestions[2],options({
  generate:async(p,_s,c)=>{correction=c;generations++;return author(p,generations===1?'Android Test Agent is not separately described.':'The shared emphasis on validation supports an evidence-derived comparison, while maturity remains specific to each system.','synthesis',['system-pr-assistant--1','system-android-test-agent--1','project-ladimus-review--1']);},
  verify:async(p,c)=>{verifications++;return verdict(p,c);},
 }));
 assert.equal(generations,2);assert.equal(verifications,1);assert.equal(correction.code,'packet_absence_contradiction');assert.equal(result.outcome,'answered');assert.ok(!result.claims[0].text.includes('not separately described'));
});

test('corrective verification has its own hard stage timeout and total deadline remains authoritative',async()=>{
 let verifications=0,seen;
 const {logs,config}=logsOptions({timeoutMs:300,stageBudget:{correctionGenerationMs:25,correctionVerificationMs:25,reserveMs:5},verify:async(_p,c,s)=>{verifications++;seen=s;return verifications===1?{claims:c.map((x,index)=>({index,supported:false,evidence_ids:x.evidence_ids}))}:new Promise(()=>{});}});
 assert.equal((await answerQuery('Azure',config)).outcome,'unavailable');assert.equal(verifications,2);assert.ok(seen.aborted);assert.equal(logs.at(-1).failure,'correction_timeout');
 const total=logsOptions({timeoutMs:35,stageBudget:{generationMs:100,verificationMs:100},generate:async p=>{await pause(10);return output(p);},verify:(_p,_c,s)=>{seen=s;return new Promise(()=>{});}});
 const start=performance.now();assert.equal((await answerQuery('Azure',total.config)).outcome,'unavailable');assert.ok(performance.now()-start<500);assert.ok(seen.aborted);assert.equal(total.logs.at(-1).failure,'verification_timeout');
});

test('assessment of a target role is separate from claiming Luis held its title',()=>{
 const p=packet(reliabilityQuestions[1]);
 assert.equal(groundAnswer(author(p,'The documented delivery work supports alignment with an AI Platform Engineer role, subject to its specific requirements.'),p).claims.length,1);
 for(const text of ['Luis was an AI Platform Engineer.','Luis is a Senior Platform Engineer.','Luis became a Senior Platform Engineer role specialist.']) assert.throws(()=>groundAnswer(author(p,text),p));
});
