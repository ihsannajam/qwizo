import { useState } from "react";
import { ExternalLink, RefreshCw, Unplug, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import { aiErrorMessage, aiRequest, AiClientError } from "./client";
import { refreshAiStatus, useAiStatus } from "./useAiStatus";
import "./ai.css";

export function AiConnection({ disabled = false }: { disabled?: boolean }) {
  const { language } = useI18n();
  const c = (id: string, en: string) => (language === "id" ? id : en);
  const status = useAiStatus(),
    connection = status?.chatgpt;
  const selected = connection?.accounts.find(
    (a) => a.id === connection.activeId,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [warning, setWarning] = useState<string | null>(null);
  const blocked = busy || disabled;
  const perform = async (path: string, body: unknown) => {
    if (blocked) return;
    setBusy(true);
    setError(null);
    setWarning(null);
    try {
      const reply = await aiRequest<{ revoked?: boolean }>(
        `chatgpt/${path}`,
        body,
      );
      if (reply.revoked === false)
        setWarning(
          c(
            "Koneksi lokal sudah dilepas, tetapi pencabutan izin di ChatGPT belum terkonfirmasi. Putuskan akses aplikasi di pengaturan ChatGPT bila perlu.",
            "The local connection was removed, but remote revocation was not confirmed. Disconnect the app in ChatGPT settings if needed.",
          ),
        );
      await refreshAiStatus();
    } catch (error) {
      setError(aiErrorMessage(error, language));
    } finally {
      setBusy(false);
    }
  };
  const connect = async (accountId?: string) => {
    if (blocked) return;
    setBusy(true);
    setError(null);
    try {
      const result = await aiRequest<{ url: string }>("chatgpt/start", {
        accountId,
        returnTo: window.location.origin + window.location.pathname,
      });
      window.location.assign(result.url);
    } catch (error) {
      setError(aiErrorMessage(error, language));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className="ai-connection"
      aria-label={c("Koneksi AI", "AI connection")}
    >
      <header>
        <b>{c("AI untuk petualanganmu", "AI for your adventure")}</b>
        {status?.authMode === "chatgpt" && status.ready && (
          <span>
            <CheckCircle2 size={13} />
            {c("Paket ChatGPT", "ChatGPT plan")}
          </span>
        )}
      </header>
      {!status && (
        <p role="status">{c("Memeriksa koneksi…", "Checking connection…")}</p>
      )}
      {status?.authMode === "api-key" && (
        <p className="ai-billing-note">
          {c(
            "Sedang memakai API key: penggunaan ditagihkan ke project API, terpisah dari paket ChatGPT.",
            "Using an API key: usage is billed to the API project, separately from your ChatGPT plan.",
          )}
        </p>
      )}
      {selected && (
        <p className="ai-account-label">
          <strong>{selected.name}</strong>
          <span>
            {selected.email ||
              c("Akun ChatGPT tersimpan", "Saved ChatGPT account")}
          </span>
        </p>
      )}
      <p>
        {c(
          "Hubungkan akunmu melalui halaman resmi ChatGPT. Izin pemakaian paket mengikuti kuota dan kelayakan akun, tanpa mengambil riwayat percakapanmu.",
          "Connect through the official ChatGPT sign-in page. Plan usage follows your account’s allowance and eligibility, without accessing your chat history.",
        )}
      </p>
      <button
        type="button"
        data-oai-siwc-button=""
        className="chatgpt-sign-in"
        disabled={blocked || !!status?.errorCode}
        onClick={() => void connect(selected?.id)}
      >
        {selected
          ? c("Hubungkan ulang dengan ChatGPT", "Reconnect with ChatGPT")
          : c("Lanjutkan dengan ChatGPT", "Continue with ChatGPT")}
      </button>
      {!!connection?.accounts.length && (
        <div className="ai-connection-fields">
          <label>
            {c("Akun ChatGPT", "ChatGPT account")}
            <select
              value={connection.activeId ?? ""}
              disabled={blocked}
              onChange={(e) =>
                void perform("select", { accountId: e.target.value })
              }
            >
              <option value="" disabled>
                {c("Pilih akun tersimpan", "Choose a saved account")}
              </option>
              {connection.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.email || account.name} · {account.id.slice(0, 5)}
                  {account.needsLogin
                    ? c(" (masuk lagi)", " (sign in again)")
                    : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            className="text-button"
            disabled={blocked}
            onClick={() => void connect()}
          >
            {c(
              "Tambahkan akun / ruang kerja lain",
              "Add another account / workspace",
            )}
          </button>
        </div>
      )}
      {status?.authMode === "chatgpt" && !!connection?.models.length && (
        <label className="ai-model-select">
          {c("Model akunmu", "Your account’s model")}
          <select
            value={status.model}
            disabled={blocked}
            onChange={(e) => void perform("model", { model: e.target.value })}
          >
            {connection.models.map((model) => (
              <option key={model.slug} value={model.slug}>
                {model.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {selected && !connection?.planEnabled && (
        <p className="ai-billing-note">
          {c(
            "Login tersimpan, tetapi pemakaian paket AI belum diizinkan. Hubungkan ulang dan periksa persetujuan akunmu.",
            "Sign-in is saved, but AI plan usage is not authorized yet. Reconnect and review your account’s consent.",
          )}
        </p>
      )}
      <div className="ai-connection-actions">
        <a
          href="https://chatgpt.com/#settings"
          target="_blank"
          rel="noreferrer"
        >
          {c("Kelola pemakaian di ChatGPT", "Manage usage in ChatGPT")}
          <ExternalLink size={12} />
        </a>
        <button
          disabled={blocked}
          onClick={() => {
            setBusy(true);
            setError(null);
            void aiRequest("chatgpt/models")
              .then(() => refreshAiStatus())
              .catch((error) => setError(aiErrorMessage(error, language)))
              .finally(() => setBusy(false));
          }}
        >
          <RefreshCw size={13} />
          {c("Perbarui", "Refresh")}
        </button>
        {selected?.connected && (
          <button
            disabled={blocked}
            onClick={() =>
              void perform("disconnect", { accountId: selected.id })
            }
          >
            <Unplug size={13} />
            {c("Putuskan", "Disconnect")}
          </button>
        )}
      </div>
      {status?.keyConfigured && (
        <details className="ai-provider-choice">
          <summary>{c("Pilihan sumber AI", "AI source options")}</summary>
          <button
            disabled={blocked || status.authMode === "chatgpt"}
            onClick={() => void perform("provider", { provider: "chatgpt" })}
          >
            {c("Gunakan paket ChatGPT", "Use ChatGPT plan")}
          </button>
          <button
            disabled={blocked || status.authMode === "api-key"}
            onClick={() => void perform("provider", { provider: "api-key" })}
          >
            {c("Gunakan API key (tagihan API)", "Use API key (API billing)")}
          </button>
        </details>
      )}
      {(error || status?.errorCode || connection?.notice) && (
        <p role="alert" className="ai-error">
          {error ??
            aiErrorMessage(
              new AiClientError(
                status?.errorCode || connection?.notice || "offline",
              ),
              language,
            )}
        </p>
      )}
      {warning && (
        <p role="status" className="ai-billing-note">
          {warning}
        </p>
      )}
      {busy && (
        <small role="status">
          {c("Memperbarui koneksi…", "Updating connection…")}
        </small>
      )}
    </section>
  );
}
