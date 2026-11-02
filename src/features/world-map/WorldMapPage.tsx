import { useProgress } from "../learning/useProgress";
import { X } from "lucide-react";
import { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  Flame,
  Flag,
  ChartNoAxesCombined,
  Settings,
  Sparkles,
} from "lucide-react";
import { useGame } from "../../store/game";
import type { Panel } from "../../store/game";
import { useI18n } from "../../i18n/useI18n";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ProgressBar } from "../../components/ui";
import { WorldCanvas } from "./WorldCanvas";
import { OverlayHost } from "./OverlayHost";
import { MascotGuide } from "./MascotGuide";
import "./game-world.css";
export function WorldMapPage() {
  const { name, panel, setPanel, selected, migrationNotice, dismissMigration } =
    useGame();
  const player = useProgress();
  const { t, number, language } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);
  const nav: { id: Panel; label: string; icon: typeof Compass }[] = [
    { id: null, label: "World Map", icon: Compass },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quests", label: "Misi Harian", icon: Flag },
    { id: "progress", label: "Progress", icon: ChartNoAxesCombined },
  ];
  return (
    <div className="game-world">
      <main className="game-world-scene" aria-label={t("World Map Qwizo")}>
        <WorldCanvas hovered={hovered} onPreview={setHovered} />
      </main>
      <header className="game-hud">
        <div className="game-identity">
          <a
            className="game-logo"
            href="/world"
            aria-label={t("Qwizo World Map")}
          >
            <img src="/assets/logo-transparent.webp" alt="qwizo!" />
          </a>
          <button
            className="game-player"
            onClick={() => setPanel("dashboard")}
            aria-label={t("Buka profil dan dashboard")}
          >
            <span className="game-level">{player.level}</span>
            <div>
              <div className="game-player-line">
                <b>{name}</b>
                <small>
                  {number(player.current)} / {number(player.next)} XP
                </small>
              </div>
              <ProgressBar value={(player.current / player.next) * 100} />
            </div>
            <span className="game-player-info">i</span>
          </button>
        </div>
        <div className="game-resources">
          <div className="game-resource streak-resource">
            <span className="resource-symbol">
              <Flame size={25} />
            </span>
            <div>
              <small>{t("DAILY STREAK")}</small>
              <b>
                {player.streak} <span>{t("hari")}</span>
              </b>
            </div>
          </div>
          <div className="game-resource token-resource">
            <span className="resource-symbol">
              <Sparkles size={24} />
            </span>
            <div>
              <small>{t("Q-TOKEN")}</small>
              <b>{number(player.coins)}</b>
            </div>
          </div>
          <LanguageToggle />
          <button
            className="game-settings game-square"
            aria-label={t("Buka pengaturan")}
            onClick={() => setPanel("settings")}
          >
            <Settings size={23} />
          </button>
        </div>
      </header>
      <nav className="game-dock" aria-label={t("Menu petualangan")}>
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={label}
            className={`game-nav-button ${panel === id ? "active" : ""}`}
            onClick={() => setPanel(id)}
            aria-label={t(label)}
            aria-current={panel === id ? "true" : undefined}
          >
            <Icon size={24} />
            <span>{t(label)}</span>
            {id === "quests" && (
              <i className="quest-notification">{player.questsDone}</i>
            )}
          </button>
        ))}
      </nav>
      <div className="world-title-plaque">
        <span>✦ {t("WORLD 01")} ✦</span>
        <h1>{t("Kepulauan Qwizo")}</h1>
        <small>{t("10 pulau · Petualangan ilmu tanpa batas")}</small>
      </div>
      <MascotGuide
        islandId={hovered || (panel === "island" ? selected : null)}
      />
      <button className="game-quest-banner" onClick={() => setPanel("quests")}>
        <Flag size={22} />
        <div>
          <b>{t("Quest hari ini")}</b>
          <span>
            {player.questsDone}/3 {t("selesai")}
          </span>
        </div>
        <span className="quest-gem">{player.day.claimed.length}/3 ✓</span>
      </button>
      {migrationNotice && (
        <div className="migration-banner" role="status">
          {language === "id"
            ? "Petualangan baru! Progres demo lama disimpan sebagai riwayat baca. Lulus kuis untuk memperoleh penguasaan dan hadiah."
            : "A new adventure! Old demo progress is saved as reading history. Pass quizzes to earn mastery and rewards."}
          <button
            onClick={dismissMigration}
            aria-label={
              language === "id" ? "Tutup pemberitahuan" : "Dismiss notice"
            }
          >
            <X size={16} />
          </button>
        </div>
      )}
      <OverlayHost />
    </div>
  );
}
