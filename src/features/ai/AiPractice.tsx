import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw, Check, X } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import {
  aiErrorMessage,
  aiRequest,
  type PracticePacket,
  type PracticeResult,
} from "./client";
import { useAiStatus } from "./useAiStatus";
import "./ai.css";
export function AiPractice({
  lessonId,
  onActiveChange,
}: {
  lessonId: string;
  onActiveChange?: (active: boolean) => void;
}) {
  const { language } = useI18n(),
    status = useAiStatus();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const [difficulty, setDifficulty] = useState("medium"),
    [packet, setPacket] = useState<PracticePacket | null>(null),
    [result, setResult] = useState<PracticeResult | null>(null),
    [answers, setAnswers] = useState<(number | null)[]>([null, null, null]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [hint, setHint] = useState<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const lock = useRef(false),
    region = useRef<HTMLElement>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    onActiveChange?.(busy || (!!packet && !result));
    return () => onActiveChange?.(false);
  }, [packet, result, busy, onActiveChange]);
  useEffect(() => {
    if (packet) region.current?.focus();
  }, [packet, result]);
  const generate = async () => {
    if (lock.current) return;
    lock.current = true;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError(null);
    try {
      const data = await aiRequest<PracticePacket>(
        "practice",
        { lessonId, language, difficulty },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setPacket(data);
      setResult(null);
      setAnswers([null, null, null]);
      setHint(null);
    } catch (error) {
      if (!controller.signal.aborted) setError(aiErrorMessage(error, language));
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        lock.current = false;
      }
    }
  };
  const submit = async () => {
    if (!packet || answers.some((a) => a === null) || lock.current) return;
    lock.current = true;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError(null);
    try {
      const data = await aiRequest<PracticeResult>(
        "practice/grade",
        { attemptId: packet.attemptId, answers },
        controller.signal,
      );
      if (!controller.signal.aborted) setResult(data);
    } catch (error) {
      if (!controller.signal.aborted) setError(aiErrorMessage(error, language));
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        lock.current = false;
      }
    }
  };
  return (
    <section
      className="ai-practice"
      aria-label={c("Latihan generatif AI", "AI-generated practice")}
      ref={region}
      tabIndex={-1}
    >
      <div className="ai-practice-heading">
        <span>
          <Sparkles size={18} />
          {c("Tantangan baru dari AI", "A fresh challenge from AI")}
        </span>
        <small>{c("Latihan bebas • tanpa XP", "Free practice • no XP")}</small>
      </div>
      <p>
        {c(
          "Coba tiga soal baru sesuai materi ini. Soal dibuat AI dan bisa keliru; hasilnya tidak mengubah kelulusan atau hadiahmu.",
          "Try three fresh questions for this lesson. AI-generated questions may contain mistakes; results do not affect your progress or rewards.",
        )}
      </p>
      {!packet && (
        <div className="ai-practice-controls">
          <label>
            {c("Kesulitan", "Difficulty")}
            <select
              value={difficulty}
              disabled={busy}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">{c("Mudah", "Easy")}</option>
              <option value="medium">{c("Sedang", "Medium")}</option>
              <option value="hard">{c("Sulit", "Hard")}</option>
            </select>
          </label>
          <button
            className="secondary-button"
            disabled={!status?.ready || busy}
            onClick={() => void generate()}
          >
            <Sparkles size={16} />
            {busy
              ? c("Menyusun soal…", "Creating questions…")
              : c("Buat 3 soal AI", "Generate 3 AI questions")}
          </button>
        </div>
      )}
      {status && !status.ready && (
        <small className="ai-availability">
          {c(
            "AI belum tersedia. Kamu tetap bisa mengikuti kuis utama dan memakai panduan Qwi.",
            "AI is not available yet. You can still take the main quiz and use Qwi’s guide.",
          )}
        </small>
      )}
      {packet && !result && (
        <div className="ai-practice-questions">
          {packet.questions.map((q, i) => (
            <fieldset key={q.id} disabled={busy}>
              <legend>
                {i + 1}. {q.prompt}
              </legend>
              <div className="answer-options">
                {q.options.map((option, n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={answers[i] === n}
                    className={answers[i] === n ? "chosen" : ""}
                    onClick={() =>
                      setAnswers((a) => a.map((v, j) => (i === j ? n : v)))
                    }
                  >
                    <span>{String.fromCharCode(65 + n)}</span>
                    {option}
                  </button>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => setHint(hint === i ? null : i)}
              >
                {c("Lihat petunjuk", "Show hint")}
              </button>
              {hint === i && <p className="ai-hint">{q.hint}</p>}
            </fieldset>
          ))}
          <button
            className="secondary-button"
            disabled={busy || answers.some((a) => a === null)}
            onClick={() => void submit()}
          >
            {c("Periksa latihan AI", "Check AI practice")}
          </button>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              setPacket(null);
              setError(null);
            }}
          >
            {c("Buang latihan ini", "Discard this practice")}
          </button>
        </div>
      )}
      {result && (
        <div className="ai-practice-result" role="status">
          <h3>
            {result.correct}/{result.total}{" "}
            {c("jawaban benar", "correct answers")}
          </h3>
          {result.review.map((q, i) => (
            <section key={i}>
              <b>
                {q.correct ? <Check size={16} /> : <X size={16} />} {q.prompt}
              </b>
              <p>
                {c("Jawabanmu: ", "Your answer: ")}
                {q.options[q.chosen]}
              </p>
              <p>{q.explanation}</p>
            </section>
          ))}
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => void generate()}
          >
            <RefreshCw size={16} />
            {c("Buat latihan baru", "Create a new practice")}
          </button>
        </div>
      )}
      {error && (
        <p className="ai-error" role="alert">
          {error}
        </p>
      )}
      {busy && (
        <p role="status" aria-live="polite">
          {c(
            "Sebentar, Qwi sedang menyiapkan…",
            "One moment, Qwi is getting ready…",
          )}
        </p>
      )}
    </section>
  );
}
