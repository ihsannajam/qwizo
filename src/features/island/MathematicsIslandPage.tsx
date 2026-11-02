import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Flag,
  LockKeyhole,
  Map,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useGame } from "../../store/game";
import { useI18n } from "../../i18n/useI18n";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ProgressBar } from "../../components/ui";
import { SpeechBubble } from "../../components/SpeechBubble";
import { useIslandTravel } from "../navigation/travel-context";
import { topics, TOTAL_LESSONS } from "./data/topics";
import { LearningSession } from "../learning/LearningSession";
import { useProgress } from "../learning/useProgress";
import { canBattle } from "../../domain/progression";
import { lessonIds } from "../learning/curriculum";
import {
  getJourney,
  getJourneyTiming,
  getStopPoint,
  TERRAIN,
} from "./data/trail";
import { TopicPanel } from "./TopicPanel";
import "./island.css";
export function MathIsland() {
  const travel = useIslandTravel();
  const { language, t } = useI18n();
  const { completedLessons, name, mathPosition, setMathPosition, reduced } =
    useGame();
  const systemReduced = useReducedMotion();
  const initialId =
    mathPosition ??
    topics[Math.min(Math.floor(completedLessons.length / 4), 5)].id;
  const [position, setPosition] = useState(initialId);
  const positionRef = useRef(initialId);
  const [selected, setSelected] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const player = useProgress();
  const [overview, setOverview] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const terrain = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const controls = useAnimationControls();
  const alive = useRef(true);
  const walking = useRef(false);
  const completed = completedLessons.filter((id) =>
    topics.some((topic) => topic.lessons.some((l) => l.id === id)),
  ).length;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controls.stop();
    };
  }, [controls]);
  useEffect(() => {
    const pane = scroll.current,
      canvas = terrain.current;
    if (!pane || !canvas) return;
    const center = () => {
      if (walking.current) return;
      const [x, y] = getStopPoint(positionRef.current);
      pane.scrollLeft =
        (x / TERRAIN.width) * canvas.clientWidth - pane.clientWidth * 0.5;
      pane.scrollTop =
        (y / TERRAIN.height) * canvas.clientHeight - pane.clientHeight * 0.55;
    };
    const observer = new ResizeObserver(center);
    observer.observe(pane);
    observer.observe(canvas);
    const frame = requestAnimationFrame(center);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  const close = useCallback(() => {
    setSelected(null);
  }, []);
  const goTo = async (id: string) => {
    if (walking.current) return;
    setOverview(false);
    setSelected(null);
    setPreview(id);
    if (id === positionRef.current) {
      setSelected(id);
      return;
    }
    const points = getJourney(positionRef.current, id);
    const { duration, times } = getJourneyTiming(points);
    walking.current = true;
    setDestination(id);
    await controls.start({
      left: points.map((p) => `${(p[0] / TERRAIN.width) * 100}%`),
      top: points.map((p) => `${(p[1] / TERRAIN.height) * 100}%`),
      transition: {
        duration: reduced || systemReduced ? 0.12 : duration,
        times,
        ease: "linear",
      },
    });
    if (!alive.current) return;
    positionRef.current = id;
    setPosition(id);
    setMathPosition(id);
    walking.current = false;
    setDestination(null);
    setSelected(id);
  };
  const activeTopic = topics.find(
    (topic) => topic.id === (destination || preview || position),
  )!;
  const speech =
    language === "id"
      ? destination
        ? `Aku sedang menuju pos ${t(activeTopic.title)}. Ayo, ikuti aku menyusuri jalan dan jembatan kristal!`
        : preview && preview !== position
          ? `Di pos ${t(activeTopic.title)} ada 4 materi seru. Klik posnya, aku akan berjalan ke sana dan menemanimu belajar!`
          : `Kita berada di pos ${t(activeTopic.title)}! Pilih pos lain untuk berjalan bersama, atau buka 4 materi di pos ini.`
      : destination
        ? `I’m heading to ${t(activeTopic.title)}. Follow me along the crystal paths and bridges!`
        : preview && preview !== position
          ? `${t(activeTopic.title)} has 4 exciting lessons. Choose its stop and I’ll walk there with you!`
          : `We’re at ${t(activeTopic.title)}! Choose another stop to walk with me, or open the 4 lessons here.`;
  const point = getStopPoint(position);
  return (
    <main className="island-world trail-world">
      <header className="island-topbar">
        <button className="return-world" onClick={() => travel("/world")}>
          <ArrowLeft size={18} />
          <span>{t("World Map")}</span>
        </button>
        <div className="island-brand">
          <img src="/assets/logo-transparent.webp" alt="qwizo!" />
          <span>{t("MATHEMATICS ISLAND")}</span>
        </div>
        <div className="island-profile">
          <LanguageToggle />
          <span>👨🏻‍🚀</span>
          <div>
            <b>{name}</b>
            <small>
              Level {player.level} · {t("Penjelajah ilmu")}
            </small>
          </div>
        </div>
      </header>
      <div className="island-intro">
        <span className="chapter-tag">
          <Sparkles size={13} />
          {t("WORLD 01 / MATEMATIKA")}
        </span>
        <h1>
          {t("Negeri Kristal")} <span>{t("Pengetahuan")}</span>
        </h1>
        <p>
          {t("Ikuti jalurnya. Temukan konsepnya. Taklukkan setiap tantangan.")}
        </p>
      </div>
      <div className="island-summary">
        <div>
          <BookOpen size={16} />
          <b>
            {completed}/{TOTAL_LESSONS}
          </b>
          <span>{t("materi selesai")}</span>
        </div>
        <div>
          <Flag size={16} />
          <b>6</b>
          <span>{t("pos petualangan")}</span>
        </div>
        <div>
          <Trophy size={16} />
          <b>1</b>
          <span>{t("tantangan akhir")}</span>
        </div>
        <ProgressBar
          value={(completed / TOTAL_LESSONS) * 100}
          label={t("Progres materi Matematika")}
        />
      </div>
      <div
        className="level-scroll"
        ref={scroll}
        onPointerDown={(e) => {
          if (
            e.pointerType !== "mouse" ||
            e.button !== 0 ||
            (e.target as HTMLElement).closest("button")
          )
            return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            left: e.currentTarget.scrollLeft,
            top: e.currentTarget.scrollTop,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          e.currentTarget.scrollLeft =
            drag.current.left - (e.clientX - drag.current.x);
          e.currentTarget.scrollTop =
            drag.current.top - (e.clientY - drag.current.y);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <motion.div
          className="level-terrain authored-terrain"
          ref={terrain}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="terrain-art" />
          <div className="terrain-haze" />
          {topics.map((topic, i) => {
            const [x, y] = getStopPoint(topic.id);
            const done = topic.lessons.filter((l) =>
              completedLessons.includes(l.id),
            ).length;
            return (
              <button
                key={topic.id}
                data-topic={topic.id}
                disabled={!!destination}
                className={`topic-pin ${done === 4 ? "pin-complete" : ""} ${position === topic.id ? "pin-current" : ""} ${destination === topic.id ? "pin-destination" : ""}`}
                style={{
                  left: `${(x / TERRAIN.width) * 100}%`,
                  top: `${(y / TERRAIN.height) * 100}%`,
                }}
                onPointerEnter={() => setPreview(topic.id)}
                onPointerLeave={() => setPreview(null)}
                onFocus={() => setPreview(topic.id)}
                onBlur={() => setPreview(null)}
                onClick={() => {
                  void goTo(topic.id);
                }}
                aria-label={`${t(topic.title)}, ${topic.lessons.length} ${t("materi")}, ${done} ${t("selesai")}`}
              >
                <span className="pin-number">
                  {t("POS")} 0{i + 1}
                </span>
                <span className="pin-orb">
                  {done === 4 ? (
                    <Check size={24} />
                  ) : topic.id === "turunan" ? (
                    <span className="derivative-symbol">
                      <span>d</span>
                      <span>dx</span>
                    </span>
                  ) : (
                    topic.symbol
                  )}
                </span>
                <span className="pin-label">
                  <b>{t(topic.title)}</b>
                  <small>
                    {done}/{topic.lessons.length} {t("materi")} ·{" "}
                    {t(topic.subtitle)}
                  </small>
                </span>
                {position === topic.id && !destination && (
                  <span className="continue-marker">
                    {t("LANJUT DI SINI")}
                    <ArrowRight size={11} />
                  </span>
                )}
              </button>
            );
          })}
          <motion.div
            className={`island-rover ${destination ? "is-walking" : ""}`}
            data-current-stop={position}
            data-destination={destination || ""}
            initial={{
              left: `${(point[0] / TERRAIN.width) * 100}%`,
              top: `${(point[1] / TERRAIN.height) * 100}%`,
            }}
            animate={controls}
            onUpdate={(latest) => {
              if (!walking.current || !terrain.current || !scroll.current)
                return;
              const x =
                (parseFloat(String(latest.left)) / 100) *
                terrain.current.clientWidth;
              const y =
                (parseFloat(String(latest.top)) / 100) *
                terrain.current.clientHeight;
              scroll.current.scrollLeft = x - scroll.current.clientWidth * 0.5;
              scroll.current.scrollTop = y - scroll.current.clientHeight * 0.55;
            }}
            aria-label={
              destination
                ? `${t("Qwi sedang berjalan")} · ${t(activeTopic.title)}`
                : `Qwi · ${t(topics.find((topic) => topic.id === position)!.title)}`
            }
          >
            <span className="rover-shadow" />
            <img
              src="/assets/mascot-transparent.webp"
              alt="Qwi"
              draggable={false}
            />
            <span className="rover-name">Qwi</span>
          </motion.div>
          <button
            className="boss-pin"
            style={{
              left: `${(1340 / TERRAIN.width) * 100}%`,
              top: `${(123 / TERRAIN.height) * 100}%`,
              right: "auto",
            }}
            onClick={() => setSelected("boss")}
            aria-label={t("Lihat syarat tantangan akhir")}
          >
            <span>♛</span>
            <b>{t("CRYSTAL GUARDIAN")}</b>
            <small>
              <LockKeyhole size={10} />
              {canBattle(useGame.getState())
                ? language === "id"
                  ? "Arena terbuka"
                  : "Arena unlocked"
                : t("Selesaikan 24 materi")}
            </small>
          </button>
        </motion.div>
      </div>
      <section className="island-companion" aria-label={t("PANDUAN PULAU")}>
        <SpeechBubble
          text={speech}
          speaker={t("PANDUAN PULAU")}
          action={
            destination
              ? undefined
              : () => {
                  void goTo(preview || position);
                }
          }
          actionLabel={t("Buka materi")}
        />
        {destination && (
          <div className="journey-status" role="status">
            <span className="walking-dots">● ● ●</span>
            {t("Menuju")} {t(activeTopic.title)}
          </div>
        )}
      </section>
      <footer className="island-footer">
        <span>
          <Compass size={14} />
          {t("Geser peta untuk melihat semua pos")}
        </span>
        <button onClick={() => setOverview((v) => !v)}>
          <Map size={16} />
          {t(overview ? "Tutup daftar" : "Daftar 24 materi")}
        </button>
        <button
          onClick={() =>
            setSession(
              lessonIds.find((id) => !completedLessons.includes(id)) ?? "boss",
            )
          }
        >
          <ArrowRight size={16} />
          {language === "id" ? "Lanjut belajar" : "Continue learning"}
        </button>
        <span className="curriculum-note">
          {language === "id"
            ? "Lulus kuis untuk membuka langkah berikutnya"
            : "Pass quizzes to unlock your next steps"}
        </span>
      </footer>
      <AnimatePresence>
        {overview && (
          <motion.div
            className="curriculum-overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <header>
              <div>
                <span className="eyebrow">{t("PETA PEMBELAJARAN")}</span>
                <h2>{t("6 pos, 24 materi, satu petualangan.")}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setOverview(false)}
                aria-label={t("Tutup daftar materi")}
              >
                <X size={18} />
              </button>
            </header>
            <div className="overview-grid">
              {topics.map((topic, i) => (
                <button
                  key={topic.id}
                  data-topic={topic.id}
                  disabled={!!destination}
                  onClick={() => {
                    void goTo(topic.id);
                  }}
                >
                  <span>
                    0{i + 1} · {topic.id === "turunan" ? "ƒ′" : topic.symbol}
                  </span>
                  <b>{t(topic.title)}</b>
                  <small>
                    {topic.lessons.length} {t("materi")} ·{" "}
                    {topic.lessons.reduce((s, l) => s + l.duration, 0)}{" "}
                    {t("menit")}
                  </small>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selected && !session && (
          <TopicPanel
            topic={
              selected === "boss"
                ? null
                : topics.find((topic) => topic.id === selected)!
            }
            close={close}
            start={setSession}
          />
        )}
      </AnimatePresence>
      {session && (
        <LearningSession
          key={session}
          id={session}
          close={() => setSession(null)}
          next={setSession}
        />
      )}
    </main>
  );
}
