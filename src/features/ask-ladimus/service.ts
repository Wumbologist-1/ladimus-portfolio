import type { AskResult, AskWireEvent, EvidenceChunk, RetrievalHint, Skill, ClaimGuards } from "./contracts.ts";
import { retrieveEvidence } from "./retrieval.ts";
import { insufficient, queryPolicy } from "./policy.ts";
import { groundSelection } from "./grounding.ts";

type Options = {
  chunks: EvidenceChunk[]; hints: RetrievalHint[]; skills: Skill[]; guards: ClaimGuards; guarded: Record<string,string>;
  configured: boolean; generate: (query:string,chunks:EvidenceChunk[],signal:AbortSignal) => Promise<unknown>;
  signal: AbortSignal; emit: (event:AskWireEvent) => void; timeoutMs?: number;
};
export async function answerQuery(query: string, options: Options): Promise<AskResult> {
  const policy = queryPolicy(query, options.guarded);
  const base: AskResult = {outcome:"no-evidence",message:insufficient,claims:[],evidence:[],coverage:"No supporting evidence",followUps:[]};
  if (policy.kind === "private") return {...base,outcome:"refused",message:policy.message};
  options.emit({type:"retrieval:start"});
  const chunks = retrieveEvidence(policy.kind === "unsupported" ? "Azure containers production" : query,options.chunks,options.hints,options.skills);
  const evidence = chunks.map(c => ({id:c.id,recordId:c.recordId,label:c.title,category:c.category,status:c.status,excerpt:c.facts.join("\n"),qualifiers:c.qualifiers}));
  options.emit({type:"retrieval:complete",evidence});
  const result = {...base,evidence,followUps:chunks.length ? ["How does Luis approach AI reliability?","What is the difference between production systems and prototypes?"] : []};
  if (policy.kind === "unsupported") return {...result,outcome:"partial",message:policy.message,coverage:"Requested technology unsupported; adjacent evidence only"};
  if (!chunks.length) return result;
  if (!options.configured) return {...result,outcome:"unavailable",message:policy.message || "Answer generation is currently unavailable. You can inspect the retrieved public evidence below.",coverage:"Retrieved evidence; no generated answer"};
  options.emit({type:"generation:start"});
  const controller = new AbortController();
  const abort = () => controller.abort(); options.signal.addEventListener("abort",abort,{once:true});
  if (options.signal.aborted) controller.abort();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timedOut = new Promise<never>((_,reject) => { timer=setTimeout(()=>{controller.abort();reject(Error("timeout"));},options.timeoutMs ?? 18000); });
    const claims = groundSelection(await Promise.race([options.generate(query,chunks,controller.signal),timedOut]),chunks);
    if (!claims.length) return {...result,message:insufficient};
    return {...result,claims,outcome:policy.kind === "qualified" ? "partial" : "answered",message:policy.message,
      coverage:policy.kind === "qualified" ? "Qualified evidence; limitations apply" : "Source-bound statements; evidence shown"};
  } catch {
    return {...result,outcome:"unavailable",message:"The answer service could not complete this request. Retrieved evidence remains available. Please try again later.",coverage:"Retrieved evidence; generation unavailable"};
  } finally { clearTimeout(timer); options.signal.removeEventListener("abort",abort); }
}
