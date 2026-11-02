import { useI18n } from "./i18n/useI18n";
import { LanguageToggle } from "./i18n/LanguageToggle";
import { ChatgptNotice } from "./features/ai/ChatgptNotice";
import { IslandTravelProvider } from "./features/navigation/IslandTravel";
import { useIslandTravel } from "./features/navigation/travel-context";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useGame } from "./store/game";
import { WorldMapPage } from "./features/world-map/WorldMapPage";
import { IslandArt } from "./features/world-map/IslandArt";
import { MathIsland } from "./features/island/MathematicsIslandPage";
import { islands } from "./features/world-map/islands";
function Login() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const login = useGame((s) => s.login);
  const travel = useIslandTravel();
  const [entering, setEntering] = useState(false);
  return (
    <main className="login-page">
      <div className="login-language">
        <LanguageToggle />
      </div>
      <div className="login-illustration">
        <IslandArt island={islands[5]} />
        <h1>
          {t("Belajar jadi")}
          <br />
          <span>{t("petualangan.")}</span>
        </h1>
        <p>
          {t("10 dunia baru. Ribuan kemungkinan.")}
          <br />
          {t("Satu langkah kecil untuk masa depanmu.")}
        </p>
      </div>
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (entering) return;
          setEntering(true);
          travel("/world", () => login(name));
        }}
      >
        <img
          className="login-logo"
          src="/assets/logo-transparent.webp"
          alt="qwizo!"
        />
        <img
          className="login-mascot"
          src="/assets/mascot-transparent.webp"
          alt={t("Robot Qwizo menyambutmu")}
        />
        <span className="eyebrow">{t("SELAMAT DATANG, PENJELAJAH")}</span>
        <h2>{t("Petualanganmu dimulai!")}</h2>
        <p>{t("Masuk ke dunia belajar kelas 12 yang lebih seru.")}</p>
        <label htmlFor="name">{t("Nama panggilan")}</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={28}
          placeholder={t("Panggil aku…")}
          autoComplete="nickname"
          required
        />
        <button className="primary-button" type="submit" disabled={entering}>
          {t(entering ? "Menyiapkan dunia…" : "Mulai petualangan")}{" "}
          <ArrowRight size={18} />
        </button>
        <small>{t("Login demo · Tidak membutuhkan akun atau password")}</small>
      </form>
    </main>
  );
}
export default function App() {
  const { language } = useI18n();
  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "id"
        ? "Qwizo! — Petualangan Belajarmu"
        : "Qwizo! — Your Learning Adventure";
  }, [language]);
  useEffect(() => {
    const refresh = () => useGame.getState().refreshDay();
    refresh();
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const { loggedIn, reduced } = useGame();
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <div className={reduced ? "reduce-motion" : undefined}>
        <IslandTravelProvider>
          <ChatgptNotice />
          <Routes>
            <Route
              path="/login"
              element={loggedIn ? <Navigate to="/world" replace /> : <Login />}
            />
            <Route
              path="/world"
              element={
                loggedIn ? <WorldMapPage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/island/mathematics"
              element={
                loggedIn ? <MathIsland /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="*"
              element={<Navigate to={loggedIn ? "/world" : "/login"} replace />}
            />
          </Routes>
        </IslandTravelProvider>
      </div>
    </MotionConfig>
  );
}
