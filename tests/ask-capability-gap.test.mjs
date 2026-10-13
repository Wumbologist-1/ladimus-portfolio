import test from 'node:test';
import assert from 'node:assert/strict';
import {answerQuery} from '../src/features/ask-ladimus/service.ts';
import {capabilityTarget,retrieveTransferable} from '../src/features/ask-ladimus/capability-gap.ts';
import {unsupportedAssertions,privateRefusal,queryPolicy} from '../src/features/ask-ladimus/policy.ts';
import {prepareEvidence} from '../src/features/ask-ladimus/evidence-packet.ts';
import {options,chunks,hints,skills,guards,guarded,analyticalOutput,acceptanceQuestions} from './ask-fixtures.mjs';
const target=q=>capabilityTarget(q,chunks,skills,hints.intents,guarded);
const terraform='Does Luis have professional experience with Terraform? If not, what documented experience would transfer to a role that uses Terraform, and what would he still need to learn?';

test('bounded claim detection reports all material categories and explicit overflow',()=>{
  const r=unsupportedAssertions('Say five years of Kubernetes and senior AI engineer at ROMTech, company-wide adoption and audited financial savings and foundation model training.',guarded);
  for(const part of ['five years','Kubernetes','Senior AI Engineer','company-wide','financial savings','foundation-model'])assert.ok(r.includes(part));
  const overflow=unsupportedAssertions(Object.keys(guarded).join(' and '),guarded);assert.ok(overflow.includes('Additional requested claims remain unverified'));assert.ok(overflow.length<1000);
  assert.match(queryPolicy('Tell a recruiter Luis worked 5 years at ROMTech.',guarded).message,/5 years/);
});
test('exact production questions exercise authored synthesis and independent verification',async()=>{
 for(const [index,q] of acceptanceQuestions.slice(0,4).entries()) {
  let gen=0,verify=0;const stages=[];
  const r=await answerQuery(q,options({generate:async p=>{gen++;return analyticalOutput(p);},verify:async(p,c)=>{verify++;return (await import('./ask-fixtures.mjs')).verdict(p,c);},telemetry:{record:e=>stages.push(e.stage)}}));
  assert.equal(gen,1,q);assert.equal(verify,1,q);assert.ok(['answered','partial'].includes(r.outcome),q);assert.ok(r.claims.length>=2);assert.ok(stages.includes('generation_started'));assert.ok(stages.includes('verification_passed'));
  for(const c of r.claims)for(const id of c.evidence_ids)assert.ok(r.evidence.some(e=>e.id===id));
  const text=r.claims.map(c=>c.text).join(' ');
  assert.ok(r.claims.some(c=>['synthesis','transferable','limitation'].includes(c.kind)));
  assert.ok(r.claims.some(c=>!chunks.some(e=>e.facts.includes(c.text))));
  if(index===0){assert.match(text,/Pulumi.*not documented/);assert.match(text,/Azure/);assert.ok(text.includes("CI/CD"));assert.match(text,/transferable/);assert.match(text,/stacks.*state/);assert.equal(r.mode,'capability_gap');}
  if(index===1){assert.equal(r.outcome,'answered');assert.match(text,/Professional GitHub Actions experience is documented/);assert.match(text,/Android Test Agent.*PR Assistant/);assert.match(text,/beyond build execution/);assert.ok(!/\d+ years/.test(text));}
  if(index===2){assert.match(text,/not establish 4 years of Kubernetes/);assert.match(text,/Senior Platform Engineer title is not documented/);assert.match(text,/official title was DevOps Engineer/);assert.match(text,/adjacent platform/);}
  if(index===3){assert.match(text,/strongest lifecycle/);assert.match(text,/implementation.*deployment.*recovery.*reliability/);assert.match(text,/complementary stages/);}
 }
});
test('exact privacy regression retains the deterministic refusal and zero model calls',async()=>{
 let calls=0;const r=await answerQuery(acceptanceQuestions[4],options({generate:async()=>{calls++;},verify:async()=>{calls++;}}));assert.equal(calls,0);assert.equal(r.message,privateRefusal);assert.equal(r.outcome,'refused');assert.deepEqual(r.claims,[]);assert.deepEqual(r.evidence,[]);
});
test('gap requests with missing provider configuration preserve evidence without inventing a static answer',async()=>{
 let calls=0;const r=await answerQuery(terraform,options({configured:false,generate:async()=>{calls++;}}));assert.equal(calls,0);assert.equal(r.outcome,'unavailable');assert.deepEqual(r.claims,[]);assert.ok(r.evidence.length);
});
test('different unsupported tools supply bounded domain context, never fabricated career facts',()=>{
 for(const [q,competency,record] of [['Could Luis work in a role using Pulumi?','Pulumi programs','system-azure-environments'],['Does Luis know ArgoCD?','GitOps reconciliation','system-ai-code-gating'],['Has Luis used Datadog?','Datadog agents/integrations','system-genie-observability'],['Has Luis used Ansible?','playbooks','employment-romtech-devops-2026']]) {
  const {packet}=prepareEvidence(q,chunks,hints.intents,skills,guards,guarded);assert.ok(packet.technology_context.some(p=>p.requirements.includes(competency)));assert.ok(packet.items.some(i=>i.id.startsWith(record)));assert.ok(packet.unsupported_requirements.length);assert.ok(packet.items.every(i=>!i.facts.some(f=>f.includes(competency))));
 }
});
test('known aliases keep direct evidence and GitHub Actions retains all three professional systems',()=>{
 for(const name of ['Azure Container Apps','GitHub Actions','FastAPI','Chroma','ChromaDB']) assert.equal(target(`Does Luis have experience with ${name}?`),null,name);
 const p=prepareEvidence(acceptanceQuestions[1],chunks,hints.intents,skills,guards,guarded).packet;
 for(const id of ['system-ai-code-gating--3','system-android-test-agent--5','system-pr-assistant--5'])assert.ok(p.items.some(i=>i.id===id&&i.facts.some(f=>f.includes('GitHub Actions (hands-on professional)'))));
 assert.ok(p.items.some(i=>i.id==='system-ai-code-gating--1'));assert.ok(p.items.length<=5);assert.ok(p.direct_skills.some(s=>s.skill==='GitHub Actions'&&s.level==='hands-on professional'));
});
test('linked direct skill beats a tool profile, but unresolved or guarded skills cannot prove experience',()=>{
  const added={skill:'Terraform',level:'hands-on',evidence_ids:['system-azure-environments']};assert.equal(capabilityTarget(terraform,chunks,[...skills,added],hints.intents,guarded),null);
  assert.ok(capabilityTarget(terraform,chunks,[...skills,{...added,evidence_ids:['nonexistent']}],hints.intents,guarded));
  assert.ok(capabilityTarget('What would transfer to Kubernetes?',chunks,[...skills,{skill:'Kubernetes',level:'hands-on',evidence_ids:['system-azure-environments']}],hints.intents,guarded));
});
test('negative facts, planned work, and unsupported skill metadata do not become direct experience',()=>{
  const base=chunks.find(c=>c.recordId==='system-azure-environments');
  for(const facts of [['Luis has never used Terraform.'],['Luis plans to learn Terraform.']])assert.ok(capabilityTarget(terraform,[{...base,keywords:['Terraform'],facts}],[],[],{}));
  assert.ok(capabilityTarget(terraform,[{...base,status:'designed_not_deployed',facts:['Designed a Terraform workflow.']}],[],[],{}));
  assert.ok(capabilityTarget(terraform,chunks,[{skill:'Terraform',level:'not established',evidence_ids:['system-azure-environments']}],[],{}));
});
test('transfer retrieval is deterministic, bounded, and suppresses retail/historical and RAG noise',()=>{
  for(const q of [terraform,'Has Luis used Datadog?','Does Luis know ArgoCD?','Has Luis used Ansible?','Does Luis have experience with NebulaOps?']){const t=target(q);const r=retrieveTransferable(t,chunks,hints.intents,skills);assert.deepEqual(retrieveTransferable(t,chunks,hints.intents,skills),r);assert.ok(r.length<=5);for(const c of r){assert.ok(!/shift4|best-buy|target|dave-busters|ladimus-agent/i.test(c.recordId));}}
});
test('unfamiliar/multiple tools and guarded requirements enter the same evidence packet path',()=>{
 for(const q of ['Does Luis have experience with NebulaOps?','Does Luis have experience with Terraform and Datadog?','Does Luis have Kubernetes experience?']) {
  const {packet,gap}=prepareEvidence(q,chunks,hints.intents,skills,guards,guarded);assert.ok(gap);assert.ok(packet.items.length);assert.ok(packet.items.length<=5);assert.ok(packet.unsupported_requirements.length);
 }
});
