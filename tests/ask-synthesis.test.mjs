import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {groundAnswer,verifyVerdict,SynthesisValidationError} from '../src/features/ask-ladimus/grounding.ts';
import {prepareEvidence} from '../src/features/ask-ladimus/evidence-packet.ts';
import {answerQuery} from '../src/features/ask-ladimus/service.ts';
import {options,chunks,hints,skills,guards,guarded,output,verdict,analyticalOutput,acceptanceQuestions} from './ask-fixtures.mjs';
const packet=q=>prepareEvidence(q,chunks,hints.intents,skills,guards,guarded).packet;
const azure=packet('Azure experience');
const make=(text,ids=['system-azure-environments--1'],kind='direct',p=azure)=>({...output(p),answer:[{text,kind,evidence_ids:ids}]});
const require=createRequire(import.meta.url),compiled={exports:{}};
new Function('require','module','exports',ts.transpileModule(readFileSync('src/features/ask-ladimus/answer-passages.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText)(require,compiled,compiled.exports);

test('new prose, interpretation and model-selected structure are accepted without passage equality',()=>{
 for(const text of ['Release validation and rollback connect deployment to recovery, so the Azure work demonstrates operational responsibility beyond publishing an image.','Development/production separation and traffic control are complementary parts of Azure environment ownership.']) {
  const result=groundAnswer(make(text,undefined,'synthesis'),azure);assert.equal(result.claims.length,1);assert.ok(!azure.items.some(i=>i.facts.includes(text)));
 }
 for(const style of ['paragraphs','list']) assert.equal(groundAnswer({...output(azure),style},azure).style,style);
});
test('schema and output bounds fail closed',()=>{
 const good=output(azure);
 for(const bad of [null,{},[],{...good,reasoning:'hidden'},{...good,style:'markdown'},{...good,answer:[]},{...good,answer:Array(6).fill(good.answer[0])},{...good,answer:[{...good.answer[0],extra:'unchecked'}]},make('x'.repeat(1801)),{...good,follow_ups:[]},{...good,follow_ups:['Invented question']}]) assert.throws(()=>groundAnswer(bad,azure),SynthesisValidationError);
});
test('citations must be unique members of the actual retrieved set',()=>{
 const outside=chunks.find(c=>!azure.items.some(i=>i.id===c.id)).id;
 for(const ids of [[],['invented'],[outside],['system-azure-environments--1','system-azure-environments--1'],[null]]) assert.throws(()=>groundAnswer(make('Azure environment ownership.',ids),azure));
});
test('critical claims cannot be authorized by valid IDs or positive verifier verdicts',async()=>{
 for(const text of ['Luis has 4 years of Azure experience.','Luis was a Senior Platform Engineer.','Luis was a Cloud Engineer.','Luis deployed Kubernetes professionally.','Luis uses Terraform and Pulumi.','Luis uses NebulaOps.','Luis saved $2 million.','Luis managed 99.99% availability.','Luis owned the environments in January 2026.','Luis achieved audited financial savings.','Luis has no Kubernetes evidence but has professional AWS experience.','Kubernetes is not documented. Luis has Kubernetes experience.']) {
  assert.throws(()=>groundAnswer(make(text),azure),text);
  const r=await answerQuery('Azure',options({generate:async()=>make(text),verify:verdict}));assert.equal(r.outcome,'unavailable',text);assert.equal(r.claims.length,0);
 }
});
test('numbers, dates and titles require the cited source, not merely some retrieved source',()=>{
 const p=packet('What measurable production impact did his automation have?');
 assert.ok(p.items.some(i=>i.id==='system-genie-swopsbot--3'));
 const metric=make('The documented reboot success rate was 99.52%.',['system-genie-swopsbot--3'],'direct',p);assert.equal(groundAnswer(metric,p).claims.length,1);
 assert.throws(()=>groundAnswer({...metric,answer:[{...metric.answer[0],evidence_ids:[p.items.find(i=>i.id!=='system-genie-swopsbot--3').id]}]},p));
 const role=packet(acceptanceQuestions[2]);assert.equal(groundAnswer(make('His official title was DevOps Engineer.',['employment-romtech-devops-2026--1'],'direct',role),role).claims.length,1);
 assert.throws(()=>groundAnswer(make('His official title was DevOps Engineer.',['system-azure-environments--1'],'direct',role),role));
 assert.equal(groundAnswer(make('His DevOps Engineer role started in March 2026.',['employment-romtech-devops-2026--1'],'direct',role),role).claims.length,1);
});
test('prototype and designed work cannot become production or implementation',()=>{
 for(const [q,id,text] of [['ROMGuide','system-romguide--1','Luis deployed ROMGuide as a production service.'],['agentic operating model','system-agentic-operating-model--1','Luis deployed the agentic operating model.']]) {
  const c=chunks.find(c=>c.id===id),p={...azure,question:q,items:[{...c,maturity:c.status}],direct_skills:[],transferable_skills:[]};assert.throws(()=>groundAnswer(make(text,[id],'direct',p),p));
 }
});
test('general technical knowledge is allowed without becoming undocumented career experience',()=>{
 assert.equal(groundAnswer(make('Pulumi stacks organize infrastructure resources and state.',[],'general_technology'),azure).claims.length,1);
 for(const ids of [[],['system-azure-environments--1']]) assert.throws(()=>groundAnswer(make('Luis manages Pulumi stacks.',ids,'general_technology'),azure));
});
test('known professional skill evidence cannot be denied as insufficient',()=>{
 const p=packet(acceptanceQuestions[1]);assert.throws(()=>groundAnswer(make('There is no professional GitHub Actions experience documented.',['system-ai-code-gating--3'],'limitation',p),p));
});
test('semantic verifier must cover every unit once, preserve citations and never rewrite',async()=>{
 const claims=groundAnswer(output(azure),azure).claims,good=await verdict(azure,claims);verifyVerdict(good,claims);
 for(const bad of [null,{}, {claims:[]},{...good,answer:'rewritten'}, {claims:[{...good.claims[0],supported:false}]},{claims:[{...good.claims[0],text:'rewrite'}]},{claims:[{...good.claims[0],index:1}]},{claims:[{...good.claims[0],evidence_ids:[]}]},{claims:[{...good.claims[0],evidence_ids:['invented']}]},{claims:[{...good.claims[0],supported:'true'}]}]) assert.throws(()=>verifyVerdict(bad,claims));
 const two=[...claims,{...claims[0],text:'Second statement'}];assert.throws(()=>verifyVerdict({claims:[good.claims[0],good.claims[0]]},two));
});
test('semantic rejection gets only one correction and no unverified answer escapes',async()=>{
 let generations=0,verifications=0;const corrections=[],events=[],logs=[];
 const r=await answerQuery('Azure',options({generate:async(p,s,c)=>{generations++;corrections.push(c);return output(p);},verify:async(p,c)=>{verifications++;return {claims:c.map((x,index)=>({index,supported:false,evidence_ids:x.evidence_ids}))};},emit:e=>events.push(e.type),telemetry:{record:e=>logs.push(e)}}));
 assert.equal(generations,2);assert.equal(verifications,2);assert.equal(corrections[0],undefined);assert.equal(corrections[1],'unsupported_semantics');assert.equal(r.outcome,'unavailable');assert.deepEqual(r.claims,[]);assert.ok(r.evidence.length);assert.equal(events.filter(e=>e==='verification:start').length,2);assert.equal(logs.filter(e=>e.stage==='verification_failed').length,2);
});
test('one corrective synthesis can pass but still requires a fresh verifier verdict',async()=>{
 let calls=0;const r=await answerQuery('Azure',options({verify:async(p,c)=>++calls===1?{claims:c.map((x,index)=>({index,supported:false,evidence_ids:x.evidence_ids}))}:verdict(p,c)}));assert.equal(calls,2);assert.equal(r.outcome,'answered');
});
test('deterministic rejection corrects once before any verifier is invoked',async()=>{
 let gens=0,vs=0;const r=await answerQuery('Azure',options({generate:async p=>++gens===1?make('Luis has Kubernetes experience.'):output(p),verify:async(p,c)=>{vs++;return verdict(p,c);}}));assert.equal(gens,2);assert.equal(vs,1);assert.equal(r.outcome,'answered');
});
test('verification errors and stalls fail closed within the shared deadline',async()=>{
 for(const verify of [async()=>{throw Error('private verifier payload');},()=>new Promise(()=>{})]){
  let calls=0;const begin=performance.now(),r=await answerQuery('Azure',options({timeoutMs:15,verify,generate:async p=>{calls++;return output(p);}}));assert.equal(r.outcome,'unavailable');assert.equal(calls,1);assert.ok(performance.now()-begin<500);assert.ok(!JSON.stringify(r).includes('private verifier payload'));
 }
});
test('cancellation settles even a provider which ignores abort',async()=>{
 const controller=new AbortController();let seen;
 const pending=answerQuery('Azure',options({signal:controller.signal,generate:async(_p,s)=>{seen=s;return new Promise(()=>{});}}));controller.abort();const r=await pending;assert.equal(r.outcome,'unavailable');assert.ok(seen.aborted);
});
test('rendered paragraphs/lists preserve inspectable per-unit citations',()=>{
 for(const style of ['paragraphs','list']) {
  const r={...groundAnswer(analyticalOutput(packet(acceptanceQuestions[3])),packet(acceptanceQuestions[3])),evidence:packet(acceptanceQuestions[3]).items};
  const html=renderToStaticMarkup(React.createElement(compiled.exports.AnswerPassages,{claims:r.claims,style,evidence:r.evidence,id:'answer'}));assert.match(html,/Evidence [1-5] for passage 1/);assert.equal(html.includes('<ul>'),style==='list');
 }
});

test('guard terms inside negative source qualifiers never authorize positive adoption or ROI',()=>{
 const p=packet('PR Assistant');
 for(const text of ['PR Assistant achieved company-wide adoption.','PR Assistant delivered ROI.']) assert.throws(()=>groundAnswer(make(text,['system-pr-assistant--1'],'direct',p),p));
});

test('a pre-aborted request invokes no provider and has no unhandled rejection',async()=>{
 const controller=new AbortController();controller.abort();let calls=0;
 const r=await answerQuery('Azure',options({signal:controller.signal,generate:async()=>{calls++;}}));assert.equal(calls,0);assert.equal(r.outcome,'unavailable');await new Promise(resolve=>setImmediate(resolve));
});
