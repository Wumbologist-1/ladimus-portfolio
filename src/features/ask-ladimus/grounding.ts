import type { EvidenceChunk, AnswerClaim } from "./contracts.ts";

// The model returns evidence selections rather than unchecked career prose.
// This makes provenance and the overclaim boundary mechanically enforceable.
export function groundSelection(output: unknown, chunks: EvidenceChunk[]): AnswerClaim[] {
  if (!output || typeof output !== "object" || !("selection" in output) || !Array.isArray(output.selection) || output.selection.length > 10) throw Error("Malformed provider selection");
  const claims: AnswerClaim[] = []; const seen = new Set<string>();
  for (const item of output.selection) {
    if (!item || typeof item !== "object" || typeof item.evidenceId !== "string" || !Number.isInteger(item.factIndex)) throw Error("Malformed citation");
    const chunk = chunks.find(c => c.id === item.evidenceId);
    const fact = chunk?.facts[item.factIndex];
    if (!chunk || !fact || item.factIndex < 0) throw Error("Unsupported citation");
    const key = `${chunk.id}:${item.factIndex}`;
    if (!seen.has(key)) { claims.push({text:fact,evidenceId:chunk.id}); seen.add(key); }
  }
  if (claims.reduce((n,c) => n+c.text.length,0) > 5000) throw Error("Answer exceeds budget");
  return claims;
}
