import type { EvidenceChunk, EvidencePacket, Skill, RetrievalHint, ClaimGuards } from "./contracts.ts";
import { retrieveEvidence } from "./retrieval.ts";
import { capabilityTarget, retrieveTransferable } from "./capability-gap.ts";
import { unsupportedAssertions } from "./policy.ts";
import { analysisMode, followUpCandidates } from "./synthesis.ts";
import { evidenceEntities, reserveNamedEvidence } from "./entities.ts";

const mentions=(q:string,name:string)=>new RegExp(`(?<![a-z0-9])${name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?![a-z0-9])`,"i").test(q);
// Known skill queries retain capability facts as first-class evidence. Overview
// chunks complement those facts with concrete implementation depth, still top-K 5.
export function prepareEvidence(query:string, chunks:EvidenceChunk[], hints:RetrievalHint[], skills:Skill[], guards:ClaimGuards, guarded:Record<string,string>) {
  const gap=capabilityTarget(query,chunks,skills,hints,guarded);
  const requested=skills.filter(s=>s.skill.split(/\s*\/\s*/).some(a=>a.length>2&&mentions(query,a)));
  let selected=gap?retrieveTransferable(gap,chunks,hints,skills):retrieveEvidence(query,chunks,hints,skills);
  if(!gap&&requested.length&&/experience|used|depth|deep|professional|evidence/i.test(query)) {
    const records=new Set(requested.flatMap(s=>s.evidence_ids));
    const candidates=chunks.filter(c=>records.has(c.recordId));
    const capabilities=candidates.filter(c=>c.facts.some(f=>f.startsWith("Documented capability:")&&requested.some(s=>mentions(f,s.skill))));
    const overviews=candidates.filter(c=>c.id.endsWith("--1"));
    if(requested.some(s=>s.skill==="GitHub Actions")) overviews.sort((a,b)=>Number(b.recordId==="system-pr-assistant")-Number(a.recordId==="system-pr-assistant"));
    selected=[...capabilities,...overviews].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i).slice(0,5);
  }
  if(/end.to.end|engineering system.*(?:design|production|reliability)/i.test(query)&&!gap) {
    const lifecycle=["employment-romtech-devops-2026","system-genie-swopsbot","system-azure-environments","system-genie-observability","system-ai-code-gating"];
    selected=lifecycle.flatMap(id=>chunks.filter(c=>c.recordId===id&&c.id.endsWith("--1"))).slice(0,5);
  }
  selected=reserveNamedEvidence(query,chunks,selected);
  if(!gap&&analysisMode(query)==="assessment"&&/autonom|modify.*code|code.*modif/i.test(query)) {
    const autonomy=["system-pr-assistant","system-android-test-agent","system-ai-code-gating","employment-romtech-devops-2026"];
    selected=[...autonomy.flatMap(id=>chunks.filter(c=>c.recordId===id&&c.id.endsWith("--1"))),...selected].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i).slice(0,5);
    selected=reserveNamedEvidence(query,chunks,selected);
  }
  const linked=skills.flatMap(s=>{
    const ids=selected.filter(c=>s.evidence_ids.includes(c.recordId)).map(c=>c.id);
    return ids.length?[{...s,evidence_ids:ids}]:[];
  });
  const assertions=unsupportedAssertions(query,guarded);
  const packet:EvidencePacket={
    question:query,
    analysis_mode:analysisMode(query),
    entities:evidenceEntities(selected),
    items:selected.map(c=>({id:c.id,title:c.title,category:c.category,organization:c.organization,timeframe:c.timeframe,maturity:c.status,facts:c.facts,qualifiers:c.qualifiers})),
    direct_skills:gap?[]:linked,transferable_skills:gap?linked:[],
    unsupported_requirements:[...(gap?.names.map(n=>`Professional ${n} experience is not established` )??[]),...(assertions?[assertions]:[])],
    technology_context:gap?.profiles.map(p=>({name:p.name,requirements:p.requirements}))??[],
    guarded_technologies:[...new Set([...Object.keys(guarded),...(gap?.names??[])])],
    known_technologies:[...new Set([...skills.map(s=>s.skill).filter(s=>/Azure|GitHub|Docker|Python|FastAPI|Chroma|Ollama|C#|SQL|Gradle|JUnit|Mockito|Hilt|UiAutomator|Java|Kotlin|React|TypeScript|Grafana|PowerShell|Bash|Redis|LLM|OpenAI/i.test(s)),"Kubernetes","AWS","EKS","Bedrock","Terraform","Pulumi","HCL","Ansible","Datadog","ArgoCD","LangChain","LangGraph","AutoGen","CrewAI","TensorFlow","PyTorch","Go","Rust"] )],
    claim_guards:guards,follow_up_candidates:followUpCandidates(query,selected),
  };
  return {chunks:selected,packet,gap};
}
