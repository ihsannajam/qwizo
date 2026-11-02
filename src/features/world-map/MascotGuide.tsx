import { useGame } from "../../store/game";
import { useI18n } from "../../i18n/useI18n";
import { SpeechBubble } from "../../components/SpeechBubble";
import { islands } from "./islands";
const id: Record<string, string> = {
  math: "Ini Pulau Matematika! Kastel kristal ini punya 6 pos dan 24 materi. Ayo, kita taklukkan bersama!",
  physics:
    "Lihat cincin energi itu! Di pulau Fisika, kita akan menjelajahi gaya, gerak, dan energi. Petualangannya segera hadir!",
  chemistry:
    "Selamat datang di pulau Kimia! Laboratoriumnya penuh molekul dan reaksi seru. Sebentar lagi kita bisa bereksperimen!",
  biology:
    "Pohon raksasa itu rumah pulau Biologi! Kita akan menemukan rahasia kehidupan di sini. Segera hadir, ya!",
  history:
    "Ada cerita di balik setiap reruntuhan. Pulau Sejarah akan mengajakmu menelusuri jejak peradaban. Segera hadir!",
  geography:
    "Pegunungan, sungai, dan bumi yang luas! Itulah pulau Geografi. Kita jelajahi bersama saat pulaunya terbuka, ya!",
  economics:
    "Kota emas itu pulau Ekonomi! Nanti kita belajar tentang pilihan, perdagangan, dan masa depan. Segera hadir!",
  sociology:
    "Di pulau Sosiologi, kita akan mencari tahu cara manusia hidup bersama. Desa penuh cerita ini segera dibuka!",
  indonesia:
    "Buku raksasa itu menyimpan dunia kata! Pulau Bahasa Indonesia akan mengajakmu membaca dan bercerita. Segera hadir!",
  english:
    "Halo, penjelajah! Pulau Bahasa Inggris menyimpan petualangan bahasa yang baru. Sebentar lagi kita bisa menjelajah bersama!",
};
const en: Record<string, string> = {
  math: "This is Mathematics Island! The crystal castle has 6 stops and 24 lessons. Let’s conquer them together!",
  physics:
    "See those energy rings? On Physics Island, we’ll explore forces, motion, and energy. The adventure is coming soon!",
  chemistry:
    "Welcome to Chemistry Island! Its laboratory is full of molecules and exciting reactions. Soon we’ll experiment together!",
  biology:
    "That giant tree is the home of Biology Island! We’ll discover the secrets of life here. Coming soon!",
  history:
    "Every ruin holds a story. History Island will take you through the footsteps of civilizations. Coming soon!",
  geography:
    "Mountains, rivers, and a wonderful planet! That is Geography Island. We’ll explore it together when it opens!",
  economics:
    "That golden city is Economics Island! We’ll learn about choices, trade, and the future. Coming soon!",
  sociology:
    "On Sociology Island, we’ll explore how people live together. This village full of stories opens soon!",
  indonesia:
    "That giant book holds a world of words! Indonesian Island will invite you to read and tell stories. Coming soon!",
  english:
    "Hello, explorer! English Island is full of new language adventures. Soon, we’ll explore it together!",
};
export function MascotGuide({ islandId }: { islandId: string | null }) {
  const { name, select } = useGame();
  const { language, t } = useI18n();
  const island = islands.find((i) => i.id === islandId);
  const text = island
    ? (language === "id" ? id : en)[island.id]
    : language === "id"
      ? `Hai, ${name}! Aku Qwi, teman petualanganmu. Arahkan kursor ke pulau yang bikin kamu penasaran. Kita jelajahi bersama, yuk!`
      : `Hi, ${name}! I’m Qwi, your adventure companion. Point at an island you’re curious about. Let’s explore together!`;
  return (
    <section
      className="mascot-guide is-speaking"
      aria-label={t("Qwi, pemandu pulau")}
    >
      <div className="mascot-stage">
        <span className="mascot-footing" />
        <img
          className="guide-robot"
          src="/assets/mascot-transparent.webp"
          alt={t("Qwi, robot oranye pemandu petualangan")}
          draggable={false}
        />
        <span className="speech-waves" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <SpeechBubble
        text={text}
        speaker={island ? t(island.name) : t("TEMAN BELAJARMU")}
        action={() => select(island?.id || "math")}
        actionLabel={t(
          island && island.id !== "math" ? "Lihat pulau" : "Ayo jelajahi!",
        )}
      />
    </section>
  );
}
