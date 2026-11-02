import { useEffect, useState } from "react";
import { aiRequest, type AiStatus } from "./client";
export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void aiRequest<AiStatus>("status", undefined, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setStatus(value);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setStatus({ ready: false, provider: "OpenAI", model: "" });
      });
    return () => controller.abort();
  }, []);
  return status;
}
