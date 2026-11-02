# ChatGPT untuk Qwizo v0.4

Qwizo menyediakan tombol **Lanjutkan dengan ChatGPT** untuk tutor dan pembuatan tiga soal latihan. Jalur ini menggunakan OAuth resmi OpenAI untuk aplikasi lokal pribadi. API key tidak diperlukan untuk jalur ChatGPT. Pemakaian paket memerlukan akun yang memenuhi syarat dan persetujuan izin penggunaan paket; login saja belum berarti model dapat dipakai. Dokumentasi OpenAI saat implementasi menyebut dukungan paket Plus/Pro yang memenuhi syarat. Kelayakan akun ini belum diuji.

## Menjalankan dan masuk

```powershell
git pull --ff-only
npm ci
npm start
```

1. Buka http://127.0.0.1:5075. `npm start` membangun frontend dan server secara otomatis.
2. Masuk demo Qwizo, lalu buka Pengaturan atau Tutor Qwi di materi.
3. Pilih **Lanjutkan dengan ChatGPT**. Browser diarahkan ke halaman resmi `auth.openai.com`.
4. Masuk dengan akunmu dan periksa persetujuan penggunaan paket pada halaman OpenAI. Jangan menyalin token, cookie, atau kode login ke chat maupun `.env`.
5. Setelah kembali ke Qwizo, periksa akun dan model yang tersedia. Model berasal dari daftar akun, tanpa mengasumsikan model API tertentu.
6. Buka materi → Tutor Qwi → AI generatif untuk tanya jawab; **Buat 3 soal AI** membuat latihan bebas. Saat kuis utama berjalan, petunjuk tetap menggunakan materi lokal.

Server harus tetap berjalan selama login. Jalankan satu server Qwizo per folder proyek agar penulisan koneksi tidak bertabrakan. Untuk pengembangan, gunakan `npm run ai` dan `npm run dev` di dua terminal; mulai login dari localhost:5174 juga didukung. Callback selalu kembali ke `http://127.0.0.1:<AI_PORT>/auth/callback`, kemudian ke halaman Qwizo asal.

Untuk perangkat lain, clone/pull kode, jalankan perintah yang sama, lalu masuk dengan ChatGPT lagi di perangkat tersebut. Koneksi akun dan progres browser tidak dikirim melalui GitHub. Integrasi ini melayani localhost untuk penggunaan pribadi; deployment publik/komersial memerlukan peninjauan akses dan arsitektur akun yang berbeda.

## Kuota dan pilihan sumber AI

Jalur ChatGPT memakai izin dan batas paket ChatGPT yang diberikan pada layar persetujuan. Ini bukan akses gratis tanpa batas. Jika izin tidak diberikan, model belum tersedia, atau kuota habis, aplikasi menampilkan error dan panduan lokal tetap tersedia. **Tidak ada perpindahan otomatis ke API berbayar.** Kelola pemakaian melalui pengaturan ChatGPT.

Jika `.env` sudah memiliki `OPENAI_API_KEY`, bagian **Pilihan sumber AI** memungkinkan pemilik memilih API key secara eksplisit. Pilihan ini memakai tagihan project API, terpisah dari paket ChatGPT. Nilai `OPENAI_MODEL` hanya berlaku pada jalur API key. Membiarkan key lama di `.env` tidak otomatis mengaktifkan tagihan API.

Batas aplikasi tetap dua permintaan bersamaan, 20 per 10 menit, dan 100 per hari UTC per proses secara default; penghitung dimulai ulang bersama server. Jalur ChatGPT memakai streaming Responses dengan `store:false`; parameter API `max_output_tokens` tidak dikirim karena tidak didukung jalur ini. Server membatasi waktu dan ukuran respons, memeriksa struktur JSON, dan hanya menerima respons dengan penanda selesai. Kuota model tetap mengikuti provider.

## Akun dan penyimpanan

- Akun dapat dihubungkan ulang, diganti, ditambah, atau diputuskan. Pilihan model disimpan terpisah per koneksi. Pergantian akun membatalkan permintaan ChatGPT yang sedang berjalan.
- Token akses, refresh, dan ID hanya disimpan pada server dalam `.qwizo-auth/connections.dat`; folder ini diabaikan Git. Tidak dikirim ke frontend/localStorage atau dicetak ke log.
- Di Windows, berkas dilindungi DPAPI CurrentUser: hanya akun Windows yang menyimpannya yang dapat membukanya. Di sistem lain, berkas menggunakan izin 0600 dan folder 0700; bukan enkripsi OS.
- PKCE S256, state, nonce, cookie HttpOnly, callback sekali pakai, verifikasi JWT/JWKS issuer/audience/signature/expiry, serta validasi identitas ulang digunakan untuk memeriksa login.
- Refresh diserialisasi dan token yang berotasi disimpan bersama. Identitas akun dan client registration diperiksa sebelum kredensial digunakan.
- **Putuskan** mencoba mencabut refresh token, menghapus token lokal, dan mempertahankan identitas registrasi untuk login berikutnya. Jika pencabutan jarak jauh belum terkonfirmasi, UI menjelaskannya; periksa akses aplikasi di pengaturan ChatGPT.
- Koneksi AI terpisah dari profil belajar demo; belum autentikasi backend untuk akun/progres siswa. Seluruh browser yang memakai server lokal yang sama memakai pilihan koneksi AI server yang sama.

Konteks materi dan pesan yang diminta pengguna dikirim ke OpenAI. Qwizo tidak meminta akses riwayat percakapan ChatGPT. `store:false` bukan janji zero retention; kebijakan penyedia tetap berlaku. Hasil matematika AI perlu diperiksa kembali; latihan generatif tidak memberi XP, kelulusan, atau unlock.

## Status pengujian

`npm test` mencakup 14 kelompok pemeriksaan tambahan: PKCE, callback dan replay, cookie/state/nonce, client registration, JWT bertanda tangan lokal, pemisahan akun/model, rotating refresh, pencabutan akses, tidak ada fallback tagihan, discovery model, kontrak streaming, kuota/incomplete/refusal, serta vault DPAPI dengan data uji lokal. Semua endpoint OAuth/model pada tes memakai tiruan; tidak menggunakan akun sungguhan atau melakukan inferensi berbayar.

Build TypeScript/Vite dan seluruh tes lulus. Server hasil build berhasil mencapai tahap listen, tetapi permintaan HTTP loopback dari lingkungan eksekusi gagal tersambung; pemeriksaan HTTP runtime belum dinyatakan lulus. Login dan inferensi akun sungguhan belum diverifikasi. Setelah pemilik menyetujui login resmi, uji satu pertanyaan, satu generasi soal, grading, pergantian model, dan putuskan/hubungkan ulang. Pengujian browser interaktif masih belum tersedia karena akses browser lokal dinonaktifkan pada pengaturan Work.

## Referensi resmi

- [Sign-in, PKCE, dan token](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)
- [Model dan inferensi melalui paket](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)
- [Profil, sesi, refresh, dan revoke](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions)
- [Kelayakan dan batas preview](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)
