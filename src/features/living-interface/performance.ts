export function renderingBudget(width: number, coarse: boolean, dpr: number, height: number) {
  const compact = width < 768 || coarse;
  return {
    compact,
    // Also bound the backing store on unusually large displays.
    ratio: Math.min(dpr, compact ? 1 : 1.5, Math.sqrt(2_400_000 / Math.max(1, width * height))),
    amplitude: compact ? 0.8 : 2,
  };
}
