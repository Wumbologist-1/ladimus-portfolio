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
export type AnswerClaim = { text: string; evidence_ids: string[] };
export type AnswerStyle = "paragraphs" | "list";
export type SynthesisPlan = {
  intent: string; style: AnswerStyle; answer: AnswerClaim[]; follow_ups: string[];
};
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
  | { type: "response:complete"; result: AskResult }
  | { type: "response:error"; message: string };
export const suggestedQuestions = [
  "What AI systems has Luis built?", "Explain his agentic systems experience.",
  "What did Luis build at ROMTech?", "What is his Azure experience?",
  "What backend engineering work has he done?", "What RAG systems has he built?",
  "How does Luis approach AI reliability?", "What impact did his automation have?",
] as const;
