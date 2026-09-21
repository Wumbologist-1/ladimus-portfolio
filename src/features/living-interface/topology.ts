import type { VisualIdentity } from "./presets";

export type Node = { x: number; y: number; settledY: number; depth: number; phase: number; primary: boolean; cluster: number; checkpoint: boolean };
export type Edge = readonly [number, number];

// Designed cluster chains with checkpoint hubs. Adjacency and bounded routes are
// computed once; no graph traversal occurs per frame.
export function createTopology(compact: boolean, identity: VisualIdentity = "possibility") {
  const count = compact ? 18 : 39;
  const clusters = compact ? 2 : 3;
  const size = count / clusters;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  for (let i = 0; i < count; i++) {
    const cluster = Math.floor(i / size), local = i % size;
    const t = local / (size - 1);
    const ordered = identity === "review" || identity === "structure";
    let x = (compact ? [0.18, 0.8] : [0.17, 0.5, 0.83])[cluster]! + (t - 0.5) * (compact ? 0.28 : 0.26);
    let y = (cluster % 2 ? 0.94 : 0.065) + (ordered ? (local % 3 - 1) * 0.014 : Math.sin(t * Math.PI * 2) * 0.026);
    if (identity === "core") {
      const angle = -Math.PI / 2 + i / count * Math.PI * 2;
      x = 0.5 + Math.cos(angle) * 0.39;
      y = 0.5 + Math.sin(angle) * 0.39;
    }
    nodes.push({ x, y, settledY: y, depth: 0.4 + (local % 3) * 0.25,
      phase: i * 1.3, primary: local === 0 || local === Math.floor(size / 2),
      cluster, checkpoint: local === 0 || local === Math.floor(size / 2) });
    if (i > 0) edges.push([i - 1, i]);
    if (local === size - 1) edges.push([i - size + 1, i]);
  }
  const adjacency: number[][] = nodes.map(() => []);
  for (const [a, b] of edges) { adjacency[a]!.push(b); adjacency[b]!.push(a); }
  const paths = nodes.map((_, start) => {
    const path = [start];
    let current = start;
    for (let step = 0; step < 5; step++) {
      const next = adjacency[current]!.find(n => n > current && !path.includes(n))
        ?? adjacency[current]!.find(n => !path.includes(n));
      if (next === undefined) break;
      path.push(next); current = next;
    }
    return path;
  });
  return { nodes, edges, adjacency, paths };
}

export function damp(current: number, target: number, seconds: number, tau = 0.45) {
  return current + (target - current) * (1 - Math.exp(-seconds / tau));
}
