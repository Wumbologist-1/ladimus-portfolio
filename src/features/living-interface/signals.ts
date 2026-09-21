import type { createTopology } from "./topology";

type Graph = ReturnType<typeof createTopology>;
export const SIGNAL_SECONDS = 2.8;
export const blockedTargets = "a,button,input,textarea,select,label,form,video,audio,summary,[role=button],[role=link],[contenteditable],p,h1,h2,h3,h4,li,figcaption,[data-topology-clear]:not([data-signal-surface])";

export function decorativeTarget(target: EventTarget | null) {
  return target instanceof Element && !target.closest(blockedTargets);
}

// Fixed slots and precomputed routes keep repeated taps bounded.
export function createSignals(graph: Graph, compact: boolean) {
  const slots = Array.from({ length: compact ? 2 : 4 }, () => ({ route: graph.paths[0]!, age: SIGNAL_SECONDS, strength: 1 }));
  let dispatched = 0;
  return {
    slots,
    get active() { return slots.reduce((n, slot) => n + Number(slot.age < SIGNAL_SECONDS), 0); },
    get dispatched() { return dispatched; },
    dispatch(index: number, strength = 1) {
      const route = graph.paths[index];
      const slot = slots.find(s => s.age >= SIGNAL_SECONDS);
      if (!route || !slot) return false;
      slot.route = route; slot.age = 0; slot.strength = strength; dispatched++;
      return true;
    },
    advance(dt: number) { for (const slot of slots) slot.age = Math.min(SIGNAL_SECONDS, slot.age + dt); },
    clear() { for (const slot of slots) slot.age = SIGNAL_SECONDS; },
  };
}

export function isTap(start: { x: number; y: number; time: number; scroll: number }, x: number, y: number, time: number, scroll: number) {
  return time - start.time <= 450 && Math.hypot(x - start.x, y - start.y) <= 8 && Math.abs(scroll - start.scroll) <= 4;
}
