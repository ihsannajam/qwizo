import type { CSSProperties } from "react";

const crystalLights = [
  [438, 359],
  [1164, 389],
  [1290, 357],
  [854, 695],
  [680, 611],
  [454, 917],
  [61, 659],
  [1456, 145],
];
const waterLights = [
  [800, 307],
  [886, 419],
  [961, 466],
  [575, 656],
  [726, 719],
  [1324, 864],
];

/** Decorative layers share the terrain coordinates, leaving the painted road stationary. */
export function IslandAtmosphere({
  width,
  paused,
}: {
  width: number;
  paused: boolean;
}) {
  return (
    <div
      className={`island-atmosphere ${paused ? "atmosphere-paused" : ""}`}
      aria-hidden="true"
      style={
        { "--island-flight-distance": `${width + 240}px` } as CSSProperties
      }
    >
      <div className="island-sunlight" />
      <div className="island-cloud island-cloud-high" />
      <div className="island-cloud island-cloud-low" />
      <div className="island-cloud island-cloud-foreground" />
      {[0, 1, 2].map((flock) => (
        <div className={`island-bird-flock flock-${flock}`} key={flock}>
          <svg
            viewBox="0 0 110 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          >
            {[
              { x: 24, y: 22, scale: 0.8 },
              { x: 57, y: 32, scale: 0.6 },
              { x: 86, y: 14, scale: 0.5 },
            ].map((bird, i) => (
              <g
                key={i}
                transform={`translate(${bird.x} ${bird.y}) scale(${bird.scale})`}
              >
                <g className={`island-bird-wings wings-${i}`}>
                  <path d="M 0 0 Q -8 -14 -18 -8 M 0 0 Q 8 -14 18 -8" />
                </g>
              </g>
            ))}
          </svg>
        </div>
      ))}
      {crystalLights.map(([x, y], i) => (
        <span
          key={`crystal-${i}`}
          className="island-crystal-light"
          style={{
            left: `${(x / 1536) * 100}%`,
            top: `${(y / 1024) * 100}%`,
            animationDelay: `${-i * 1.7}s`,
          }}
        >
          ✧
        </span>
      ))}
      {waterLights.map(([x, y], i) => (
        <span
          key={`water-${i}`}
          className="island-water-light"
          style={{
            left: `${(x / 1536) * 100}%`,
            top: `${(y / 1024) * 100}%`,
            animationDelay: `${-i * 1.3}s`,
          }}
        />
      ))}
      <span className="island-waterfall-mist mist-upper" />
      <span className="island-waterfall-mist mist-lower" />
    </div>
  );
}
