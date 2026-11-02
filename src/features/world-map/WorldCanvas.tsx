import { useI18n } from "../../i18n/useI18n";
import { getWorldFit } from "./camera";
import { WorldBirds } from "./WorldBirds";
import { motion } from "motion/react";
import { useRef, useEffect, useState } from "react";
import type { PointerEvent, CSSProperties } from "react";
import {
  Compass,
  LockKeyhole,
  Minus,
  Plus,
  RotateCcw,
  ArrowUpRight,
  MousePointer2,
} from "lucide-react";
import { useGame } from "../../store/game";
import { islands } from "./islands";
import { IslandArt } from "./IslandArt";
export function WorldCanvas({
  hovered,
  onPreview,
}: {
  hovered: string | null;
  onPreview: (id: string | null) => void;
}) {
  const { t } = useI18n();
  const { camera, setCamera, select, selected, panel } = useGame();
  const container = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setFit(getWorldFit(entry.contentRect.width, entry.contentRect.height)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(false);
  const distance = () => {
    const p = [...points.current.values()];
    return p.length === 2 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const prev = points.current.get(e.pointerId);
    if (!prev) return;
    const d = distance();
    const dx = e.clientX - prev.x,
      dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
    if (moved.current && !e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.setPointerCapture(e.pointerId);
    points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const c = useGame.getState().camera;
    if (points.current.size === 2 && d > 0)
      setCamera({
        ...c,
        zoom: Math.max(0.55, Math.min(1.8, (c.zoom * distance()) / d)),
      });
    else
      setCamera({
        ...c,
        x: Math.max(-850, Math.min(850, c.x + dx)),
        y: Math.max(-650, Math.min(650, c.y + dy)),
      });
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    points.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const zoom = (delta: number) =>
    setCamera({
      ...camera,
      zoom: Math.max(0.55, Math.min(1.8, camera.zoom + delta)),
    });
  const focus = (id: string) => {
    const i = islands.find((a) => a.id === id)!;
    const width = container.current?.clientWidth || 1200;
    const height = container.current?.clientHeight || 800;
    const fit = getWorldFit(width, height);
    setCamera({
      zoom: 1.2,
      x: (625 - i.x) * fit * 1.2,
      y: (425 - i.y - 20) * fit * 1.2,
    });
    select(id);
  };
  return (
    <>
      <div
        className="world-viewport"
        ref={container}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(e) => {
          if (e.ctrlKey) e.preventDefault();
          zoom(e.deltaY > 0 ? -0.06 : 0.06);
        }}
      >
        <motion.div
          className="world-plane"
          style={{ marginLeft: -625, marginTop: -425 }}
          animate={{ x: camera.x, y: camera.y, scale: camera.zoom * fit }}
          transition={{ type: "spring", stiffness: 130, damping: 25 }}
        >
          <svg className="routes" viewBox="0 0 1250 850" aria-hidden="true">
            <path d="M205 230Q320 150 490 185T800 220 1060 330L990 555 660 665 320 695 115 455 425 445 735 430 990 555M425 445L490 185M425 445L320 695M735 430L800 220" />
          </svg>
          <span className="map-cloud cloud-1" />
          <span className="map-cloud cloud-2" />
          <span className="map-cloud cloud-3" />
          <WorldBirds />
          {islands.map((i) => (
            <button
              key={i.id}
              className={`island ${i.id === "math" ? "active-island" : ""} ${panel === "island" && selected === i.id ? "selected-island" : ""} ${hovered === i.id ? "is-hovered" : ""}`}
              style={
                {
                  left: i.x,
                  top: i.y,
                  animationDelay: `${islands.indexOf(i) * -0.65}s`,
                  "--island-color": i.color,
                } as CSSProperties
              }
              onPointerEnter={() => onPreview(i.id)}
              onPointerLeave={(e) => {
                if (!e.currentTarget.matches(":focus-visible")) onPreview(null);
              }}
              onFocus={() => onPreview(i.id)}
              onBlur={(e) => {
                if (!e.currentTarget.matches(":hover")) onPreview(null);
              }}
              onPointerDown={(e) => {
                moved.current = false;
                e.stopPropagation();
              }}
              onClick={(e) => {
                if (e.detail === 0 || !moved.current) focus(i.id);
              }}

              aria-label={`${t(i.name)}, ${i.id === "math" ? t("Pulau aktif") : t("Segera hadir")}`}
            >
              <span className="island-halo" aria-hidden="true" />
              <IslandArt island={i} />
              <span className="island-label">
                <span className="subject-symbol">{i.icon}</span>
                <b>{t(i.name)}</b>
                {i.id === "math" ? (
                  <ArrowUpRight size={19} />
                ) : (
                  <LockKeyhole size={13} />
                )}
              </span>
              <span className="island-subtitle">
                {t(i.id === "math" ? "LANJUTKAN PETUALANGAN" : "COMING SOON")}
              </span>
            </button>
          ))}
          <span className="world-coordinate">
            THE QWIZO ARCHIPELAGO · 10 WORLDS TO DISCOVER
          </span>
        </motion.div>
      </div>
      <div className="camera-controls">
        <span className="camera-help">
          <MousePointer2 size={14} /> {t("Geser untuk menjelajah")}
        </span>
        <div className="zoom-group">
          <button
            aria-label={t("Perkecil peta")}
            disabled={camera.zoom <= 0.55}
            onClick={() => zoom(-0.15)}
          >
            <Minus size={18} />
          </button>
          <span>{Math.round(camera.zoom * 100)}%</span>
          <button
            aria-label={t("Perbesar peta")}
            disabled={camera.zoom >= 1.8}
            onClick={() => zoom(0.15)}
          >
            <Plus size={18} />
          </button>
        </div>
        <button
          aria-label={t("Reset kamera")}
          onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}
        >
          <RotateCcw size={17} />
          <span>{t("Reset kamera")}</span>
        </button>
        <button
          aria-label={t("Fokus Matematika")}
          onClick={() => focus("math")}
        >
          <Compass size={19} />
        </button>
      </div>
    </>
  );
}
