import type { VisualIdentity } from "./presets";

export type Node = { x: number; y: number; settledY: number; depth: number; phase: number; primary: boolean };
export type Edge = readonly [number, number];

// Three gently staggered rails form a connected, designed lattice. No random
// particle placement or proximity search; topology stays stable across frames.
export function createTopology(compact: boolean, identity: VisualIdentity = "possibility") {
  const columns = compact ? 6 : 13;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  for (let column = 0; column < columns; column++) {
    for (let rail = 0; rail < 3; rail++) {
      const index = nodes.length;
      const cluster = Math.min(2, Math.floor(column / (compact ? 2 : 4)));
      const settledY = identity === "systems"
        ? [0.38, 0.5, 0.62][cluster]! + (rail - 1) * 0.23
        : [0.1, 0.49, 0.87][rail]!;
      const x = identity === "systems"
        ? 0.05 + cluster * 0.33 + (column - cluster * (compact ? 2 : 4)) * (compact ? 0.18 : 0.06)
        : 0.035 + column / (columns - 1) * 0.93;
      nodes.push({
        x: Math.min(0.965, x),
        y: settledY + Math.sin(column * 1.7 + rail) * (identity === "review" ? 0.012 : 0.045),
        settledY,
        depth: 0.35 + rail * 0.3,
        phase: column * 1.3 + rail * 2.1,
        primary: (column % (compact ? 2 : 3) === 0 && rail !== 1) || (identity === "review" && rail === 1),
      });
      if (column > 0) edges.push([index - 3, index]);
      if (rail > 0 && (!compact || column % 2 === 0)) edges.push([index - 1, index]);
    }
  }
  // One additional cross-rail connection keeps the compact graph balanced.
  if (compact) edges.push([16, 17]);
  // Precomputed, connected three-edge routes; no proximity searches per frame.
  const paths: number[][] = [];
  for (let rail = 0; rail < 3; rail++) {
    for (let column = 0; column < columns - 3; column += 3) {
      paths.push([column * 3 + rail, (column + 1) * 3 + rail, (column + 2) * 3 + rail, (column + 3) * 3 + rail]);
    }
  }
  return { nodes, edges, paths };
}

export function damp(current: number, target: number, seconds: number, tau = 0.45) {
  return current + (target - current) * (1 - Math.exp(-seconds / tau));
}
