import { useEffect, useRef, useState } from "react";
import { Send, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { Sheet } from "../../components/ui";
import { useI18n } from "../../i18n/useI18n";
import type { LearningUnit, Question } from "./curriculum";
import { tutorReply, type HelpKind } from "./tutor";
import { aiRequest, aiErrorMessage } from "../ai/client";
import { useAiStatus } from "../ai/useAiStatus";
import "../ai/ai.css";
export function TutorPanel({
  unit,
  question,
  answered,
  close,
}: {
  unit: LearningUnit;
  question?: Question;
  answered: boolean;
  close: () => void;
}) {
  const { language } = useI18n();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const [input, setInput] = useState("");
  const status = useAiStatus();
  const [mode, setMode] = useState<"guide" | "ai">("guide");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<
    { role: "qwi" | "you"; text: string; source?: "ai" | "guide" }[]
  >([
    {
      role: "qwi",
      text: c(
        "Hai! Aku bantu memahami langkahnya. Pilih bantuan atau tulis pertanyaan tentang konsep, petunjuk, atau contoh.",
        "Hi! Let’s understand the steps together. Choose some help or ask about a concept, hint, or example.",
      ),
    },
  ]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  useEffect(() => () => request.current?.abort(), []);
  const sendAi = async (text: string) => {
    if (lock.current || !status?.ready || question) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    request.current = controller;
    const history = messages
      .filter((m) => m.source === "ai")
      .slice(-8)
      .map((m) => ({
        role: m.role === "you" ? "user" : "assistant",
        text: m.text.slice(0, 2000),
      }));
    setMessages((m) => [...m, { role: "you", text, source: "ai" }]);
    setInput("");
    try {
      const response = await aiRequest<{
        reply: string;
        source: "ai" | "guide";
      }>(
        "tutor",
        { lessonId: unit.id, language, message: text, history },
        controller.signal,
      );
      if (!controller.signal.aborted)
        setMessages((m) => [
          ...m,
          { role: "qwi", text: response.reply, source: response.source },
        ]);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(aiErrorMessage(error, language));
        setInput(text);
      }
    } finally {
      if (!controller.signal.aborted) {
        lock.current = false;
        setBusy(false);
      }
    }
  };
  const respond = (kind: HelpKind, prompt?: string) => {
    if (mode === "ai" && !question) {
      void sendAi(
        prompt ??
          c(
            kind === "concept"
              ? "Jelaskan konsep materi ini"
              : kind === "hint"
                ? "Bantu aku memahami langkah-langkahnya"
                : "Berikan contoh lain dan pembahasannya",
            kind === "concept"
              ? "Explain this lesson’s concept"
              : kind === "hint"
                ? "Help me understand the steps"
                : "Give another worked example",
          ),
      );
      return;
    }
    const text = tutorReply(unit, question, answered, kind, language);
    setMessages((m) => [
      ...m,
      {
        role: "you",
        text:
          prompt ??
          c(
            kind === "concept"
              ? "Jelaskan konsepnya"
              : kind === "hint"
                ? "Beri petunjuk"
                : "Tunjukkan pembahasan",
            kind === "concept"
              ? "Explain the concept"
              : kind === "hint"
                ? "Give me a hint"
                : "Show the explanation",
          ),
      },
      { role: "qwi", text },
    ]);
  };
  return (
    <div className="tutor-layer">
      <Sheet title={c("Tutor Qwi", "Qwi Tutor")} close={close}>
        <div className="tutor-intro">
          <img src="/assets/mascot-transparent.webp" alt="Qwi" />
          <div>
            <b>{c("Teman berpikirmu", "Your thinking companion")}</b>
            <p>
              {c(
                mode === "ai"
                  ? "AI generatif • periksa kembali penjelasannya"
                  : "Panduan lokal • bantuan terstruktur, bukan AI langsung",
                mode === "ai"
                  ? "Generative AI • double-check explanations"
                  : "Local guide • structured help, not live AI",
              )}
            </p>
          </div>
        </div>
        <div className="ai-mode">
          <button
            aria-pressed={mode === "guide"}
            disabled={busy}
            onClick={() => {
              setMode("guide");
              setError(null);
            }}
          >
            {" "}
            {c("Panduan lokal", "Local guide")}
          </button>
          <button
            aria-pressed={mode === "ai"}
            disabled={busy || !status?.ready || !!question}
            onClick={() => setMode("ai")}
          >
            {c("AI generatif", "Generative AI")}
          </button>
          <small>
            {question
              ? c(
                  "Saat kuis aktif, Qwi memakai petunjuk terstruktur. Tanya jawab AI tersedia saat membaca materi.",
                  "During an active quiz, Qwi uses structured hints. AI chat is available while reading.",
                )
              : !status?.ready
                ? c(
                    "Mode AI belum tersedia. Koneksi dapat dikelola di Pengaturan → Pengaturan lanjutan; panduan lokal tetap bisa dipakai.",
                    "AI mode is not available yet. Manage the connection in Settings → Advanced settings; the local guide still works.",
                  )
                : c(
                    "Tanya konsep atau minta contoh baru dalam bahasa pilihanmu.",
                    "Ask about concepts or request fresh examples in your chosen language.",
                  )}
          </small>
        </div>
        <div className="tutor-messages" ref={log} role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`tutor-message ${m.role} ${m.source === "ai" ? "ai" : ""}`}
            >
              <small>{m.role === "qwi" ? "Qwi" : c("Kamu", "You")}</small>
              <p>{m.text}</p>
              {m.source && m.role === "qwi" && (
                <span className="message-source">
                  {m.source === "ai" ? "AI" : c("Panduan lokal", "Local guide")}
                </span>
              )}
            </div>
          ))}
        </div>
        {busy && (
          <p role="status">{c("Qwi sedang berpikir…", "Qwi is thinking…")}</p>
        )}
        {error && (
          <p role="alert" className="ai-error">
            {error}
          </p>
        )}
        <div className="tutor-shortcuts">
          <button disabled={busy} onClick={() => respond("concept")}>
            <BookOpen size={15} />
            {c("Konsep", "Concept")}
          </button>
          <button disabled={busy} onClick={() => respond("hint")}>
            <Lightbulb size={15} />
            {c("Petunjuk", "Hint")}
          </button>
          <button disabled={busy} onClick={() => respond("example")}>
            <Sparkles size={15} />
            {c("Pembahasan", "Explain")}
          </button>
        </div>
        <form
          className="tutor-form"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text || busy) return;
            if (mode === "ai") {
              void sendAi(text);
              return;
            }
            setInput("");
            if (/contoh|example|bahas|explain|jawab|answer/i.test(text))
              respond("example", text);
            else if (/petunjuk|hint|langkah|step/i.test(text))
              respond("hint", text);
            else if (
              /konsep|concept|rumus|formula|apa|what|mengapa|why/i.test(text)
            )
              respond("concept", text);
            else
              setMessages((m) => [
                ...m,
                { role: "you", text },
                {
                  role: "qwi",
                  text: c(
                    "Aku belum bisa menjawab pertanyaan bebas. Pilih Konsep, Petunjuk, atau Pembahasan untuk bantuan yang sesuai materi ini.",
                    "I cannot answer open-ended questions yet. Choose Concept, Hint, or Explain for help with this lesson.",
                  ),
                },
              ]);
          }}
        >
          <input
            aria-label={c("Tanya Qwi", "Ask Qwi")}
            placeholder={c(
              "Tanya konsep atau petunjuk…",
              "Ask for a concept or hint…",
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1200}
            disabled={busy}
          />
          <button
            aria-label={c("Kirim pertanyaan", "Send question")}
            disabled={!input.trim() || busy}
          >
            <Send size={18} />
          </button>
        </form>
      </Sheet>
    </div>
  );
}
