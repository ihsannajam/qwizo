import { Globe2 } from "lucide-react";
import { useGame } from "../store/game";
import { useI18n } from "./useI18n";
export function LanguageToggle() {
  const { language, t } = useI18n();
  const setLanguage = useGame((s) => s.setLanguage);
  return (
    <button
      type="button"
      className="language-toggle"
      onClick={() => setLanguage(language === "id" ? "en" : "id")}
      aria-label={t("Ganti bahasa ke Inggris")}
      title={t("Ganti bahasa ke Inggris")}
    >
      <Globe2 size={17} />
      <span>{language.toUpperCase()}</span>
    </button>
  );
}
