import { Heart, Lightbulb, Shield, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { ProgressBar } from "../../components/ui";
import { useI18n } from "../../i18n/useI18n";

export function BossArena({
  bossHP,
  playerHP,
  attack,
  turn,
  onHelp,
}: {
  bossHP: number;
  playerHP: number;
  attack: "qwi" | "guardian" | null;
  turn: number;
  onHelp: () => void;
}) {
  const { language } = useI18n();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  return (
    <section
      className="boss-battle"
      aria-label={c("Arena pertarungan", "Battle arena")}
    >
      <header className="battle-heading">
        <div>
          <span className="battle-kicker">
            ✦ {c("TANTANGAN AKHIR", "FINAL CHALLENGE")}
          </span>
          <h2>{c("Penjaga Kristal", "Crystal Guardian")}</h2>
        </div>
        <button
          className="battle-help"
          aria-label={c("Bantuan Qwi", "Qwi help")}
          onClick={onHelp}
        >
          <Lightbulb size={17} />
          <span>{c("Bantuan Qwi", "Qwi help")}</span>
        </button>
      </header>
      <div
        key={turn}
        className={`battle-scene ${attack ? `attack-${attack}` : ""} ${bossHP === 0 ? "guardian-defeated" : ""} ${playerHP === 0 ? "qwi-defeated" : ""}`}
      >
        <div className="battle-world">
          <div className="fighter-anchor guardian-anchor">
            {bossHP === 0 && (
              <>
                <div className="defeat-shards" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => {
                    const angle = (index / 12) * Math.PI * 2;
                    return (
                      <i
                        key={index}
                        style={
                          {
                            "--shard-x": `${Math.cos(angle) * 110}px`,
                            "--shard-y": `${Math.sin(angle) * 80 - 25}px`,
                            "--shard-spin": `${index % 2 ? 240 : -240}deg`,
                          } as CSSProperties
                        }
                      />
                    );
                  })}
                </div>
                <span className="fighter-defeated-label">
                  {c("DITAKLUKKAN", "DEFEATED")}
                </span>
              </>
            )}
            <div className="fighter-status enemy-status">
              <div>
                <b>
                  <Shield size={15} />
                  {c("Penjaga Kristal", "Crystal Guardian")}
                </b>
                <span>BOSS</span>
              </div>
              <ProgressBar value={bossHP} />
              <small>
                HP <strong>{bossHP}</strong> / 100
              </small>
            </div>
            <div className="guardian-fighter">
              <div className="guardian-idle">
                <svg
                  className="crystal-guardian guardian-art"
                  viewBox="0 0 240 240"
                  role="img"
                  aria-label={c(
                    "Monster penjaga kristal",
                    "Crystal guardian monster",
                  )}
                >
                  <defs>
                    <linearGradient id="guardian-shell" x2="0.8" y2="1">
                      <stop stopColor="#efcdff" />
                      <stop offset=".45" stopColor="#a46fea" />
                      <stop offset="1" stopColor="#472776" />
                    </linearGradient>
                    <linearGradient id="guardian-core" x2="1" y2="1">
                      <stop stopColor="#fff9b9" />
                      <stop offset="1" stopColor="#ffb04f" />
                    </linearGradient>
                  </defs>
                  <g className="guardian-arm arm-left">
                    <path
                      d="M63 89 21 105 9 153 43 166 75 130Z"
                      fill="url(#guardian-shell)"
                    />
                    <path d="m21 105 22 61 20-77" fill="#7143ac" />
                  </g>
                  <g className="guardian-arm arm-right">
                    <path
                      d="m177 89 42 16 12 48-34 13-32-36Z"
                      fill="url(#guardian-shell)"
                    />
                    <path d="m219 105-22 61-20-77" fill="#d0a2ff" />
                  </g>
                  <path
                    d="m83 176-13 39 31 11 20-39m36-11 13 39-31 11-20-39"
                    fill="#634090"
                  />
                  <path
                    d="m120 27 65 49 10 70-41 51H86l-41-51 10-70Z"
                    fill="url(#guardian-shell)"
                    stroke="#d6b7ff"
                    strokeWidth="2"
                  />
                  <path
                    d="m120 27 1 170-76-51 10-70Z"
                    fill="#c497f4"
                    opacity=".45"
                  />
                  <path d="m55 76 65 30 65-30-31 65H86Z" fill="#3f285e" />
                  <path
                    d="m76 100 26 8-5 13-20-6m87-15-26 8 5 13 20-6"
                    fill="#fff2a6"
                  />
                  <path
                    className="guardian-heart"
                    d="m120 140 21 21-21 28-21-28Z"
                    fill="url(#guardian-core)"
                  />
                  <path
                    d="m92 38-8-27 23 13L120 4l13 20 23-13-8 27Z"
                    fill="#ffd879"
                    stroke="#fff0b7"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="fighter-anchor hero-anchor">
            {playerHP === 0 && (
              <span className="fighter-defeated-label">
                {c("TENAGA HABIS", "OUT OF ENERGY")}
              </span>
            )}
            <div className="fighter-status hero-status">
              <div>
                <b>
                  <Heart size={15} />
                  Qwi
                </b>
                <span>{c("PENJELAJAH", "EXPLORER")}</span>
              </div>
              <ProgressBar value={playerHP} />
              <small>
                HP <strong>{playerHP}</strong> / 100
              </small>
            </div>
            <div className="qwi-fighter">
              <div className="qwi-idle">
                <img src="/assets/mascot-transparent.webp" alt="Qwi" />
              </div>
            </div>
          </div>
          <div className="battle-projectile" aria-hidden="true">
            <Sparkles />
          </div>
          <div className="battle-impact" aria-hidden="true">
            ✦
          </div>
          {attack && (
            <span
              className={`battle-damage ${attack === "qwi" ? "enemy-damage" : "hero-damage"}`}
              aria-hidden="true"
            >
              −{attack === "qwi" ? 20 : 50} HP
            </span>
          )}
        </div>
        <div className="battle-announcer" role="status">
          {bossHP === 0
            ? c(
                "Penjaga tumbang! Cahaya kristal kembali.",
                "Guardian defeated! The crystal shines again.",
              )
            : playerHP === 0
              ? c(
                  "Qwi kehabisan tenaga. Istirahat, lalu coba lagi!",
                  "Qwi is out of energy. Rest, then try again!",
                )
              : attack === "qwi"
                ? c(
                    "Qwi menggunakan Kilau Pengetahuan!",
                    "Qwi uses Knowledge Spark!",
                  )
                : attack === "guardian"
                  ? c(
                      "Penjaga membalas dengan Gelombang Kristal!",
                      "Guardian uses Crystal Wave!",
                    )
                  : c(
                      "Giliranmu! Jawaban tepat menjadi kekuatan Qwi.",
                      "Your turn! A correct answer powers Qwi’s attack.",
                    )}
        </div>
      </div>
    </section>
  );
}
