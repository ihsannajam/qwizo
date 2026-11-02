import { createServer } from "node:http";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError, createAiService } from "./service";
import { validateOrigin } from "./security";
import { frontendResponse } from "./frontend";
import { createCredentialVault } from "./chatgpt/vault";
import { createChatgptManager } from "./chatgpt/manager";
// The bundled file lives in dist-server/, independent of the launch directory.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(resolve(projectRoot, ".env"));
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
const apiConfig = {
  key: process.env.OPENAI_API_KEY ?? "",
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  dailyLimit,
};
const chatgpt = createChatgptManager({
  port,
  vault: createCredentialVault(resolve(projectRoot, ".qwizo-auth")),
  api: apiConfig,
});
const service = createAiService(
  {
    ...apiConfig,
    getStatus: () => chatgpt.status(),
    available: async () => Boolean((await chatgpt.status()).ready),
  },
  chatgpt.call,
);
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
    if (path === "/auth/chatgpt/start" || path === "/auth/callback") {
      if (req.method !== "GET") throw new ApiError(405, "method_not_allowed");
      validateOrigin(undefined, req.headers.host ?? "", undefined, port);
      const query = new URL(req.url!, `http://127.0.0.1:${port}`).searchParams;
      const result =
        path === "/auth/chatgpt/start"
          ? await chatgpt.begin(query.get("ticket") ?? "")
          : await chatgpt.callback(query, req.headers.cookie ?? "");
      res.writeHead(303, {
        Location: result.location,
        "Set-Cookie": result.cookie,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      });
      res.end();
      return;
    }
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
      return send(
        200,
        path.startsWith("/api/ai/chatgpt/")
          ? await chatgpt.handle(req.method ?? "GET", path, body)
          : await service.handle(req.method ?? "GET", path, body),
      );
    }
    const frontend = await frontendResponse(
      path,
      resolve(projectRoot, "dist"),
      req.method ?? "GET",
    );
    res.writeHead(frontend.status, {
      "Content-Type": frontend.type,
      "Cache-Control": "no-cache",
    });
    res.end(frontend.body);
  } catch (error) {
    if (req.url?.startsWith("/auth/")) {
      res.writeHead(error instanceof ApiError ? error.status : 500, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      });
      res.end(
        '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Qwizo — Login ChatGPT</title><body style="font:16px/1.7 system-ui;padding:32px;background:#f5f0ff;color:#342c65"><h1>Koneksi ChatGPT belum selesai</h1><p>Login dibatalkan, kedaluwarsa, atau belum dapat diverifikasi. Kembali ke Qwizo dan coba hubungkan lagi. Akun yang sebelumnya tersimpan tidak diganti.</p><p>Pastikan server Qwizo tetap berjalan selama login. Jangan menyalin token atau kode login ke percakapan.</p><a href="/world">Kembali ke Qwizo</a></body></html>',
      );
      return;
    }
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
