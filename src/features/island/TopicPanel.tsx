import {
  ArrowRight,
  Check,
  Clock3,
  LockKeyhole,
  Swords,
  Trophy,
} from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import { useGame } from "../../store/game";
import { Sheet, ProgressBar } from "../../components/ui";
import { canBattle, mastery, unlocked } from "../../domain/progression";
import type { Topic } from "./data/topics";
export function TopicPanel({
  topic,
  close,
  start,
}: {
  topic: Topic | null;
  close: () => void;
  start: (id: string) => void;
}) {
  const { t, language } = useI18n();
  const game = useGame();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const done =
    topic?.lessons.filter((l) => game.completedLessons.includes(l.id)).length ??
    0;
  return (
    <Sheet title={topic ? t(topic.title) : t("Penjaga Kristal")} close={close}>
      {!topic ? (
        <div className="boss-detail">
          <Trophy size={52} />
          <h3>{c("Pulihkan cahaya kristal", "Restore the crystal’s light")}</h3>
          <p>
            {c(
              "Luluskan seluruh 24 materi untuk membuka arena. Jawab benar 5 soal untuk menang; 2 kesalahan menghabiskan perisai Qwi.",
              "Pass all 24 lessons to unlock the arena. Answer 5 questions correctly to win; 2 mistakes exhaust Qwi’s shield.",
            )}
          </p>
          <ProgressBar value={(game.completedLessons.length / 24) * 100} />
          <p>
            {game.completedLessons.length}/24{" "}
            {c("materi lulus", "lessons passed")}
          </p>
          <div className="topic-mastery">
            300 XP · 100{" "}
            {c("koin untuk kemenangan pertama", "coins for your first victory")}
            {game.bossWon && (
              <p>
                🏆{" "}
                {c(
                  "Penjaga Kristal sudah ditaklukkan",
                  "Crystal Guardian defeated",
                )}
              </p>
            )}
          </div>
          <button
            className="primary-button"
            disabled={!canBattle(game)}
            onClick={() => start("boss")}
          >
            <Swords size={18} />
            {canBattle(game)
              ? c("Masuki arena", "Enter the arena")
              : c("Selesaikan semua kuis dahulu", "Pass every quiz first")}
          </button>
        </div>
      ) : (
        <>
          <div className="topic-detail-hero">
            <span>{topic.symbol === "d/dx" ? "ƒ′" : topic.symbol}</span>
            <div>
              <small>{t(topic.subtitle)}</small>
              <h3>
                {topic.lessons.length}{" "}
                {c("langkah menuju penguasaan", "steps toward mastery")}
              </h3>
              <p>
                {done}/4 {c("materi lulus", "lessons passed")}
              </p>
            </div>
          </div>
          <div className="topic-mastery">
            <div className="stat-line">
              <b>{c("Penguasaan topik", "Topic mastery")}</b>
              <b>
                {mastery(
                  game,
                  topic.lessons.map((l) => l.id),
                )}
                %
              </b>
            </div>
            <ProgressBar
              value={mastery(
                game,
                topic.lessons.map((l) => l.id),
              )}
            />
            <p>
              {c(
                "Skor terbaik dari setiap kuis. Lulus minimal 2/3 untuk membuka materi berikutnya.",
                "Best score from each quiz. Pass with at least 2/3 to unlock the next lesson.",
              )}
            </p>
          </div>
          <div className="material-list">
            {topic.lessons.map((l, i) => {
              const open = unlocked(game, l.id),
                passed = game.completedLessons.includes(l.id);
              return (
                <button key={l.id} disabled={!open} onClick={() => start(l.id)}>
                  <span className={passed ? "material-done" : "material-index"}>
                    {passed ? (
                      <Check size={17} />
                    ) : !open ? (
                      <LockKeyhole size={17} />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <b>{t(l.title)}</b>
                    <small>
                      <Clock3 size={12} />
                      {l.duration} {t("menit")} ·{" "}
                      {passed
                        ? `${c("Terbaik", "Best")} ${game.results[l.id]?.best ?? 0}/3`
                        : open
                          ? game.readLessons.includes(l.id)
                            ? c(
                                "Sudah dibaca · Lanjut kuis",
                                "Read before · Try quiz",
                              )
                            : c("Baca & kuis", "Read & quiz")
                          : c(
                              "Lulus materi sebelumnya",
                              "Pass the previous lesson",
                            )}
                    </small>
                  </div>
                  <ArrowRight size={17} />
                </button>
              );
            })}
          </div>
          <p className="fine-print">
            {c(
              "Bantuan Qwi tersedia di setiap materi dan kuis. Progres tersimpan pada browser ini.",
              "Qwi’s help is available in every lesson and quiz. Progress is saved in this browser.",
            )}
          </p>
        </>
      )}
    </Sheet>
  );
}
