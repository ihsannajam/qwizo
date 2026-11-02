import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "../i18n/useI18n";
import { LanguageToggle } from "../i18n/LanguageToggle";
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || t("Progres")}
    >
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
export function Sheet({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const previous = useRef(document.activeElement);
  useEffect(() => {
    const el = ref.current;
    el?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const items = el?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a[href],input:not(:disabled)",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === el)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !el?.contains(document.activeElement))
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      if (
        previous.current instanceof HTMLElement &&
        previous.current.isConnected
      )
        previous.current.focus();
    };
  }, [close, title]);
  return (
    <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.aside
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet quest-journal"
        initial={{ opacity: 0, x: 35, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 35, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 250, damping: 26 }}
      >
        <i className="journal-rivet rivet-top" />
        <i className="journal-rivet rivet-bottom" />
        <header className="sheet-header">
          <span className="journal-emblem" aria-hidden="true">
            <Sparkles size={27} />
          </span>
          <div className="journal-title">
            <span className="eyebrow">{t("YOUR LEARNING ADVENTURE")}</span>
            <h2>{title}</h2>
          </div>
          <div className="journal-actions">
            <LanguageToggle />
            <button
              className="icon-button journal-close"
              onClick={close}
              aria-label={t("Tutup panel")}
            >
              <X size={20} />
            </button>
          </div>
        </header>
        <div className="sheet-body">{children}</div>
        <footer className="journal-footer">
          <span>✦</span>
          <b>qwizo!</b>
          <small>{t("Petualangan menantimu")}</small>
          <span>✦</span>
        </footer>
      </motion.aside>
    </>
  );
}
