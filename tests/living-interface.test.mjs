import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
function load(name, globals = {}) {
    const exports = {};
    const source = readFileSync(`src/features/living-interface/${name}.ts`, 'utf8');
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, ...globals });
    return exports;
}
const topology = load('topology'), budget = load('performance');
const presetModule = load('presets');
function setup(paused = false, drawCost = 0) {
    let width = 1440, height = 1000, now = 0, serial = 0, draws = 0, arcs = [], intersection, resize;
    const frames = new Map();
    const fine = Object.assign(new EventTarget(), { matches: true });
    const coarse = Object.assign(new EventTarget(), { matches: false });
    const hero = Object.assign(new EventTarget(), { getBoundingClientRect: () => ({ width, height, top: 0, left: 0 }), querySelectorAll: () => [] });
    const document = Object.assign(new EventTarget(), { hidden: false });
    const window = Object.assign(new EventTarget(), { scrollY: 0 });
    const ctx = { clearRect() { draws++; arcs = []; now += drawCost; }, arc(x, y, radius) { if (radius <= 2.2) arcs.push([x, y]); }, createRadialGradient() { return { addColorStop() {} }; }, translate() {}, fillRect() {}, setTransform() { }, save() { }, restore() { }, clip() { }, beginPath() { }, moveTo() { }, lineTo() { }, stroke() { }, fill() { } };
    const canvas = { closest: () => hero, getContext: () => ctx };
    const mod = load('canvas-renderer', {
        require: name => ({ './topology': topology, './performance': budget, './presets': presetModule,
            './runtime': { requestFrame: cb => { frames.set(++serial, cb); return serial; }, cancelFrame: id => frames.delete(id) },
        })[name], window, document, AbortController,
        matchMedia: q => q.includes('coarse') ? coarse : fine, devicePixelRatio: 2,
        Path2D: class {
            rect() { }
        }, getComputedStyle: () => ({ getPropertyValue: () => '#aabbcc' }),
        performance: { now: () => now }, requestAnimationFrame: cb => { frames.set(++serial, cb); return serial; }, cancelAnimationFrame: id => frames.delete(id),
        ResizeObserver: class {
            constructor(cb) { resize = cb; }
            observe() { }
            disconnect() { }
        },
        IntersectionObserver: class {
            constructor(cb) { intersection = cb; }
            observe() { }
            disconnect() { }
        },
    });
    const runtime = mod.createRenderer(canvas, paused);
    const step = () => { now += 34; const work = [...frames.values()]; frames.clear(); work.forEach(cb => cb(now)); };
    return { runtime, canvas, frames, step, get draws() { return draws; }, get arcs() { return arcs; },
        drawCost: value => { drawCost = value; },
        visible: value => intersection([{ isIntersecting: value }]),
        hidden: value => { document.hidden = value; document.dispatchEvent(new Event('visibilitychange')); },
        resize: w => { width = w; resize(); },
        coarse: () => { fine.matches = false; coarse.matches = true; fine.dispatchEvent(new Event('change')); coarse.dispatchEvent(new Event('change')); },
        pointer: (x, y) => hero.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: x, clientY: y, pointerType: 'mouse' })),
    };
}
test('deterministic connected topology and bounded backing stores', () => {
  for (const identity of Object.keys(presetModule.presets)) {
    for (const compact of [false, true]) {
        const graph = topology.createTopology(compact, identity);
        assert.deepEqual(graph, topology.createTopology(compact, identity));
        assert.equal(graph.nodes.length, compact ? 18 : 39);
        assert.equal(graph.edges.length, compact ? 22 : 62);
        const visited = new Set([0]);
        const degree = graph.nodes.map(() => 0);
        for (const [a, b] of graph.edges) {
            assert.ok(Number.isInteger(a) && a >= 0 && a < graph.nodes.length);
            assert.ok(Number.isInteger(b) && b >= 0 && b < graph.nodes.length);
            assert.notEqual(a, b);
            degree[a]++; degree[b]++;
        }
        assert.ok(degree.every(value => value <= 4));
        for (const node of graph.nodes) {
            assert.ok([node.x, node.y, node.settledY, node.depth, node.phase].every(Number.isFinite));
            assert.ok(node.x >= 0 && node.x <= 1 && node.y >= 0 && node.y <= 1);
        }
        for (const path of graph.paths) {
            for (let i = 1; i < path.length; i++) {
                assert.ok(graph.edges.some(([a, b]) => (a === path[i - 1] && b === path[i]) || (b === path[i - 1] && a === path[i])));
            }
        }
        for (let i = 0; i < graph.nodes.length; i++)
            for (const [a, b] of graph.edges) {
                if (visited.has(a))
                    visited.add(b);
                if (visited.has(b))
                    visited.add(a);
            }
        assert.equal(visited.size, graph.nodes.length);
    }
  }
    for (const [w, h, coarse] of [[1440, 1000, false], [320, 1800, false], [1920, 1100, true], [8000, 4000, false]]) {
        const b = budget.renderingBudget(w, coarse, 3, h);
        assert.ok(b.ratio <= (b.compact ? 1 : 1.5));
        assert.ok(w * h * b.ratio ** 2 <= 2400001);
    }
});
test('damping is time based, bounded, and stationary for zero time', () => {
    assert.equal(topology.damp(2, 7, 0), 2);
    assert.ok(topology.damp(0, 1, 0.5) > 0 && topology.damp(0, 1, 0.5) < 1);
    assert.ok(Math.abs(topology.damp(topology.damp(0, 1, 0.5), 1, 0.5) - topology.damp(0, 1, 1)) < 1e-10);
});
test('paused canvas refreshes after resizing offscreen or hidden, without a loop', () => {
    const s = setup(true);
    s.visible(true);
    const initial = s.canvas.width;
    s.visible(false);
    s.resize(600);
    assert.equal(s.canvas.width, initial);
    s.visible(true);
    assert.equal(s.canvas.width, 600);
    assert.equal(s.frames.size, 0);
    s.hidden(true);
    s.resize(400);
    assert.equal(s.canvas.width, 600);
    s.hidden(false);
    assert.equal(s.canvas.width, 400);
    assert.equal(s.frames.size, 0);
    s.runtime.dispose();
});
test('fine pointer changes positions; coarse pointer has no residual or new parallax', () => {
    const a = setup(), b = setup();
    a.visible(true);
    b.visible(true);
    a.step();
    b.step();
    a.pointer(1100, 400);
    for (let i = 0; i < 30; i++) {
        a.step();
        b.step();
    }
    assert.ok(a.arcs.some((p, i) => Math.hypot(p[0] - b.arcs[i][0], p[1] - b.arcs[i][1]) > .2));
    a.coarse();
    b.coarse();
    a.pointer(200, 500);
    for (let i = 0; i < 30; i++) {
        a.step();
        b.step();
    }
    assert.equal(a.arcs.length, 18);
    assert.deepEqual(a.arcs, b.arcs);
    a.runtime.dispose();
    b.runtime.dispose();
});
test('visibility, pause, repeated scheduling and disposal keep one or zero loops', () => {
    const s = setup();
    s.visible(true);
    for (let i = 0; i < 5; i++) {
        s.visible(true);
        assert.equal(s.frames.size, 1);
        s.step();
    }
    s.hidden(true);
    assert.equal(s.frames.size, 0);
    s.hidden(false);
    assert.equal(s.frames.size, 1);
    s.visible(false);
    assert.equal(s.frames.size, 0);
    s.visible(true);
    s.runtime.pause(true);
    assert.equal(s.frames.size, 0);
    s.runtime.pause(false);
    assert.equal(s.frames.size, 1);
    s.runtime.dispose();
    assert.equal(s.frames.size, 0);
});
test('sustained expensive frames downgrade once without oscillation', () => {
    const s = setup(false, 9);
    s.visible(true);
    s.step();
    assert.equal(s.arcs.length, 39);
    for (let i = 0; i < 60; i++) s.step();
    assert.equal(s.arcs.length, 18);
    assert.equal(s.canvas.width, 1440);
    s.drawCost(0);
    for (let i = 0; i < 60; i++) s.step();
    assert.equal(s.arcs.length, 18);
    s.runtime.dispose();
});

test('bounded regions share one browser frame and release all scheduled work', () => {
    let serial = 0;
    const frames = new Map();
    const runtime = load('runtime', {
        requestAnimationFrame: callback => { frames.set(++serial, callback); return serial; },
        cancelAnimationFrame: id => frames.delete(id),
    });
    let calls = 0;
    const first = runtime.requestFrame(() => { calls++; });
    runtime.requestFrame(() => { calls++; });
    assert.equal(frames.size, 1);
    runtime.cancelFrame(first);
    const [id, callback] = [...frames][0]; frames.delete(id); callback(16);
    assert.equal(calls, 1);
    assert.equal(frames.size, 0);
    const last = runtime.requestFrame(() => { calls++; });
    runtime.cancelFrame(last);
    assert.equal(frames.size, 0);
});

test('one session preference controls all regions and survives route remounts', () => {
    const storage = new Map([['ladimus-motion-paused', 'true']]);
    const runtime = load('runtime', { sessionStorage: {
        getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value),
    } });
    let first, second, updates = 0;
    const unsubscribe = runtime.subscribeMotion(() => { updates++; });
    const removeFirst = runtime.registerMotion(paused => { first = paused; });
    const removeSecond = runtime.registerMotion(paused => { second = paused; });
    assert.equal(first, true); assert.equal(second, true);
    runtime.toggleMotion();
    assert.equal(first, false); assert.equal(second, false);
    assert.equal(storage.get('ladimus-motion-paused'), 'false');
    removeFirst(); removeSecond();
    assert.equal(runtime.getMotion().available, false);
    const removeRemount = runtime.registerMotion(paused => { first = paused; });
    assert.equal(first, false); assert.equal(runtime.getMotion().available, true);
    removeRemount(); unsubscribe();
    assert.equal(updates, 7);
});
