import type { CSSProperties } from "react";
const flightPath =
  'path("M 100 370 Q 80 220 205 145 T 490 100 Q 660 45 800 135 T 1060 245 Q 1160 360 990 470 T 1030 665 Q 800 780 660 580 T 425 360 Q 250 270 100 370 Z")';
export function WorldBirds() {
  return (
    <div className="world-birds" aria-hidden="true">
      {[0, 1, 2].map((flock) => (
        <div
          key={flock}
          className="bird-flight"
          style={
            {
              offsetPath: flightPath,
              animationDuration: `${58 + flock * 9}s`,
              animationDelay: `${-flock * 23}s`,
            } as CSSProperties
          }
        >
          {[0, 1, 2].map((bird) => (
            <svg
              key={bird}
              className="world-bird"
              viewBox="0 0 28 18"
              style={{
                left: bird * 24,
                top: bird === 1 ? 18 : 0,
                animationDelay: `${bird * -0.19}s`,
              }}
            >
              <path
                className="bird-wing left-wing"
                d="M14 11Q7 0 1 5Q8 5 14 13Z"
              />
              <path
                className="bird-wing right-wing"
                d="M14 11Q21 0 27 5Q20 5 14 13Z"
              />
              <path d="M13 10L14 8 16 10 15 15 13 14Z" />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
