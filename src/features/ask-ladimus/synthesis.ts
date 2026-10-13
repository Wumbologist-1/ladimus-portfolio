import type { EvidenceChunk } from "./contracts.ts";
export function synthesisIntent(query: string) {
  const q = query.normalize("NFKC").toLowerCase();
  if (/more than|beyond|traditional devops/.test(q)) return "broader_scope";
  if (/measur|metrics|impact|requests|success rate/.test(q)) return "impact";
  if (/rag|retrieval|romguide|ladimus agent|chroma|knowledge/.test(q)) return "rag";
  if (/romtech|rom technologies/.test(q)) return "romtech";
  if (/ai systems/.test(q)) return "ai_systems";
  if (/agent|orchestrat|specialist/.test(q)) return "agentic_ai";
  if (/safe|reliab|approval|validation|trust|ci\/cd|pr assistant|ladimus review/.test(q)) return "ai_safety";
  if (/azure|cloud|deploy|rollback|production/.test(q)) return "production_ownership";
  if (/backend|api|middleware/.test(q)) return "backend";
  if (/android|test/.test(q)) return "android_testing";
  return "career";
}

const followUps = [
  { text: "How did Luis make the PR Assistant safe?", records: ["employment-romtech-devops-2026", "system-pr-assistant"], topics: ["broader_scope", "romtech", "agentic_ai", "ai_systems", "ai_safety"] },
  { text: "What production systems has Luis operated?", records: ["employment-romtech-devops-2026", "system-azure-environments", "system-genie-swopsbot"], topics: ["broader_scope", "romtech", "impact", "production_ownership", "backend"] },
  { text: "How has Luis applied AI inside CI/CD?", records: ["employment-romtech-devops-2026", "system-ai-code-gating", "system-android-test-agent"], topics: ["broader_scope", "romtech", "ai_systems", "ai_safety", "android_testing"] },
  { text: "How does ROMGuide keep answers tied to sources?", records: ["system-romguide"], topics: ["rag", "backend"] },
  { text: "How does Ladimus Agent handle missing evidence?", records: ["project-ladimus-agent"], topics: ["rag", "ai_safety"] },
  { text: "What distinguishes ROMGuide's prototype from Ladimus Agent's public project?", records: ["system-romguide", "project-ladimus-agent"], topics: ["rag"] },
  { text: "What did Luis measure with the Teams automation dashboard?", records: ["system-genie-observability", "system-genie-swopsbot"], topics: ["impact", "production_ownership"] },
  { text: "What limits apply to the reported automation metrics?", records: ["system-genie-swopsbot"], topics: ["impact"] },
  { text: "How did Luis manage Azure release recovery?", records: ["system-azure-environments", "employment-romtech-devops-2026"], topics: ["production_ownership", "backend", "romtech"] },
  { text: "How does Ladimus Review bind changes to reviewed evidence?", records: ["project-ladimus-review"], topics: ["ai_systems", "agentic_ai", "ai_safety"] },
  { text: "What safeguards constrain Android test generation?", records: ["system-android-test-agent"], topics: ["android_testing", "romtech", "ai_safety"] },
];

export function followUpCandidates(query:string, chunks:EvidenceChunk[]) {
  const intent=synthesisIntent(query), records=new Set(chunks.map(c=>c.recordId));
  const related=followUps.filter(f=>f.topics.includes(intent)&&f.records.some(r=>records.has(r))&&f.text.toLowerCase()!==query.toLowerCase()).map(f=>f.text);
  const fallback=followUps.filter(f=>f.records.some(r=>records.has(r))&&f.text.toLowerCase()!==query.toLowerCase()).map(f=>f.text);
  return [...new Set([...related,...fallback])].slice(0,5);
}
