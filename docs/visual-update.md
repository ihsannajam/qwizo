# Pembaruan visual dan peta materi

## Perubahan

- Sepuluh pulau menggunakan ilustrasi render 3D independen berformat WebP dengan alpha. Pemandangan langit/lautan adalah layer terpisah.
- Pulau mengambang, awan bergerak, jalur berkilau, maskot bergerak ringan, dan fokus kamera memakai spring animation.
- Tombol Masuk Pulau dan Lanjut Belajar menjalankan zoom kamera, overlay perjalanan, kemudian masuk peta Matematika. Tombol World Map di dalam pulau memakai transisi kembali.
- Peta Matematika memakai lanskap kristal, jembatan, aliran air, kastel, dan enam titik pembelajaran interaktif, bukan halaman daftar topik.
- Setiap titik memuat empat materi: total 24 materi demo dalam Fungsi & Grafik, Statistika, Peluang, Geometri Ruang, Turunan, dan Integral.
- Pemilihan titik membuka daftar materi, estimasi waktu, dan progres. Materi bisa dibuka untuk membaca ringkasan konsep serta contoh, lalu ditandai selesai dalam mode demo.
- Progres disimpan lokal dan ditampilkan juga pada overlay World Map. Tidak memberikan XP materi atau melakukan penilaian; quest dan XP tetap simulasi terpisah.
- Titik boss menjelaskan syarat 24 materi. Arena boss belum diimplementasikan.
- Daftar 24 materi memberi akses cepat ke semua titik, termasuk ketika peta digeser pada ponsel.

## Teknologi visual

Visual menggunakan render 3D sebagai sprite/latar 2.5D, sesuai pendekatan MVP pada blueprint. Animasi kamera dan transisi dikerjakan dengan Motion, efek lingkungan dengan CSS. Belum berupa dunia WebGL dengan model GLB yang bisa diputar. Logo serta robot oranye tetap memakai referensi asli PDF.

Pengaturan **Kurangi animasi** dan preferensi aksesibilitas sistem tetap dihormati. Matikan pengaturan tersebut untuk melihat semua gerakan.

## Aset

- `public/assets/islands/*.webp`: 10 sprite pulau terpisah.
- `public/assets/world-backdrop.webp`: scenery World Map.
- `public/assets/math-backdrop.webp`: terrain peta Matematika.
- Prompt aset dicatat di `docs/asset-generation.md`. Menggunakan built-in ImageGen; tidak ada API AI runtime di aplikasi.

Semua materi dan urutannya adalah dummy untuk review alur, belum menjadi silabus final kelas 12/UTBK.
