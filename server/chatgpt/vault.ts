import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { ApiError } from "../service";
import type { Grant, Identity } from "./protocol";

export interface Connection {
  id: string;
  clientId: string;
  identity: Identity;
  grant: Grant | null;
  model: string;
  nonce: string;
  needsLogin: boolean;
}
export interface VaultData {
  version: 1;
  hostId: string;
  activeId: string | null;
  provider: "chatgpt" | "api-key";
  accounts: Connection[];
}
export interface CredentialVault {
  read: () => Promise<VaultData>;
  write: (data: VaultData) => Promise<void>;
}
export interface VaultCodec {
  seal: (text: string) => Promise<string>;
  open: (text: string) => Promise<string>;
}
const dpapi = (text: string, decrypt: boolean) =>
  new Promise<string>((resolve, reject) => {
    // Secret text is passed over stdin, never command-line arguments or console logs.
    const script = `[Console]::InputEncoding=[Text.UTF8Encoding]::new($false); [Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); Add-Type -AssemblyName System.Security; $data=[Console]::In.ReadToEnd(); $bytes=${decrypt ? "[Convert]::FromBase64String($data)" : "[Text.Encoding]::UTF8.GetBytes($data)"}; $result=[Security.Cryptography.ProtectedData]::${decrypt ? "Unprotect" : "Protect"}($bytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Write(${decrypt ? "[Text.Encoding]::UTF8.GetString($result)" : "[Convert]::ToBase64String($result)"})`;
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] },
    );
    let output = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.length > 1000000) child.kill();
    });
    child.stderr.resume();
    const timeout = setTimeout(() => child.kill(), 15000);
    child.on("error", () => {
      clearTimeout(timeout);
      reject(new ApiError(503, "chatgpt_storage_locked"));
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve(output);
      else reject(new ApiError(503, "chatgpt_storage_locked"));
    });
    child.stdin.on("error", () => {});
    child.stdin.end(text, "utf8");
  });
export function createCredentialVault(
  directory: string,
  codec: VaultCodec = process.platform === "win32"
    ? { seal: (text) => dpapi(text, false), open: (text) => dpapi(text, true) }
    : { seal: async (text) => text, open: async (text) => text },
): CredentialVault {
  const file = resolve(directory, "connections.dat");
  let queue = Promise.resolve();
  let initializing: Promise<VaultData> | null = null;
  let cached: VaultData | undefined;
  const read = async () => {
    await queue;
    if (cached) return structuredClone(cached);
    try {
      const text = await codec.open(await readFile(file, "utf8"));
      const data = JSON.parse(text) as VaultData;
      if (
        data.version !== 1 ||
        !/^urn:uuid:[a-f0-9-]{36}$/.test(data.hostId) ||
        !Array.isArray(data.accounts) ||
        !["chatgpt", "api-key"].includes(data.provider)
      )
        throw new Error();
      cached = structuredClone(data);
      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        if (!initializing) {
          const data: VaultData = {
            version: 1,
            hostId: `urn:uuid:${randomUUID()}`,
            activeId: null,
            provider: "chatgpt",
            accounts: [],
          };
          initializing = write(data).then(() => data);
        }
        return structuredClone(await initializing);
      }
      throw new ApiError(503, "chatgpt_storage_locked");
    }
  };
  const write = (data: VaultData) => {
    const snapshot = structuredClone(data);
    const save = async () => {
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const temporary = resolve(directory, `connections-${randomUUID()}.tmp`);
      try {
        await writeFile(temporary, await codec.seal(JSON.stringify(snapshot)), {
          mode: 0o600,
          flag: "wx",
        });
        await rename(temporary, file);
        cached = structuredClone(snapshot);
      } catch {
        await unlink(temporary).catch(() => {});
        throw new ApiError(503, "chatgpt_storage_locked");
      }
    };
    const result = queue.then(save);
    queue = result.catch(() => {});
    return result;
  };
  return { read, write };
}
