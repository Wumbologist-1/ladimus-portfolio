"use client";
import { useEffect, useRef, useState, useId } from "react";
import type { FormEvent } from "react";
import { suggestedQuestions } from "./contracts";
import type { AskResult, AskWireEvent, Evidence } from "./contracts";
import { emitIntelligence } from "@/features/living-interface/event-bridge";
import { LivingInterface } from "@/features/living-interface/living-interface";
import styles from "./ask.module.css";
import { AnswerPassages } from "./answer-passages";
import { startAskRequest, ClientRequestError } from "./client-request";
import type { AskRequest, ClientFailure } from "./client-request";

type Phase="idle"|"understanding"|"retrieving"|"grounding"|"synthesizing"|"verifying"|"complete"|"error";
const labels:Record<Phase,string>={idle:"Ready for a question",understanding:"Understanding · validating your question",retrieving:"Retrieving public evidence",grounding:"Grounding · evidence retrieved",synthesizing:"Synthesizing",verifying:"Verifying claims",complete:"Response complete",error:"Request could not complete"};

export function AskConsole({compact=false,onBusyChange,onRequestChange}:{compact?:boolean;onBusyChange?:(busy:boolean)=>void;onRequestChange?:(request:AskRequest|null)=>void}) {
  const id=useId(); const [query,setQuery]=useState("");const [submitted,setSubmitted]=useState("");
  const [phase,setPhase]=useState<Phase>("idle");const [evidence,setEvidence]=useState<Evidence[]>([]);
  const [result,setResult]=useState<AskResult|null>(null);const [error,setError]=useState("");
  const pending=useRef<AskRequest|null>(null);
  const [failure,setFailure]=useState<ClientFailure|null>(null);const [retryAt,setRetryAt]=useState(0);const [retrySeconds,setRetrySeconds]=useState(0);
  const mounted=useRef(true);
  useEffect(()=>{if(!retryAt)return;const timer=setInterval(()=>{const remaining=Math.max(0,Math.ceil((retryAt-Date.now())/1000));setRetrySeconds(remaining);if(!remaining)clearInterval(timer);},1000);return()=>clearInterval(timer);},[retryAt]);
  const busy=["understanding","retrieving","grounding","synthesizing","verifying"].includes(phase);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;pending.current?.cancel("navigation_abort");emitIntelligence({type:"response:error"});};},[]);
  async function ask(question:string) {
    if(pending.current||busy||Date.now()<retryAt) return;
    const value=question.trim();if(value.length<3||value.length>600){setError("Enter a question between 3 and 600 characters.");return;}
    setFailure(null);setRetryAt(0);setRetrySeconds(0);setQuery(value);setSubmitted(value);setError("");setResult(null);setEvidence([]);setPhase("understanding");
    emitIntelligence({type:"query:start"});
    try {
      const receive=(event:AskWireEvent)=>{
        switch(event.type){
          case "retrieval:start":setPhase("retrieving");emitIntelligence(event);break;
          case "retrieval:complete":setEvidence(event.evidence);setPhase("grounding");emitIntelligence({type:event.type,evidenceIds:event.evidence.map(e=>e.recordId)});break;
          case "generation:start":setPhase("synthesizing");emitIntelligence(event);break;
          case "generation:complete":setPhase("grounding");break;
          case "grounding:complete":setPhase("grounding");break;
          case "verification:start":setPhase("verifying");emitIntelligence(event);break;
          case "verification:complete":break;
          case "response:complete":setResult(event.result);setEvidence(event.result.evidence);setPhase("complete");emitIntelligence({type:event.type,success:event.result.outcome==="answered"||event.result.outcome==="partial",evidenceIds:event.result.evidence.map(e=>e.recordId)});break;
          case "response:error":throw Error(event.message);
        }
      };
      const request=startAskRequest(value,receive);pending.current=request;onRequestChange?.(request);onBusyChange?.(true);
      await request.done;
    } catch(cause){if(mounted.current){const failure=cause instanceof ClientRequestError?cause:new ClientRequestError("stream_interrupted");setPhase("error");setFailure(failure.code);setError(failure.message);if(failure.retryAfter){setRetryAt(Date.now()+failure.retryAfter*1000);setRetrySeconds(failure.retryAfter);}emitIntelligence({type:"response:error"});}}
    finally{pending.current=null;if(mounted.current){onRequestChange?.(null);onBusyChange?.(false);}}
  }
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();void ask(query);}
  return <div className={`${styles.console} ${compact ? styles.compact : ""}`} data-living-surface data-ask-phase={phase} data-ask-failure={failure??undefined}>
    <LivingInterface identity="intelligence" />
    <div className={styles.consoleHead} data-topology-clear><span>Career Intelligence Interface</span><span>Evidence before confidence</span></div>
    <div className={styles.queryArea} data-topology-clear>
      <form onSubmit={submit} className={styles.form} aria-busy={busy}>
        <label htmlFor={`${id}-query`}>What would you like to know about Luis?</label>
        <textarea id={`${id}-query`} value={query} onChange={event=>setQuery(event.target.value)} maxLength={600} rows={2} placeholder="Ask about systems, decisions, or production experience…" required minLength={3} aria-describedby={`${id}-boundary ${id}-privacy`} />
        <div className={styles.formFoot}><p id={`${id}-boundary`}>Public evidence. Clear limits. Inspectable sources.</p><button type="submit" disabled={busy||retrySeconds>0} data-field-reactive>{busy ? "Working…" : retrySeconds>0 ? `Wait ${retrySeconds}s` : "Ask Ladimus"}<span aria-hidden="true">↗</span></button></div>
      </form>
      <p id={`${id}-privacy`} className={styles.disclosure}>Questions may be logged after privacy redaction to improve Ask Ladimus and understand visitor interests. No visitor identifiers are included. Please avoid sharing personal details or secrets.</p>
      <div className={styles.suggestions} aria-label="Suggested questions">{suggestedQuestions.slice(0,compact?4:8).map(question=><button key={question} type="button" disabled={busy||retrySeconds>0} onClick={()=>void ask(question)} data-field-reactive>{question}<span aria-hidden="true">↗</span></button>)}</div>
    </div>
    <div className={styles.phase} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{failure==="http_429"?"Waiting before the next request":labels[phase]}{phase==="complete" && result ? ` · ${result.coverage}` : ""}</div>
    {busy && <button type="button" className={styles.requestAction} onClick={()=>pending.current?.cancel("user_abort")}>Cancel request</button>}
    {error && <div className={styles.error} role="alert"><p>{error}</p>{failure!=="navigation_abort" && <button type="button" className={styles.requestAction} disabled={busy||retrySeconds>0} onClick={()=>void ask(submitted)}>{retrySeconds>0?`Try again in ${retrySeconds}s`:"Try again"}</button>}</div>}
    {phase!=="idle" && <div className={styles.responseGrid}>
      <section className={styles.answer} aria-label="Grounded response" aria-busy={busy} data-topology-clear>
        <p className={styles.label}>01 / Response</p><h3>{submitted}</h3>
        {busy && <p className={styles.waiting}>The answer will appear here. Evidence arrives directly from retrieval.</p>}
        {result?.message && <p className={styles.notice}>{result.message}</p>}
        {result && result.claims.length>0 && <><p className={styles.label}>Grounded synthesis</p><div className={styles.claims}>
          <AnswerPassages claims={result.claims} style={result.style} evidence={evidence} id={id} />
        </div></>}
        {result?.limitations && <p className={styles.notice}>{result.limitations}</p>}
        {result && <div className={styles.followUps}>{result.followUps.map(question=><button type="button" key={question} disabled={busy||retrySeconds>0} onClick={()=>void ask(question)}>{question} →</button>)}</div>}
      </section>
      <section className={styles.sources} aria-label="Retrieved evidence" data-topology-clear><p className={styles.label}>02 / Evidence · {evidence.length} sources</p>
        {evidence.length===0 && <p className={styles.waiting}>{busy ? "Awaiting retrieval results." : "No supporting public records were returned."}</p>}
        {evidence.map((source,index)=><article id={`${id}-${source.id}`} key={source.id} className={styles.evidence} data-field-reactive><div className={styles.sourceHead}><span>[{index+1}] {source.category}</span><span>{source.status.replaceAll("_"," ")}</span></div><h4>{source.label}</h4><p className={styles.excerpt}>{source.excerpt}</p>{source.qualifiers.length>0 && <details><summary>Evidence limits</summary><ul>{source.qualifiers.map(q=><li key={q}>{q}</li>)}</ul></details>}</article>)}
      </section>
    </div>}
    <noscript>Interactive questions require JavaScript. Portfolio content and project evidence remain available through the navigation.</noscript>
  </div>;
}
