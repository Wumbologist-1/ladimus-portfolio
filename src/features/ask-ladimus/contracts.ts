export type EvidenceRecord = {
  id: string; category: string; title: string; organization: string;
  timeframe: string; status: string; evidenceLevel: string;
  facts: string[]; keywords: string[]; qualifiers: string[];
};
export type EvidenceChunk = EvidenceRecord & { recordId: string };
export type RetrievalHint = { intent: string; keywords: string[]; evidence_ids: string[] };
export type Skill = { skill: string; level: string; evidence_ids: string[] };
export type ClaimGuards = {
  do_not_claim: { claim: string; reason: string }[];
  safe_qualification_examples: Record<string, string>;
  conflicts: { topic: string; canonical: string; variants: string[]; resolution: string }[];
};
export type Evidence = { id: string; recordId: string; label: string; category: string; status: string; excerpt: string; qualifiers: string[] };
export type ClaimKind = "direct" | "synthesis" | "transferable" | "limitation" | "general_technology";
export type AnswerClaim = { text: string; evidence_ids: string[]; kind: ClaimKind };
export type EvidencePacket = {
  question: string;
  items: {id:string; title:string; category:string; organization:string; timeframe:string; maturity:string; facts:string[]; qualifiers:string[]}[];
  direct_skills: Skill[]; transferable_skills: Skill[];
  unsupported_requirements: string[];
  technology_context: {name:string; requirements:string}[];
  guarded_technologies: string[]; known_technologies: string[];
  claim_guards: ClaimGuards; follow_up_candidates: string[];
};
export type AnswerStyle = "paragraphs" | "list";
export type AskResult = {
  outcome: "answered" | "partial" | "no-evidence" | "unavailable" | "refused";
  message: string; claims: AnswerClaim[]; style: AnswerStyle; evidence: Evidence[];
  coverage: string; followUps: string[];
  limitations?: string;
  mode?: "capability_gap";
};
export type AskWireEvent =
  | { type: "retrieval:start" }
  | { type: "retrieval:complete"; evidence: Evidence[] }
  | { type: "generation:start" }
  | { type: "generation:complete" }
  | { type: "grounding:complete"; supported: boolean; code?: string }
  | { type: "verification:start" }
  | { type: "verification:complete"; supported: boolean }
  | { type: "response:complete"; result: AskResult }
  | { type: "response:error"; message: string };
export const suggestedQuestions = [
  "What AI systems has Luis built?", "Explain his agentic systems experience.",
  "What did Luis build at ROMTech?", "What is his Azure experience?",
  "What backend engineering work has he done?", "What RAG systems has he built?",
  "How does Luis approach AI reliability?", "What impact did his automation have?",
] as const;
