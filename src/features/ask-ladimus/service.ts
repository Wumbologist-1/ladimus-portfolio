import type { AskResult, AskWireEvent, EvidenceChunk, RetrievalHint, Skill, ClaimGuards, EvidencePacket, AnswerClaim, SynthesisCorrection } from "./contracts.ts";
import { insufficient, queryPolicy } from "./policy.ts";
import { prepareEvidence } from "./evidence-packet.ts";
import { parseAnswer, validateGrounding, verifyVerdict, SynthesisValidationError } from "./grounding.ts";
import { synthesisIntent } from "./synthesis.ts";
import { recordAskTelemetry } from "./telemetry.ts";
import type { AskTelemetryProvider, AskTelemetryStatus, AskTelemetryStage } from "./telemetry.ts";

type Options = {
  chunks:EvidenceChunk[]; hints:RetrievalHint[]; skills:Skill[]; guards:ClaimGuards; guarded:Record<string,string>;
  configured:boolean; generate:(packet:EvidencePacket,signal:AbortSignal,correction?:SynthesisCorrection)=>Promise<unknown>;
  verify:(packet:EvidencePacket,claims:AnswerClaim[],signal:AbortSignal)=>Promise<unknown>;
  signal:AbortSignal; emit:(event:AskWireEvent)=>void; timeoutMs?:number; telemetry?:AskTelemetryProvider|undefined;
};
export async function answerQuery(query:string,options:Options):Promise<AskResult> {
  const started=performance.now();
  let status:AskTelemetryStatus="no_evidence", intent=synthesisIntent(query), evidenceIds:string[]=[];
  const log=(stage:AskTelemetryStage)=>recordAskTelemetry({query,intent,evidenceIds,status,stage,latencyMs:performance.now()-started},options.telemetry);
  try {
    const policy=queryPolicy(query,options.guarded);
    const base:AskResult={outcome:"no-evidence",message:insufficient,claims:[],style:"paragraphs",evidence:[],coverage:"No supporting evidence",followUps:[]};
    if(policy.kind==="private") {intent="private";log("policy_refusal");return {...base,outcome:"refused",message:policy.message};}
    options.emit({type:"retrieval:start"});
    const {chunks,packet,gap}=prepareEvidence(query,options.chunks,options.hints,options.skills,options.guards,options.guarded);
    if(gap) intent="capability_gap";
    const evidence=chunks.map(c=>({id:c.id,recordId:c.recordId,label:c.title,category:c.category,status:c.status,excerpt:c.facts.join("\n"),qualifiers:c.qualifiers}));
    evidenceIds=evidence.map(e=>e.id);
    options.emit({type:"retrieval:complete",evidence});
    const result={...base,evidence};
    if(!chunks.length) {log("retrieval_only");return result;}
    if(!options.configured) {status="generation_unavailable";log("retrieval_only");return {...result,outcome:"unavailable",message:"Answer generation is currently unavailable. You can inspect the retrieved public evidence below.",coverage:"Retrieved evidence; no generated answer"};}
    const controller=new AbortController();
    let stop:((reason:Error)=>void)|undefined;
    const cancelled=new Promise<never>((_,reject)=>{stop=reject;});
    const abort=()=>{controller.abort();stop?.(Error("cancelled"));};
    options.signal.addEventListener("abort",abort,{once:true});
    if(options.signal.aborted) abort();
    const timer=setTimeout(()=>{controller.abort();stop?.(Error("timeout"));},Math.max(1,Math.min(18000,options.timeoutMs??18000)));
    const bounded=<T>(work:()=>Promise<T>)=>Promise.race([controller.signal.aborted?Promise.reject(Error("cancelled")):work(),cancelled]);
    let correction:SynthesisCorrection|undefined, verifying=false;
    let draft:AnswerClaim[]|undefined;
    try {
      for(let attempt=0;attempt<2;attempt++) {
        draft=undefined;
        if(attempt) log("corrective_generation");
        options.emit({type:"generation:start"});log("generation_started");
        const output=await bounded(()=>options.generate(packet,controller.signal,correction));
        options.emit({type:"generation:complete"});log("generation_completed");
        try {
          const answer=parseAnswer(output,packet);
          draft=answer.claims;
          validateGrounding(answer.claims,packet);
          options.emit({type:"grounding:complete",supported:true});
          verifying=true;options.emit({type:"verification:start"});
          verifyVerdict(await bounded(()=>options.verify(packet,answer.claims,controller.signal)),answer.claims);
          status="success";log("verification_passed");options.emit({type:"verification:complete",supported:true});
          return {...result,...answer,outcome:gap||packet.unsupported_requirements.length?"partial":"answered",message:"",coverage:"Verified synthesis; evidence shown",...(gap?{mode:"capability_gap" as const}:{})};
        } catch(cause) {
          if(!verifying && cause instanceof SynthesisValidationError) options.emit({type:"grounding:complete",supported:false,code:cause.code,...(cause.atom?{atom:cause.atom}:{}),...(cause.technology?{technology:cause.technology}:{}),...(cause.unit!==undefined?{unit:cause.unit}:{})});
          if(verifying) {status=cause instanceof SynthesisValidationError?"validation_rejected":"provider_error";log("verification_failed");options.emit({type:"verification:complete",supported:false});}
          verifying=false;
          if(!(cause instanceof SynthesisValidationError)) throw cause;
          status="validation_rejected";
          // Corrections contain bounded server codes and structurally parsed
          // units. Draft text never reaches telemetry or the visitor.
          correction={code:cause.code,...(cause.unit!==undefined?{unit:cause.unit}:{}),...(cause.atom?{numeric_atom:cause.atom}:{}),...(cause.technology?{technology:cause.technology}:{}),...(draft?{rejected_answer:draft}:{})};
          if(attempt===1) throw cause;
        }
      }
      throw Error("Unreachable");
    } catch(cause) {
      status=cause instanceof SynthesisValidationError?"validation_rejected":"provider_error";
      return {...result,outcome:"unavailable",message:status==="validation_rejected"?"The generated answer could not be verified. Retrieved evidence remains available.":"Answer generation or verification is currently unavailable. Retrieved evidence remains available. Please try again later.",coverage:"Retrieved evidence; no verified answer"};
    } finally {clearTimeout(timer);options.signal.removeEventListener("abort",abort);controller.abort();}
  } finally {log("answer_completed");}
}
