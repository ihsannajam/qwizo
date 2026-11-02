import { ApiError, type ModelCall } from "../service";
export function chatgptCall(
  credentials: () => Promise<{
    accessToken: string;
    model: string;
    signal?: AbortSignal;
  }>,
  fetcher: typeof fetch = fetch,
): ModelCall {
  return async (request) => {
    const { accessToken, model, signal } = await credentials();
    let response: Response;
    try {
      response = await fetcher("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model,
          instructions: request.instructions,
          input: request.input,
          store: false,
          stream: true,
          text: {
            format: {
              type: "json_schema",
              name: request.name,
              strict: true,
              schema: request.schema,
            },
          },
        }),
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(45000)])
          : AbortSignal.timeout(45000),
      });
    } catch {
      if (signal?.aborted) throw new ApiError(409, "chatgpt_account_changed");
      throw new ApiError(504, "chatgpt_connection_unavailable");
    }
    if (!response.ok) {
      if (response.status === 401)
        throw new ApiError(401, "chatgpt_sign_in_required");
      if (response.status === 429)
        throw new ApiError(429, "chatgpt_usage_limit");
      throw new ApiError(
        response.status === 403 ? 403 : 502,
        "chatgpt_request_unavailable",
      );
    }
    if (!response.body) throw new ApiError(502, "chatgpt_stream_incomplete");
    const reader = response.body.getReader(),
      decoder = new TextDecoder();
    let buffer = "",
      size = 0,
      completed: unknown;
    const processEvent = (event: string) => {
      const data = event
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data || data === "[DONE]") return;
      let parsed: {
        type: string;
        response?: { error?: { code?: string } };
        error?: { code?: string };
      };
      try {
        parsed = JSON.parse(data);
      } catch {
        throw new ApiError(502, "chatgpt_stream_incomplete");
      }
      if (parsed.type === "response.completed") completed = parsed.response;
      if (
        ["response.failed", "response.incomplete", "error"].includes(
          parsed.type,
        )
      ) {
        const code = parsed.response?.error?.code ?? parsed.error?.code ?? "";
        if (code === "subscription_sharing_usage_limit_exceeded")
          throw new ApiError(429, "chatgpt_usage_limit");
        if (code === "subscription_sharing_usage_unavailable")
          throw new ApiError(403, "chatgpt_plan_unavailable");
        throw new ApiError(502, "chatgpt_stream_incomplete");
      }
    };
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) processEvent(buffer);
          break;
        }
        size += value.byteLength;
        if (size > 1000000)
          throw new ApiError(502, "chatgpt_stream_incomplete");
        buffer = (buffer + decoder.decode(value, { stream: true })).replace(
          /\r\n/g,
          "\n",
        );
        let boundary: number;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          processEvent(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
        }
      }
      const data = completed as
        | {
            status?: string;
            output?: {
              type: string;
              content?: { type: string; text?: string }[];
            }[];
          }
        | undefined;
      if (data?.status !== "completed")
        throw new ApiError(502, "chatgpt_stream_incomplete");
      const content = (data.output ?? [])
        .filter((o) => o.type === "message")
        .flatMap((o) => o.content ?? []);
      if (content.some((c) => c.type === "refusal"))
        throw new ApiError(422, "ai_refused");
      try {
        return JSON.parse(
          content
            .filter((c) => c.type === "output_text")
            .map((c) => c.text ?? "")
            .join(""),
        );
      } catch {
        throw new ApiError(502, "invalid_ai_output");
      }
    } catch (error) {
      if (signal?.aborted) throw new ApiError(409, "chatgpt_account_changed");
      if (error instanceof ApiError) throw error;
      throw new ApiError(502, "chatgpt_stream_incomplete");
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  };
}
