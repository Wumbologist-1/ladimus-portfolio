// Used only by the server Ask path. Providers receive an explicit sanitized
// event, never a request, private corpus, prompt, or provider response object.
export type AskTelemetryStatus = "success" | "no_evidence" | "generation_unavailable" | "provider_error" | "validation_rejected" | "rate_limited";
export type AskTelemetryStage = "policy_refusal" | "retrieval_only" | "generation_started" | "generation_completed" | "verification_passed" | "verification_failed" | "corrective_generation" | "answer_completed";
export type AskTelemetryInput = { query: string; intent: string; evidenceIds: string[]; status: AskTelemetryStatus; latencyMs: number; stage?: AskTelemetryStage };
export type AskTelemetryEvent = { event: "ask_ladimus_query"; query: string; intent: string; evidence_ids: string[]; status: AskTelemetryStatus; latency_ms: number; stage?: AskTelemetryStage };
export type AskTelemetryProvider = { record: (event: AskTelemetryEvent) => void | Promise<void> };

export function sanitizeQuery(query: string) {
  if (query.length > 2048) return "[long query omitted]";
  return query.normalize("NFKC")
    .replace(/https?:\/\/[^\s<>]+/gi, "[url]")
    .replace(/(?:www\.[^\s<>]+|(?:\/[A-Za-z0-9_./-]+|[A-Za-z0-9.-]+\.[A-Za-z]{2,}[^\s<>]*)\?[^\s<>]*)/gi, "[url]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b(?:Bearer\s+\S+|(?:api[_ -]?key|access[_ -]?token|secret|password|authorization)\s*[:=]\s*["']?[^\s,"';]+)/gi, "[secret]")
    .replace(/\b(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{8,}|(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{8,}|xox[baprs]-[A-Za-z0-9-]{8,}|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{8,}|AKIA[A-Z0-9]{16}|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/g, "[secret]")
    .replace(/[A-Za-z0-9_+\/-]{32,}={0,2}/g, "[secret]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, match => match.replace(/\D/g, "").length >= 9 ? "[phone]" : match)
    .replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
}

const structuredLogs: AskTelemetryProvider = { record: event => { console.info(JSON.stringify(event)); } };
const intents = new Set(["capability_gap", "broader_scope", "impact", "rag", "romtech", "ai_systems", "agentic_ai", "ai_safety", "production_ownership", "backend", "android_testing", "career", "private", "unsupported", "rate_limited"]);
const statuses = new Set<AskTelemetryStatus>(["success", "no_evidence", "generation_unavailable", "provider_error", "validation_rejected", "rate_limited"]);

export function recordAskTelemetry(input: AskTelemetryInput, provider: AskTelemetryProvider = structuredLogs): void {
  try {
    const event: AskTelemetryEvent = {
      event: "ask_ladimus_query",
      ...(input.stage && ["policy_refusal","retrieval_only","generation_started","generation_completed","verification_passed","verification_failed","corrective_generation","answer_completed"].includes(input.stage) ? {stage:input.stage} : {}),
      query: input.intent === "private" ? "[private request omitted]" : sanitizeQuery(input.query),
      intent: intents.has(input.intent) ? input.intent : "career",
      evidence_ids: [...new Set(input.evidenceIds.filter(id => /^[a-z0-9-]+--\d{1,3}$/.test(id)))].slice(0, 5),
      status: statuses.has(input.status) ? input.status : "provider_error",
      latency_ms: Number.isFinite(input.latencyMs) ? Math.min(60000, Math.max(0, Math.round(input.latencyMs))) : 0,
    };
    // Never await telemetry on the answer path. Swallow throws and rejections
    // without logging the failure or its potentially sensitive payload.
    const pending = provider.record(event);
    if (pending) void Promise.resolve(pending).catch(() => {});
  } catch { /* Telemetry must never affect a visitor's answer. */ }
}
