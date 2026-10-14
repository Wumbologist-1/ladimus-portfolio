import type { AskWireEvent, AskResult, Evidence } from "./contracts.ts";
import { askBudget } from "./budget.ts";

export type ClientFailure = "client_inactivity_timeout" | "client_absolute_timeout" | "user_abort" | "navigation_abort" | "stream_interrupted" | "http_429" | "http_503" | "malformed_stream" | "response_budget_exceeded";
const messages: Record<ClientFailure,string> = {
  client_inactivity_timeout:"The response stopped progressing. Please try again.",
  client_absolute_timeout:"The request took too long to complete. Please try again.",
  user_abort:"Request cancelled. You can ask again when ready.", navigation_abort:"Request cancelled by navigation.",
  stream_interrupted:"The response was interrupted. Please try again.",
  http_429:"Ask Ladimus is receiving several requests right now. Please wait a moment and try again.",
  http_503:"Ask Ladimus is temporarily busy. Please try again shortly.",
  malformed_stream:"The response could not be read. Please try again.",
  response_budget_exceeded:"The response exceeded its size limit. Please try again.",
};
export class ClientRequestError extends Error {
  code:ClientFailure; retryAfter?:number;
  constructor(code:ClientFailure,retryAfter?:number){super(messages[code]);this.code=code;if(retryAfter!==undefined)this.retryAfter=retryAfter;}
}
type Scheduler={set:(callback:()=>void,ms:number)=>unknown;clear:(handle:unknown)=>void};
const timers:Scheduler={set:(fn,ms)=>setTimeout(fn,ms),clear:handle=>clearTimeout(handle as ReturnType<typeof setTimeout>)};
export function createWatchdog(fail:(code:ClientFailure)=>void, scheduler:Scheduler=timers, absoluteMs:number=askBudget.clientMs, inactivityMs:number=askBudget.clientInactivityMs){
  let stopped=false;let inactivity:unknown;
  const stop=()=>{if(stopped)return;stopped=true;scheduler.clear(absolute);scheduler.clear(inactivity);};
  const expire=(code:ClientFailure)=>{stop();fail(code);};
  const absolute=scheduler.set(()=>expire("client_absolute_timeout"),absoluteMs);
  const progress=()=>{if(stopped)return;scheduler.clear(inactivity);inactivity=scheduler.set(()=>expire("client_inactivity_timeout"),inactivityMs);};
  progress();return {progress,stop};
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==="string");
const evidence=(v:unknown):v is Evidence[]=>Array.isArray(v)&&v.length<=5&&v.every(e=>object(e)&&["id","recordId","label","category","status","excerpt"].every(k=>typeof e[k]==="string")&&strings(e.qualifiers));
function result(v:unknown):v is AskResult {
  return object(v)&&["answered","partial","no-evidence","unavailable","refused"].includes(String(v.outcome))&&["paragraphs","list"].includes(String(v.style))&&typeof v.message==="string"&&typeof v.coverage==="string"&&strings(v.followUps)&&v.followUps.length<=3&&evidence(v.evidence)&&Array.isArray(v.claims)&&v.claims.length<=8&&v.claims.every(c=>object(c)&&typeof c.text==="string"&&c.text.length<=1800&&strings(c.evidence_ids)&&c.evidence_ids.length<=5&&["direct","synthesis","assessment","transferable","limitation","general_technology"].includes(String(c.kind)))&&(v.limitations===undefined||typeof v.limitations==="string");
}
export function parseWireEvent(line:string):AskWireEvent {
  let v:unknown;try{v=JSON.parse(line);}catch{throw new ClientRequestError("malformed_stream");}
  if(object(v)){
    const keys=Object.keys(v);
    if(["retrieval:start","generation:start","generation:complete","verification:start"].includes(String(v.type))&&keys.length===1)return v as AskWireEvent;
    if(v.type==="retrieval:complete"&&keys.every(k=>["type","evidence"].includes(k))&&evidence(v.evidence))return v as AskWireEvent;
    if(["grounding:complete","verification:complete"].includes(String(v.type))&&typeof v.supported==="boolean"&&keys.every(k=>["type","supported","code","atom","unit","technology"].includes(k))&&(v.code===undefined||typeof v.code==="string")&&(v.unit===undefined||Number.isInteger(v.unit))&&(v.atom===undefined||typeof v.atom==="string")&&(v.technology===undefined||typeof v.technology==="string"))return v as AskWireEvent;
    if(v.type==="response:complete"&&keys.every(k=>["type","result"].includes(k))&&result(v.result))return v as AskWireEvent;
    if(v.type==="response:error"&&keys.every(k=>["type","message"].includes(k))&&typeof v.message==="string"&&v.message.length<=500)return v as AskWireEvent;
  }
  throw new ClientRequestError("malformed_stream");
}
export async function consumeAskStream(body:ReadableStream<Uint8Array>,receive:(event:AskWireEvent)=>void,signal?:AbortSignal):Promise<void>{
  const reader=body.getReader();const decoder=new TextDecoder("utf-8",{fatal:true});let buffer="",size=0;
  let terminal=false;
  const abort=()=>{void reader.cancel().catch(()=>{});};
  signal?.addEventListener("abort",abort,{once:true});
  const checkAbort=()=>{if(signal?.aborted)throw signal.reason instanceof ClientRequestError?signal.reason:new ClientRequestError("navigation_abort");};
  const line=(text:string)=>{
    if(!text.trim())return;
    if(terminal)throw new ClientRequestError("malformed_stream");
    const event=parseWireEvent(text);checkAbort();
    if(event.type==="response:error")throw new ClientRequestError("stream_interrupted");
    receive(event);if(event.type==="response:complete")terminal=true;
  };
  try{
    checkAbort();
    while(true){
      let chunk:ReadableStreamReadResult<Uint8Array>;try{chunk=await reader.read();}catch{checkAbort();throw new ClientRequestError("stream_interrupted");}
      const {done,value}=chunk;checkAbort();
      if(done){buffer+=decoder.decode();if(buffer.trim())line(buffer);break;}
      size+=value.byteLength;if(size>100000)throw new ClientRequestError("response_budget_exceeded");
      buffer+=decoder.decode(value,{stream:true});let end:number;
      while((end=buffer.indexOf("\n"))>=0){line(buffer.slice(0,end));buffer=buffer.slice(end+1);}
      if(terminal){if(buffer.trim())line(buffer);void reader.cancel().catch(()=>{});break;}
    }
    if(!terminal)throw new ClientRequestError("stream_interrupted");
  }catch(cause){checkAbort();throw cause instanceof ClientRequestError?cause:new ClientRequestError("malformed_stream");}
  finally{signal?.removeEventListener("abort",abort);void reader.cancel().catch(()=>{});reader.releaseLock();}
}
export function allowBackdropClose(busy:boolean,targetIsBackdrop:boolean){return !busy&&targetIsBackdrop;}
export function startAskRequest(query:string,receive:(event:AskWireEvent)=>void,fetcher:typeof fetch=fetch){
  const controller=new AbortController();
  const cancel=(code:ClientFailure)=>{if(!controller.signal.aborted)controller.abort(new ClientRequestError(code));};
  const watchdog=createWatchdog(cancel);
  const done=(async()=>{
    try{
      const response=await fetcher("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query}),signal:controller.signal});
      if(controller.signal.aborted)throw controller.signal.reason;
      if(!response.ok){const seconds=Number(response.headers.get("Retry-After"));throw new ClientRequestError(response.status===429?"http_429":response.status===503?"http_503":"stream_interrupted",Number.isFinite(seconds)&&seconds>0?Math.min(300,Math.ceil(seconds)):undefined);}
      if(!response.body)throw new ClientRequestError("stream_interrupted");
      await consumeAskStream(response.body,event=>{watchdog.progress();receive(event);},controller.signal);
    }catch(cause){throw controller.signal.aborted?controller.signal.reason:cause instanceof ClientRequestError?cause:new ClientRequestError("stream_interrupted");}
    finally{watchdog.stop();}
  })();
  return {done,cancel};
}
export type AskRequest=ReturnType<typeof startAskRequest>;
