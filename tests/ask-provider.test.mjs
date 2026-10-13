import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {prepareEvidence} from '../src/features/ask-ladimus/evidence-packet.ts';
import {chunks,hints,skills,guards,guarded,output} from './ask-fixtures.mjs';
const p=prepareEvidence('Azure',chunks,hints.intents,skills,guards,guarded).packet;
// Load the real provider logic with isolated process/fetch dependencies. No live
// environment or API key is read and no network call occurs in these tests.
const source=ts.transpileModule(readFileSync('src/features/ask-ladimus/provider.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const load=(fetch,env={ASK_LADIMUS_API_KEY:'test-key',ASK_LADIMUS_MODEL:'test-model'})=>{const mod={exports:{}};new Function('require','module','exports','process','fetch',source)(()=>({}),mod,mod.exports,{env},fetch);return mod.exports;};
const response=value=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]}));
test('real provider sends active authored synthesis and an independent verdict-only request',async()=>{
 const requests=[],provider=load(async(url,init)=>{requests.push({url,init,body:JSON.parse(init.body)});return response(requests.length===1?output(p):{claims:[]});}),signal=new AbortController().signal;
 await provider.generateGroundedAnswer(p,signal);await provider.verifyGroundedAnswer(p,output(p).answer,signal);
 assert.equal(requests.length,2);assert.ok(requests.every(r=>r.init.signal===signal&&r.init.cache==='no-store'));
 const generation=requests[0].body,verification=requests[1].body;
 assert.equal(generation.max_completion_tokens,1700);assert.equal(verification.max_completion_tokens,1100);assert.equal(generation.response_format.type,'json_object');
 assert.deepEqual(JSON.parse(generation.messages[1].content),p);assert.ok(!generation.messages[1].content.includes('answer_candidates'));
 assert.match(generation.messages[0].content,/new prose/);assert.match(verification.messages[0].content,/independent factuality verifier/);
 assert.deepEqual(JSON.parse(verification.messages[1].content).evidence_packet,p);assert.deepEqual(JSON.parse(verification.messages[1].content).answer,output(p).answer);
 assert.ok(!JSON.stringify(requests.map(r=>r.body)).includes('test-key'));
});
test('provider response bytes, completion status, JSON and HTTPS configuration are bounded',async()=>{
 for(const fetch of [async()=>new Response('unavailable',{status:500}),async()=>new Response('x'.repeat(64001)),async()=>new Response('not json'),async()=>new Response(JSON.stringify({choices:[{finish_reason:'length',message:{content:'{}'}}]}))]) await assert.rejects(load(fetch).generateGroundedAnswer(p,new AbortController().signal));
 let calls=0;await assert.rejects(load(async()=>{calls++;return response({});},{ASK_LADIMUS_API_URL:'http://insecure.test'}).generateGroundedAnswer(p,new AbortController().signal));assert.equal(calls,0);
});

test('GPT-6 Luna uses supported low effort while unrelated models keep their request contract',async()=>{
 for(const model of ['gpt-6-luna','test-model']) {
  let body;const provider=load(async(_url,init)=>{body=JSON.parse(init.body);return response(output(p));},{ASK_LADIMUS_MODEL:model,ASK_LADIMUS_API_KEY:'test-key'});
  await provider.generateGroundedAnswer(p,new AbortController().signal);assert.equal(body.model,model);assert.equal(body.reasoning_effort,model==='gpt-6-luna'?'low':undefined);
 }
});
