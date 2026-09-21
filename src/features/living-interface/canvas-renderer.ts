import { createSignals, decorativeTarget, isTap, SIGNAL_SECONDS } from "./signals";
import { createTopology, damp } from "./topology";
import { renderingBudget } from "./performance";
import { presets, type VisualIdentity } from "./presets";
import { requestFrame, cancelFrame } from "./runtime";

export function createRenderer(canvas: HTMLCanvasElement, initiallyPaused: boolean, identity: VisualIdentity = "possibility") {
  const hero = canvas.closest<HTMLElement>("[data-living-surface], section");
  const context = canvas.getContext("2d");
  if (!hero || !context) return null;
  const ctx = context;
  const coarse = matchMedia("(pointer: coarse)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const abort = new AbortController();
  const options = { passive: true, signal: abort.signal };
  let width = 1;
  let height = 1;
  let top = 0;
  let left = 0;
  let scroll = window.scrollY;
  let budget = renderingBudget(1, coarse.matches, devicePixelRatio, 1);
  const preset = presets[identity];
  let graph = createTopology(budget.compact, identity);
  let points = graph.nodes.map(() => ({ x: 0, y: 0, energy: 0, pulse: 0 }));
  let clips: Path2D[] = [];
  let exclusions: { x: number; y: number; w: number; h: number }[] = [];
  let signals = createSignals(graph, budget.compact);
  let gesture: { x: number; y: number; time: number; scroll: number; id: number } | null = null;
  let lastDispatch = -Infinity;
  let reactive = -1;
  let reactiveEnergy = 0;
  let halo: CanvasGradient;
  let order: number = preset.order;
  let frame = 0;
  let last = 0;
  let time = 0;
  let visible = false;
  let paused = initiallyPaused;
  let disposed = false;
  let dirty = true;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerInside = false;
  let energy = 0;
  let scrollOffset = 0;
  let lastPointer = -Infinity;
  let slowFrames = 0;
  let constrained = false;
  let metal = "#c6d0d5";
  let green = "#b4ef63";
  let cyan = "#80dbe8";

  function measure() {
    const bounds = hero!.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    top = bounds.top + window.scrollY;
    left = bounds.left;
    scroll = window.scrollY;
    const previousCompact = budget.compact;
    budget = renderingBudget(width, coarse.matches || constrained, devicePixelRatio, height);
    if (budget.compact) resetPointer();
    if (previousCompact !== budget.compact) {
      graph = createTopology(budget.compact, identity);
      points = graph.nodes.map(() => ({ x: 0, y: 0, energy: 0, pulse: 0 }));
      signals = createSignals(graph, budget.compact);
      reactive = -1;
    }
    canvas.width = Math.max(1, Math.floor(width * budget.ratio));
    canvas.height = Math.max(1, Math.floor(height * budget.ratio));
    ctx.setTransform(budget.ratio, 0, 0, budget.ratio, 0, 0);
    const tokens = getComputedStyle(hero!);
    metal = tokens.getPropertyValue("--color-metal").trim();
    green = tokens.getPropertyValue("--color-accent").trim();
    cyan = tokens.getPropertyValue("--color-secondary").trim();
    halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
    halo.addColorStop(0, cyan);
    halo.addColorStop(0.15, `${cyan}99`);
    halo.addColorStop(1, `${cyan}00`);
    clips = [];
    exclusions = [];
    // Reserve complete reading/panel regions, not moving per-glyph masks.
    for (const region of hero!.querySelectorAll("[data-topology-clear]")) {
      const box = region.getBoundingClientRect();
      const clip = new Path2D();
      clip.rect(0, 0, width, height);
      clip.rect(box.left - bounds.left - 12, box.top - bounds.top - 10, box.width + 24, box.height + 20);
      clips.push(clip);
      exclusions.push({ x: box.left - bounds.left - 12, y: box.top - bounds.top - 10, w: box.width + 24, h: box.height + 20 });
    }
    dirty = false;
  }

  function draw(dt: number) {
    signals.advance(dt);
    reactiveEnergy = damp(reactiveEnergy, reactive >= 0 ? 1 : 0, dt, 0.25);
    pointerX = damp(pointerX, targetX, dt);
    pointerY = damp(pointerY, targetY, dt);
    energy = damp(energy, pointerInside && fine.matches && !budget.compact ? 1 : 0, dt);
    const progress = Math.max(0, Math.min(1, (scroll - top) / Math.max(1, height)));
    order = damp(order, Math.min(1, preset.order + progress * 0.24), dt, 0.9);
    scrollOffset = damp(scrollOffset, progress * (budget.compact ? 2 : 7), dt, 0.65);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    // Intersect each exclusion separately: overlapping reading masks must not
    // cancel one another as they would in a single even-odd compound path.
    for (const clip of clips) ctx.clip(clip, "evenodd");
    for (let i = 0; i < graph.nodes.length; i++) {
      const node = graph.nodes[i]!;
      const point = points[i]!;
      const influence = Math.max(0, 1 - Math.hypot(node.x - (pointerX + 1) / 2, node.y - (pointerY + 1) / 2) / 0.36) * energy;
      point.x = node.x * width + Math.sin(time * 0.12 + node.phase) * budget.amplitude * preset.motion + pointerX * node.depth * 5 * influence;
      point.y = (node.y + (node.settledY - node.y) * order) * height + Math.cos(time * 0.1 + node.phase) * budget.amplitude * preset.motion + pointerY * node.depth * 4 * influence - scrollOffset * node.depth;
      point.energy = Math.max(influence, node.cluster === reactive ? reactiveEnergy * 0.65 : 0);
      point.pulse = 0;
    }
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = metal;
    for (const [a, b] of graph.edges) {
      const start = points[a]!;
      const end = points[b]!;
      const depth = (graph.nodes[a]!.depth + graph.nodes[b]!.depth) / 2;
      const crossRail = graph.nodes[a]!.cluster !== graph.nodes[b]!.cluster;
      ctx.globalAlpha = preset.line * (0.5 + depth * 0.5) * (crossRail ? 0.42 : 1) + Math.max(start.energy, end.energy) * 0.13;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
    // Ambient and dispatched signals use exactly the same graph edges.
    const period = preset.period * (budget.compact ? 1.6 : 1);
    const cycle = time % period;
    if (cycle < SIGNAL_SECONDS) paintSignal(graph.paths[Math.floor(time / period) % graph.paths.length]!, cycle, preset.energy * 0.6);
    for (const slot of signals.slots) {
      if (slot.age < SIGNAL_SECONDS) paintSignal(slot.route, slot.age, slot.strength);
    }
    for (let i = 0; i < points.length; i++) {
      const point = points[i]!;
      const node = graph.nodes[i]!;
      const light = point.pulse + point.energy * 0.3 + (node.primary ? (0.1 + Math.sin(time * 0.45 + node.phase) * 0.025) * preset.energy : 0);
      if (light > 0.02 && !budget.compact) {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.fillStyle = halo;
        ctx.globalAlpha = Math.min(0.45, light * 0.45);
        ctx.fillRect(-22, -22, 44, 44);
        ctx.restore();
      }
      ctx.fillStyle = node.primary ? green : metal;
      ctx.globalAlpha = Math.min(0.95, (node.primary ? 0.64 : 0.22 + node.depth * 0.12) + light * 0.3);
      ctx.beginPath();
      ctx.arc(point.x, point.y, node.primary ? 2.2 : 1.1, 0, Math.PI * 2);
      ctx.fill();
      if (node.primary) {
        ctx.strokeStyle = green;
        ctx.globalAlpha = 0.13 + light * 0.2;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5 + light * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function paintSignal(route: number[], age: number, strength: number) {
    const phase = age / SIGNAL_SECONDS;
    const head = phase * (route.length - 1);
    const fade = Math.min(1, (1 - phase) * 5) * strength;
    for (let i = 0; i < route.length; i++) {
      const point = points[route[i]!]!;
      point.pulse = Math.max(point.pulse, Math.max(0, 1 - Math.abs(head - i) / 1.2) * fade);
      if (i === route.length - 1) continue;
      const end = points[route[i + 1]!]!;
      const tail = Math.max(0, Math.min(1, head - i - 0.85));
      const lead = Math.max(0, Math.min(1, head - i));
      if (lead <= tail) continue;
      ctx.strokeStyle = cyan; ctx.globalAlpha = fade * 0.85; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(point.x + (end.x - point.x) * tail, point.y + (end.y - point.y) * tail);
      ctx.lineTo(point.x + (end.x - point.x) * lead, point.y + (end.y - point.y) * lead);
      ctx.stroke();
    }
  }

  function nearest(x: number, y: number) {
    let best = -1, distance = Infinity;
    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      if (exclusions.some(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h)) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  }
  function enabled() { return !disposed && !paused && visible && !document.hidden; }
  function ownTarget(target: EventTarget | null) {
    return target instanceof Element && target.closest("[data-living-surface], section") === hero;
  }
  hero.addEventListener("pointerdown", event => {
    gesture = null;
    if (!enabled() || !event.isPrimary || event.button !== 0 || !ownTarget(event.target) || !decorativeTarget(event.target)) return;
    gesture = { x: event.clientX, y: event.clientY, time: performance.now(), scroll: window.scrollY, id: event.pointerId };
  }, options);
  hero.addEventListener("pointerup", event => {
    const start = gesture; gesture = null;
    const now = performance.now();
    if (!start || start.id !== event.pointerId || !enabled() || !ownTarget(event.target) || !decorativeTarget(event.target)
      || window.getSelection()?.toString() || !isTap(start, event.clientX, event.clientY, now, window.scrollY) || now - lastDispatch < 180) return;
    const index = nearest(event.clientX - left, event.clientY + scroll - top);
    if (signals.dispatch(index)) {
      lastDispatch = now;
      // A quiet handoff follows an alternate connected branch, never particles.
      const branch = graph.adjacency[index]?.find(n => !graph.paths[index]!.includes(n));
      if (!budget.compact && identity !== "review" && branch !== undefined) signals.dispatch(branch, 0.55);
    }
  }, options);
  hero.addEventListener("pointercancel", () => { gesture = null; }, options);
  const react = (event: Event) => {
    if (!enabled() || !(event.target instanceof Element)) return;
    if (event.type === "pointerover" && (!fine.matches || budget.compact)) return;
    const target = event.target.closest("[data-field-reactive]");
    if (!target) return;
    const box = target.getBoundingClientRect();
    const index = nearest(box.left + box.width / 2 - left, box.top + box.height / 2 + scroll - top);
    reactive = graph.nodes[index]?.cluster ?? -1;
  };
  hero.addEventListener("pointerover", react, options);
  hero.addEventListener("focusin", react, options);
  hero.addEventListener("pointerout", () => { reactive = -1; }, options);
  hero.addEventListener("focusout", () => { reactive = -1; }, options);

  function tick(now: number) {
    frame = 0;
    if (disposed || paused || !visible || document.hidden) return;
    const interval = !budget.compact && now - lastPointer < 800 ? 1000 / 60 : 1000 / 30;
    if (last && now - last < interval - 0.5) {
      frame = requestFrame(tick);
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    const started = performance.now();
    if (dirty) measure();
    time += dt;
    draw(dt);
    // Sustained expensive drawing downgrades once, avoiding tier oscillation.
    slowFrames = performance.now() - started > 8 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 45 && !constrained) { constrained = true; dirty = true; }
    frame = requestFrame(tick);
  }

  function schedule() {
    cancelFrame(frame);
    frame = 0;
    last = 0;
    if (disposed || !visible || document.hidden) return;
    // A paused hero can resize while offscreen or hidden. Refresh its still
    // frame on return without starting a continuous animation loop.
    if (paused) {
      if (dirty) { measure(); draw(0); }
      return;
    }
    frame = requestFrame(tick);
  }
  function invalidate() {
    dirty = true;
    if (paused && visible && !document.hidden) { measure(); draw(0); }
  }
  function resetPointer() {
    pointerInside = false;
    targetX = 0;
    targetY = 0;
    if (!fine.matches || budget.compact) {
      pointerX = 0;
      pointerY = 0;
      energy = 0;
    }
  }
  hero.addEventListener("pointermove", (event) => {
    if (!enabled() || !fine.matches || budget.compact || event.pointerType === "touch") return;
    targetX = Math.max(-1, Math.min(1, (event.clientX - left) / width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY + scroll - top) / height * 2 - 1));
    pointerInside = true;
    lastPointer = performance.now();
  }, options);
  hero.addEventListener("pointerleave", resetPointer, options);
  hero.addEventListener("animationend", invalidate, options);
  window.addEventListener("blur", resetPointer, options);
  window.addEventListener("scroll", () => { scroll = window.scrollY; gesture = null; }, options);
  window.addEventListener("resize", invalidate, options);
  document.addEventListener("visibilitychange", schedule, options);
  coarse.addEventListener("change", invalidate, options);
  fine.addEventListener("change", resetPointer, options);
  const resize = new ResizeObserver(invalidate);
  resize.observe(hero);
  for (const region of hero.querySelectorAll("[data-topology-clear]")) resize.observe(region);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) dirty = true;
    schedule();
  });
  intersection.observe(hero);
  measure();
  if (paused) draw(0);
  return {
    pause(value: boolean) { paused = value; gesture = null; if (paused) { signals.clear(); reactive = -1; } schedule(); },
    inspect() { return { activeSignals: signals.active, dispatched: signals.dispatched, compact: budget.compact }; },
    dispose() {
      disposed = true;
      signals.clear(); gesture = null;
      cancelFrame(frame);
      abort.abort();
      resize.disconnect();
      intersection.disconnect();
      ctx.clearRect(0, 0, width, height);
    },
  };
}
