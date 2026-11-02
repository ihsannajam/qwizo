import { Check, LockKeyhole } from "lucide-react";
import { useGame } from "../../store/game";
import { useI18n } from "../../i18n/useI18n";
import { useProgress } from "./useProgress";
import { quests, questValue } from "../../domain/progression";
export function QuestList() {
  const { language } = useI18n();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const { day } = useProgress();
  const claim = useGame((s) => s.claim);
  const labels = {
    lesson: c("Lulus 1 kuis materi", "Pass 1 lesson quiz"),
    questions: c("Kerjakan 5 soal berbeda", "Answer 5 unique questions"),
    topics: c("Latihan pada 2 topik", "Practice across 2 topics"),
  };
  return (
    <>
      <div className="quest-list live-quest">
        {quests.map((quest) => {
          const value = questValue(day, quest.id),
            ready = value >= quest.target,
            claimed = day.claimed.includes(quest.id);
          return (
            <div className="quest-item" key={quest.id}>
              <span className={ready ? "quest-check" : "quest-circle"}>
                {ready && <Check size={16} />}
              </span>
              <div>
                <b>{labels[quest.id]}</b>
                <small>
                  {Math.min(value, quest.target)}/{quest.target} · +
                  {quest.coins} {c("koin", "coins")}
                </small>
              </div>
              <button
                className="reward"
                disabled={!ready || claimed}
                onClick={() => claim(quest.id)}
                aria-label={`${claimed ? c("Sudah diklaim", "Already claimed") : c("Klaim", "Claim")} ${labels[quest.id]}`}
              >
                {claimed ? (
                  <Check size={15} />
                ) : !ready ? (
                  <LockKeyhole size={13} />
                ) : null}
                {claimed ? c("Diklaim", "Claimed") : `+${quest.xp} XP`}
              </button>
            </div>
          );
        })}
      </div>
      <p className="daily-reset-note">
        {c(
          "Misi berganti pada tengah malam waktu perangkat. Soal dihitung setelah kuis atau pertarungan diselesaikan. Setiap hadiah dapat diklaim sekali per hari.",
          "Quests reset at midnight in your device’s time zone. Questions count after completing a quiz or battle. Each reward can be claimed once per day.",
        )}
      </p>
    </>
  );
}
