// Production-browser checks using an existing Chromium CDP endpoint; no package
// or browser installation. All navigation must target a public deployment.
// BROWSER_CDP and PORTFOLIO_URL override the local defaults.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const endpoint = process.env.BROWSER_CDP || 'http://127.0.0.1:9224';
const origin = process.env.PORTFOLIO_URL;
assert.ok(origin && /^https:\/\//.test(origin) && !/localhost|127\.0\.0\.1/.test(origin), 'PORTFOLIO_URL must be a public HTTPS deployment');
const artifactDirectory = process.env.ARTIFACT_DIR || 'scratch/v05-review';
await mkdir(artifactDirectory, { recursive: true });
const target = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let serial = 0;
const pending = new Map(), exceptions = [], results = [];
ws.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params);
  if (!pending.has(message.id)) return;
  const callback = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) callback.reject(message.error);
  else callback.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++serial, { resolve, reject });
  ws.send(JSON.stringify({ id: serial, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const until = async expression => {
  for (let i = 0; i < 150; i++) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await wait(100);
  }
  throw Error(`Timed out: ${expression}`);
};
const navigate = async path => {
  await send('Page.navigate', { url: origin + path });
  await until('document.querySelector("[data-motion-control]") || location.hostname === "vercel.com"');
  assert.notEqual(new URL(await evaluate('location.href')).hostname, 'vercel.com', 'Preview must be public, not a Vercel login page');
  await wait(1600);
};
const viewport = width => send('Emulation.setDeviceMetricsOverride', { width, height: ({320:800,375:812,390:844,430:932,768:1024,1440:1000,1920:1080})[width], deviceScaleFactor: 2, mobile: false });
const screenshot = async (name, selector = 'main section') => {
  const clip = await evaluate(`(()=>{const box=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:0,y:box.top+scrollY,width:innerWidth,height:box.height,scale:1/devicePixelRatio}})()`);
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
  await writeFile(`${artifactDirectory}/${name}.png`, Buffer.from(data, 'base64'));
};
const key = async (key, code, value) => {
  for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', {
    type, key, code, windowsVirtualKeyCode: value,
    ...(type === 'keyDown' && key === 'Enter' ? { text: '\r' } : {}),
    ...(type === 'keyDown' && key === ' ' ? { text: ' ' } : {}),
  });
};
const stopped = async () => {
  await wait(250);
  const count = await evaluate('__draws');
  await wait(400);
  assert.equal(await evaluate('__draws'), count);
};
const record = (label, detail = 'passed') => {
  results.push({ label, detail });
  console.log(label, detail.canvas ? `passed (${detail.canvas.length} bounded regions)` : detail);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.bringToFront');
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
window.__signalStrokes=0;window.__longTasks=[];window.__draws=0;window.__cost=[];window.__commits=0;window.__canvasStats=new Map();window.__pendingFrames=new Set();window.__shifts=0;
const clear=CanvasRenderingContext2D.prototype.clearRect;
CanvasRenderingContext2D.prototype.clearRect=function(...args){__draws++;const old=__canvasStats.get(this.canvas);__canvasStats.set(this.canvas,{draws:(old?.draws||0)+1,nodes:0,signalSegments:0,positions:[],light:0});return clear.apply(this,args)};
const stroke=CanvasRenderingContext2D.prototype.stroke;
CanvasRenderingContext2D.prototype.stroke=function(...args){if(this.lineWidth===2){window.__signalStrokes++;const s=__canvasStats.get(this.canvas);if(s)s.signalSegments++}return stroke.apply(this,args)};
const arc=CanvasRenderingContext2D.prototype.arc;
CanvasRenderingContext2D.prototype.arc=function(...args){if(args[2]<=2.2){const s=__canvasStats.get(this.canvas);s.nodes++;s.positions.push([args[0],args[1]]);s.light+=this.globalAlpha;}return arc.apply(this,args)};
const raf=window.requestAnimationFrame,cancel=window.cancelAnimationFrame;
window.requestAnimationFrame=function(callback){let id=raf.call(window,time=>{__pendingFrames.delete(id);const start=performance.now(),before=__draws;callback(time);if(__draws>before)__cost.push(performance.now()-start)});__pendingFrames.add(id);return id};
window.cancelAnimationFrame=function(id){__pendingFrames.delete(id);return cancel.call(window,id)};
window.__REACT_DEVTOOLS_GLOBAL_HOOK__={supportsFiber:true,inject:()=>1,onCommitFiberRoot:()=>__commits++,onCommitFiberUnmount:()=>{}};
new PerformanceObserver(list=>{for(const item of list.getEntries())__longTasks.push(item.duration)}).observe({type:'longtask',buffered:true});
new PerformanceObserver(list=>{for(const item of list.getEntries())if(!item.hadRecentInput)__shifts+=item.value}).observe({type:'layout-shift',buffered:true});
` });

try {
  for (const path of ['/', '/work', '/projects/ladimus-review']) {
    for (const width of [320, 375, 390, 430, 768, 1440, 1920]) {
      await viewport(width); await navigate(path);
      const state = await evaluate(`(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth,
        canvas:[...document.querySelectorAll('canvas')].map(c=>({identity:c.dataset.livingCanvas,ratio:c.width/c.clientWidth,nodes:__canvasStats.get(c)?.nodes||0,hidden:c.getAttribute('aria-hidden'),pointer:getComputedStyle(c).pointerEvents})),
        controls:document.querySelectorAll('[data-motion-control]').length,
        covered:[...document.querySelectorAll('header a,main section:first-child a')].filter(a=>{const r=a.getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight&&!a.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}).map(a=>a.textContent),
        proofCanvas:!!document.querySelector('#proof canvas'),
        title:document.querySelector('h1').textContent
      }))()`);
      assert.equal(state.overflow, false); assert.equal(state.controls, 1); assert.equal(state.proofCanvas, false); assert.deepEqual(state.covered, []);
      for (const canvas of state.canvas) { assert.ok(canvas.ratio <= 1.501); assert.equal(canvas.hidden, 'true'); assert.equal(canvas.pointer, 'none'); }
      assert.ok(state.canvas[0].nodes === 18 || state.canvas[0].nodes === 39);
      if (width < 768) { assert.equal(state.canvas[0].nodes, 18); assert.ok(state.canvas[0].ratio <= 1.001); }
      record(`${path} ${width}px`, state);
      if (width !== 375) await screenshot(`${path === '/' ? 'home' : path.includes('review') ? 'review' : 'work'}-${width}`);
    }
  }

  await viewport(1440); await navigate('/');
  assert.ok(await evaluate('__commits') > 0);
  const commits = await evaluate('__commits');
  const shifts = await evaluate('__shifts');
  await wait(1000);
  assert.equal(await evaluate('__commits'), commits); assert.equal(await evaluate('__shifts'), shifts);
  assert.equal(await evaluate('__pendingFrames.size'), 1);
  record('Stable React commits, layout, and one shared frame');
  record('Shared draw callback cost (ms)', await evaluate('({samples:__cost.length,mean:__cost.reduce((a,b)=>a+b,0)/__cost.length,max:Math.max(...__cost),p95:[...__cost].sort((a,b)=>a-b)[Math.floor(__cost.length*.95)]})'));

  assert.ok(await evaluate('document.querySelector("[data-ladimus-core]")'));
  assert.ok(await evaluate('document.body.textContent.includes("0.5")'));
  await screenshot('hero-before');
  const empty = await evaluate(`(()=>{const r=document.querySelector('main section').getBoundingClientRect();return {x:innerWidth*.17,y:r.top+14}})()`);
  const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, ...(type === 'mouseMoved' ? {} : {button:'left',clickCount:1}) });
  const clickSpace = async point => { await mouse('mousePressed',point.x,point.y); await mouse('mouseReleased',point.x,point.y); };
  // Wait for the ambient route to settle before measuring input-triggered drawing.
  await wait(2200);
  const before = await evaluate('__signalStrokes');
  await clickSpace(empty); await wait(500);
  assert.ok(await evaluate('__signalStrokes') > before, 'Decorative click dispatches a visible routed signal');
  await screenshot('hero-signal');
  await wait(3000);
  const settled = await evaluate('__signalStrokes'); await wait(250);
  assert.equal(await evaluate('__signalStrokes'), settled, 'Dispatched signal expires');
  await mouse('mouseMoved', empty.x, empty.y + 45); await wait(500);
  const influenced = await evaluate('__canvasStats.get(document.querySelector("canvas")).light');
  await mouse('mouseMoved', 0, 0); await wait(1200);
  const rested = await evaluate('__canvasStats.get(document.querySelector("canvas")).light');
  assert.ok(influenced > rested, 'Fine pointer field illuminates nearby junctions and settles');
  record('Ladimus Core, edition, pointer field, decorative dispatch and expiry');

  // Native pointer events over real content must not dispatch a decorative signal.
  await evaluate(`(()=>{for(const target of document.querySelectorAll('header a,main section:first-child a,main section:first-child p,[data-motion-control]')){
    const options={bubbles:true,isPrimary:true,pointerId:9,button:0,clientX:10,clientY:10};
    target.dispatchEvent(new PointerEvent('pointerdown',options));target.dispatchEvent(new PointerEvent('pointerup',options));
  }})()`);
  const filtered = await evaluate('__signalStrokes'); await wait(300);
  assert.equal(await evaluate('__signalStrokes'), filtered);
  record('Links, buttons and selectable copy filter decorative dispatch');
  await navigate('/');
  await key('Tab', 'Tab', 9);
  assert.equal(await evaluate('document.activeElement.textContent'), 'Skip to main content');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
  await key('Enter', 'Enter', 13); assert.equal(await evaluate('document.activeElement.id'), 'main-content');
  await evaluate('document.querySelector("[data-motion-control]").focus()');
  assert.equal(await evaluate('document.activeElement.matches(":focus-visible")'), true);
  await key('Enter', 'Enter', 13); await stopped();
  await clickSpace(empty); await mouse('mouseMoved', empty.x, empty.y + 30); await stopped();
  assert.equal(await evaluate('document.querySelector("[data-motion-control]").getAttribute("aria-label")'), 'Resume ambient motion');
  await navigate('/work'); await stopped();
  assert.equal(await evaluate('document.querySelector("[data-motion-control]").getAttribute("aria-label")'), 'Resume ambient motion');
  await key('Tab', 'Tab', 9); await evaluate('document.querySelector("[data-motion-control]").focus()');
  await key(' ', 'Space', 32); await wait(300); assert.equal(await evaluate('document.querySelector("[data-motion-control]").getAttribute("aria-label")'), 'Pause ambient motion');
  record('Skip link, visible keyboard focus, Enter/Space pause, stored preference');

  await navigate('/');
  for (const identity of ['structure', 'systems', 'authority']) {
    await evaluate(`document.querySelector('[data-living-region="${identity}"]').scrollIntoView()`); await wait(500);
    assert.ok(await evaluate(`__canvasStats.get(document.querySelector('[data-living-canvas="${identity}"]')).draws>1`));
    await screenshot(`home-${identity}`, `[data-living-region="${identity}"]`);
  }
  const heroCount = await evaluate('__canvasStats.get(document.querySelector("canvas")).draws'); await wait(400);
  assert.equal(await evaluate('__canvasStats.get(document.querySelector("canvas")).draws'), heroCount);
  record('Native scrolling, section identities, hero offscreen suspension');

  await evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"))');
  await stopped(); assert.equal(await evaluate('__pendingFrames.size'), 0);
  await evaluate('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"))');
  await wait(300); record('Hidden-document lifecycle signal');

  await navigate('/work');
  await evaluate('document.querySelector("article").scrollIntoView({block:"center"})'); await wait(600);
  const workLight = await evaluate('__canvasStats.get(document.querySelectorAll("canvas")[1]).light');
  await evaluate('document.querySelector("article a").focus()'); await wait(700);
  assert.ok(await evaluate('__canvasStats.get(document.querySelectorAll("canvas")[1]).light')>workLight, 'Project focus activates local cluster');
  await evaluate('document.activeElement.blur()'); await wait(1000);
  const cardPoint = await evaluate('(()=>{const r=document.querySelector("article").getBoundingClientRect();return {x:r.left+30,y:r.top+30}})()');
  await mouse('mouseMoved',cardPoint.x,cardPoint.y); await wait(700);
  assert.ok(await evaluate('__canvasStats.get(document.querySelectorAll("canvas")[1]).light')>workLight, 'Project hover activates local cluster');
  record('Project focus and hover activate local cluster');

  await navigate('/work');
  await evaluate(`document.querySelector('a[href="#featured"]').click()`);
  await until('location.hash==="#featured"'); assert.ok(await evaluate('scrollY>0'));
  await key('Tab', 'Tab', 9); await evaluate('document.querySelector("article a").focus()');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
  await key('Enter', 'Enter', 13); await until('location.pathname==="/projects/ladimus-review"');
  await wait(700);
  await evaluate(`document.querySelector('a[href="#proof"]').click()`); await until('location.hash==="#proof"');
  assert.ok(await evaluate('Math.abs(document.querySelector("#proof").getBoundingClientRect().top)<100'));
  assert.equal(await evaluate('document.querySelector("#proof canvas")!==null'), false);
  const source = await evaluate('[...document.querySelectorAll("a")].find(a=>a.textContent.includes("View source on GitHub")).href');
  assert.equal(source, 'https://github.com/Wumbologist-1/ladimus-review');
  const captures = await evaluate('[...document.querySelectorAll("#proof a")].map(a=>({href:a.href,target:a.target,label:a.textContent}))');
  assert.equal(captures.length, 3);
  for (const capture of captures) {
    assert.equal(capture.target, '_blank');
    const response = await fetch(capture.href); assert.equal(response.status, 200); assert.ok(response.headers.get('content-type').startsWith('image/'));
    await evaluate(`[...document.querySelectorAll('#proof a')].find(a=>a.href===${JSON.stringify(capture.href)}).click()`);
    await wait(200);
    const opened = (await (await fetch(`${endpoint}/json`)).json()).find(item => item.url === capture.href);
    assert.ok(opened, 'Full-size capture opened');
    await send('Target.closeTarget', { targetId: opened.id });
  }
  await send('Page.bringToFront');
  assert.ok(await evaluate('document.querySelector("#proof").textContent.includes("unpublished")'));
  assert.equal(await evaluate('document.querySelectorAll("video").length'), 0);
  record('Work/project links, fragments, source URL, three full-size captures, unpublished video');
  const history = await send('Page.getNavigationHistory');
  const current = history.currentIndex;
  await send('Page.navigateToHistoryEntry', { entryId: history.entries[current - 1].id }); await wait(500);
  assert.notEqual(await evaluate('location.hash'), '#proof');
  await send('Page.navigateToHistoryEntry', { entryId: history.entries[current].id }); await until('location.hash==="#proof"');
  record('Browser back/forward');

  for (let cycle = 0; cycle < 3; cycle++) {
    await evaluate('document.querySelector("header a").click()'); await until('location.pathname==="/" && document.querySelectorAll("canvas").length===6'); await wait(1400);
    const count = await evaluate('__canvasStats.get(document.querySelector("canvas")).draws');
    await wait(1000); const rate = await evaluate('__canvasStats.get(document.querySelector("canvas")).draws') - count;
    assert.ok(rate > 15 && rate <= 35, `Single loop: ${rate}`);
    assert.equal(await evaluate('__pendingFrames.size'), 1);
    const detached = await evaluate('[...__canvasStats].filter(([c])=>!c.isConnected).map(([,s])=>s.draws)');
    await wait(200); assert.deepEqual(await evaluate('[...__canvasStats].filter(([c])=>!c.isConnected).map(([,s])=>s.draws)'), detached);
    await evaluate(`document.querySelector('main a[href="/work"]').click()`); await until('location.pathname==="/work" && document.querySelectorAll("canvas").length===2');
  }
  record('Three client navigation/remount cycles, detached canvas cleanup, single shared loop');

  for (const path of ['/', '/work', '/projects/ladimus-review']) {
    await navigate(path);
    for (const [name, value] of [['prefers-reduced-motion', 'reduce'], ['forced-colors', 'active']]) {
      await send('Emulation.setEmulatedMedia', { features: [{ name, value }] }); await stopped();
      await clickSpace(empty); await stopped();
      assert.equal(await evaluate('document.querySelector("[data-motion-control]")!==null'), false);
      assert.ok(await evaluate('[...document.querySelectorAll("canvas")].every(c=>getComputedStyle(c).display==="none")'));
      if (path === '/') await screenshot(name);
    }
    await send('Emulation.setEmulatedMedia', { features: [], media: 'print' }); await stopped();
    assert.ok(await evaluate('[...document.querySelectorAll("canvas")].every(c=>getComputedStyle(c).display==="none")'));
    await send('Emulation.setEmulatedMedia', { features: [], media: '' });
    await until('document.querySelector("[data-motion-control]")');
  }
  record('Reduced motion, forced colors, print on every route');

  for (const width of [320,375,390,430]) {
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await viewport(width); await navigate('/');
    assert.equal(await evaluate('matchMedia("(pointer:coarse)").matches'), true);
    assert.equal(await evaluate('__canvasStats.get(document.querySelector("canvas")).nodes'), 18);
    assert.ok(await evaluate('document.querySelector("canvas").width/document.querySelector("canvas").clientWidth<=1'));
    await wait(2200);
    const point = await evaluate(`(()=>{const r=document.querySelector('main section').getBoundingClientRect();return {x:innerWidth*.17,y:r.top+12}})()`);
    const touch = (type,x,y) => send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
    const baseline = await evaluate('__signalStrokes');
    await touch('touchStart',point.x,point.y); await touch('touchEnd'); await wait(350);
    assert.ok(await evaluate('__signalStrokes') > baseline, 'Touch dispatch '+width);
    await wait(3000);
    const start = await evaluate('__signalStrokes');
    await touch('touchStart',point.x,point.y+250);
    for(let step=1;step<=5;step++){await touch('touchMove',point.x,point.y+250-step*30);await wait(25);}
    await touch('touchEnd'); await wait(300);
    assert.ok(await evaluate('scrollY')>0, 'Native touch scroll');
    assert.equal(await evaluate('__signalStrokes'),start,'Scroll does not dispatch');
    record('Touch '+width+'px: compact, tap dispatch, native scroll without accidental signal');
  }
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await viewport(1440);

  for (const source of ['HTMLCanvasElement.prototype.getContext=()=>null', 'HTMLCanvasElement.prototype.getContext=()=>{throw Error("Simulated context failure")}']) {
    const script = await send('Page.addScriptToEvaluateOnNewDocument', { source });
    for (const path of ['/', '/work', '/projects/ladimus-review']) {
      await send('Page.navigate', { url: origin + path }); await until('document.querySelector("h1")'); await wait(1200);
      assert.equal(await evaluate('document.querySelector("[data-motion-control]")!==null'), false);
      assert.ok(await evaluate('document.querySelector("main a").href.length>0'));
    }
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: script.identifier });
  }
  record('Null and throwing Canvas context fallback on every route');
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await viewport(390);
  for (const path of ['/', '/work', '/projects/ladimus-review']) {
    await send('Page.navigate', { url: origin + path }); await wait(1000);
    assert.equal(await evaluate('document.querySelector("[data-motion-control]")!==null'), false);
    assert.ok(await evaluate('document.querySelector("h1").textContent.length>0'));
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  }
  await screenshot('review-no-js');
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  record('No-JS semantic routes and navigation anchors');
  assert.deepEqual(exceptions, []);
  record('No browser exceptions');
  await writeFile(`${artifactDirectory}/validation.json`, JSON.stringify(results, null, 2));
} finally {
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  ws.close();
}
