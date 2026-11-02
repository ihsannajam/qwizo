# OpenAI API key opsional untuk Qwizo

Sejak v0.4, jalur utama tersedia melalui tombol **Lanjutkan dengan ChatGPT**, tanpa API key untuk akun/paket yang memenuhi syarat. Lihat [chatgpt-sign-in.md](chatgpt-sign-in.md). Dokumen ini menjelaskan pilihan API key dengan tagihan API terpisah. Pemilihan API harus eksplisit pada Pengaturan → Pilihan sumber AI; tidak ada fallback otomatis.

## Status implementasi

Server OpenAI Responses API, mode chat AI di Tutor Qwi, generator tiga soal per materi, dan penilaian latihan AI di server telah dibuat. Mode lokal tetap tersedia tanpa key. Koneksi ke akun/model nyata belum diuji karena API key belum diberikan melalui konfigurasi lokal. Jalur API key tidak memakai cookie/token login browser maupun kredensial GitHub. Jalur ChatGPT terpisah memakai grant OAuth resmi, disimpan hanya di server.

## Aktivasi oleh pemilik akun

1. Buka https://platform.openai.com/api-keys dan masuk dengan akunmu. Buat project/API key. Kunci tidak perlu dikirim ke percakapan.
2. Pastikan organisasi API punya kuota. Pengguna Pro/Business yang memenuhi syarat dapat menautkan manfaat kredit API: https://developers.openai.com/api/docs/guides/chatgpt-api-credits . Kelayakan, saldo dan aktivasi manfaat akun ini belum diverifikasi.
3. Isi `OPENAI_API_KEY` di `.env` lokal. Model awal `gpt-4.1-mini`, dapat diganti dengan model berakses untuk projectmu yang mendukung Responses API + Structured Outputs.
4. Jalankan `npm run ai`, lalu `npm run dev` di terminal kedua. Buka http://localhost:5174.
5. Di Pengaturan, pilih Pilihan sumber AI → Gunakan API key (tagihan API). Pada halaman materi, buka Tutor Qwi → AI generatif. Minta penjelasan, tanyakan hubungan konsep, atau minta contoh baru. Pada materi yang sama, pilih kesulitan lalu Buat 3 soal AI untuk latihan bebas.

Server `.env` tidak menggunakan awalan `VITE_`, tidak disalin ke `dist`, dan diabaikan Git. Di komputer lain, buat `.env` sendiri; GitHub hanya membawa `.env.example`. Jangan menaruh key dalam browser/localStorage atau melakukan commit `.env`.

## Cara menjalankan

- `npm run ai`: build dan jalankan server pada 127.0.0.1:5075.
- `npm run dev`: frontend Vite port 5174 dengan proxy `/api/ai` ke server lokal. Port mengikuti `AI_PORT` pada `.env`; restart Vite jika port diubah.
- `npm run build`: periksa TypeScript frontend/server, buat `dist/` dan `dist-server/`.
- `npm start`: bangun ulang frontend/server secara otomatis, lalu jalankan server; frontend dan API tersedia pada http://127.0.0.1:5075.
- `npm run preview`: preview frontend saja; bukan server AI.

Server mendengarkan loopback dan memeriksa Origin/Host. Ini konfigurasi lokal satu pengguna; sebelum deployment publik, tambahkan autentikasi, kuota per pengguna dan penyimpanan server. Jangan membuka port langsung ke internet hanya untuk mengaktifkan AI.

## Kontrak fitur

| Endpoint                    | Perilaku                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| GET /api/ai/status          | Status konfigurasi dan model, tidak mengirim key atau menguji saldo                        |
| POST /api/ai/tutor          | Konteks materi terpilih, ID/EN, maksimal delapan pesan riwayat dan satu pesan baru         |
| POST /api/ai/practice       | Tiga soal dengan kesulitan easy/medium/hard; respons tidak memuat jawaban benar/pembahasan |
| POST /api/ai/practice/grade | Penilaian tiga jawaban berdasarkan key dalam memori server, lalu hasil dan pembahasan      |

Tutor generatif tersedia saat membaca. Pada kuis utama, server selalu memberi petunjuk authored untuk questionId aktif, tanpa meminta model menyelesaikan soal. Backend tidak mengizinkan caller menyisipkan role system/developer pada riwayat. Chat baru memulai riwayat baru; percakapan tidak disimpan di database.

Latihan AI tidak menambah XP, mastery, unlock atau kelulusan. API memvalidasi struktur, panjang, pilihan berbeda dan index jawaban. Validasi format tidak membuktikan kebenaran matematika. Pembahasan dan isi soal masih perlu ditinjau manusia sebelum menjadi bank soal resmi.

Key jawaban latihan AI disimpan dalam memori server selama 20 menit. ID percobaan acak, maksimal 100 percobaan aktif. Jawaban lengkap diperlukan untuk menilai; pengiriman ulang identik memberi hasil sama, jawaban berbeda setelah dinilai ditolak. Restart server menghapus percobaan. User dapat membuang latihan jika sudah kedaluwarsa. Kuis utama tetap memakai bank lokal MVP.

## Pemakaian dan error

Default lokal: maksimal dua permintaan model bersamaan, 20 per 10 menit dan 100 per hari UTC per proses. `AI_DAILY_REQUEST_LIMIT` bisa diatur di `.env`; restart menghapus penghitung sehingga bukan pengganti limit/anggaran project di API Platform. Pada jalur API key, token output dibatasi 900 untuk tutor dan 2600 untuk generator. Jalur ChatGPT tidak mengirim parameter ini. Tidak ada retry otomatis berbayar.

Tidak ada fallback AI palsu: mode lokal diberi label terpisah. Saat server mati, API key kosong/tidak valid, kuota provider habis, timeout, refusal atau JSON tidak valid, UI menampilkan pesan dan tetap menyediakan alur belajar lokal. Konfigurasi key terisi bukan bukti key valid/saldo cukup.

Request model memakai `store:false`. Pesan/konteks dikirim ke OpenAI ketika pengguna meminta mode AI atau soal baru. Tidak ada janji zero retention; ketentuan pemrosesan data mengikuti konfigurasi akun dan kebijakan penyedia. Header/token dan detail error upstream tidak dikirim ke browser atau dicetak ke log.

## Pengujian

`npm test` menambahkan 14 kelompok pemeriksaan AI/server dengan provider tiruan: key kosong, konteks bahasa/riwayat, petunjuk semua soal aktif, request salah, tidak bocor key jawaban sebelum grading, grading ulang, expired/malformed output, limit/concurrency, Origin/Host, bentuk request Responses dan error/refusal/incomplete. Tidak ada API berbayar yang dipanggil dalam tes.

Build frontend/server telah diverifikasi. Tes browser interaktif masih terhalang pengaturan akses browser lokal Work. Permintaan smoke test HTTP ke loopback juga dibatasi/tidak tersambung dari lingkungan eksekusi, sehingga pemeriksaan HTTP runtime belum dinyatakan lulus. Setelah key diisi, masih perlu smoke test nyata: status AI, satu percakapan, satu generasi latihan, penilaian, dan melihat konsumsi di API Platform.

## Referensi resmi yang digunakan

- Auth dan penyimpanan key server: https://developers.openai.com/api/reference/overview
- Responses API: https://developers.openai.com/api/docs/guides/migrate-to-responses
- Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- Model awal: https://developers.openai.com/api/docs/models/gpt-4.1-mini
- Kredit API pelanggan yang memenuhi syarat: https://developers.openai.com/api/docs/guides/chatgpt-api-credits
- Alternatif Sign in with ChatGPT: https://developers.openai.com/siwc/token-sharing-open-source (sudah diterapkan pada v0.4; lihat panduan ChatGPT)

## Halaman utama port 5075 dan fresh clone

`npm run ai` membangun server saja. Frontend untuk port 5075 memerlukan `dist/index.html`; pada clone baru file ini belum tersedia. Versi lama mengubah kegagalan file tersebut menjadi `server_error` generik. Versi terbaru menyediakan halaman instruksi berstatus 503 ketika folder/file frontend belum dibangun.

`npm start` kini memiliki tahap prestart yang menjalankan build frontend/server, sehingga satu perintah cukup untuk menjalankan paket lokal. `server/main.ts` memakai lokasi bundel untuk mencari folder proyek dan `.env`; menjalankan berkas dari folder terminal berbeda tidak mengalihkan lokasi konfigurasi.

Tiga pengujian tambahan memakai fixture sementara di dalam workspace: dist/index yang hilang menghasilkan halaman petunjuk; build normal melayani root, route SPA, aset dan HEAD dari working directory berbeda; aset hilang, path privat, encoding rusak dan metode POST ditolak dengan status yang sesuai. Tes ini memanggil penanganan file secara langsung dan tidak membutuhkan jaringan atau API key.
