import { useI18n } from "../../i18n/useI18n";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useGame } from "../../store/game";
import { islands } from "../world-map/islands";
import { getWorldFit } from "../world-map/camera";
import { TravelContext, type Travel } from "./travel-context";
function preloadWorld(onProgress: (progress: number) => void) {
  const sources = [
    ...islands.map((i) => `/assets/islands/${i.id}.webp`),
    "/assets/world-backdrop.webp",
    "/assets/mascot-transparent.webp",
  ];
  let loaded = 0;
  return Promise.all(
    sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timeout);
            onProgress(Math.round((++loaded / sources.length) * 100));
            resolve();
          };
          const timeout = setTimeout(finish, 5000);
          image.onload = finish;
          image.onerror = finish;
          image.src = src;
        }),
    ),
  );
}
export function IslandTravelProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { pathname } = useLocation();
  const systemReduced = useReducedMotion();
  const reduced = useGame((s) => s.reduced) || systemReduced;
  const [destination, setDestination] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(false);
  const [progress, setProgress] = useState(0);
  const busy = useRef(false);
  const alive = useRef(true);
  const generation = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    // Fast Refresh can cancel timers while preserving refs; release the travel lock.
    alive.current = true;
    busy.current = false;
    setDestination(null);
    return () => {
      alive.current = false;
      generation.current += 1;
      busy.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);
  const travel = useCallback<Travel>(
    (target = "/island/mathematics", onArrive) => {
      if (busy.current) return;
      busy.current = true;
      const currentGeneration = generation.current;
      const isCurrent = () =>
        alive.current && generation.current === currentGeneration;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const entering = pathname === "/login";
      const game = useGame.getState();
      const previousCamera = game.camera;
      game.setPanel(null);
      setDestination(target);
      setWelcome(entering);
      setProgress(0);
      if (target.includes("mathematics") && !reduced) {
        const viewport = document.querySelector(".world-viewport");
        const fit = viewport
          ? getWorldFit(viewport.clientWidth, viewport.clientHeight)
          : 0.65;
        game.setCamera({ x: 200 * fit * 2.8, y: 45 * fit * 2.8, zoom: 2.8 });
      }
      const arrive = () => {
        if (!isCurrent()) return;
        onArrive?.();
        navigate(target);
        requestAnimationFrame(() =>
          useGame.getState().setCamera(previousCamera),
        );
        timers.current.push(
          setTimeout(
            () => {
              if (!isCurrent()) return;
              setDestination(null);
              busy.current = false;
            },
            reduced ? 120 : 650,
          ),
        );
      };
      if (entering) {
        const minimumTime = new Promise<void>((resolve) =>
          timers.current.push(setTimeout(resolve, reduced ? 200 : 1500)),
        );
        void Promise.all([
          preloadWorld((value) => {
            if (isCurrent()) setProgress(value);
          }),
          minimumTime,
        ]).then(arrive);
      } else timers.current.push(setTimeout(arrive, reduced ? 120 : 1100));
    },
    [navigate, pathname, reduced],
  );
  return (
    <TravelContext.Provider value={travel}>
      {children}
      <AnimatePresence>
        {destination && (
          <motion.div
            className={`island-travel ${welcome ? "welcome-travel" : ""}`}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduced ? 0.1 : 0.45,
              delay: welcome || reduced ? 0 : 0.32,
            }}
          >
            <motion.div
              className="travel-orbit"
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            />
            {welcome && (
              <img
                className="travel-brand"
                src="/assets/logo-transparent.webp"
                alt="qwizo!"
              />
            )}
            <motion.img
              className={welcome ? "travel-welcome-mascot" : ""}
              src={
                welcome
                  ? "/assets/mascot-transparent.webp"
                  : "/assets/islands/math.webp"
              }
              alt=""
              initial={{ scale: 0.65, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.8 }}
            />
            <div className="travel-caption">
              <Sparkles size={20} />
              <span>
                {t(
                  welcome
                    ? "Membuka dunia Qwizo!"
                    : destination.includes("mathematics")
                      ? "Menuju Pulau Matematika"
                      : "Kembali ke dunia Qwizo",
                )}
              </span>
              <small>
                {t(
                  welcome
                    ? "Sebentar, Qwi sedang menyiapkan petualanganmu…"
                    : destination.includes("mathematics")
                      ? "Menyiapkan jalur petualanganmu…"
                      : "Petualangan berikutnya menantimu…",
                )}
              </small>
            </div>
            {welcome && (
              <div className="welcome-loading">
                <div className="welcome-loading-track">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                  />
                </div>
                <span>
                  {t("MENYIAPKAN PULAU")} <b>{progress}%</b>
                </span>
              </div>
            )}
            <span className="travel-cloud travel-cloud-left" />
            <span className="travel-cloud travel-cloud-right" />
          </motion.div>
        )}
      </AnimatePresence>
    </TravelContext.Provider>
  );
}
