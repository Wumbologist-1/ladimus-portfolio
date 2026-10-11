"use client";
import { useEffect, useRef, useState, useId } from "react";
import type { FormEvent } from "react";
import { suggestedQuestions } from "./contracts";
import type { AskResult, AskWireEvent, Evidence } from "./contracts";
import { emitIntelligence } from "@/features/living-interface/event-bridge";
import { LivingInterface } from "@/features/living-interface/living-interface";
import styles from "./ask.module.css";

type Phase="idle"|"understanding"|"retrieving"|"grounding"|"composing"|"complete"|"error";
const labels:Record<Phase,string>={idle:"Ready for a question",understanding:"Understanding · validating your question",retrieving:"Retrieving public evidence",grounding:"Grounding · evidence retrieved",composing:"Composing from approved statements",complete:"Response complete",error:"Request could not complete"};

export function AskConsole({compact=false}:{compact?:boolean}) {
  const id=useId(); const [query,setQuery]=useState("");const [submitted,setSubmitted]=useState("");
  const [phase,setPhase]=useState<Phase>("idle");const [evidence,setEvidence]=useState<Evidence[]>([]);
  const [result,setResult]=useState<AskResult|null>(null);const [error,setError]=useState("");
  const pending=useRef<AbortController|null>(null);
  const busy=["understanding","retrieving","grounding","composing"].includes(phase);
  useEffect(()=>()=>{pending.current?.abort();emitIntelligence({type:"response:error"});},[]);
  async function ask(question:string) {
    if(busy) return;
    const value=question.trim();if(value.length<3||value.length>600){setError("Enter a question between 3 and 600 characters.");return;}
    setQuery(value);setSubmitted(value);setError("");setResult(null);setEvidence([]);setPhase("understanding");
    emitIntelligence({type:"query:start"});
    const controller=new AbortController();pending.current=controller;
    const timeout=setTimeout(()=>controller.abort(),25000);
    let complete=false;
    try {
      const response=await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:value}),signal:controller.signal});
      if(!response.ok){const data=await response.json();throw Error(typeof data.error==="string" ? data.error : "The service is unavailable. Please try again later.");}
      const reader=response.body?.getReader();if(!reader) throw Error("The service could not return a response.");
      const decoder=new TextDecoder();let buffer="";
      const receive=(event:AskWireEvent)=>{
        switch(event.type){
          case "retrieval:start":setPhase("retrieving");emitIntelligence(event);break;
          case "retrieval:complete":setEvidence(event.evidence);setPhase("grounding");emitIntelligence({type:event.type,evidenceIds:event.evidence.map(e=>e.recordId)});break;
          case "generation:start":setPhase("composing");emitIntelligence(event);break;
          case "response:complete":complete=true;setResult(event.result);setEvidence(event.result.evidence);setPhase("complete");emitIntelligence({type:event.type,success:event.result.outcome==="answered",evidenceIds:event.result.evidence.map(e=>e.recordId)});break;
          case "response:error":throw Error(event.message);
        }
      };
      while(true){const {done,value:bytes}=await reader.read();if(done)break;buffer+=decoder.decode(bytes,{stream:true});if(buffer.length>100000)throw Error("The response exceeded its budget.");let end;while((end=buffer.indexOf("\n"))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);if(line)receive(JSON.parse(line));}}
      if(!complete)throw Error("The response was interrupted. Please try again.");
    } catch(cause){setPhase("error");setError(controller.signal.aborted ? "The request timed out. Please try again." : cause instanceof Error ? cause.message : "The service is unavailable.");emitIntelligence({type:"response:error"});}
    finally{clearTimeout(timeout);pending.current=null;}
  }
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();void ask(query);}
  return <div className={`${styles.console} ${compact ? styles.compact : ""}`} data-living-surface data-ask-phase={phase}>
    <LivingInterface identity="intelligence" />
    <div className={styles.consoleHead} data-topology-clear><span>Career Intelligence Interface</span><span>Evidence before confidence</span></div>
    <div className={styles.queryArea} data-topology-clear>
      <form onSubmit={submit} className={styles.form} aria-busy={busy}>
        <label htmlFor={`${id}-query`}>What would you like to know about Luis?</label>
        <textarea id={`${id}-query`} value={query} onChange={event=>setQuery(event.target.value)} maxLength={600} rows={2} placeholder="Ask about systems, decisions, or production experience…" required minLength={3} aria-describedby={`${id}-boundary`} />
        <div className={styles.formFoot}><p id={`${id}-boundary`}>Public evidence. Clear limits. Inspectable sources.</p><button type="submit" disabled={busy} data-field-reactive>{busy ? "Working…" : "Ask Ladimus"}<span aria-hidden="true">↗</span></button></div>
      </form>
      <div className={styles.suggestions} aria-label="Suggested questions">{suggestedQuestions.slice(0,compact?4:8).map(question=><button key={question} type="button" disabled={busy} onClick={()=>void ask(question)} data-field-reactive>{question}<span aria-hidden="true">↗</span></button>)}</div>
    </div>
    <div className={styles.phase} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{labels[phase]}{phase==="complete" && result ? ` · ${result.coverage}` : ""}</div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {phase!=="idle" && <div className={styles.responseGrid}>
      <section className={styles.answer} aria-label="Grounded response" aria-busy={busy} data-topology-clear>
        <p className={styles.label}>01 / Response</p><h3>{submitted}</h3>
        {busy && <p className={styles.waiting}>The answer will appear here. Evidence arrives directly from retrieval.</p>}
        {result?.message && <p className={styles.notice}>{result.message}</p>}
        {result && result.claims.length>0 && <><p className={styles.label}>Source-bound synthesis</p><ul className={styles.claims}>{result.claims.map((claim,index)=><li key={`${claim.evidenceId}-${index}`}>{claim.text}<a href={`#${id}-${claim.evidenceId}`} aria-label={`Evidence for statement ${index+1}`}>[{evidence.findIndex(e=>e.id===claim.evidenceId)+1}]</a></li>)}</ul></>}
        {result && <div className={styles.followUps}>{result.followUps.map(question=><button type="button" key={question} disabled={busy} onClick={()=>void ask(question)}>{question} →</button>)}</div>}
      </section>
      <section className={styles.sources} aria-label="Retrieved evidence" data-topology-clear><p className={styles.label}>02 / Evidence · {evidence.length} sources</p>
        {evidence.length===0 && <p className={styles.waiting}>{busy ? "Awaiting retrieval results." : "No supporting public records were returned."}</p>}
        {evidence.map((source,index)=><article id={`${id}-${source.id}`} key={source.id} className={styles.evidence} data-field-reactive><div className={styles.sourceHead}><span>[{index+1}] {source.category}</span><span>{source.status.replaceAll("_"," ")}</span></div><h4>{source.label}</h4><p className={styles.excerpt}>{source.excerpt}</p>{source.qualifiers.length>0 && <details><summary>Evidence limits</summary><ul>{source.qualifiers.map(q=><li key={q}>{q}</li>)}</ul></details>}</article>)}
      </section>
    </div>}
    <noscript>Interactive questions require JavaScript. Portfolio content and project evidence remain available through the navigation.</noscript>
  </div>;
}
