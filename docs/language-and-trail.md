# Bahasa, jurnal dan perjalanan Qwi

## Tipografi dan bahasa

Fredoka Variable merupakan font lokal untuk seluruh UI, termasuk tombol, judul dan teks materi. Font dibundel dari `@fontsource-variable/fredoka`, sehingga tidak memerlukan koneksi layanan font saat runtime.

`src/i18n/` memuat katalog ID/EN, format angka, tombol globe dan terjemahan 24 materi. Preferensi disimpan oleh Zustand; atribut bahasa HTML dan judul tab ikut berubah. Logo asli tetap menggunakan identitas mereknya.

## Semua dialog

Komponen `Sheet` menjadi jurnal petualangan: bingkai ungu/emas, lambang, header, area isi dengan scroll sendiri dan footer. Ukurannya mengikuti isi hingga tinggi maksimum, sehingga tidak meninggalkan panel kosong panjang. Teks dan hadiah memiliki warna eksplisit agar tidak mewarisi warna terang dari HUD.

Jurnal dipakai oleh dasbor, misi, progres, pengaturan, info pulau, daftar materi, konsep dan tantangan akhir. Daftar cepat enam pos menggunakan kartu dalam bingkai yang selaras.

## Peta dan gerak karakter

`src/features/island/data/trail.ts` menyimpan titik jalan pada bidang 1536×1024 sesuai ilustrasi. Canvas mempertahankan rasio 3:2 dan menampilkan gambar tanpa crop. Pos, robot dan rutenya memakai koordinat yang sama, termasuk pada mobile yang dapat digeser.

Tidak ada garis rute putus-putus yang digambar atau dianimasikan di peta Matematika. Qwi bergerak melalui sampel jalan dan jembatan dari pos saat ini ke tujuan; perjalanan mundur mengikuti rute terbalik. Durasi berdasarkan panjang lintasan, dibatasi 1,1–7,5 detik. Kamera mengikuti Qwi jika canvas lebih besar daripada viewport. Setelah tiba, panel materi dibuka dan posisi disimpan.

Selama perjalanan, klik pos lain dinonaktifkan untuk mencegah dua animasi saling menimpa. Navigasi kembali tetap tersedia. Reduced-motion menggunakan perpindahan singkat. Bubble pemandu berubah sesuai pos yang disorot, perjalanan, dan kedatangan. Simbol turunan memakai pecahan d/dx yang dibatasi di dalam lingkaran.

## Pemeriksaan

- `npm test`: semua 36 kombinasi perjalanan, endpoint, pembalikan rute, urutan waktu dan batas koordinat lolos; terjemahan judul/konsep/contoh seluruh 24 materi lengkap.
- Browser: ID → EN memperbarui seluruh panel dan peta; Qwi berjalan ke Statistika, lalu panel baru terbuka; `data-current-stop` sesuai tujuan.
- Simbol turunan diverifikasi berada di dalam bounding box lingkaran.
- Mobile 390×844: rasio gambar tetap, karakter dipusatkan, peta dapat digeser dan jurnal materi tetap dapat dibaca.
