# Qwizo! — MVP + AI Server v0.3

Petualangan belajar Matematika dengan World Map 2.5D, 24 materi, 72 soal, tutor Qwi terstruktur, dan arena Penjaga Kristal. React + TypeScript strict + Vite + Tailwind + React Router + Zustand + Motion. Progres inti disimpan lokal pada browser dan tetap dapat dimainkan tanpa kunci API. Mode AI opsional memakai server Node.js dan OpenAI Responses API.

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

Build menghasilkan `dist/` dan `dist-server/`, dengan pemeriksaan TypeScript frontend dan server. Gunakan Node.js 20.19+ atau 22.12+. `npm run preview` hanya untuk frontend tanpa API; untuk paket frontend + AI gunakan `npm start`, yang otomatis menjalankan build terlebih dahulu.

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
6. Gunakan Qwi Tutor pada materi/kuis: Konsep, Petunjuk, Pembahasan atau pertanyaan dengan kata kunci. Mode panduan lokal tersedia tanpa API. Mode AI generatif tersedia pada materi jika layanan AI diaktifkan. Saat kuis utama aktif, hanya petunjuk terstruktur yang dipakai.
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

`npm test` memeriksa 36 perjalanan Qwi, kelengkapan terjemahan 24 materi, serta 15 kelompok pemeriksaan MVP: 72 soal, transisi sesi, tutor sebelum/sesudah menjawab, migrasi, penyimpanan, kelulusan, unlock, reward ganda, mastery, level, misi, streak dan kemenangan/kekalahan boss. Komponen 24 materi, topik, tutor dan arena dirender melalui server untuk memeriksa error runtime awal.

Build TypeScript/Vite diverifikasi. **Pengujian browser interaktif dan inspeksi visual pembaruan v0.3 belum dapat dilakukan karena akses browser lokal dinonaktifkan di pengaturan Work.** Screenshot lama di `docs/screenshots/` adalah referensi versi sebelumnya, bukan bukti pengujian v0.3.

Materi merupakan jalur fondasi Matematika enam topik, belum silabus kelas 12/UTBK yang telah direview guru. Backend akun/progres, autentikasi nyata, model 3D penuh, kuis adaptif, audio, sembilan pulau lain, deployment publik dan pengujian perangkat sentuh fisik masih tahap lanjutan. Integrasi AI telah disiapkan, tetapi koneksi model nyata memerlukan API key dan kuota akun pemilik.

Keputusan dan checklist uji manual: [docs/mvp-learning.md](docs/mvp-learning.md). Referensi historis: [docs/visual-update.md](docs/visual-update.md), [docs/game-ui-update.md](docs/game-ui-update.md), [docs/language-and-trail.md](docs/language-and-trail.md). Catatan Sprint 1 bersifat historis; README ini menjelaskan perilaku terbaru.

## Mengaktifkan AI generatif

1. Masuk ke [OpenAI API Platform](https://platform.openai.com/api-keys) dengan akunmu. Buat project/API key dan pastikan ada kuota API aktif. Akun ChatGPT dapat memakai email yang sama, tetapi cookie/token login ChatGPT bukan API key. Paket Pro/Business yang memenuhi syarat dapat mengaktifkan manfaat [kredit API](https://developers.openai.com/api/docs/guides/chatgpt-api-credits).
2. Salin `.env.example` menjadi `.env`, isi `OPENAI_API_KEY` secara lokal. Jangan kirim key lewat chat, jangan beri awalan `VITE_`, dan jangan commit `.env`. Model awal `gpt-4.1-mini` dapat diganti dengan model yang tersedia untuk projectmu dan mendukung Structured Outputs.
3. Jalankan server AI dan frontend pada dua terminal:

```powershell
# Terminal 1
npm run ai
```

```powershell
# Terminal 2
npm run dev
```

Buka http://localhost:5174. Pada materi, buka Tutor Qwi dan pilih **AI generatif**, atau gulir ke **Tantangan baru dari AI** untuk membuat tiga soal. Jika key belum diisi/server belum berjalan, mode lokal dan kuis utama tetap tersedia. Sesudah mengubah `.env`, mulai ulang server AI dan buka ulang panel/halaman.

Untuk menjalankan frontend dan AI dengan satu server lokal (build otomatis):

```powershell
npm start
```

Buka http://127.0.0.1:5075. Server melayani frontend hasil build sekaligus API. Server hanya mendengarkan loopback; integrasi ini belum ditujukan sebagai API publik tanpa autentikasi. Di komputer lain, `.env` harus diisi sendiri karena key tidak ikut GitHub.

Latihan AI merupakan latihan bebas tanpa XP/unlock. Jawaban benar disimpan sementara di server dan baru dikirim pada hasil penilaian. Pemeriksaan format tidak menjamin kebenaran matematika; tetap perlu review konten. Percobaan kedaluwarsa setelah 20 menit atau ketika server dimulai ulang.

Batas lokal awal: 100 permintaan model per hari UTC per proses, 20 per 10 menit, maksimum dua bersamaan. Batas proses hilang saat restart; tetapkan juga anggaran project di API Platform. Semua pengujian AI memakai provider tiruan tanpa biaya; API nyata dan pemeriksaan UI browser belum diverifikasi. Detail: [docs/ai-setup.md](docs/ai-setup.md).

## Peta Matematika fullscreen dan suasana hidup

Kanvas Matematika kini menutup seluruh viewport peta tanpa bidang buram di kiri/kanan. Gambar tetap proporsional 3:2; ukuran dihitung dari lebar dan tinggi area tampilan. Pada layar dengan rasio berbeda, peta dapat digeser untuk menjelajahi seluruh dunia. Titik materi dan rute Qwi tetap menggunakan koordinat ilustrasi yang sama.

Lapisan dekoratif terpisah menambahkan awan melintas, tiga kawanan burung dengan kepakan sayap, cahaya kristal, kilau air dan kabut air terjun. Jalan, gambar dasar dan titik materi tidak digerakkan oleh animasi suasana. Lapisan tidak menangkap input. Animasi berhenti sementara saat tab tersembunyi atau panel belajar terbuka, dan menghormati pengaturan Kurangi animasi serta preferensi sistem.

Tes ukuran mencakup delapan viewport, termasuk 1366×574, 1920×1004, 3440×1364, 390×778 dan 320×480: kanvas menutup kedua sumbu, rasio tetap, dan kamera dapat menjangkau semua pos. Build dan tes lulus; pemeriksaan visual browser tetap belum tersedia karena akses browser lokal Work dinonaktifkan.

## Jika port 5075 menampilkan server_error

Pada versi lama, membuka port 5075 tanpa folder `dist/` menghasilkan error generik. Setelah clone baru, folder hasil build belum ada karena tidak disimpan di GitHub. Ambil perbaikan terbaru dengan `git pull --ff-only`, hentikan server lama dengan Ctrl+C, lalu jalankan `npm start` dari folder proyek. Perintah ini sekarang membangun frontend dan server secara otomatis sebelum menjalankan aplikasi.

Jika hanya menjalankan `npm run ai`, buka frontend melalui terminal kedua dengan `npm run dev` dan alamat http://localhost:5174. Tanpa build frontend, port 5075 kini menampilkan halaman petunjuk, bukan JSON error generik. Lokasi `.env` dan `dist/` dihitung dari lokasi server yang dibangun, bukan dari working directory terminal. Perbaikan ini tidak memerlukan perubahan API key.
