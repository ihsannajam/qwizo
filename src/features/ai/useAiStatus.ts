import { useSyncExternalStore } from "react";
import { aiRequest, AiClientError, type AiStatus } from "./client";
let snapshot: AiStatus | null = null,
  request: Promise<void> | null = null,
  lastUpdate = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
export async function refreshAiStatus() {
  if (request) return request;
  request = (async () => {
    try {
      snapshot = await aiRequest<AiStatus>("status");
    } catch (error) {
      snapshot = {
        ready: false,
        provider: "ChatGPT",
        model: "",
        errorCode: error instanceof AiClientError ? error.code : "offline",
      };
    } finally {
      lastUpdate = Date.now();
      request = null;
      listeners.forEach((listener) => listener());
    }
  })();
  return request;
}
const onFocus = () => {
  void refreshAiStatus();
};
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    timer = setInterval(() => void refreshAiStatus(), 30000);
    window.addEventListener("focus", onFocus);
  }
  if (!snapshot || Date.now() - lastUpdate > 30000) void refreshAiStatus();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
      window.removeEventListener("focus", onFocus);
    }
  };
}
export function useAiStatus() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
}
