import { createLimiter } from "./limits.ts";
import { parseQuery } from "./policy.ts";
import { answerQuery } from "./service.ts";
import type { AskWireEvent } from "./contracts.ts";
import { recordAskTelemetry } from "./telemetry.ts";
import type { AskTelemetryProvider } from "./telemetry.ts";

type ServiceOptions = Omit<Parameters<typeof answerQuery>[1],"emit" | "signal">;
export function createAskHandler(options: () => ServiceOptions, telemetry?: AskTelemetryProvider) {
  const limiter = createLimiter(); let active = 0;
  return async function POST(request:Request) {
    const error = (message:string,status:number,retry?:number) => Response.json({error:message},{status,headers:{"Cache-Control":"no-store",...(retry ? {"Retry-After":String(retry)} : {})}});
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return error("This request must come from the portfolio.",403);
    // On Vercel use the platform's overwritten IP header, never caller-supplied x-forwarded-for.
    const key = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "local";
    const retry = limiter.take(key);
    if (retry) {
      // Do not parse an attacker-controlled body after the rate limit is hit.
      recordAskTelemetry({query:"",intent:"rate_limited",evidenceIds:[],status:"rate_limited",failure:"http_429",latencyMs:0},telemetry);
      return error("Please wait before asking another question.",429,retry);
    }
    if (active >= 3) {recordAskTelemetry({query:"",intent:"career",evidenceIds:[],status:"service_busy",failure:"http_503",latencyMs:0},telemetry);return error("The answer service is busy. Please try again shortly.",503,10);}
    if (!request.headers.get("content-type")?.includes("application/json")) return error("Use a JSON question.",400);
    if (Number(request.headers.get("content-length")) > 4096) return error("Please shorten your question.",413);
    let query:string|null;
    try {
      const reader=request.body?.getReader(); if (!reader) return error("Enter a career question.",400);
      const parts:Uint8Array[]=[]; let size=0;
      while (true) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>4096){await reader.cancel();return error("Please shorten your question.",413);} parts.push(value); }
      const bytes=new Uint8Array(size); let offset=0; for(const part of parts){bytes.set(part,offset);offset+=part.length;}
      query=parseQuery(JSON.parse(new TextDecoder().decode(bytes)));
    } catch { return error("That question could not be read. Please try again.",400); }
    if (!query) return error("Enter a question between 3 and 600 characters.",400);
    let config:ServiceOptions; try {config=options();} catch {recordAskTelemetry({query:"",intent:"career",evidenceIds:[],status:"service_busy",failure:"http_503",latencyMs:0},telemetry);return error("Public evidence is temporarily unavailable.",503);}
    active++;
    const abort=new AbortController(); const cancel=()=>abort.abort(); request.signal.addEventListener("abort",cancel,{once:true});
    const stream=new ReadableStream({
      async start(controller) {
        const emit=(event:AskWireEvent)=>{if(!abort.signal.aborted) controller.enqueue(new TextEncoder().encode(JSON.stringify(event)+"\n"));};
        try { const result=await answerQuery(query!,{...config,telemetry:config.telemetry ?? telemetry,signal:abort.signal,emit}); emit({type:"response:complete",result}); }
        catch { emit({type:"response:error",message:"Public evidence is temporarily unavailable. Please try again later."}); }
        finally {active--;request.signal.removeEventListener("abort",cancel);if(!abort.signal.aborted) controller.close();}
      }, cancel(){abort.abort();},
    });
    return new Response(stream,{headers:{"Content-Type":"application/x-ndjson","Cache-Control":"no-store, no-transform","X-Content-Type-Options":"nosniff"}});
  };
}
