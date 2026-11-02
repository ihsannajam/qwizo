import { useEffect, useRef, useState } from "react";
import { Send, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { Sheet } from "../../components/ui";
import { useI18n } from "../../i18n/useI18n";
import type { LearningUnit, Question } from "./curriculum";
import { tutorReply, type HelpKind } from "./tutor";
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
  const log = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<
    { role: "qwi" | "you"; text: string }[]
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
  const respond = (kind: HelpKind, prompt?: string) => {
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
                "Panduan lokal • bantuan terstruktur, bukan AI langsung",
                "Local guide • structured help, not live AI",
              )}
            </p>
          </div>
        </div>
        <div className="tutor-messages" ref={log} role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`tutor-message ${m.role}`}>
              <small>{m.role === "qwi" ? "Qwi" : c("Kamu", "You")}</small>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
        <div className="tutor-shortcuts">
          <button onClick={() => respond("concept")}>
            <BookOpen size={15} />
            {c("Konsep", "Concept")}
          </button>
          <button onClick={() => respond("hint")}>
            <Lightbulb size={15} />
            {c("Petunjuk", "Hint")}
          </button>
          <button onClick={() => respond("example")}>
            <Sparkles size={15} />
            {c("Pembahasan", "Explain")}
          </button>
        </div>
        <form
          className="tutor-form"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text) return;
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
            maxLength={300}
          />
          <button
            aria-label={c("Kirim pertanyaan", "Send question")}
            disabled={!input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </Sheet>
    </div>
  );
}
