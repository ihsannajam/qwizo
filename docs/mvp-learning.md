# Sprint lanjutan: alur belajar MVP

## Lingkup

Empat bagian diterapkan sebagai satu MVP frontend lokal: Materi–Quiz–Hasil, progression/reward, tutor Qwi terstruktur, dan boss battle. Tidak ada layanan AI atau backend baru. Mode tutor diberi label lokal secara jelas, termasuk respons untuk pertanyaan yang tidak dapat ditangani.

Urutan belajar: Fungsi & Grafik → Statistika → Peluang → Geometri Ruang → Turunan → Integral. Masing-masing empat materi. Konsep dan contoh dasar dipertahankan; ditambahkan cara berpikir, contoh bertahap, tiga soal pilihan ganda, petunjuk dan pembahasan untuk setiap materi. Kedua bahasa tersedia. Ini keputusan jalur fondasi MVP, belum klaim kesesuaian silabus sekolah/UTBK final.

## Keputusan perilaku

- Kuis lulus dengan dua dari tiga jawaban benar; topik dan materi dibuka berdasarkan kelulusan berurutan. Semua pos dapat dikunjungi, tetapi materi terkunci tidak dapat dimulai.
- Mastery berasal dari skor terbaik per materi, bukan jumlah klik atau XP. Nilai tidak turun saat mengulang dengan skor lebih rendah.
- Reward materi 80 XP/20 koin satu kali, kemenangan boss 300 XP/100 koin satu kali. Gagal atau keluar tidak mengurangi reward lama.
- Level dimulai dari satu, bertambah per 300 XP. Badge per empat kelulusan topik dan satu tambahan kemenangan boss.
- Misi: satu kuis lulus, lima ID soal berbeda diselesaikan, dan praktik kuis di dua topik. Klaim memeriksa tanggal, syarat dan status klaim setiap kali dipanggil.
- Streak mencatat aktivitas kuis/boss, bukan sekadar membuka aplikasi. Pergantian hari menggunakan tanggal lokal perangkat. Tidak ada penalti ekonomi jika hari terlewat.
- Tutor membantu melalui konsep, petunjuk dan pembahasan. Sebelum jawaban diperiksa, meminta pembahasan soal memberi petunjuk; sesudahnya pembahasan tersedia. Pertanyaan bebas di luar kata kunci mendapat batasan yang jelas.
- Arena memakai enam checkpoint, satu dari masing-masing topik. Lima hit mengalahkan penjaga. Dua miss menghabiskan perisai Qwi. Hasil menyimpan kemenangan, jumlah percobaan dan reward; ulangi tetap tersedia.
- Arena memakai kedalaman visual CSS 3D dan sprite maskot asli; tidak ada model WebGL/GLB. Tanpa penghitung waktu agar belajar tidak terburu-buru.
- Menutup sesi aktif meminta konfirmasi jika sudah ada jawaban; percobaan belum selesai tidak mengubah progres. Reload belum melanjutkan jawaban percobaan, tetapi progres yang telah diselesaikan tetap tersimpan.

## Migrasi

Save `qwizo-sprint1` memakai versi 2. Profil, sesi dan preferensi lama dipertahankan. ID materi selesai versi demo dipindah ke riwayat baca, divalidasi terhadap ID materi yang dikenal. Tidak diberi mastery, unlock atau reward tanpa hasil kuis. Pemberitahuan menjelaskan perubahan pada World Map; riwayat baca tetap terlihat di progres dan panel materi.

## Pemeriksaan otomatis

- `npm run build`: TypeScript strict dan bundel produksi.
- `npm test`: rute Qwi + pengujian konten, reducer sesi, petunjuk tutor, penilaian, invalid input, unlock, pengulangan, mastery, reward, level, misi, hari/streak, migrasi/save Zustand dan menang/kalah boss.
- Tes progression menyelesaikan 24 kuis berurutan dengan jawaban benar, memeriksa seluruh gerbang lalu kemenangan dan kekalahan boss.
- Tes render menggunakan React server rendering, bukan simulasi klik browser. Storage pengujian merupakan Map dalam memori; tidak menyentuh profil browser pengguna.

## Checklist browser yang masih perlu dijalankan

Akses browser lokal dinonaktifkan di Work saat implementasi ini. Checklist berikut belum dianggap lulus otomatis:

1. Login → loading → World Map; klik Matematika → Masuk Pulau.
2. Pilih Fungsi & Grafik atau Lanjut belajar → baca → kuis. Pilihan kosong tidak dapat diperiksa.
3. Jawab salah: pembahasan tampil. Jawab dua benar: hasil lulus +80 XP/+20 koin, materi kedua terbuka.
4. Ulangi kelulusan: tidak ada reward ganda. Skor terbaik dapat meningkat menjadi 3/3.
5. Keluar setelah satu jawaban: konfirmasi; batalkan untuk melanjutkan, tinggalkan untuk kembali ke pulau. Reload setelah hasil: progres masih ada.
6. Buka tutor ketika kuis: minta pembahasan sebelum menjawab → petunjuk; setelah diperiksa → pembahasan. Ganti bahasa ID/EN.
7. World Map: HUD, dasbor, progres dan misi konsisten. Klaim hanya aktif jika syarat terpenuhi dan hanya sekali.
8. Boss sebelum seluruh kuis lulus terkunci. Setelah 24 lulus: arena terbuka. Lima hit menang; dua miss kalah; percobaan ulang dapat dimainkan.
9. Kemenangan pertama +300 XP/+100 koin; kemenangan ulang +0. Badge kemenangan tampil pada progres.
10. Desktop dan mobile: tidak ada overflow horizontal pada sesi, soal panjang dapat dibaca, tutor terbaca, fokus keyboard tetap dalam dialog, Escape dan reduced-motion bekerja.

## Tahap selanjutnya

Review visual dan perangkat nyata; validasi materi oleh guru; tambah variasi soal/kuis adaptif; penyimpanan draft percobaan; integrasi AI melalui backend; penilaian dan ledger reward server; model 3D arena, audio dan aset produksi. Karena seluruh aturan lokal, manipulasi storage/jam perangkat belum dicegah dan tidak boleh digunakan sebagai penilaian resmi.
