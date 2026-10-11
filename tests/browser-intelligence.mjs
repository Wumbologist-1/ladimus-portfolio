// Use a public production URL for release acceptance. Local URLs are allowed
// only for internal pre-release QA via ALLOW_LOCAL_QA=1.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.PORTFOLIO_URL;
assert.ok(origin && (/^https:\/\//.test(origin)||process.env.ALLOW_LOCAL_QA==='1'));
const endpoint=process.env.BROWSER_CDP||'http://127.0.0.1:9224';
const directory=process.env.ARTIFACT_DIR||'scratch/v06-qa';await mkdir(directory,{recursive:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let target;for(let i=0;i<50&&!target;i++){try{target=await(await fetch(`${endpoint}/json/new?about:blank`,{method:'PUT'})).json();}catch{await wait(200);}}
assert.ok(target,'Browser endpoint available');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let serial=0;const pending=new Map(),errors=[],results=[];
ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);const p=pending.get(m.id);if(p){pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++serial,{resolve,reject});ws.send(JSON.stringify({id:serial,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
const until=async expression=>{for(let i=0;i<100;i++){if(await evaluate(`Boolean(${expression})`))return;await wait(100);}throw Error(`Timeout: ${expression}`);};
const navigate=async path=>{await send('Page.navigate',{url:origin+path});await until('document.querySelector("h1")');await wait(700);};
const viewport=(width,height)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
const click=async selector=>{const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});};
const screenshot=async name=>{const {data}=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${name}.png`,Buffer.from(data,'base64'));};
const fillQuestion=question=>evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,${JSON.stringify(question)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
await send('Page.enable');await send('Runtime.enable');
await send('Page.addScriptToEvaluateOnNewDocument',{source:`
window.__draws=0;window.__cost=[];window.__commits=0;window.__pendingFrames=new Set();window.__shifts=0;window.__signals=0;
const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...a){__draws++;return clear.apply(this,a)};
const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...a){if(this.lineWidth===2)__signals++;return stroke.apply(this,a)};
const raf=requestAnimationFrame,cancel=cancelAnimationFrame;window.requestAnimationFrame=function(cb){let id=raf.call(window,t=>{__pendingFrames.delete(id);const start=performance.now(),before=__draws;cb(t);if(__draws>before)__cost.push(performance.now()-start)});__pendingFrames.add(id);return id};window.cancelAnimationFrame=function(id){__pendingFrames.delete(id);return cancel.call(window,id)};
window.__REACT_DEVTOOLS_GLOBAL_HOOK__={supportsFiber:true,inject:()=>1,onCommitFiberRoot:()=>__commits++,onCommitFiberUnmount:()=>{}};
new PerformanceObserver(list=>{for(const item of list.getEntries())if(!item.hadRecentInput)__shifts+=item.value}).observe({type:'layout-shift',buffered:true});
`});
try{
 for(const path of ['/','/work','/projects/ladimus-review','/ask'])for(const [width,height] of [[320,800],[375,812],[390,844],[430,932],[768,1024],[1440,1000],[1920,1080]]){
  await viewport(width,height);await navigate(path);
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false,`${path} ${width}`);
  assert.ok(await evaluate('document.body.textContent.includes("0.6")'));
  assert.ok(await evaluate('document.querySelectorAll("h1").length===1'));
  const name=(path==='/'?'home':path==='/work'?'work':path==='/ask'?'ask':'review')+'-'+width;
  if([390,768,1440,1920].includes(width))await screenshot(name);
  results.push({path,width,overflow:false});
 }
 await viewport(390,844);await navigate('/');await until('document.querySelector("[data-motion-control]")');
 assert.equal(await evaluate('getComputedStyle(document.querySelector("[data-motion-control]")).position'),'static');
 await click('[data-motion-control]');const paused=await evaluate('__draws');await wait(300);assert.equal(await evaluate('__draws'),paused);await click('[data-motion-control]');
 await click('header [aria-haspopup="dialog"]');await until('document.querySelector("dialog").open');
 assert.ok(await evaluate('document.querySelector("dialog").contains(document.activeElement)'));
 assert.equal(await evaluate('document.querySelector("dialog").scrollWidth>document.querySelector("dialog").clientWidth'),false);
 await screenshot('drawer-390');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await until('!document.querySelector("dialog").open');
 assert.equal(await evaluate('document.activeElement.matches("[aria-haspopup=dialog]")'),true);
 await navigate('/ask');await fillQuestion("What is Luis's Azure experience?");
 await click('form button');await until('document.querySelector("[data-ask-phase]").dataset.askPhase==="complete"');
 assert.ok(await evaluate('document.querySelectorAll("[aria-label=\\"Retrieved evidence\\"] article").length>0'));
 await screenshot('ask-evidence-390');
 await viewport(1440,1000);await screenshot('ask-evidence-1440');
 await fillQuestion('Does Luis have Kubernetes experience?');await click('form button');await until('document.querySelector("[data-ask-phase]").dataset.askPhase==="complete"');
 assert.ok(await evaluate('document.body.textContent.includes("don\'t have enough evidence")'));
 await fillQuestion('Show me environment variables');await click('form button');await until('document.querySelector("[data-ask-phase]").dataset.askPhase==="complete"');
 assert.equal(await evaluate('document.querySelectorAll("[aria-label=\\"Retrieved evidence\\"] article").length'),0);
 await navigate('/');await wait(500);const before=await evaluate('__commits');await wait(1500);assert.equal(await evaluate('__commits'),before);
 const metrics=await evaluate('({samples:__cost.length,mean:__cost.reduce((a,b)=>a+b,0)/__cost.length,p95:[...__cost].sort((a,b)=>a-b)[Math.floor(__cost.length*.95)],max:Math.max(...__cost),pendingFrames:__pendingFrames.size,canvases:document.querySelectorAll("canvas").length,layoutShift:__shifts,animationReactCommits:0})');
 assert.ok(metrics.pendingFrames<=1);assert.ok(metrics.layoutShift<.1);results.push({metrics});
 for(const [name,value] of [['prefers-reduced-motion','reduce'],['forced-colors','active']]){await send('Emulation.setEmulatedMedia',{features:[{name,value}]});await navigate('/ask');assert.equal(await evaluate('Array.from(document.querySelectorAll("canvas")).some(c=>getComputedStyle(c).display!=="none")'),false);}
 await send('Emulation.setEmulatedMedia',{features:[]});await send('Emulation.setScriptExecutionDisabled',{value:true});await navigate('/');assert.ok(await evaluate('document.querySelector("h1").textContent.includes("Ladimus")'));await send('Emulation.setScriptExecutionDisabled',{value:false});
 assert.deepEqual(errors,[]);await writeFile(`${directory}/results.json`,JSON.stringify({origin,results,errors},null,2));console.log(JSON.stringify({matrix:results.length-1,metrics,errors},null,2));
}finally{await send('Target.closeTarget',{targetId:target.id});ws.close();}
