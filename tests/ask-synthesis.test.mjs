import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSynthesisPlan,editorialPassages} from '../src/features/ask-ladimus/synthesis.ts';
import {groundAnswer,SynthesisValidationError} from '../src/features/ask-ladimus/grounding.ts';
import {retrieveEvidence} from '../src/features/ask-ladimus/retrieval.ts';
import {answerQuery} from '../src/features/ask-ladimus/service.ts';

const read=n=>JSON.parse(readFileSync(`src/data/career/${n}.json`,'utf8'));
const chunks=read('chunks'), hints=read('retrieval-hints'), skills=Object.values(read('skills')).flat();
const retrieve=q=>retrieveEvidence(q,chunks,hints.intents,skills);
const output=p=>({answer:p.answer.slice(0,p.style==='list'?5:3),follow_ups:p.follow_ups});
const options=(overrides={})=>({chunks,hints:hints.intents,skills,guards:read('claim-guards'),guarded:hints.unsupported_or_guarded_terms,configured:true,
  generate:async(q,c)=>output(createSynthesisPlan(q,c)),signal:new AbortController().signal,emit:()=>{},telemetry:{record:()=>{}},...overrides});
// Exercise actual JSX output without adding a test framework or a browser mock.
const require=createRequire(import.meta.url),compiled={exports:{}};
const code=ts.transpileModule(readFileSync('src/features/ask-ladimus/answer-passages.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
new Function('require','module','exports',code)(require,compiled,compiled.exports);
const {AnswerPassages}=compiled.exports;
const markup=r=>renderToStaticMarkup(React.createElement(AnswerPassages,{claims:r.claims,style:r.style,evidence:r.evidence,id:'answer'}));

test('every reviewed substantive passage has exact corpus facts and maturity support',()=>{
  for(const p of editorialPassages)for(const s of p.support){const c=chunks.find(c=>c.id===s.id);assert.ok(c,s.id);assert.equal(c.status,s.status);assert.ok(s.facts.length);for(const fact of s.facts)assert.ok(c.facts.includes(fact),`${s.id}: missing support`);}
});
test('synthesis schema is bounded, deterministic, and fails closed for unknown fields',()=>{
  const c=retrieve('Azure'),p=createSynthesisPlan('Azure',c),valid=output(p);
  assert.deepEqual(groundAnswer(valid,c,p).claims,valid.answer);
  for(const bad of [null,[],{}, {answer:null,follow_ups:[]},{...valid,provider_payload:'secret'},{...valid,answer:[{...valid.answer[0],extra:'unchecked'}]},{...valid,answer:Array(7).fill(valid.answer[0])},{...valid,follow_ups:Array(4).fill('unknown')}])assert.throws(()=>groundAnswer(bad,c,p),SynthesisValidationError);
  assert.deepEqual(createSynthesisPlan('Azure',c),p);
});
test('real IDs outside retrieval and invented citations are rejected',()=>{
  const c=retrieve('Azure'),p=createSynthesisPlan('Azure',c),valid=output(p);
  const outside=chunks.find(x=>!c.some(y=>y.id===x.id));
  for(const id of ['invented',outside.id])assert.throws(()=>groundAnswer({...valid,answer:[{...valid.answer[0],evidence_ids:[id]}]},c,p));
  for(const ids of [[],[valid.answer[0].evidence_ids[0],valid.answer[0].evidence_ids[0]],[null]])assert.throws(()=>groundAnswer({...valid,answer:[{...valid.answer[0],evidence_ids:ids}]},c,p));
});
test('valid citation cannot authorize unsupported prose or silently invent support',()=>{
  const c=retrieve('Azure'),p=createSynthesisPlan('Azure',c),valid=output(p);
  for(const text of ['Luis deployed Kubernetes across the company.',`${valid.answer[0].text} He saved $2 million.`,valid.answer[0].text.replace('production','company-wide production')])assert.throws(()=>groundAnswer({...valid,answer:[{text,evidence_ids:valid.answer[0].evidence_ids}]},c,p));
});
test('multi-source passage requires all exact supporting citations',()=>{
  const q='What RAG systems has Luis built?',c=retrieve(q),p=createSynthesisPlan(q,c),valid=output(p);
  assert.equal(p.answer[0].evidence_ids.length,2);
  assert.throws(()=>groundAnswer({...valid,answer:[{...valid.answer[0],evidence_ids:valid.answer[0].evidence_ids.slice(0,1)},...valid.answer.slice(1)]},c,p));
});
test('corpus fact or maturity changes disable affected editorial prose',()=>{
  const q='Tell me about ROMGuide.',c=retrieve(q),p=createSynthesisPlan(q,c);
  for(const changed of [c.map(x=>({...x,status:'production_verified'})),c.map(x=>({...x,facts:['different source facts']}))]){
    const next=createSynthesisPlan(q,changed);assert.ok(!next.answer.some(a=>a.text===p.answer[0].text));
    assert.throws(()=>groundAnswer(output(p),changed,next));
  }
});
test('substantive DevOps answer opens directly and renders 2–4 cohesive paragraphs',async()=>{
  const q='What makes Luis more than a traditional DevOps engineer?',r=await answerQuery(q,options());
  assert.equal(r.outcome,'answered');assert.equal(r.style,'paragraphs');assert.match(r.claims[0].text,/scope extends beyond traditional DevOps/);
  assert.match(r.claims[0].text,/official ROMTech title was DevOps Engineer/);
  assert.ok(r.claims.length>=2&&r.claims.length<=4);const words=r.claims.map(c=>c.text).join(' ').split(/\s+/).length;assert.ok(words>=180&&words<=350,words);
  const html=markup(r);assert.equal((html.match(/<p>/g)||[]).length,r.claims.length);assert.ok(!html.includes('<ul>'));assert.ok(html.includes('Evidence 1 for passage 1'));
  assert.deepEqual(r.followUps,['How did Luis make the PR Assistant safe?','What production systems has Luis operated?','How has Luis applied AI inside CI/CD?']);
});
test('AI system overview renders framing paragraph then organized list with maturity',async()=>{
  const r=await answerQuery('What AI systems has Luis built?',options());assert.equal(r.outcome,'answered');assert.equal(r.style,'list');
  const html=markup(r);assert.ok(html.startsWith('<p>'));assert.ok(html.includes('<ul>'));assert.equal((html.match(/<li>/g)||[]).length,r.claims.length-1);
  const text=r.claims.map(c=>c.text).join(' ');assert.match(text,/production-onboarded.*adoption limits/);assert.match(text,/designed, not deployed/);assert.match(text,/public open-source/);
});
test('Kubernetes answer remains brief, conservative, and bypasses provider',async()=>{
  let called=false;const r=await answerQuery('Does Luis have professional Kubernetes experience?',options({generate:async()=>{called=true;throw Error('must not call');}}));
  assert.equal(called,false);assert.equal(r.outcome,'partial');assert.equal(r.claims.length,0);assert.ok(r.message.split(/\s+/).length<60);assert.match(r.message,/enough evidence.*Kubernetes/);
});
test('impact answer retains every requested metric without projecting savings or resolutions',async()=>{
  const r=await answerQuery('What measurable production impact did his automation have?',options());assert.equal(r.outcome,'answered');
  const text=r.claims.map(c=>c.text).join(' ');for(const v of ['7,156','11,000','414','412','99.52%','98'])assert.ok(text.includes(v));assert.match(text,/do not establish audited financial savings/);assert.match(text,/should not be interpreted as successfully resolved/);
  assert.ok(r.claims[0].evidence_ids.includes('system-genie-swopsbot--3'));
});
test('unrelated and named-system answers exclude unrelated metric and system passages',()=>{
  for(const q of ['What is his Azure experience?','What backend work has he done?','What makes Luis more than a traditional DevOps engineer?'])assert.ok(!createSynthesisPlan(q,retrieve(q)).answer.some(a=>/7,156|11,000/.test(a.text)));
  const p=createSynthesisPlan('How did Luis make the PR Assistant safe?',retrieve('How did Luis make the PR Assistant safe?'));assert.ok(p.answer.length>=2);assert.ok(p.answer.every(a=>a.evidence_ids.every(id=>id.startsWith('system-pr-assistant--'))));
});
test('ROMTech response keeps built, validated, and designed work distinct',async()=>{
  const q='What did Luis build at ROMTech?',r=await answerQuery(q,options({generate:async(q,c)=>{const p=createSynthesisPlan(q,c);return {answer:p.answer.slice(0,4),follow_ups:p.follow_ups};}}));
  assert.equal(r.outcome,'answered');const text=r.claims.map(c=>c.text).join(' ');assert.match(text,/official title DevOps Engineer/);assert.match(text,/built and validated/);assert.match(text,/live validated with merged components/);assert.match(text,/designed, not deployed/);
});
test('follow-ups must come from evidence-supported topic choices',()=>{
  const q='What RAG systems has Luis built?',c=retrieve(q),p=createSynthesisPlan(q,c),valid=output(p);
  assert.ok(p.follow_ups.length>=2);assert.ok(p.follow_ups.every(q=>retrieve(q).length>0));
  for(const follow_ups of [['How much did Luis save with Kubernetes?'],[p.follow_ups[0],p.follow_ups[0]],[]])assert.throws(()=>groundAnswer({...valid,follow_ups},c,p));
  const comparison='What distinguishes ROMGuide\'s prototype from Ladimus Agent\'s public project?';const comparePlan=createSynthesisPlan(comparison,retrieve(comparison));
  for(const prefix of ['system-romguide--','project-ladimus-agent--'])assert.ok(comparePlan.answer.some(a=>a.evidence_ids.some(id=>id.startsWith(prefix))));
});
test('invalid provider synthesis fails closed while evidence stays inspectable',async()=>{
  const r=await answerQuery('Azure',options({generate:async(q,c)=>({answer:[{text:'Luis runs Kubernetes.',evidence_ids:[c[0].id]}],follow_ups:[]})}));
  assert.equal(r.outcome,'unavailable');assert.equal(r.claims.length,0);assert.ok(r.evidence.length);assert.ok(!r.message.includes('Kubernetes'));
});
