# Fullscreen game UI dan pemandu Qwi

- World Map memenuhi viewport; tidak ada navbar atau sidebar berupa bidang putih. HUD pemain, resource, pengaturan, quest dan menu berupa kontrol mengambang dengan bingkai, bevel dan bayangan bergaya game. Palet tetap ungu/oranye/emas Qwizo; referensi game digunakan sebagai arah tata letak kontrol.
- `public/assets/mascot-transparent.webp` dan `public/assets/logo-transparent.webp` memakai alpha transparan. Referensi asli tetap disimpan. Cutout dibuat dengan built-in ImageGen, lalu dikodekan menjadi WebP lokal.
- Qwi berdiri pada pijakan kecil. Saat teks diketik, pose diberi gerakan ringan dan indikator bicara. Bubble memiliki ekor, label pembicara dan tombol menuju informasi pulau.
- Sepuluh pulau mempunyai deskripsi berbeda. Hover mouse atau fokus keyboard mengubah percakapan dan memunculkan glow sesuai warna tema. Touch menggunakan pemilihan pulau.
- Tiga kelompok burung dengan animasi kepakan mengikuti jalur dunia melewati sepuluh pulau. Pan dan zoom kamera memengaruhi burung bersama seluruh pulau.
- Login menampilkan loading sambil memuat sepuluh sprite pulau, background dan robot. Transisi minimum 1,5 detik memberi waktu melihat layar persiapan; pada reduced-motion durasi minimum dipersingkat. Permintaan aset dibatasi waktunya agar tidak menahan navigasi tanpa batas.
- Reduced-motion sistem dan pengaturan aplikasi dihormati: animasi burung disembunyikan, gerakan dekoratif dihentikan dan percakapan langsung tampil lengkap.

Bubble merupakan percakapan teks yang telah disiapkan, bukan AI atau sintesis suara.

## Validasi

Build TypeScript strict dan Vite berhasil. Browser memverifikasi loading login lalu masuk World Map, aset transparan termuat, pergantian deskripsi Fisika melalui fokus keyboard, glow warna Fisika dan burung. Layout mobile diperiksa pada ukuran 390×844. Sesi QA menggunakan origin 127.0.0.1 agar tidak mengubah sesi demo pengguna di localhost.
