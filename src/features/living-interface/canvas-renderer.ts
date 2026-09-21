import { createTopology, damp } from "./topology";
import { renderingBudget } from "./performance";
import { presets, type VisualIdentity } from "./presets";
import { requestFrame, cancelFrame } from "./runtime";

export function createRenderer(canvas: HTMLCanvasElement, initiallyPaused: boolean, identity: VisualIdentity = "possibility") {
  const hero = canvas.closest("section");
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
    // Reserve complete reading/panel regions, not moving per-glyph masks.
    for (const region of hero!.querySelectorAll("[data-topology-clear]")) {
      const box = region.getBoundingClientRect();
      const clip = new Path2D();
      clip.rect(0, 0, width, height);
      clip.rect(box.left - bounds.left - 12, box.top - bounds.top - 10, box.width + 24, box.height + 20);
      clips.push(clip);
    }
    dirty = false;
  }

  function draw(dt: number) {
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
      const influence = Math.max(0, 1 - Math.hypot(node.x - (pointerX + 1) / 2, node.y - (pointerY + 1) / 2) / 0.65) * energy;
      point.x = node.x * width + Math.sin(time * 0.12 + node.phase) * budget.amplitude * preset.motion + pointerX * node.depth * 5 * influence;
      point.y = (node.y + (node.settledY - node.y) * order) * height + Math.cos(time * 0.1 + node.phase) * budget.amplitude * preset.motion + pointerY * node.depth * 4 * influence - scrollOffset * node.depth;
      point.energy = influence;
      point.pulse = 0;
    }
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = metal;
    for (const [a, b] of graph.edges) {
      const start = points[a]!;
      const end = points[b]!;
      const depth = (graph.nodes[a]!.depth + graph.nodes[b]!.depth) / 2;
      const crossRail = Math.floor(a / 3) === Math.floor(b / 3);
      ctx.globalAlpha = preset.line * (0.5 + depth * 0.5) * (crossRail ? 0.42 : 1) + Math.max(start.energy, end.energy) * 0.13;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
    // A short coordinated route, followed by a long rest. Smoothstep gives the
    // pulse an accelerating / settling curve without moving the topology.
    const period = preset.period * (budget.compact ? 1.6 : 1);
    const cycle = (time + 2) % period;
    if (cycle < 4) {
      const route = graph.paths[Math.floor(time / period) % graph.paths.length]!;
      const phase = cycle / 4;
      const head = phase * phase * (3 - 2 * phase) * (route.length - 1);
      for (let i = 0; i < route.length; i++) {
        points[route[i]!]!.pulse = Math.max(0, 1 - Math.abs(head - i) / 0.65) * Math.sin(phase * Math.PI) * preset.energy;
      }
      for (let i = 0; i < route.length - 1; i++) {
        const start = points[route[i]!]!;
        const end = points[route[i + 1]!]!;
        const tail = Math.max(0, Math.min(1, head - i - 0.6));
        const lead = Math.max(0, Math.min(1, head - i));
        if (lead <= tail) continue;
        ctx.strokeStyle = cyan;
        ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.7 * preset.energy;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(start.x + (end.x - start.x) * tail, start.y + (end.y - start.y) * tail);
        ctx.lineTo(start.x + (end.x - start.x) * lead, start.y + (end.y - start.y) * lead);
        ctx.stroke();
      }
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
    if (!fine.matches || budget.compact || event.pointerType === "touch") return;
    targetX = Math.max(-1, Math.min(1, (event.clientX - left) / width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY + scroll - top) / height * 2 - 1));
    pointerInside = true;
    lastPointer = performance.now();
  }, options);
  hero.addEventListener("pointerleave", resetPointer, options);
  hero.addEventListener("animationend", invalidate, options);
  window.addEventListener("blur", resetPointer, options);
  window.addEventListener("scroll", () => { scroll = window.scrollY; }, options);
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
    pause(value: boolean) { paused = value; schedule(); },
    dispose() {
      disposed = true;
      cancelFrame(frame);
      abort.abort();
      resize.disconnect();
      intersection.disconnect();
      ctx.clearRect(0, 0, width, height);
    },
  };
}
