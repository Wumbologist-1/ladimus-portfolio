export type VisualIdentity = "possibility" | "structure" | "evidence" | "authority" | "systems" | "review";

// Decorative identities, never live system status. Values blend as a region
// crosses the viewport, from its open composition to its settled composition.
export const presets = {
  possibility: { order: 0.08, motion: 1, line: 0.18, energy: 1, period: 12 },
  structure: { order: 0.6, motion: 0.55, line: 0.18, energy: 0.65, period: 15 },
  evidence: { order: 0.84, motion: 0.28, line: 0.2, energy: 0.4, period: 18 },
  authority: { order: 1, motion: 0.12, line: 0.2, energy: 0.16, period: 26 },
  systems: { order: 0.45, motion: 0.65, line: 0.2, energy: 0.75, period: 15 },
  review: { order: 0.95, motion: 0.2, line: 0.23, energy: 0.65, period: 16 },
} as const;
