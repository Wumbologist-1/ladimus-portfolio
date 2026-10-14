import { normalizeQuery, mentionsQueryTerm, requestedToolObjects, requestedTechnologyDomain } from "./query-language.ts";
import type { EvidenceChunk, RetrievalHint, Skill } from "./contracts.ts";
import { retrieveEvidence } from "./retrieval.ts";

type Domain = "infrastructure" | "delivery" | "observability" | "automation";
type Technology = { name: string; aliases: string[]; domain: Domain; requirements: string };
// Technology knowledge, not career evidence. These profiles select reusable
// competency domains; no tool name is added to Luis's skills or public corpus.
export const technologies: Technology[] = [
  {name:"Terraform",aliases:["terraform"],domain:"infrastructure",requirements:"Terraform/HCL, provider/resource configuration, state, modules, the plan/apply lifecycle, and Terraform-specific infrastructure-as-code practices"},
  {name:"Pulumi",aliases:["pulumi"],domain:"infrastructure",requirements:"Pulumi programs, providers/resources, stacks, state management, configuration/secrets, and preview/update workflows"},
  {name:"ArgoCD",aliases:["argocd","argo cd"],domain:"delivery",requirements:"ArgoCD applications, Kubernetes manifests, GitOps reconciliation, synchronization/drift handling, and access configuration"},
  {name:"Datadog",aliases:["datadog"],domain:"observability",requirements:"Datadog agents/integrations, telemetry ingestion, queries, monitors/alerts, and Datadog-specific dashboards"},
  {name:"Ansible",aliases:["ansible"],domain:"automation",requirements:"Ansible inventories, playbooks, modules, roles, idempotent configuration, and secrets handling"},
];
const domains: Record<Domain,{skills:string[];intent:string[];query:string}> = {
  infrastructure:{skills:["Microsoft Azure","Azure Container Apps","Azure Container Registry","Docker / containers","GitHub Actions","CI/CD","Git / YAML","Azure DevOps"],intent:["azure","devops"],query:"Azure production development container environments cloud configuration CI/CD GitHub Actions release rollback"},
  delivery:{skills:["GitHub Actions","CI/CD","Git / YAML","Release validation","Rollback / deployment recovery","Azure Container Apps"],intent:["devops"],query:"CI/CD GitHub Actions deterministic configuration deployment release validation rollback recovery"},
  observability:{skills:["Grafana / operational observability","Monitoring and log analysis","Root-cause analysis"],intent:["production_ownership"],query:"Grafana dashboard operational observability monitoring log analysis health verification"},
  automation:{skills:["PowerShell / Bash","Microsoft Azure","Docker / containers","CI/CD","Git / YAML","Azure DevOps"],intent:["devops","azure"],query:"automation DevOps environment containers configuration validation production"},
};
const mentions = mentionsQueryTerm;
const normalize = normalizeQuery;

export function capabilityTarget(query:string, chunks:EvidenceChunk[], skills:Skill[], hints:RetrievalHint[], guarded:Record<string,string>) {
  const q=normalize(query);
  const profiles=technologies.filter(t=>t.aliases.some(a=>mentions(q,a)));
  const guardedNames=Object.keys(guarded).filter(t=>mentions(q,t));
  const requested=requestedToolObjects(query)[0];
  const requestedNames=[...new Set([...profiles.map(p=>p.name),...guardedNames,...(!profiles.length&&!guardedNames.length&&requested?[requested]:[])])];
  const names=requestedNames.slice(0,4);
  if(!names.length) return null;
  const missing=names.filter(name=>{
    if(guardedNames.includes(name)) return true;
    // Skills/aliases need a resolvable evidence link. A hint is usable only
    // alongside an affirmative matching fact; merely naming a tool is not proof.
    const skill=skills.find(s=>s.skill.split(/\s*\/\s*/).some(a=>mentions(a,name)));
    if(skill&&!/not established|unsupported|no evidence/i.test(skill.level)&&chunks.some(c=>skill.evidence_ids.includes(c.recordId)&&c.status!=="designed_not_deployed")) return false;
    const linkedHints=hints.filter(h=>h.keywords.some(k=>mentions(k,name))).flatMap(h=>h.evidence_ids);
    return !chunks.some(c=>c.status!=="designed_not_deployed"&&(c.keywords.some(k=>mentions(k,name))||linkedHints.includes(c.recordId)||c.facts.some(f=>mentions(f,name)))&&c.facts.some(f=>mentions(f,name)&&!/(?:\b(?:no|not|never|without|unsupported)\b|(?:plan|intend|propos).{0,30}(?:use|learn|adopt))/i.test(f)));
  });
  if(!missing.length) return null; // Direct evidence retains the normal pipeline.

  const unknownDomain=requestedTechnologyDomain(query);
  return {names:missing,profiles:missing.map(name=>profiles.find(p=>p.name===name)??{name,aliases:[name],domain:unknownDomain,requirements:`${name}-specific concepts, configuration, APIs, operational workflows, and hands-on validation`}),unknown:missing.some(n=>!profiles.some(p=>p.name===n)),truncated:requestedNames.length>4};
}

export function retrieveTransferable(target:NonNullable<ReturnType<typeof capabilityTarget>>, chunks:EvidenceChunk[], hints:RetrievalHint[], skills:Skill[]) {
  const selectedDomains=[...new Set(target.profiles.map(p=>p.domain))].map(d=>domains[d]);
  const relevantSkills=skills.filter(s=>selectedDomains.some(d=>d.skills.includes(s.skill)));
  const relevantHints=hints.filter(h=>selectedDomains.some(d=>d.intent.includes(h.intent)));
  const allowed=new Set([...relevantSkills.flatMap(s=>s.evidence_ids),...relevantHints.flatMap(h=>h.evidence_ids)]);
  const professionalRoles=new Set(relevantHints.flatMap(h=>h.evidence_ids));
  const candidates=chunks.filter(c=>allowed.has(c.recordId)&&c.id.endsWith("--1")&&(c.category==="system"||(c.category==="employment"&&professionalRoles.has(c.recordId))));
  return retrieveEvidence(selectedDomains.map(d=>d.query).join(" "),candidates,relevantHints,relevantSkills);
}
