import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { ApiError, createAiService } from "./service";
import { validateOrigin } from "./security";
try {
  process.loadEnvFile(resolve(".env"));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT")
    throw new Error("Cannot load .env configuration");
}
const port = Number(process.env.AI_PORT ?? 5075);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid AI_PORT");
const dailyLimit = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? 100);
if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 10000)
  throw new Error("Invalid AI_DAILY_REQUEST_LIMIT");
const service = createAiService({
  key: process.env.OPENAI_API_KEY ?? "",
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  dailyLimit,
});
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  const send = (status: number, body: unknown) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(body));
  };
  try {
    const path = new URL(req.url ?? "/", `http://localhost:${port}`).pathname;
    if (path.startsWith("/api/")) {
      validateOrigin(
        req.headers.origin,
        req.headers.host ?? "",
        req.headers["sec-fetch-site"] as string | undefined,
        port,
      );
      let body: unknown = {};
      if (req.method === "POST") {
        if (!req.headers["content-type"]?.startsWith("application/json"))
          throw new ApiError(415, "json_required");
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 24000) throw new ApiError(413, "request_too_large");
          chunks.push(Buffer.from(chunk));
        }
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          throw new ApiError(400, "invalid_request");
        }
      }
      return send(200, await service.handle(req.method ?? "GET", path, body));
    }
    if (req.method !== "GET" && req.method !== "HEAD")
      throw new ApiError(405, "method_not_allowed");
    const root = await realpath(resolve("dist"));
    let file = resolve(root, "." + decodeURIComponent(path));
    if (file !== root && !file.startsWith(root + sep))
      throw new ApiError(404, "not_found");
    try {
      if (!(await stat(file)).isFile()) file = resolve(root, "index.html");
    } catch {
      if (extname(path)) throw new ApiError(404, "not_found");
      file = resolve(root, "index.html");
    }
    file = await realpath(file);
    if (!file.startsWith(root + sep)) throw new ApiError(404, "not_found");
    const content = req.method === "HEAD" ? undefined : await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(content);
  } catch (error) {
    if (error instanceof ApiError)
      return send(error.status, { error: error.code });
    send(500, { error: "server_error" });
  }
});
server.requestTimeout = 60000;
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Qwizo AI server: http://127.0.0.1:${port} (credentials stay server-side)`,
  ),
);
