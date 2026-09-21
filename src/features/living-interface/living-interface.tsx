"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { VisualIdentity } from "./presets";
import { getMotion, getServerMotion, registerMotion, subscribeMotion, toggleMotion } from "./runtime";
import styles from "./living-interface.module.css";

export function LivingInterface({ identity = "possibility" }: { identity?: VisualIdentity }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false;
    let generation = 0;
    let runtime: ReturnType<typeof import("./canvas-renderer").createRenderer> = null;
    let unregister: (() => void) | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const print = matchMedia("print");
    const initialize = async () => {
      const ticket = ++generation;
      runtime?.dispose();
      runtime = null;
      unregister?.();
      unregister = undefined;
      if (reduced.matches || forced.matches || print.matches) return;
      try {
        const { createRenderer } = await import("./canvas-renderer");
        if (disposed || ticket !== generation || !canvasRef.current) return;
        runtime = createRenderer(canvasRef.current, getMotion().paused, identity);
        if (runtime) unregister = registerMotion(runtime.pause);
      } catch { /* The server-rendered section remains the fallback. */ }
    };
    // Two frames give the semantic hero a paint opportunity before importing.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => { void initialize(); });
    });
    const change = () => { void initialize(); };
    for (const query of [reduced, forced, print]) query.addEventListener("change", change);
    return () => {
      disposed = true;
      generation++;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      for (const query of [reduced, forced, print]) query.removeEventListener("change", change);
      runtime?.dispose();
      unregister?.();
    };
  }, [identity]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" data-living-canvas={identity} />;
}

export function MotionControl() {
  const { available, paused } = useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
  if (!available) return null;
  return <button type="button" className={styles.control} onClick={toggleMotion} aria-label={paused ? "Resume ambient motion" : "Pause ambient motion"} data-motion-control>
    <span aria-hidden="true" className={styles.indicator}>{paused ? "▷" : "Ⅱ"}</span>
    {paused ? "Resume motion" : "Pause motion"}
  </button>;
}
