/** Fit the archipelago between the floating game controls. */
export function getWorldFit(width: number, height: number) {
  return Math.max(
    0.18,
    Math.min(
      (width - (width < 768 ? 32 : 160)) / 1250,
      (height - (width < 768 ? 200 : 145)) / 850,
      1,
    ),
  );
}
