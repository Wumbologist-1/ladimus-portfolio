// Multiple bounded renderers share one browser animation callback. Renderers
// retain their own frame budgets and stop requesting work when not visible.
const callbacks = new Map<number, FrameRequestCallback>();
let frame = 0;
let serial = 0;

function flush(now: number) {
  frame = 0;
  const pending = [...callbacks];
  callbacks.clear();
  for (const [, callback] of pending) callback(now);
}

export function requestFrame(callback: FrameRequestCallback) {
  const id = ++serial;
  callbacks.set(id, callback);
  if (!frame) frame = requestAnimationFrame(flush);
  return id;
}

export function cancelFrame(id: number) {
  callbacks.delete(id);
  if (!callbacks.size) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

const listeners = new Set<() => void>();
const renderers = new Set<(paused: boolean) => void>();
const initialState = { paused: false, available: false };
let state = initialState;
let restored = false;

function publish(paused: boolean) {
  state = { paused, available: renderers.size > 0 };
  for (const listener of listeners) listener();
}

export function subscribeMotion(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const getMotion = () => state;
export const getServerMotion = () => initialState;

export function registerMotion(pause: (paused: boolean) => void) {
  if (!restored) {
    restored = true;
    try { state = { ...state, paused: sessionStorage.getItem("ladimus-motion-paused") === "true" }; } catch { /* Optional storage. */ }
  }
  renderers.add(pause);
  pause(state.paused);
  publish(state.paused);
  return () => {
    renderers.delete(pause);
    publish(state.paused);
  };
}

export function toggleMotion() {
  const paused = !state.paused;
  for (const pause of renderers) pause(paused);
  try { sessionStorage.setItem("ladimus-motion-paused", String(paused)); } catch { /* Optional storage. */ }
  publish(paused);
}
