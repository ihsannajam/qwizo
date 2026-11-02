import { useEffect, useRef, useState, useReducer } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  X,
} from "lucide-react";
import { useGame } from "../../store/game";
import { useI18n } from "../../i18n/useI18n";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ProgressBar } from "../../components/ui";
import { battleStatus, type Outcome } from "../../domain/progression";
import { bossQuestions, curriculum, findUnit } from "./curriculum";
import { topics } from "../island/data/topics";
import { TutorPanel } from "./TutorPanel";
import { newSession, sessionReducer } from "./session";
import { AiPractice } from "../ai/AiPractice";
import { BossArena } from "./BossArena";
import { BossResult } from "./BossResult";

export function LearningSession({
  id,
  close,
  next,
}: {
  id: string;
  close: () => void;
  next: (id: string) => void;
}) {
  const boss = id === "boss";
  const { language, t } = useI18n();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const game = useGame();
  const unit = boss ? curriculum[0] : findUnit(id)!;
  const lesson = topics
    .flatMap((topic) => topic.lessons)
    .find((l) => l.id === id);
  const questions = boss ? bossQuestions : unit.questions;
  const [{ phase, answers, choice, checked }, dispatch] = useReducer(
    sessionReducer,
    boss,
    newSession,
  );
  const [result, setResult] = useState<Outcome | null>(null);
  const [tutor, setTutor] = useState(false);
  const [exit, setExit] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const [attacking, setAttacking] = useState(false);
  const battle = battleStatus(boss ? answers : []);
  useEffect(() => {
    if (!attacking) return;
    const reduced =
      game.reduced ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => setAttacking(false),
      reduced ? 0 : battle.finished ? 2800 : 1200,
    );
    return () => window.clearTimeout(timer);
  }, [attacking, game.reduced, battle.finished]);
  const stage = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const index = checked ? answers.length - 1 : answers.length;
  const question = questions[index];
  const nextUnit = curriculum[curriculum.findIndex((u) => u.id === id) + 1];
  const requestClose = () =>
    (phase === "quiz" && answers.length > 0) || aiActive
      ? setExit(true)
      : close();
  useEffect(() => {
    const previous = document.activeElement;
    stage.current?.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [phase, index]);
  useEffect(() => {
    if ((phase !== "quiz" || !answers.length) && !aiActive) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase, answers.length, aiActive]);
  const check = () => {
    if (choice === null || checked || submitting.current) return;
    if (boss) setAttacking(true);
    dispatch({ type: "check" });
  };
  const advance = () => {
    if (submitting.current || attacking) return;
    if ((boss && battle.finished) || answers.length === questions.length) {
      submitting.current = true;
      const outcome = boss
        ? game.finishBoss(answers)
        : game.finishQuiz(id, answers);
      setResult(outcome);
      dispatch({ type: "result" });
    } else {
      dispatch({ type: "next" });
    }
  };
  const retry = () => {
    setResult(null);
    dispatch({ type: "retry" });
    submitting.current = false;
  };
  const tutorUnit = boss
    ? curriculum.find((u) => u.questions.some((q) => q.id === question?.id))!
    : unit;
  return (
    <div
      ref={stage}
      tabIndex={-1}
      className={`learning-stage ${boss ? `boss-stage boss-phase-${phase} ${checked ? "boss-answer-checked" : ""}` : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={
        boss
          ? c("Arena Penjaga Kristal", "Crystal Guardian Arena")
          : t(lesson?.title ?? "")
      }
      onKeyDown={(e) => {
        if (tutor) return;
        if (e.key === "Escape") {
          e.stopPropagation();
          if (exit) setExit(false);
          else requestClose();
        }
        if (e.key === "Tab") {
          const root = exit
            ? stage.current?.querySelector(".session-exit")
            : stage.current;
          const items = Array.from(
            root?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,textarea,a[href],select:not(:disabled),[tabindex='0']",
            ) ?? [],
          ).filter(
            (item) =>
              !item.closest("[inert]") && item.getClientRects().length > 0,
          );
          if (!items?.length) return;
          const first = items[0],
            last = items[items.length - 1];
          if (
            e.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === stage.current ||
              document.activeElement === heading.current)
          ) {
            e.preventDefault();
            last.focus();
          } else if (
            !e.shiftKey &&
            (document.activeElement === last ||
              document.activeElement === stage.current)
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <header
        className="learning-header"
        inert={exit || tutor || (boss && phase === "result")}
      >
        <button
          className="session-back"
          aria-label={c("Pulau Matematika", "Mathematics Island")}
          onClick={requestClose}
        >
          <ArrowLeft size={18} />
          <span>{c("Pulau Matematika", "Mathematics Island")}</span>
        </button>
        <img src="/assets/logo-transparent.webp" alt="qwizo!" />
        <LanguageToggle />
      </header>
      <div className="session-layout" inert={exit || tutor}>
        {boss ? (
          <BossArena
            bossHP={battle.bossHP}
            playerHP={battle.playerHP}
            attack={
              checked
                ? choice === question?.answer
                  ? "qwi"
                  : "guardian"
                : null
            }
            turn={answers.length}
            onHelp={() => setTutor(true)}
            inactive={phase === "result"}
          />
        ) : (
          <aside className="session-story">
            <span className="learning-eyebrow">
              {c("PETUALANGAN PENGETAHUAN", "KNOWLEDGE ADVENTURE")}
            </span>
            <h2>{t(lesson?.title ?? "")}</h2>
            <p>
              {c(
                "Pahami idenya, coba kuisnya, lalu buka langkah berikutnya.",
                "Understand the idea, try the quiz, then unlock your next step.",
              )}
            </p>
            <img
              className="lesson-qwi"
              src="/assets/mascot-transparent.webp"
              alt="Qwi"
            />
            <div className="learning-rules">
              <span>
                <Check size={16} />
                {c("Lulus: 2 dari 3 benar", "Pass: 2 of 3 correct")}
              </span>
              <span>
                <Sparkles size={16} />
                80 XP · 20 {c("koin sekali saat lulus", "coins on first pass")}
              </span>
              <span>
                {c("Boleh mengulang tanpa penalti", "Retry without penalty")}
              </span>
            </div>
            <button className="tutor-launch" onClick={() => setTutor(true)}>
              <Lightbulb size={20} />
              {c("Minta bantuan Qwi", "Ask Qwi for help")}
              <span>↗</span>
            </button>
          </aside>
        )}
        <main className="session-content">
          {phase === "read" && (
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="lesson-book"
            >
              <span className="learning-eyebrow">
                01 / {c("PAHAMI KONSEP", "UNDERSTAND THE CONCEPT")}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {t(lesson!.title)}
              </h1>
              <p className="lesson-lead">{t(lesson!.summary)}</p>
              <div className="worked-steps">
                {unit.steps.map((step, i) => (
                  <section key={i}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>
                        {i === 0
                          ? c("Cara berpikir", "How to think")
                          : c("Contoh bertahap", "Worked example")}
                      </h3>
                      <p>{step[language]}</p>
                    </div>
                  </section>
                ))}
              </div>
              <div className="lesson-takeaway">
                <Lightbulb size={21} />
                <p>{t(lesson!.example)}</p>
              </div>
              <button
                className="primary-button"
                disabled={aiActive}
                onClick={() => {
                  game.readLesson(id);
                  dispatch({ type: "start" });
                }}
              >
                {c("Siap! Mulai kuis", "Ready! Start quiz")}
                <ArrowRight size={18} />
              </button>
              <small className="session-note">
                {c(
                  "3 soal • Tidak dibatasi waktu • Bantuan selalu tersedia",
                  "3 questions • No time limit • Help is always available",
                )}
              </small>
              {aiActive && (
                <small className="session-note">
                  {c(
                    "Selesaikan atau buang latihan AI sebelum memulai kuis utama.",
                    "Finish or discard AI practice before starting the main quiz.",
                  )}
                </small>
              )}
              <AiPractice lessonId={id} onActiveChange={setAiActive} />
            </motion.article>
          )}
          {phase === "quiz" && question && (
            <article className="quiz-card">
              <div className="quiz-meta">
                <span className="learning-eyebrow">
                  {boss
                    ? c("SERANGAN", "ATTACK")
                    : c("CEK PEMAHAMAN", "CHECK YOUR UNDERSTANDING")}
                </span>
                <b>
                  {index + 1} / {questions.length}
                </b>
              </div>
              <ProgressBar value={(index / questions.length) * 100} />
              <h1 ref={heading} tabIndex={-1}>
                {question.prompt[language]}
              </h1>
              <div
                className="answer-options"
                role="group"
                aria-label={c("Pilihan jawaban", "Answer choices")}
              >
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    disabled={checked}
                    aria-pressed={choice === i}
                    className={`${choice === i ? "chosen" : ""} ${checked && i === question.answer ? "correct" : ""} ${checked && choice === i && i !== question.answer ? "incorrect" : ""}`}
                    onClick={() => dispatch({ type: "choose", choice: i })}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option[language]}
                    {checked && i === question.answer && <Check size={18} />}
                  </button>
                ))}
              </div>
              {checked && (
                <div
                  className={`answer-feedback ${choice === question.answer ? "right" : "wrong"}`}
                  role="status"
                >
                  <b>
                    {boss
                      ? choice === question.answer
                        ? c("Serangan tepat!", "A perfect hit!")
                        : c(
                            "Belum tepat. Perhatikan pembahasannya.",
                            "Not quite. Learn from this.",
                          )
                      : choice === question.answer
                        ? c(
                            "Tepat! Pemahamanmu bertambah.",
                            "Correct! Your understanding is growing.",
                          )
                        : c(
                            "Belum tepat. Mari pelajari langkahnya.",
                            "Not quite. Let’s learn the steps.",
                          )}
                  </b>
                  <p>{question.explanation[language]}</p>
                  {boss && (
                    <small>
                      {choice === question.answer
                        ? c("Penjaga −20 HP", "Guardian −20 HP")
                        : c("Perisai Qwi −50 HP", "Qwi’s shield −50 HP")}
                    </small>
                  )}
                </div>
              )}
              <button
                className="primary-button"
                disabled={attacking || (!checked && choice === null)}
                onClick={checked ? advance : check}
              >
                {attacking
                  ? c("Serangan berlangsung…", "Attack in progress…")
                  : checked
                    ? (boss && battle.finished) ||
                      answers.length === questions.length
                      ? c("Lihat hasil", "See results")
                      : c("Soal berikutnya", "Next question")
                    : boss
                      ? c("Kirim serangan", "Launch attack")
                      : c("Periksa jawaban", "Check answer")}
                {boss ? <Swords size={18} /> : <ArrowRight size={18} />}
              </button>
            </article>
          )}
          {phase === "result" && result && boss && (
            <BossResult
              result={result}
              answers={answers}
              questions={questions}
              playerHP={battle.playerHP}
              headingRef={heading}
              retry={retry}
              close={close}
            />
          )}
          {phase === "result" && result && !boss && (
            <article
              className={`result-card ${result.passed ? "victory" : "retry"}`}
            >
              <div className="result-medal">
                {result.passed ? <Trophy size={52} /> : <Shield size={52} />}
              </div>
              <span className="learning-eyebrow">
                {boss
                  ? c("HASIL PERTARUNGAN", "BATTLE RESULTS")
                  : c("HASIL PETUALANGAN", "ADVENTURE RESULTS")}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {result.passed
                  ? boss
                    ? c("Cahaya pulau kembali!", "The island shines again!")
                    : c("Langkah baru terbuka!", "A new step unlocked!")
                  : c("Coba lagi, kamu bisa!", "Try again, you can do it!")}
              </h1>
              <p>
                {result.correct} / {result.total}{" "}
                {c("jawaban benar", "correct answers")}
                {!boss &&
                  ` · ${Math.round((result.correct / result.total) * 100)}%`}
              </p>
              <div className="result-rewards">
                <span>
                  <Sparkles />+{result.xp} XP
                </span>
                <span>
                  ◈ +{result.coins} {c("koin", "coins")}
                </span>
              </div>
              <p className="session-note">
                {result.first
                  ? c(
                      "Hadiah pertama sudah tersimpan. Kamu bisa mengulang untuk memperkuat pemahaman.",
                      "Your first-pass reward is saved. Replay to strengthen your understanding.",
                    )
                  : result.passed
                    ? c(
                        "Hadiah kelulusan sudah pernah diterima. Skor terbaik tetap disimpan.",
                        "The first-pass reward was already earned. Your best score is still saved.",
                      )
                    : c(
                        "Tidak ada XP atau koin yang hilang. Pelajari pembahasan, lalu coba lagi.",
                        "No XP or coins were lost. Review the explanations, then retry.",
                      )}
              </p>
              <details className="result-review">
                <summary>
                  {c(
                    "Tinjau jawaban dan pembahasan",
                    "Review answers and explanations",
                  )}
                </summary>
                {answers.map((answer, i) => (
                  <section key={i}>
                    <b>
                      {i + 1}. {questions[i].prompt[language]}
                    </b>
                    <p>
                      {c("Jawabanmu: ", "Your answer: ")}
                      {questions[i].options[answer][language]}{" "}
                      {answer === questions[i].answer ? "✓" : "✕"}
                    </p>
                    <p>{questions[i].explanation[language]}</p>
                  </section>
                ))}
              </details>
              {result.passed && !boss && nextUnit && (
                <button
                  className="primary-button"
                  onClick={() => next(nextUnit.id)}
                >
                  {c("Materi berikutnya", "Next lesson")}
                  <ArrowRight size={18} />
                </button>
              )}
              {result.passed && !boss && !nextUnit && (
                <button className="primary-button" onClick={() => next("boss")}>
                  {c("Hadapi Penjaga Kristal", "Face the Crystal Guardian")}
                  <Swords size={18} />
                </button>
              )}
              <div className="result-actions">
                {!boss && (
                  <button
                    className="secondary-button"
                    onClick={() => {
                      submitting.current = false;
                      setResult(null);
                      dispatch({ type: "review" });
                    }}
                  >
                    {c("Pelajari lagi", "Read again")}
                  </button>
                )}
                <button className="secondary-button" onClick={retry}>
                  {c("Ulangi tantangan", "Retry challenge")}
                </button>
                <button className="secondary-button" onClick={close}>
                  {c("Kembali ke pulau", "Return to island")}
                </button>
              </div>
            </article>
          )}
        </main>
      </div>
      {tutor && (
        <TutorPanel
          unit={tutorUnit ?? unit}
          question={phase === "quiz" ? question : undefined}
          answered={checked}
          close={() => setTutor(false)}
        />
      )}
      {exit && (
        <div className="session-exit">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={c("Tinggalkan tantangan?", "Leave challenge?")}
          >
            <button
              className="exit-close"
              aria-label={c("Tutup", "Close")}
              onClick={() => setExit(false)}
            >
              <X />
            </button>
            <h2>{c("Kembali ke pulau?", "Return to the island?")}</h2>
            <p>
              {c(
                "Jawaban percobaan ini belum tersimpan. Progres dan hadiah sebelumnya tetap aman.",
                "This attempt’s answers are not saved yet. Your previous progress and rewards remain safe.",
              )}
            </p>
            <button
              className="primary-button"
              autoFocus
              onClick={() => setExit(false)}
            >
              {c("Lanjutkan tantangan", "Continue challenge")}
            </button>
            <button className="secondary-button" onClick={close}>
              {c("Tinggalkan percobaan", "Leave attempt")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
