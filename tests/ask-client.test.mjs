import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {consumeAskStream,parseWireEvent,createWatchdog,startAskRequest,ClientRequestError,allowBackdropClose} from '../src/features/ask-ladimus/client-request.ts';
import {presentationIssue} from '../src/features/ask-ladimus/presentation.ts';
import {createLimiter} from '../src/features/ask-ladimus/limits.ts';
import {createAskHandler} from '../src/features/ask-ladimus/handler.ts';
import {retrieveEvidence} from '../src/features/ask-ladimus/retrieval.ts';
import {answerQuery} from '../src/features/ask-ladimus/service.ts';
import {options,output,verdict,chunks,hints,skills} from './ask-fixtures.mjs';
const end={type:'response:complete',result:{outcome:'answered',message:'',style:'paragraphs',claims:[{text:'Validation connects delivery to recovery.',kind:'synthesis',evidence_ids:['example--1']}],evidence:[{id:'example--1',recordId:'example',label:'Résumé',category:'system',status:'documented_experience',excerpt:'Public evidence.',qualifiers:[]}],coverage:'Public evidence',followUps:[]}};
const encoder=new TextEncoder();
const wire=e=>JSON.stringify(e);
function stream(parts){return new ReadableStream({start(c){for(const p of parts)c.enqueue(typeof p==='string'?encoder.encode(p):p);c.close();}});}
async function read(parts){const events=[];await consumeAskStream(stream(parts),e=>events.push(e));return events;}
for(const [name,parts] of [
 ['complete line',[wire(end)+'\n']],
 ['JSON split across chunks',[wire(end).slice(0,13),wire(end).slice(13,70),wire(end).slice(70)+'\n']],
 ['multiple lifecycle events buffered together',[wire({type:'retrieval:start'})+'\n'+wire({type:'generation:start'})+'\n'+wire(end)+'\n']],
 ['final record at EOF without newline',[wire(end)]],
 ['empty chunks',[new Uint8Array(),'',wire(end),'']],
])test('stream handles '+name,async()=>{assert.deepEqual((await read(parts)).at(-1),end);});
test('stream decodes a multibyte character split at every UTF-8 byte boundary',async()=>{
 const bytes=encoder.encode(wire(end));for(let at=0;at<bytes.length;at++)assert.deepEqual((await read([bytes.slice(0,at),bytes.slice(at)])).at(-1),end);
});
test('partial records never execute; final malformed data and invalid UTF-8 fail safely',async()=>{
 for(const parts of [['{"type":"response:complete"'],['{}'],['{"type":"heartbeat"}\n'],[new Uint8Array([0xc3])]]){
  let events=0;await assert.rejects(consumeAskStream(stream(parts),()=>events++),e=>e.code==='malformed_stream');assert.equal(events,0);
 }
});
test('EOF without a terminal result is interrupted, and response:error ends immediately',async()=>{
 await assert.rejects(read([wire({type:'generation:start'})+'\n']),e=>e.code==='stream_interrupted');
 let cancelled=false;const body=new ReadableStream({start(c){c.enqueue(encoder.encode(wire({type:'response:error',message:'Unavailable'})+'\n'));},cancel(){cancelled=true;}});
 await assert.rejects(consumeAskStream(body,()=>assert.fail()),e=>e.code==='stream_interrupted');assert.equal(cancelled,true);
});
test('underlying connection failures are interrupted rather than malformed JSON',async()=>{
 await assert.rejects(consumeAskStream(new ReadableStream({start(c){c.error(new TypeError('Network disconnected'));}}),()=>{}),e=>e.code==='stream_interrupted');
});
test('stream enforces a total byte budget even across small valid chunks',async()=>{
 await assert.rejects(read([' '.repeat(50001),' '.repeat(50001)]),e=>e.code==='response_budget_exceeded');
});
test('event validation rejects plausible names with invalid required payloads',()=>{
 for(const v of [{type:'generation:start',heartbeat:true},{type:'retrieval:complete',evidence:[{}]},{type:'verification:complete',supported:'yes'},{type:'response:complete',result:{}},{type:'response:error',message:42}])assert.throws(()=>parseWireEvent(wire(v)),e=>e.code==='malformed_stream');
});
function clock(){let now=0,next=0;const tasks=new Map();return{set(fn,ms){const id=++next;tasks.set(id,{fn,at:now+ms});return id;},clear(id){tasks.delete(id);},advance(ms){const to=now+ms;while(true){const due=[...tasks].filter(([,t])=>t.at<=to).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;now=due[1].at;tasks.delete(due[0]);due[1].fn();}now=to;},get count(){return tasks.size;}};}
test('inactivity fires without valid progress and clears every timer',()=>{const c=clock(),fail=[];createWatchdog(code=>fail.push(code),c);c.advance(14999);assert.deepEqual(fail,[]);c.advance(1);assert.deepEqual(fail,['client_inactivity_timeout']);assert.equal(c.count,0);});
test('real progress survives long pauses beyond the former client cliff but absolute ceiling remains fixed',()=>{
 const c=clock(),fail=[];const w=createWatchdog(code=>fail.push(code),c);
 for(let i=0;i<3;i++){c.advance(14000);w.progress();assert.deepEqual(fail,[]);}
 c.advance(2999);assert.deepEqual(fail,[]);c.advance(1);assert.deepEqual(fail,['client_absolute_timeout']);assert.equal(c.count,0);
});
test('watchdog cleanup is idempotent and ignores later progress',()=>{const c=clock();const w=createWatchdog(()=>assert.fail(),c);w.stop();w.stop();w.progress();assert.equal(c.count,0);c.advance(100000);});
test('buffer bytes and blank lines cannot reset the inactivity watchdog',async()=>{
 const c=clock(),abort=new AbortController();let controller;
 const w=createWatchdog(code=>abort.abort(new ClientRequestError(code)),c);
 const promise=consumeAskStream(new ReadableStream({start(s){controller=s;}}),()=>w.progress(),abort.signal);
 controller.enqueue(encoder.encode('\n{"type":'));await Promise.resolve();c.advance(15000);
 await assert.rejects(promise,e=>e.code==='client_inactivity_timeout');assert.equal(c.count,0);
});
test('valid events reset inactivity across long pauses and a final EOF response',async()=>{
 const c=clock(),abort=new AbortController();let controller;
 const w=createWatchdog(code=>abort.abort(new ClientRequestError(code)),c);
 const promise=consumeAskStream(new ReadableStream({start(s){controller=s;}}),()=>w.progress(),abort.signal);
 c.advance(14000);controller.enqueue(encoder.encode(wire({type:'generation:start'})+'\n'));await new Promise(resolve=>setImmediate(resolve));
 c.advance(14000);controller.enqueue(encoder.encode(wire(end)));controller.close();await promise;w.stop();assert.equal(abort.signal.aborted,false);assert.equal(c.count,0);
});
for(const reason of ['user_abort','navigation_abort'])test('intentional '+reason+' cancels a stalled reader cleanly',async()=>{
 let calls=0;const request=startAskRequest('Azure',()=>{},async(_url,init)=>{calls++;assert.equal(init.method,'POST');return new Response(new ReadableStream());});
 await Promise.resolve();request.cancel(reason);await assert.rejects(request.done,e=>e.code===reason);assert.equal(calls,1);
});
test('busy backdrop remains open while explicit cancellation remains available',()=>{
 assert.equal(allowBackdropClose(true,true),false);assert.equal(allowBackdropClose(false,true),true);assert.equal(allowBackdropClose(false,false),false);
 const launcher=readFileSync('src/features/ask-ladimus/ask-launcher.tsx','utf8');assert.match(launcher,/request.current\?\.cancel\(reason\)/);assert.match(launcher,/close\("navigation_abort"\)/);assert.match(launcher,/onCancel/);
 const ui=readFileSync('src/features/ask-ladimus/ask-console.tsx','utf8');assert.match(ui,/if\(pending.current\|\|busy/);assert.match(ui,/cancel\("navigation_abort"\)/);assert.ok(!ui.includes('visibilitychange'));assert.ok(!launcher.includes('visibilitychange'));
});
for(const status of [429,503])test('HTTP '+status+' preserves Retry-After and never automatically retries',async()=>{
 let calls=0;const r=startAskRequest('Azure',()=>assert.fail(),async()=>{calls++;return new Response('private body must not be rendered',{status,headers:{'Retry-After':'60'}});});
 await assert.rejects(r.done,e=>e.code==='http_'+status&&e.retryAfter===60&&e.message.includes(status===429?'several requests':'temporarily busy')&&!e.message.includes('private'));assert.equal(calls,1);
});
test('shared NAT desktop/iOS/Android requests remain bounded at eight, with conservative alternatives evaluated',()=>{
 for(const limit of [8,10,12]){const limiter=createLimiter(limit);for(let i=0;i<limit;i++)assert.equal(limiter.take('shared-nat',1000),0);assert.equal(limiter.take('shared-nat',2000),59);assert.equal(limiter.take('shared-nat',61000),0);}
 const limiter=createLimiter();for(const device of ['desktop','ios','android'])for(let i=0;i<2;i++)assert.equal(limiter.take('shared-nat',1000),0,device);assert.equal(limiter.take('shared-nat',1000),0);assert.equal(limiter.take('shared-nat',1000),0);assert.equal(limiter.take('shared-nat',1000),60);
});
test('429 handler includes retry guidance and safe classification without reading rejected body',async()=>{
 const logs=[];const post=createAskHandler(()=>options(),{record:e=>logs.push(e)});
 for(let i=0;i<8;i++){const r=await post(new Request('https://test.local/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'Azure'})}));await r.text();}
 let parsed=false;const req=new Request('https://test.local/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:'secret'});Object.defineProperty(req,'body',{get(){parsed=true;throw Error('must not parse');}});
 const r=await post(req);assert.equal(r.status,429);assert.ok(Number(r.headers.get('Retry-After'))>0);assert.equal(parsed,false);assert.equal(logs.at(-1).failure,'http_429');assert.equal(logs.at(-1).status,'rate_limited');assert.ok(!JSON.stringify(logs).includes('secret'));
});
for(const bad of ['system-pr-assistant--5','project-ladimus-review--3','employment-romtech-devops-2026--1','a--123456','**bold**','__bold__','# Heading','## Heading','```code```','[link](https://example.org)','[1]','[source]','Evidence-derived assessment: The strongest case','Direct evidence: Luis','Grounded synthesis: Text','Synthesis: Text'])test('prose rejects '+bad,()=>assert.ok(presentationIssue(bad)));
test('natural limitations and engineering terms remain plain prose',()=>{for(const good of ['The evidence does not establish professional Pulumi experience.','CI/CD links validation to delivery.','C# is a programming language.','The strongest case follows from documented safeguards.'])assert.equal(presentationIssue(good),null);});
test('artifact rejection uses bounded correction followed by independent verification, never stripping prose',async()=>{
 for(const bad of ['system-azure-environments--1','**Release validation**','Evidence-derived assessment: Release validation']){
  let generations=0,verifications=0,correction;
  const result=await answerQuery('Azure',options({generate:async(p,_s,c)=>{generations++;correction=c;const draft=output(p);if(generations===1)draft.answer[0].text=bad;return draft;},verify:async(p,c)=>{verifications++;return verdict(p,c);}}));
  assert.equal(result.outcome,'answered');assert.equal(generations,2);assert.equal(verifications,1);assert.equal(correction.code,presentationIssue(bad));assert.ok(result.claims.every(c=>presentationIssue(c.text)===null));
 }
});
test('exact evaluative presentation regressions return clean authored prose after correction',async()=>{
 for(const query of [
  'What is the strongest argument for hiring Luis into an AI Engineering role instead of a traditional DevOps role, and what evidence keeps that argument honest rather than overstated?',
  'Across Luis’s work, where does he appear strongest technically, and where is the evidence thinner?',
  'If you had to explain Luis’s engineering philosophy to a staff engineer in three themes, what would they be, and which systems best demonstrate each one?',
 ]){
  let calls=0,verified=0;
  const result=await answerQuery(query,options({generate:async(p)=>{calls++;return {...output(p),answer:[{text:calls===1?'**Evidence-derived assessment:** '+p.items[0].id:'The documented safeguards support a bounded assessment of engineering judgment; broader claims need further evidence.',kind:'assessment',evidence_ids:[p.items[0].id]}]};},verify:async(p,c)=>{verified++;return verdict(p,c);}}));
  assert.equal(result.outcome,'answered',query);assert.equal(calls,2);assert.equal(verified,1);assert.ok(result.claims.every(c=>presentationIssue(c.text)===null));
 }
});
test('busy 503 rejects the body and logs only a coarse HTTP classification',async()=>{
 const releases=[],logs=[];
 const post=createAskHandler(()=>options({generate:p=>new Promise(resolve=>releases.push(()=>resolve(output(p))))}),{record:e=>logs.push(e)});
 const responses=[];for(let i=0;i<3;i++)responses.push(await post(new Request('https://test.local/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'Azure'})})));
 let read=false;const req=new Request('https://test.local/api/ask',{method:'POST',body:'private'});Object.defineProperty(req,'body',{get(){read=true;throw Error('unread');}});
 const busy=await post(req);assert.equal(busy.status,503);assert.equal(busy.headers.get('Retry-After'),'10');assert.equal(read,false);assert.equal(logs.at(-1).failure,'http_503');assert.equal(logs.at(-1).status,'service_busy');
 releases.forEach(release=>release());await Promise.all(responses.map(response=>response.text()));
});
test('valid terminal response completes even if transport cancellation cannot finish',async()=>{
 const body=new ReadableStream({start(c){c.enqueue(encoder.encode(wire(end)+'\n'));},cancel(){return new Promise(()=>{});}});
 const events=[];await consumeAskStream(body,e=>events.push(e));assert.deepEqual(events,[end]);
});
test('varied thematic questions prefer multiple concrete system sources without one-query overfitting',()=>{
 for(const q of ["Explain Luis's engineering philosophy in three themes and the systems demonstrating them.",'How do his AI systems use deterministic controls and human approval?','What evidence demonstrates provenance and fail-closed AI reliability?']){
  const records=retrieveEvidence(q,chunks,hints.intents,skills);assert.ok(records.filter(c=>['system','project'].includes(c.category)).length>=3,q);assert.ok(records.some(c=>/pr-assistant|ai-code-gating|android-test-agent|ladimus-review/.test(c.recordId)),q);assert.ok(new Set(records.map(c=>c.recordId)).size>=3);
 }
});
test('broad philosophy retrieval retains complementary concrete AI mechanisms instead of lexical tie winners',()=>{
 for(const query of ['Explain his engineering philosophy through themes and concrete systems.', 'If you had to explain Luis’s engineering philosophy to a staff engineer in three themes, what would they be, and which systems best demonstrate each one?']){
  const selected=retrieveEvidence(query,chunks,hints.intents,skills);
  for(const record of ['system-pr-assistant','system-ai-code-gating','system-android-test-agent','project-ladimus-review'])assert.ok(selected.some(c=>c.recordId===record),record);
  assert.ok(!selected.some(c=>c.category==='profile'||c.category==='employment'));
 }
});
