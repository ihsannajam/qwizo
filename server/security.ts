import { ApiError } from "./service";
export function validateOrigin(
  origin: string | undefined,
  host: string,
  site: string | undefined,
  port: number,
) {
  const allowedOrigins = new Set([
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]);
  if (origin && !allowedOrigins.has(origin))
    throw new ApiError(403, "origin_denied");
  if (
    ![
      `localhost:${port}`,
      `127.0.0.1:${port}`,
      "localhost:5174",
      "127.0.0.1:5174",
    ].includes(host)
  )
    throw new ApiError(403, "origin_denied");
  if (site === "cross-site") throw new ApiError(403, "origin_denied");
}
