import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { ApiError } from "./service";

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
const missing = (error: unknown) =>
  (error as NodeJS.ErrnoException)?.code === "ENOENT";
const setupPage = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Qwizo — Siapkan halaman</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#efe6ff,#fff1d4);font:16px/1.65 system-ui,sans-serif;color:#342c65}main{max-width:620px;margin:24px;padding:32px;border:2px solid #d6bce8;border-radius:26px;background:#fffaf2;box-shadow:0 14px 45px #7255e822}h1{font-size:28px;line-height:1.3}strong{color:#7255e8}pre{padding:15px;border-radius:12px;background:#ece3ff;overflow:auto}a{display:inline-block;color:white;background:#7255e8;text-decoration:none;border-radius:12px;padding:10px 16px}small{color:#806a99}</style></head><body><main>
<strong>qwizo!</strong><h1>Server sudah berjalan. Halaman Qwizo belum dibangun.</h1>
<p>Ini terjadi jika proyek baru diambil dari GitHub atau hanya menjalankan server AI. File halaman perlu disiapkan terlebih dahulu. Halaman ini tidak menunjukkan masalah pada API key.</p>
<h2>Jalankan dalam satu terminal</h2><p>Hentikan server dengan Ctrl+C, lalu jalankan dari folder proyek:</p><pre>npm start</pre><p>Versi terbaru akan membangun halaman dan server secara otomatis sebelum membuka aplikasi di port ini.</p>
<h2>Atau gunakan mode pengembangan</h2><p>Biarkan server AI berjalan, lalu buka terminal kedua:</p><pre>npm run dev</pre><a href="http://localhost:5174">Buka Qwizo di port 5174</a>
<p><small>Jangan tampilkan atau kirim API key untuk memperbaiki halaman ini.</small></p></main></body></html>`;

/** Serve only built public assets; a fresh clone gets setup instructions instead of a 500. */
export async function frontendResponse(
  path: string,
  directory: string,
  method = "GET",
) {
  if (method !== "GET" && method !== "HEAD")
    throw new ApiError(405, "method_not_allowed");
  const setup = () => ({
    status: 503,
    type: mime[".html"],
    body: method === "HEAD" ? undefined : Buffer.from(setupPage),
  });
  let root: string;
  try {
    root = await realpath(directory);
  } catch (error) {
    if (missing(error)) return setup();
    throw error;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    throw new ApiError(400, "invalid_path");
  }
  if (
    decoded.split(/[\\/]/).some((part) => part.startsWith(".") && part !== "")
  )
    throw new ApiError(404, "not_found");
  let file = resolve(root, "." + decoded);
  if (file !== root && !file.startsWith(root + sep))
    throw new ApiError(404, "not_found");
  try {
    if (!(await stat(file)).isFile()) file = resolve(root, "index.html");
  } catch (error) {
    if (!missing(error)) throw error;
    if (extname(decoded)) throw new ApiError(404, "not_found");
    file = resolve(root, "index.html");
  }
  try {
    file = await realpath(file);
    if (!file.startsWith(root + sep)) throw new ApiError(404, "not_found");
    const content = await readFile(file);
    return {
      status: 200,
      type: mime[extname(file)] ?? "application/octet-stream",
      body: method === "HEAD" ? undefined : content,
    };
  } catch (error) {
    if (missing(error) && file === resolve(root, "index.html")) return setup();
    if (missing(error)) throw new ApiError(404, "not_found");
    throw error;
  }
}
