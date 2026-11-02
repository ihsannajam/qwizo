import { useProgress } from "../learning/useProgress";
import { QuestList } from "../learning/QuestList";
import { topics } from "../island/data/topics";
import { mastery as topicMastery } from "../../domain/progression";
import { useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  LockKeyhole,
  LogOut,
  Sparkles,
  Trophy,
  Volume2,
  Accessibility,
  Target,
  Flag,
} from "lucide-react";
import { useGame } from "../../store/game";
import { useI18n } from "../../i18n/useI18n";
import { Sheet, ProgressBar } from "../../components/ui";
import { islands } from "./islands";
import { IslandArt } from "./IslandArt";
import { useIslandTravel } from "../navigation/travel-context";
export function OverlayHost() {
  const {
    panel,
    setPanel,
    selected,
    name,
    sound,
    reduced,
    toggleSound,
    toggleReduced,
    logout,
  } = useGame();
  const { t, number, language } = useI18n();
  const player = useProgress();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const mastery = player.mastery;
  const close = useCallback(() => setPanel(null), [setPanel]);
  const navigate = useNavigate();
  const travel = useIslandTravel();
  const island = islands.find((i) => i.id === selected)!;
  const nextLesson = topics
    .flatMap((topic) => topic.lessons)
    .find((lesson) => !useGame.getState().completedLessons.includes(lesson.id));
  const titles = {
    dashboard: "Player Dashboard",
    quests: "Misi Harian",
    progress: "Progres & Profil",
    settings: "Pengaturan",
    island: island.name,
  };
  return (
    <AnimatePresence>
      {panel && (
        <Sheet key={panel} title={t(titles[panel])} close={close}>
          {panel === "island" ? (
            <>
              <div className="island-preview">
                <IslandArt island={island} />
              </div>
              <span
                className={`status ${island.id === "math" ? "" : "locked-status"}`}
              >
                {island.id === "math"
                  ? "✦ " + t("TERBUKA UNTUK DIJELAJAHI")
                  : "🔒 " + t("Segera hadir")}
              </span>
              <h3>{t(island.subtitle)}</h3>
              <p>
                {t(
                  island.id === "math"
                    ? "Temukan pola, pecahkan tantangan, dan bangun kepercayaan dirimu. Petualangan angka dimulai di sini!"
                    : "Petualangan baru sedang disiapkan. Sambil menunggu, jelajahi pulau Matematika dan kumpulkan XP pertamamu.",
                )}
              </p>
              {island.id === "math" ? (
                <>
                  <div className="stat-line">
                    <span>
                      {c("Penguasaan Matematika", "Mathematics mastery")}
                    </span>
                    <b>{mastery}%</b>
                  </div>
                  <ProgressBar value={mastery} />
                  <div className="mini-stats">
                    <span>{t("6 pos petualangan")}</span>
                    <span>{t("24 materi")}</span>
                    <span>{t("1 tantangan akhir")}</span>
                  </div>
                  <button className="primary-button" onClick={() => travel()}>
                    {t("Masuk Pulau")}
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <button className="primary-button" disabled>
                  <LockKeyhole size={18} />
                  {t("Segera hadir")}
                </button>
              )}
              <p className="fine-print">
                {c(
                  "Jalur Matematika MVP • 24 materi dengan kuis dan bantuan Qwi.",
                  "Mathematics MVP trail • 24 lessons with quizzes and Qwi’s help.",
                )}
              </p>
            </>
          ) : panel === "dashboard" ? (
            <>
              <div className="profile-block">
                <span className="avatar large">👨🏻‍🚀</span>
                <div>
                  <h3>{name}</h3>
                  <p>{t("Penjelajah ilmu · Kelas 12")}</p>
                </div>
                <span className="level-badge">{player.level}</span>
              </div>
              <div className="stat-line">
                <b>Level {player.level}</b>
                <span>
                  {number(player.current)} / {number(player.next)} XP
                </span>
              </div>
              <ProgressBar value={(player.current / player.next) * 100} />
              <div className="metric-grid">
                <div>
                  <Flame />
                  <b>
                    {player.streak} {t("hari")}
                  </b>
                  <small>{t("Streak")}</small>
                </div>
                <div>
                  <Sparkles />
                  <b>{number(player.coins)}</b>
                  <small>{t("Q-Token")}</small>
                </div>
                <div>
                  <Trophy />
                  <b>{player.badges}</b>
                  <small>{t("Badge")}</small>
                </div>
              </div>
              <div className="section-heading">
                <h3>{t("Lanjutkan petualangan")}</h3>
                <ArrowRight size={17} />
              </div>
              <div className="continue-card">
                <span className="math-icon">π</span>
                <div>
                  <b>{t("Matematika")}</b>
                  <p>
                    {nextLesson ? t(nextLesson.title) : t("Penjaga Kristal")}
                  </p>
                  <ProgressBar value={mastery} />
                </div>
              </div>
              <button className="primary-button" onClick={() => travel()}>
                {t("Lanjut belajar")}
                <ArrowRight size={18} />
              </button>
              <div className="section-heading">
                <h3>{t("Quest hari ini")}</h3>
                <button
                  className="text-button"
                  onClick={() => setPanel("quests")}
                >
                  {t("Lihat semua")}
                </button>
              </div>
              <QuestList />
              <div className="tip">
                ✦ {t("Sedikit setiap hari, jadi hebat suatu hari.")}
              </div>
            </>
          ) : panel === "quests" ? (
            <>
              <div className="quest-hero journal-hero">
                <span className="hero-medallion">
                  <Target size={40} />
                </span>
                <div>
                  <span className="hero-kicker">{t("Hadiah menantimu")}</span>
                  <h3>{t("Langkah kecil, reward besar!")}</h3>
                  <p>{t("Bangun kebiasaan belajarmu setiap hari.")}</p>
                </div>
                <span className="hero-stars" aria-hidden="true">
                  ✧ ✦ ✧
                </span>
              </div>
              <div className="quest-score">
                <span>
                  <Flag size={20} />
                  <b>{t("Misi selesai")}</b>
                </span>
                <strong>
                  {player.questsDone} <small>/ 3</small>
                </strong>
              </div>
              <ProgressBar value={(player.questsDone / 3) * 100} />
              <QuestList />
              <p className="fine-print">
                {c(
                  "Hadiah dan progres tersimpan di browser ini.",
                  "Rewards and progress are saved in this browser.",
                )}
              </p>
            </>
          ) : panel === "progress" ? (
            <>
              <div className="profile-block">
                <span className="avatar large">👨🏻‍🚀</span>
                <div>
                  <h3>{name}</h3>
                  <p>{t("Penjelajah ilmu · Kelas 12")}</p>
                </div>
              </div>
              <div className="achievement journal-hero">
                <Trophy size={42} />
                <h3>
                  {useGame.getState().bossWon
                    ? c(
                        "Penakluk Penjaga Kristal!",
                        "Crystal Guardian champion!",
                      )
                    : c("Setiap langkah berarti", "Every step matters")}
                </h3>
                <p>{t("1 dari 10 pulau sudah terbuka")}</p>
              </div>
              <p className="fine-print">
                {useGame.getState().readLessons.length}{" "}
                {c("materi dalam riwayat baca", "lessons in reading history")} ·{" "}
                {useGame.getState().completedLessons.length}/24{" "}
                {c("kuis lulus", "quizzes passed")}
              </p>
              <h3>{c("Penguasaan per topik", "Mastery by topic")}</h3>
              {topics.map((topic) => (
                <div className="live-progress-topic" key={topic.id}>
                  <b>
                    {t(topic.title)}{" "}
                    <span>
                      {topicMastery(
                        useGame.getState(),
                        topic.lessons.map((l) => l.id),
                      )}
                      %
                    </span>
                  </b>
                  <ProgressBar
                    value={topicMastery(
                      useGame.getState(),
                      topic.lessons.map((l) => l.id),
                    )}
                  />
                </div>
              ))}
              <h3>{t("Progres materi per pulau")}</h3>
              {islands.map((i) => (
                <div className="subject-progress" key={i.id}>
                  <div className="stat-line">
                    <span>{t(i.name)}</span>
                    <b>{i.id === "math" ? `${mastery}%` : t("Terkunci")}</b>
                  </div>
                  <ProgressBar
                    value={i.id === "math" ? mastery : 0}
                    label={t(i.name)}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="settings-heading">
                <Sparkles />
                <h3>{t("Preferensi petualangan")}</h3>
              </div>
              <div className="setting-row">
                <Volume2 />
                <div>
                  <b>{t("Suara permainan")}</b>
                  <p>{t("Preferensi untuk fitur audio mendatang")}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={sound}
                  aria-label={t("Suara permainan")}
                  className={`toggle ${sound ? "on" : ""}`}
                  onClick={toggleSound}
                >
                  <span />
                </button>
              </div>
              <div className="setting-row">
                <Accessibility />
                <div>
                  <b>{t("Kurangi animasi")}</b>
                  <p>{t("Gerakan lebih tenang di seluruh aplikasi")}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={reduced}
                  aria-label={t("Kurangi animasi")}
                  className={`toggle ${reduced ? "on" : ""}`}
                  onClick={toggleReduced}
                >
                  <span />
                </button>
              </div>
              <div className="info-box">
                <h3>{t("Tentang prototype")}</h3>
                <p>Qwizo · v0.3.0</p>
                <p>
                  {c(
                    "Progres kuis tersimpan lokal. Tutor dan latihan AI tersedia jika layanan AI diaktifkan; panduan lokal tetap tersedia. Belum ada sinkronisasi akun.",
                    "Quiz progress is saved locally. AI tutoring and practice are available when the AI service is enabled; local guidance remains available. Account sync is not connected yet.",
                  )}
                </p>
              </div>
              <button
                className="secondary-button danger"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={18} />
                {t("Keluar dari akun demo")}
              </button>
            </>
          )}
        </Sheet>
      )}
    </AnimatePresence>
  );
}
