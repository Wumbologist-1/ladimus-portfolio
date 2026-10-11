import type { EvidenceChunk, AnswerClaim, SynthesisPlan } from "./contracts.ts";

export class SynthesisValidationError extends Error {}
const reject = (): never => { throw new SynthesisValidationError("Unsupported synthesis"); };
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

export function groundAnswer(output: unknown, chunks: EvidenceChunk[], plan: SynthesisPlan): { claims: AnswerClaim[]; followUps: string[] } {
  if (!object(output) || Object.keys(output).some(k => !["answer", "follow_ups"].includes(k)) || !Array.isArray(output.answer) || !Array.isArray(output.follow_ups)) return reject();
  if (output.answer.length > (plan.style === "list" ? 6 : 4) || output.follow_ups.length > 3) return reject();
  const ids = new Set(chunks.map(c => c.id));
  const seen = new Set<string>();
  const claims: AnswerClaim[] = output.answer.map(item => {
    if (!object(item) || Object.keys(item).some(k => !["text", "evidence_ids"].includes(k)) || typeof item.text !== "string" || !Array.isArray(item.evidence_ids) || !item.evidence_ids.length || item.evidence_ids.length > 5) return reject();
    if (item.evidence_ids.some(id => typeof id !== "string" || !ids.has(id)) || new Set(item.evidence_ids).size !== item.evidence_ids.length) return reject();
    const citedIds = item.evidence_ids;
    const approved = plan.answer.find(a => a.text === item.text);
    if (!approved || approved.evidence_ids.length !== citedIds.length || approved.evidence_ids.some(id => !citedIds.includes(id)) || seen.has(item.text)) return reject();
    seen.add(item.text);
    return {text: approved.text, evidence_ids: [...approved.evidence_ids]};
  });
  if (claims.reduce((n, c) => n + c.text.length, 0) > 5000) return reject();
  if (claims.length && claims[0]?.text !== plan.answer[0]?.text) return reject();
  if (claims.length && plan.style === "paragraphs" && plan.answer.length > 1 && claims.length < 2) return reject();
  const followUps: string[] = output.follow_ups.map(q => {
    if (typeof q !== "string" || !plan.follow_ups.includes(q)) return reject();
    return q;
  });
  if (new Set(followUps).size !== followUps.length || (claims.length && followUps.length < Math.min(2, plan.follow_ups.length))) return reject();
  if (!claims.length && followUps.length) return reject();
  return {claims, followUps};
}
