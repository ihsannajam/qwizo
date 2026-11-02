import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Coins,
  Heart,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  X,
} from "lucide-react";
import type { Outcome } from "../../domain/progression";
import type { Question } from "./curriculum";
import { useI18n } from "../../i18n/useI18n";

export function BossResult({
  result,
  answers,
  questions,
  playerHP,
  headingRef,
  retry,
  close,
}: {
  result: Outcome;
  answers: number[];
  questions: Question[];
  playerHP: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  retry: () => void;
  close: () => void;
}) {
  const { language } = useI18n();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const [review, setReview] = useState(false);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const wasReview = useRef(false);
  useEffect(() => {
    if (review) reviewHeading.current?.focus();
    else if (wasReview.current) reviewButton.current?.focus();
    wasReview.current = review;
  }, [review]);
  const victory = result.passed;
  return (
    <div
      className={`boss-result-overlay ${victory ? "battle-won" : "battle-lost"}`}
      onKeyDown={(e) => {
        if (review && e.key === "Escape") {
          e.stopPropagation();
          setReview(false);
        }
      }}
    >
      <div className="result-ambient" aria-hidden="true" />
      {victory && (
        <div className="victory-motes" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  "--mote-angle": `${(i * 360) / 14}deg`,
                  "--mote-delay": `${(i % 4) * 0.12}s`,
                } as CSSProperties
              }
            >
              ✦
            </i>
          ))}
        </div>
      )}
      <article
        className={`boss-result-panel ${review ? "showing-review" : ""}`}
        aria-label={c("Hasil pertarungan", "Battle results")}
      >
        {review ? (
          <>
            <div className="boss-review-heading">
              <BookOpen size={24} />
              <div>
                <span className="boss-result-kicker">
                  {c("CATATAN PETUALANGAN", "ADVENTURE NOTES")}
                </span>
                <h1 ref={reviewHeading} tabIndex={-1}>
                  {c("Pelajari seranganmu", "Learn from your attacks")}
                </h1>
              </div>
            </div>
            <div
              className="boss-review-list"
              tabIndex={0}
              role="region"
              aria-label={c(
                "Jawaban dan pembahasan",
                "Answers and explanations",
              )}
            >
              {answers.map((answer, i) => (
                <section
                  key={questions[i].id}
                  className={
                    answer === questions[i].answer
                      ? "review-hit"
                      : "review-miss"
                  }
                >
                  <span className="review-outcome">
                    {answer === questions[i].answer ? (
                      <Check size={17} />
                    ) : (
                      <X size={17} />
                    )}{" "}
                    {c("Serangan", "Attack")} {i + 1}
                  </span>
                  <h2>{questions[i].prompt[language]}</h2>
                  <p>
                    <span>{c("Jawabanmu", "Your answer")}:</span>{" "}
                    {questions[i].options[answer][language]}
                  </p>
                  {answer !== questions[i].answer && (
                    <p className="review-correct">
                      <span>{c("Jawaban tepat", "Correct answer")}:</span>{" "}
                      {questions[i].options[questions[i].answer][language]}
                    </p>
                  )}
                  <div className="review-explanation">
                    {questions[i].explanation[language]}
                  </div>
                </section>
              ))}
            </div>
            <button
              className="boss-result-primary"
              onClick={() => setReview(false)}
            >
              <ArrowLeft size={18} />
              {c("Kembali ke hasil", "Back to results")}
            </button>
          </>
        ) : (
          <>
            <div className="boss-result-ribbon">
              {victory ? <Trophy size={16} /> : <Shield size={16} />}{" "}
              {victory
                ? c("TANTANGAN DITAKLUKKAN", "CHALLENGE COMPLETE")
                : c("PERTARUNGAN SELESAI", "BATTLE COMPLETE")}
            </div>
            <div className="boss-result-emblem" aria-hidden="true">
              <div className="emblem-orbit" />
              {victory ? (
                <Trophy className="emblem-trophy" />
              ) : (
                <img src="/assets/mascot-transparent.webp" alt="" />
              )}
              <span className="emblem-spark spark-left">✦</span>
              <span className="emblem-spark spark-right">✧</span>
            </div>
            <div className="boss-result-stars" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Star key={i} className={victory ? "lit" : ""} />
              ))}
            </div>
            <span className="boss-result-kicker">
              {c("PENJAGA KRISTAL", "CRYSTAL GUARDIAN")}
            </span>
            <h1 ref={headingRef} tabIndex={-1}>
              {victory
                ? c("KEMENANGAN!", "VICTORY!")
                : c("BELUM BERHASIL", "NOT THIS TIME")}
            </h1>
            <p className="boss-result-subtitle">
              {victory
                ? c(
                    "Cahaya pulau kembali. Kerja hebat, Penjelajah!",
                    "The island shines again. Well played, Explorer!",
                  )
                : c(
                    "Qwi perlu mengisi tenaga. Petualanganmu belum berakhir!",
                    "Qwi needs to recharge. Your adventure isn’t over!",
                  )}
            </p>
            <div className="boss-result-stats">
              <div>
                <Swords size={17} />
                <strong>
                  {result.correct}
                  <small> / {result.total}</small>
                </strong>
                <span>{c("Serangan tepat", "Accurate hits")}</span>
              </div>
              <div>
                <Sparkles size={17} />
                <strong>
                  {Math.round((result.correct / result.total) * 100)}
                  <small>%</small>
                </strong>
                <span>{c("Akurasi", "Accuracy")}</span>
              </div>
              <div>
                <Heart size={17} />
                <strong>
                  {playerHP}
                  <small> HP</small>
                </strong>
                <span>{c("Sisa tenaga Qwi", "Qwi’s energy")}</span>
              </div>
            </div>
            {victory && (result.xp > 0 || result.coins > 0) ? (
              <div className="boss-loot">
                <span>{c("HADIAH KEMENANGAN", "VICTORY REWARDS")}</span>
                <div>
                  <b>
                    <Sparkles size={19} />+{result.xp} XP
                  </b>
                  <b>
                    <Coins size={19} />+{result.coins} {c("koin", "coins")}
                  </b>
                </div>
                <small>
                  <Check size={13} />
                  {c(
                    "Sudah ditambahkan ke progresmu",
                    "Added to your progress",
                  )}
                </small>
              </div>
            ) : (
              <p className="boss-result-note">
                {victory
                  ? c(
                      "Hadiah pertama sudah diklaim. Kemenangan ini tetap milikmu!",
                      "First-win rewards already claimed. This victory is still yours!",
                    )
                  : c(
                      "XP dan koinmu tetap aman. Pelajari polanya, lalu balas serang!",
                      "Your XP and coins are safe. Learn the pattern, then strike back!",
                    )}
              </p>
            )}
            <div className="boss-result-actions">
              <button
                className="boss-result-primary"
                onClick={victory ? close : retry}
              >
                {victory ? <ArrowRight size={18} /> : <RotateCcw size={18} />}{" "}
                {victory
                  ? c("Lanjutkan petualangan", "Continue adventure")
                  : c("Bertarung lagi", "Battle again")}
              </button>
              <button
                className="boss-result-secondary"
                onClick={victory ? retry : close}
              >
                {victory ? <RotateCcw size={17} /> : <ArrowLeft size={17} />}{" "}
                {victory
                  ? c("Tantang lagi", "Challenge again")
                  : c("Kembali ke pulau", "Return to island")}
              </button>
            </div>
            <button
              className="boss-result-review"
              ref={reviewButton}
              onClick={() => setReview(true)}
            >
              <BookOpen size={16} />
              {c("Lihat pembahasan", "Review answers")}
            </button>
          </>
        )}
      </article>
    </div>
  );
}
