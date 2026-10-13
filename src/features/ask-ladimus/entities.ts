import type { EvidenceChunk, EvidenceEntity } from "./contracts.ts";
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
export const mentionsEntity=(text:string,name:string)=>new RegExp(`(?<![a-z0-9])${escape(name)}(?![a-z0-9])`,"i").test(text.normalize("NFKC"));

export function evidenceEntities(chunks:EvidenceChunk[]):EvidenceEntity[] {
  const records=[...new Set(chunks.filter(c=>["system","project"].includes(c.category)).map(c=>c.recordId))];
  return records.map(record_id=>{
    const items=chunks.filter(c=>c.recordId===record_id),title=items[0]!.title;
    const short=record_id.replace(/^(?:system|project)-/,"").replaceAll("-"," ");
    return {record_id,title,aliases:[...new Set([title,short])],evidence_ids:items.map(c=>c.id)};
  });
}
export function namedEntities(query:string,chunks:EvidenceChunk[]) {
  return evidenceEntities(chunks).filter(e=>e.aliases.some(a=>mentionsEntity(query,a)))
    .sort((a,b)=>Math.min(...a.aliases.map(n=>query.toLowerCase().indexOf(n.toLowerCase())).filter(i=>i>=0))-Math.min(...b.aliases.map(n=>query.toLowerCase().indexOf(n.toLowerCase())).filter(i=>i>=0)));
}
export function reserveNamedEvidence(query:string,chunks:EvidenceChunk[],ranked:EvidenceChunk[],topK=5) {
  const entities=namedEntities(query,chunks),limit=Math.max(1,Math.min(5,topK));
  if(entities.length<2) return ranked.slice(0,limit);
  const representatives=entities.map(e=>chunks.find(c=>c.recordId===e.record_id&&c.id.endsWith("--1"))??ranked.find(c=>c.recordId===e.record_id)??chunks.find(c=>c.recordId===e.record_id)!).slice(0,limit);
  return [...representatives,...ranked].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i).slice(0,limit);
}
