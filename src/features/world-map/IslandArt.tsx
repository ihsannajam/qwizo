import type { Island } from "./islands";
export function IslandArt({ island }: { island: Island }) {
  return (
    <img
      className="island-art rendered-island"
      src={`/assets/islands/${island.id}.webp`}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={island.id === "math" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
