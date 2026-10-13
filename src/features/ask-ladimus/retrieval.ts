import type { EvidenceChunk, RetrievalHint, Skill } from "./contracts.ts";
import { reserveNamedEvidence } from "./entities.ts";

const stop = new Set("what who how has have does did do is are the a an of for to and in his he luis tomassini experience tell me about kind much real with built build work engineering explain projects best demonstrate".split(" "));
export function tokens(value: string) {
  const normalized=value.toLowerCase().replace(/[’']s\b/g,"").replace(/\bjudgment\b/g,"validation").replace(/\bprototypes\b/g,"prototype").replace(/\bsystems\b/g,"system");
  return [...new Set(normalized.match(/[a-z0-9+#]+(?:[./-][a-z0-9+#]+)*/g) ?? [])].filter(t => !stop.has(t));
}
const contains = (value: string, token: string) => tokens(value).includes(token);

export function retrieveEvidence(query: string, chunks: EvidenceChunk[], hints: RetrievalHint[], skills: Skill[], topK = 5) {
  const terms = tokens(query);
  if (!terms.length) return [];
  const activeHints = hints.filter(h => h.keywords.some(k => tokens(k).some(t => terms.includes(t))));
  const mapped = new Set(skills.filter(s => tokens(s.skill).some(t => terms.includes(t))).flatMap(s => s.evidence_ids));
  const ranked = chunks.map(chunk => {
    const body = chunk.facts.join(" ");
    const metadata = [chunk.title, chunk.organization, ...chunk.keywords].join(" ");
    let score = terms.reduce((sum, term) => sum + (contains(body,term) ? 1 : 0) + (contains(metadata,term) ? 3 : 0),0);
    score += activeHints.reduce((sum,h) => sum + (h.evidence_ids.includes(chunk.recordId) ? 4 : 0),0);
    if (mapped.has(chunk.recordId)) score += 3;
    // Impact questions must retain the documented measurements, not just a system overview.
    if (score > 0 && terms.some(t => ["measurable","measured","metrics","impact","requests"].includes(t)) && chunk.facts.some(f => /:\s*(?:exceeded\s+)?[\d,.]+%?\.$/.test(f))) score += 10;
    // Named system queries retain depth; overview queries diversify records.
    // Organizations and skills identify a topic, not a request for one system's depth.
    const named = ["system","project"].includes(chunk.category) && (chunk.keywords.some(alias => alias.length > 3 && alias.toLowerCase() !== "romtech" && alias.toLowerCase() !== chunk.organization.toLowerCase() && !skills.some(s => s.skill.toLowerCase() === alias.toLowerCase()) && query.toLowerCase().includes(alias.toLowerCase())) || query.toLowerCase().includes(chunk.title.toLowerCase()));
    if (named) score += 8;
    return { chunk, score, named };
  }).filter(r => r.score >= 2).sort((a,b) => Number(b.named)-Number(a.named) || b.score-a.score || a.chunk.id.localeCompare(b.chunk.id));
  const selected: EvidenceChunk[] = []; const counts = new Map<string,number>();
  for (const row of ranked) {
    const n = counts.get(row.chunk.recordId) ?? 0;
    if (n >= (row.named ? 3 : 1)) continue;
    selected.push(row.chunk); counts.set(row.chunk.recordId,n+1);
    if (selected.length >= Math.max(1,Math.min(5,Math.floor(topK) || 5))) break;
  }
  return reserveNamedEvidence(query,chunks,selected,Math.max(1,Math.min(5,Math.floor(topK)||5)));
}
