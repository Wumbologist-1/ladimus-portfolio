import type { AskResult, AskWireEvent, EvidenceChunk, RetrievalHint, Skill, ClaimGuards } from "./contracts.ts";
import { retrieveEvidence } from "./retrieval.ts";
import { insufficient, queryPolicy, unsupportedAssertions } from "./policy.ts";
import { capabilityTarget, retrieveTransferable, gapAnswer } from "./capability-gap.ts";
import { groundAnswer, SynthesisValidationError } from "./grounding.ts";
import { createSynthesisPlan, synthesisIntent } from "./synthesis.ts";
import { recordAskTelemetry } from "./telemetry.ts";
import type { AskTelemetryProvider, AskTelemetryStatus } from "./telemetry.ts";

type Options = {
  chunks: EvidenceChunk[]; hints: RetrievalHint[]; skills: Skill[]; guards: ClaimGuards; guarded: Record<string,string>;
  configured: boolean; generate: (query:string,chunks:EvidenceChunk[],signal:AbortSignal) => Promise<unknown>;
  signal: AbortSignal; emit: (event:AskWireEvent) => void; timeoutMs?: number;
  telemetry?: AskTelemetryProvider | undefined;
};
export async function answerQuery(query: string, options: Options): Promise<AskResult> {
  const started = performance.now();
  let status: AskTelemetryStatus = "no_evidence";
  let intent = synthesisIntent(query);
  let evidenceIds: string[] = [];
  try {
    const policy = queryPolicy(query, options.guarded);
    const base: AskResult = {outcome:"no-evidence",message:insufficient,claims:[],style:"paragraphs",evidence:[],coverage:"No supporting evidence",followUps:[]};
    if (policy.kind === "private") { intent = "private"; return {...base,outcome:"refused",message:policy.message}; }
    options.emit({type:"retrieval:start"});
    const gap=capabilityTarget(query,options.chunks,options.skills,options.hints,options.guarded);
    const chunks = gap?retrieveTransferable(gap,options.chunks,options.hints,options.skills):retrieveEvidence(policy.kind === "unsupported" ? "Azure containers production" : query,options.chunks,options.hints,options.skills);
    const evidence = chunks.map(c => ({id:c.id,recordId:c.recordId,label:c.title,category:c.category,status:c.status,excerpt:c.facts.join("\n"),qualifiers:c.qualifiers}));
    evidenceIds = evidence.map(e => e.id);
    options.emit({type:"retrieval:complete",evidence});
    if(gap) { intent="capability_gap"; return {...base,evidence,...gapAnswer(gap,chunks,unsupportedAssertions(query,options.guarded))}; }
    const plan = createSynthesisPlan(query, chunks);
    const result = {...base,evidence,style:plan.style,followUps:plan.follow_ups};
    if (policy.kind === "unsupported") { intent = "unsupported"; return {...result,style:"paragraphs",outcome:"partial",message:policy.message,coverage:"Requested technology unsupported; adjacent evidence only"}; }
    if (!chunks.length) return result;
    if (!options.configured) { status = "generation_unavailable"; return {...result,outcome:"unavailable",message:policy.message || "Answer generation is currently unavailable. You can inspect the retrieved public evidence below.",coverage:"Retrieved evidence; no generated answer"}; }
    options.emit({type:"generation:start"});
    const controller = new AbortController();
    const abort = () => controller.abort(); options.signal.addEventListener("abort",abort,{once:true});
    if (options.signal.aborted) controller.abort();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timedOut = new Promise<never>((_,reject) => { timer=setTimeout(()=>{controller.abort();reject(Error("timeout"));},options.timeoutMs ?? 18000); });
      const {claims, followUps} = groundAnswer(await Promise.race([options.generate(query,chunks,controller.signal),timedOut]),chunks,plan);
      if (!claims.length) return {...result,message:insufficient};
      status = "success";
      return {...result,claims,followUps,outcome:policy.kind === "qualified" ? "partial" : "answered",message:policy.message,
        coverage:policy.kind === "qualified" ? "Qualified evidence; limitations apply" : "Grounded synthesis; evidence shown"};
    } catch (cause) {
      status = cause instanceof SynthesisValidationError ? "validation_rejected" : "provider_error";
      return {...result,outcome:"unavailable",message:"The answer service could not complete this request. Retrieved evidence remains available. Please try again later.",coverage:"Retrieved evidence; generation unavailable"};
    } finally { clearTimeout(timer); options.signal.removeEventListener("abort",abort); }
  } finally {
    recordAskTelemetry({query,intent,evidenceIds,status,latencyMs:performance.now()-started},options.telemetry);
  }
}
