import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Volume2 } from "lucide-react";
import { useGame } from "../store/game";
export function SpeechBubble({
  text,
  speaker,
  action,
  actionLabel,
  className = "",
}: {
  text: string;
  speaker: string;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}) {
  const reduced = useGame((s) => s.reduced);
  const systemReduced = useReducedMotion();
  const [typing, setTyping] = useState({ text, index: 0 });
  useEffect(() => {
    setTyping({ text, index: 0 });
    if (reduced || systemReduced) return;
    let index = 0;
    const timer = setInterval(() => {
      index = Math.min(text.length, index + 2);
      setTyping({ text, index });
      if (index >= text.length) clearInterval(timer);
    }, 24);
    return () => clearInterval(timer);
  }, [text, reduced, systemReduced]);
  const shown =
    reduced || systemReduced
      ? text
      : typing.text === text
        ? text.slice(0, typing.index)
        : "";
  const speaking = shown.length < text.length;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`mascot-bubble ${className} ${speaking ? "bubble-speaking" : ""}`}
        key={text}
        initial={{ opacity: 0, scale: 0.97, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.12 }}
      >
        <span className="speaker-tag">
          <Volume2 size={13} /> QWI <span>· {speaker}</span>
        </span>
        <p aria-hidden="true">
          {shown}
          <span className={speaking ? "type-caret" : ""} />
        </p>
        <span className="sr-only" role="status" aria-live="polite">
          {text}
        </span>
        {action && (
          <button onClick={action}>
            {actionLabel}
            <ArrowRight size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
