import { useGame } from "../store/game";
import { translations, indonesian } from "./messages";
export function useI18n() {
  const language = useGame((s) => s.language);
  const t = (text: string): string =>
    language === "en"
      ? (translations[text] ?? text)
      : (indonesian[text] ?? text);
  const number = (value: number) =>
    new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US").format(value);
  return { language, t, number };
}
