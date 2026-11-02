import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import { refreshAiStatus } from "./useAiStatus";
export function ChatgptNotice() {
  const location = useLocation(),
    navigate = useNavigate(),
    { language } = useI18n();
  const [outcome, setOutcome] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search),
      value = params.get("chatgpt");
    if (!value || !["connected", "denied", "permission_needed"].includes(value))
      return;
    setOutcome(value);
    params.delete("chatgpt");
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true },
    );
    void refreshAiStatus();
  }, [location.pathname, location.search, navigate]);
  if (!outcome) return null;
  const id =
    outcome === "connected"
      ? "ChatGPT terhubung. Pilih model di Tutor Qwi atau Pengaturan, lalu coba tanya jawab."
      : outcome === "denied"
        ? "Login ChatGPT dibatalkan. Koneksi lama tidak diganti."
        : "Login berhasil, tetapi izin pemakaian paket ChatGPT belum diberikan. Hubungkan ulang jika ingin mengaktifkan AI.";
  const en =
    outcome === "connected"
      ? "ChatGPT is connected. Choose a model in Qwi Tutor or Settings, then try a conversation."
      : outcome === "denied"
        ? "ChatGPT sign-in was cancelled. Your existing connection was not replaced."
        : "Sign-in succeeded, but ChatGPT plan usage was not authorized. Reconnect to enable AI.";
  return (
    <div className="chatgpt-notice" role="status">
      <p>{language === "id" ? id : en}</p>
      <button
        aria-label={
          language === "id" ? "Tutup pemberitahuan" : "Dismiss notice"
        }
        onClick={() => setOutcome(null)}
      >
        <X size={17} />
      </button>
    </div>
  );
}
