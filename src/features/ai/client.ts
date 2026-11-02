export interface AiStatus {
  ready: boolean;
  provider: string;
  model: string;
  authMode?: "chatgpt" | "api-key";
  keyConfigured?: boolean;
  errorCode?: string;
  chatgpt?: {
    activeId: string | null;
    connected: boolean;
    planEnabled: boolean;
    notice: string;
    models: { slug: string; name: string }[];
    accounts: {
      id: string;
      name: string;
      email: string;
      connected: boolean;
      planEnabled: boolean;
      needsLogin: boolean;
    }[];
  };
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
    ai_out_of_scope: [
      "Soal AI keluar dari materi yang sedang dibuka dan tidak ditampilkan. Coba buat soal lagi untuk materi ini.",
      "The AI practice went outside the current lesson and was not shown. Try generating practice for this lesson again.",
    ],
    chatgpt_sign_in_required: [
      "Masuk kembali dengan ChatGPT untuk melanjutkan.",
      "Sign in again with ChatGPT to continue.",
    ],
    chatgpt_plan_unavailable: [
      "Pemakaian paket ChatGPT belum diizinkan atau tidak tersedia untuk akun ini. Periksa izin dan paket akunmu.",
      "ChatGPT plan usage is not authorized or available for this account. Check its permissions and plan.",
    ],
    chatgpt_usage_limit: [
      "Batas pemakaian paket ChatGPT tercapai. Kelola pemakaian di ChatGPT atau tunggu batasnya direset.",
      "Your ChatGPT plan usage limit was reached. Manage usage in ChatGPT or wait for the limit to reset.",
    ],
    chatgpt_connection_unavailable: [
      "Koneksi resmi ChatGPT belum dapat dihubungi. Coba lagi nanti.",
      "The ChatGPT connection is unavailable. Please try again later.",
    ],
    chatgpt_models_unavailable: [
      "Daftar model akun belum dapat dimuat. Coba perbarui koneksi.",
      "Your account’s model list could not be loaded. Try refreshing the connection.",
    ],
    chatgpt_invalid_identity: [
      "Hasil login belum dapat diverifikasi. Mulai login baru melalui tombol ChatGPT.",
      "The sign-in result could not be verified. Start a fresh ChatGPT sign-in.",
    ],
    chatgpt_storage_locked: [
      "Koneksi lokal tidak dapat dibuka oleh akun komputer ini. Jalankan Qwizo dengan akun Windows yang menyimpan koneksinya.",
      "The local connection cannot be opened by this computer account. Run Qwizo as the Windows user who saved it.",
    ],
    chatgpt_stream_incomplete: [
      "Jawaban ChatGPT terputus sebelum selesai. Coba lagi; tidak ada hasil yang dinilai.",
      "The ChatGPT response ended before completion. Try again; no result was graded.",
    ],
    chatgpt_request_unavailable: [
      "Permintaan ini belum didukung oleh akun/model ChatGPT yang dipilih. Coba model lain dari daftar akunmu.",
      "This request is not supported by the selected ChatGPT account or model. Try another model from your account’s list.",
    ],
    chatgpt_account_changed: [
      "Akun ChatGPT berubah. Perbarui koneksi lalu coba lagi.",
      "The ChatGPT account changed. Refresh the connection and try again.",
    ],
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
