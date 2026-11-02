export interface AiStatus {
  ready: boolean;
  provider: string;
  model: string;
}
export interface PracticePacket {
  attemptId: string;
  expiresIn: number;
  questions: { id: number; prompt: string; options: string[]; hint: string }[];
}
export interface PracticeResult {
  correct: number;
  total: number;
  xp: number;
  review: {
    prompt: string;
    options: string[];
    chosen: number;
    correct: boolean;
    answer: number;
    explanation: string;
  }[];
}
export class AiClientError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
export async function aiRequest<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/ai/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(55000)])
        : AbortSignal.timeout(55000),
    });
  } catch {
    throw new AiClientError("offline");
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new AiClientError("offline");
  }
  if (!response.ok)
    throw new AiClientError(
      (data as { error?: string })?.error ?? "ai_unavailable",
    );
  return data as T;
}
export function aiErrorMessage(error: unknown, language: "id" | "en") {
  const code = error instanceof AiClientError ? error.code : "ai_unavailable";
  const messages: Record<string, [string, string]> = {
    offline: [
      "AI belum dapat dihubungi. Coba lagi nanti; panduan lokal tetap tersedia.",
      "AI cannot be reached. Try again later; the local guide is still available.",
    ],
    ai_not_configured: [
      "AI belum diaktifkan untuk petualangan ini. Panduan lokal tetap tersedia.",
      "AI has not been enabled for this adventure. The local guide is still available.",
    ],
    local_limit: [
      "Batas latihan AI sementara tercapai. Coba lagi nanti.",
      "The temporary AI usage limit has been reached. Try again later.",
    ],
    provider_limit: [
      "Layanan AI sedang mencapai batas pemakaian. Coba lagi nanti.",
      "The AI provider’s usage limit has been reached. Try again later.",
    ],
    practice_expired: [
      "Latihan ini kedaluwarsa atau server dimulai ulang. Buat latihan baru.",
      "This practice expired or the server restarted. Create a new practice set.",
    ],
    practice_submitted: [
      "Latihan ini sudah dinilai. Buat latihan baru untuk mencoba kembali.",
      "This practice was already graded. Create a new set to try again.",
    ],
    invalid_ai_output: [
      "Soal atau jawaban AI belum lolos pemeriksaan format. Silakan coba lagi.",
      "The AI output did not pass format checks. Please try again.",
    ],
    ai_refused: [
      "AI tidak dapat menjawab permintaan ini. Coba pertanyaan Matematika yang lain.",
      "AI cannot answer this request. Try a different mathematics question.",
    ],
  };
  return (messages[code] ?? [
    "AI belum dapat merespons. Coba lagi nanti.",
    "AI cannot respond right now. Please try again later.",
  ])[language === "id" ? 0 : 1];
}
