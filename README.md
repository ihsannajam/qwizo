# Qwizo! — MVP Frontend v0.2

Petualangan belajar Matematika dengan World Map 2.5D, 24 materi, 72 soal, tutor Qwi terstruktur, dan arena Penjaga Kristal. React + TypeScript strict + Vite + Tailwind + React Router + Zustand + Motion. Seluruh data disimpan lokal pada browser; tidak memerlukan backend atau kunci API.

## Menjalankan

```powershell
cd "C:\Users\User\Documents\Project QWIZO"
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite (default http://localhost:5174). Isi nama panggilan, masuk World Map, pilih Matematika, lalu **Masuk Pulau**. Tombol **Lanjut belajar** di bagian bawah peta langsung membuka materi berikutnya yang belum lulus.

```powershell
npm test
npm run build
npm run preview
```

Build menghasilkan `dist/`. Hosting SPA membutuhkan fallback ke `index.html`. Gunakan Node.js 20.19+ atau 22.12+.

## Menjalankan di komputer lain melalui GitHub

Repository: [ihsannajam/qwizo](https://github.com/ihsannajam/qwizo) (private). Pasang Git dan Node.js, kemudian ambil proyek:

```powershell
git clone https://github.com/ihsannajam/qwizo.git
cd qwizo
npm ci
npm run dev
```

Untuk repo private, masuk menggunakan akun GitHub yang memiliki akses. Buka alamat lokal yang ditampilkan Vite (default port 5174). Untuk mengambil pembaruan berikutnya, jalankan `git pull --ff-only`, lalu `npm ci` dan `npm run dev` lagi.

GitHub menyimpan kode sumber; unggahan repository saja belum menghasilkan website publik. Untuk membuka Qwizo langsung dari browser tanpa memasang Node.js, perlu deployment terpisah. Progres belajar masih tersimpan per browser dan tidak ikut tersinkron ketika repository di-clone.

## Alur yang dapat dimainkan

1. Masuk demo → World Map 10 pulau; Matematika aktif, sembilan lainnya Coming Soon.
2. Masuk Matematika → enam pos; Qwi bergerak mengikuti jalan saat pos dipilih.
3. Baca materi → konsep, cara berpikir, contoh bertahap → kuis tiga soal.
4. Pilih jawaban, periksa, baca umpan balik, lanjutkan hingga hasil.
5. Dua dari tiga benar berarti lulus. Materi berikutnya terbuka, hadiah pertama masuk, dan skor terbaik tersimpan.
6. Gunakan Qwi Tutor pada materi/kuis: Konsep, Petunjuk, Pembahasan atau pertanyaan dengan kata kunci. Ini panduan lokal, bukan AI generatif. Pembahasan soal ditahan sampai jawaban diperiksa.
7. Setelah 24 materi lulus, buka arena Penjaga Kristal. Lima jawaban tepat menghabiskan HP penjaga; dua kesalahan menghabiskan perisai Qwi. Ada hasil kemenangan/kekalahan, pembahasan dan ulangi.
8. Kembali ke World Map untuk melihat level, penguasaan topik, streak, koin, lencana dan klaim misi harian.

Tidak ada pengurangan XP saat gagal. Pengulangan materi memperbarui skor terbaik tanpa menggandakan hadiah kelulusan. Percobaan aktif belum disimpan sampai kuis selesai; meninggalkan percobaan menampilkan konfirmasi, sedangkan reload menggunakan peringatan bawaan browser.

## Aturan progres MVP

| Mekanisme       | Aturan                                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Kelulusan       | Minimal 2/3 benar, membuka materi berikutnya secara berurutan                                                   |
| Hadiah materi   | 80 XP + 20 koin sekali pada kelulusan pertama                                                                   |
| Mastery         | Rata-rata persentase skor terbaik; terpisah dari XP                                                             |
| Level           | Mulai level 1, naik setiap 300 XP                                                                               |
| Boss            | Terbuka setelah 24 kuis lulus; 100 HP masing-masing; benar: penjaga −20, salah: Qwi −50                         |
| Hadiah boss     | 300 XP + 100 koin sekali pada kemenangan pertama                                                                |
| Lencana         | Satu per topik yang seluruh materinya lulus; satu untuk kemenangan boss                                         |
| Streak          | Bertambah sekali per hari saat menyelesaikan kuis/pertarungan, mulai lagi setelah hari terlewat                 |
| Misi harian     | Lulus satu kuis (+50 XP/10 koin), jawab lima soal berbeda (+100 XP/20 koin), latihan dua topik (+50 XP/10 koin) |
| Pergantian hari | Tengah malam tanggal lokal perangkat; halaman menyegarkan status tiap menit dan saat aktif kembali              |

Aturan ini keputusan implementasi lokal yang dapat disesuaikan saat uji pengguna. Penilaian dan reward dihitung deterministik, belum divalidasi server.

## Desain dan akses

- World Map fullscreen, pulau berupa sprite WebP terpisah, HUD dan kontrol game mengambang.
- Pan, pinch/wheel/tombol zoom, reset dan fokus kamera; dashboard/misi/progres/pengaturan tetap overlay.
- Maskot dan logo memakai referensi brand asli, latar transparan. Bubble, efek mengetik, glow warna pulau, burung, loading dan transisi perjalanan tersedia.
- Font Fredoka lokal; ID/EN pada UI, materi, soal, petunjuk dan hasil.
- Jurnal desktop/bottom sheet mobile; layar belajar fokus dan arena fullscreen responsif.
- Fokus keyboard, focus trap, konfirmasi keluar dan reduced-motion tersedia.

Visual arena menggunakan kristal berlapis dengan transformasi CSS 3D dan animasi damage; belum model GLB/Three.js. Peta tetap sprite 2.5D. Suara belum tersedia; toggle menyimpan preferensi untuk tahap berikutnya.

## Penyimpanan dan migrasi

Zustand menyimpan profil lokal, hasil terbaik, jumlah percobaan, kelulusan, XP/koin, hari aktif, misi, kemenangan boss, bahasa dan posisi Qwi. Data tidak tersinkron antarperangkat dan berasal dari satu profil browser. Keluar demo tidak menghapus progres; mengganti nama bukan membuat akun terpisah.

Save Sprint 1 dimigrasikan ke versi 2. Materi yang dulu ditandai selesai menjadi **riwayat baca**, sementara kelulusan/mastery dan hadiah dimulai dari hasil kuis. Nama, sesi, bahasa dan preferensi dipertahankan. Pemberitahuan migrasi muncul di World Map.

## Struktur utama

```text
src/
  App.tsx                         Login, routing, pergantian hari
  components/                     Jurnal, progress bar, bubble
  store/game.ts                   State dan penyimpanan versi 2
  domain/progression.ts           Penilaian, reward, unlock, misi, streak, boss
  features/world-map/             Peta, kamera, HUD, pulau, overlay
  features/island/                Peta Matematika, pos, panel materi, rute Qwi
  features/learning/
    curriculum.ts                 24 materi tambahan + 72 soal ID/EN
    session.ts                    Transisi sesi baca/kuis/hasil
    LearningSession.tsx           Layar materi, kuis, hasil dan arena
    TutorPanel.tsx / tutor.ts      Tutor terstruktur dan aturan petunjuk
    QuestList.tsx / useProgress.ts Misi dan statistik pemain
    learning.css                  Tampilan belajar dan arena
  i18n/                           Terjemahan UI dan materi dasar
scripts/
  check-trail.mjs                 Rute Qwi dan terjemahan materi dasar
  check-mvp.mjs / mvp.test.tsx     Pengujian progres, tutor, sesi dan render
public/assets/                    Sprite, peta, maskot dan logo lokal
```

## Validasi dan batasan

`npm test` memeriksa 36 perjalanan Qwi, kelengkapan terjemahan 24 materi, serta 14 kelompok pemeriksaan MVP: 72 soal, transisi sesi, tutor sebelum/sesudah menjawab, migrasi, penyimpanan, kelulusan, unlock, reward ganda, mastery, level, misi, streak dan kemenangan/kekalahan boss. Komponen 24 materi, topik, tutor dan arena dirender melalui server untuk memeriksa error runtime awal.

Build TypeScript/Vite diverifikasi. **Pengujian browser interaktif dan inspeksi visual pembaruan v0.2 belum dapat dilakukan karena akses browser lokal dinonaktifkan di pengaturan Work.** Screenshot lama di `docs/screenshots/` adalah referensi versi sebelumnya, bukan bukti pengujian v0.2.

Materi merupakan jalur fondasi Matematika enam topik, belum silabus kelas 12/UTBK yang telah direview guru. Backend, autentikasi nyata, AI generatif, model 3D penuh, kuis adaptif, audio, sembilan pulau lain, deployment dan pengujian perangkat sentuh fisik masih tahap lanjutan.

Keputusan dan checklist uji manual: [docs/mvp-learning.md](docs/mvp-learning.md). Referensi historis: [docs/visual-update.md](docs/visual-update.md), [docs/game-ui-update.md](docs/game-ui-update.md), [docs/language-and-trail.md](docs/language-and-trail.md). Catatan Sprint 1 bersifat historis; README ini menjelaskan perilaku terbaru.
