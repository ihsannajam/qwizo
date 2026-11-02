export interface TerrainSize {
  width: number;
  height: number;
}

/** Cover the viewport with the complete coordinate plane; overflow stays pannable. */
export function getTerrainSize(
  viewportWidth: number,
  viewportHeight: number,
): TerrainSize {
  const viewWidth = Number.isFinite(viewportWidth)
    ? Math.max(1, viewportWidth)
    : 1;
  const viewHeight = Number.isFinite(viewportHeight)
    ? Math.max(1, viewportHeight)
    : 1;
  const minimumWidth = viewWidth < 768 ? 1100 : 850;
  const ratio = TERRAIN.width / TERRAIN.height;
  const width = Math.ceil(
    Math.max(viewWidth, viewHeight * ratio, minimumWidth),
  );
  return { width, height: width / ratio };
}

export function getTerrainFocus(
  size: TerrainSize,
  viewportWidth: number,
  viewportHeight: number,
  point: readonly [number, number],
) {
  return {
    left: Math.max(
      0,
      Math.min(
        size.width - viewportWidth,
        (point[0] / TERRAIN.width) * size.width - viewportWidth * 0.5,
      ),
    ),
    top: Math.max(
      0,
      Math.min(
        size.height - viewportHeight,
        (point[1] / TERRAIN.height) * size.height - viewportHeight * 0.55,
      ),
    ),
  };
}
import { TERRAIN } from "./data/trail";
