/** Coordinates are authored against the un-cropped 1536 × 1024 terrain. */
export type Point = readonly [number, number];
export const TERRAIN = { width: 1536, height: 1024 };
export const stopIds = [
  "fungsi",
  "statistika",
  "peluang",
  "geometri",
  "turunan",
  "integral",
] as const;
export const stopPoints: Point[] = [
  [158, 834],
  [510, 566],
  [718, 467],
  [846, 334],
  [1104, 321],
  [1245, 218],
];
// Samples trace the cobblestones and both bridges already painted in the artwork.
const segments: Point[][] = [
  [
    [158, 834],
    [207, 821],
    [258, 809],
    [301, 789],
    [326, 767],
    [339, 740],
    [337, 707],
    [339, 678],
    [355, 658],
    [382, 645],
    [414, 631],
    [443, 611],
    [470, 590],
    [493, 577],
    [510, 566],
  ],
  [
    [510, 566],
    [533, 555],
    [546, 540],
    [568, 524],
    [608, 519],
    [652, 509],
    [691, 492],
    [710, 480],
    [718, 467],
  ],
  [
    [718, 467],
    [726, 451],
    [718, 435],
    [699, 419],
    [685, 409],
    [680, 396],
    [687, 385],
    [711, 373],
    [742, 362],
    [774, 351],
    [807, 340],
    [846, 334],
  ],
  [
    [846, 334],
    [878, 331],
    [908, 336],
    [944, 339],
    [982, 340],
    [1020, 337],
    [1054, 332],
    [1085, 327],
    [1104, 321],
  ],
  [
    [1104, 321],
    [1122, 304],
    [1133, 284],
    [1150, 273],
    [1182, 264],
    [1211, 254],
    [1239, 242],
    [1253, 228],
    [1245, 218],
  ],
];
export function getStopPoint(id: string): Point {
  return stopPoints[
    Math.max(
      0,
      stopIds.findIndex((s) => s === id),
    )
  ];
}
export function getJourney(from: string, to: string): Point[] {
  const a = stopIds.findIndex((id) => id === from),
    b = stopIds.findIndex((id) => id === to);
  if (a < 0 || b < 0 || a === b) return [getStopPoint(to)];
  const points: Point[] = [];
  if (a < b) {
    for (let i = a; i < b; i++)
      points.push(...segments[i].slice(points.length ? 1 : 0));
  } else {
    for (let i = a - 1; i >= b; i--)
      points.push(...[...segments[i]].reverse().slice(points.length ? 1 : 0));
  }
  return points;
}
export function getJourneyTiming(points: Point[]) {
  const distances = [0];
  for (let i = 1; i < points.length; i++)
    distances.push(
      distances[i - 1] +
        Math.hypot(
          points[i][0] - points[i - 1][0],
          points[i][1] - points[i - 1][1],
        ),
    );
  const total = distances[distances.length - 1];
  return {
    duration: Math.min(7.5, Math.max(1.1, total / 220)),
    times: distances.map((d) => (total ? d / total : 0)),
  };
}
