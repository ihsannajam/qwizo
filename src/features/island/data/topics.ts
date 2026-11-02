export interface Lesson {
  id: string;
  title: string;
  duration: number;
  summary: string;
  example: string;
}
export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  symbol: string;
  x: number;
  y: number;
  lessons: Lesson[];
}
const lesson = (
  id: string,
  title: string,
  summary: string,
  example: string,
  duration = 8,
): Lesson => ({ id, title, summary, example, duration });
export const topics: Topic[] = [
  {
    id: "fungsi",
    title: "Fungsi & Grafik",
    subtitle: "Gerbang Pola",
    symbol: "ƒ",
    x: 17,
    y: 76,
    lessons: [
      lesson(
        "fungsi-1",
        "Mengenal fungsi",
        "Fungsi memasangkan setiap anggota domain dengan tepat satu anggota kodomain. Grafik membantu kita melihat hubungan input dan output.",
        "Untuk f(x) = 2x + 1, input x = 3 menghasilkan f(3) = 7.",
      ),
      lesson(
        "fungsi-2",
        "Domain, kodomain, dan range",
        "Domain adalah himpunan input yang diperbolehkan. Kodomain adalah himpunan tujuan, sedangkan range berisi output yang benar-benar dihasilkan.",
        "Jika f(x) = x² dengan domain {−2, −1, 0, 1, 2}, range-nya adalah {0, 1, 4}.",
      ),
      lesson(
        "fungsi-3",
        "Membaca grafik fungsi",
        "Koordinat (x, y) pada grafik menunjukkan nilai fungsi y = f(x). Titik potong sumbu membantu mengenali bentuk grafik.",
        "Grafik y = 2x + 1 memotong sumbu y di (0, 1).",
      ),
      lesson(
        "fungsi-4",
        "Transformasi grafik",
        "Pergeseran, pencerminan, dan perubahan skala mengubah posisi atau bentuk grafik dasar.",
        "Grafik y = (x − 2)² bergeser 2 satuan ke kanan dari grafik y = x².",
      ),
    ],
  },
  {
    id: "statistika",
    title: "Statistika",
    subtitle: "Lembah Data",
    symbol: "x̄",
    x: 34,
    y: 57,
    lessons: [
      lesson(
        "statistika-1",
        "Menyajikan data",
        "Tabel dan diagram menyederhanakan kumpulan data sehingga pola lebih mudah dibaca.",
        "Data nilai 70, 80, 80, 90 dapat disajikan sebagai tabel frekuensi.",
      ),
      lesson(
        "statistika-2",
        "Mean, median, dan modus",
        "Mean adalah rata-rata, median adalah nilai tengah data terurut, dan modus adalah nilai yang paling sering muncul.",
        "Pada data 2, 3, 3, 8: mean = 4, median = 3, modus = 3.",
      ),
      lesson(
        "statistika-3",
        "Kuartil dan jangkauan",
        "Jangkauan mengukur selisih nilai maksimum dan minimum. Kuartil membantu membagi data terurut menjadi empat bagian.",
        "Pada data 3, 5, 7, 9, 11, jangkauannya adalah 11 − 3 = 8.",
      ),
      lesson(
        "statistika-4",
        "Varians dan simpangan baku",
        "Varians dan simpangan baku menggambarkan seberapa jauh data tersebar dari rata-ratanya.",
        "Dua kumpulan data dapat memiliki rata-rata sama, tetapi penyebarannya berbeda.",
      ),
    ],
  },
  {
    id: "peluang",
    title: "Peluang",
    subtitle: "Jembatan Kemungkinan",
    symbol: "P",
    x: 53,
    y: 70,
    lessons: [
      lesson(
        "peluang-1",
        "Ruang sampel",
        "Ruang sampel memuat semua hasil yang mungkin dari suatu percobaan. Kejadian merupakan bagian dari ruang sampel.",
        "Pelemparan sebuah dadu memiliki ruang sampel {1, 2, 3, 4, 5, 6}.",
      ),
      lesson(
        "peluang-2",
        "Peluang suatu kejadian",
        "Untuk hasil yang sama mungkin, peluang kejadian adalah banyaknya hasil yang diinginkan dibagi banyaknya seluruh hasil.",
        "Peluang memperoleh angka genap pada dadu adalah 3/6 = 1/2.",
      ),
      lesson(
        "peluang-3",
        "Kombinasi dan permutasi",
        "Permutasi memperhatikan urutan. Kombinasi memilih anggota tanpa memperhatikan urutannya.",
        "Memilih dua orang dari tiga orang menghasilkan 3 kombinasi.",
      ),
      lesson(
        "peluang-4",
        "Peluang bersyarat",
        "Peluang bersyarat memperhitungkan informasi bahwa kejadian lain sudah terjadi.",
        "P(A|B) = P(A ∩ B) / P(B), untuk P(B) > 0.",
      ),
    ],
  },
  {
    id: "geometri",
    title: "Geometri Ruang",
    subtitle: "Puncak Dimensi",
    symbol: "△",
    x: 70,
    y: 48,
    lessons: [
      lesson(
        "geometri-1",
        "Titik, garis, dan bidang",
        "Bangun ruang dapat dipahami melalui hubungan titik, garis, dan bidang penyusunnya.",
        "Rusuk kubus merupakan ruas garis; sisinya merupakan bagian bidang.",
      ),
      lesson(
        "geometri-2",
        "Jarak dalam ruang",
        "Jarak terpendek diukur melalui ruas garis yang tegak lurus terhadap objek tujuan.",
        "Diagonal ruang kubus dengan panjang rusuk a adalah a√3.",
      ),
      lesson(
        "geometri-3",
        "Sudut dalam ruang",
        "Sudut antara garis dan bidang dapat dipelajari menggunakan proyeksi garis pada bidang tersebut.",
        "Gunakan segitiga siku-siku yang terbentuk dari garis dan proyeksinya.",
      ),
      lesson(
        "geometri-4",
        "Luas dan volume",
        "Luas permukaan menjumlahkan luas sisi, sedangkan volume mengukur ruang yang ditempati bangun.",
        "Kubus dengan rusuk 3 memiliki volume 3³ = 27 satuan kubik.",
      ),
    ],
  },
  {
    id: "turunan",
    title: "Turunan",
    subtitle: "Menara Perubahan",
    symbol: "d/dx",
    x: 56,
    y: 29,
    lessons: [
      lesson(
        "turunan-1",
        "Laju perubahan",
        "Turunan menyatakan laju perubahan sesaat suatu fungsi terhadap variabelnya.",
        "Kecepatan sesaat merupakan turunan posisi terhadap waktu.",
      ),
      lesson(
        "turunan-2",
        "Aturan turunan",
        "Aturan pangkat membantu menurunkan banyak fungsi polinomial.",
        "Jika f(x) = x³, maka f′(x) = 3x².",
      ),
      lesson(
        "turunan-3",
        "Garis singgung",
        "Gradien garis singgung pada grafik di suatu titik sama dengan nilai turunannya di titik itu.",
        "Untuk y = x² di x = 2, gradien garis singgungnya adalah 4.",
      ),
      lesson(
        "turunan-4",
        "Nilai maksimum dan minimum",
        "Titik stasioner menjadi kandidat nilai ekstrem; perubahan tanda turunan membantu memeriksa sifatnya.",
        "Fungsi f(x) = x² memiliki minimum di x = 0.",
      ),
    ],
  },
  {
    id: "integral",
    title: "Integral",
    subtitle: "Taman Akumulasi",
    symbol: "∫",
    x: 81,
    y: 18,
    lessons: [
      lesson(
        "integral-1",
        "Mengenal antiturunan",
        "Integral tak tentu mencari keluarga fungsi yang turunannya sama dengan fungsi yang diberikan.",
        "∫ 2x dx = x² + C.",
      ),
      lesson(
        "integral-2",
        "Aturan integral",
        "Aturan pangkat dapat digunakan untuk mengintegralkan fungsi pangkat, dengan pengecualian tertentu.",
        "∫ x² dx = x³/3 + C.",
      ),
      lesson(
        "integral-3",
        "Integral tentu",
        "Integral tentu menghitung akumulasi bertanda pada suatu interval.",
        "∫ dari 0 sampai 2 untuk 2x dx = [x²] dari 0 sampai 2 = 4.",
      ),
      lesson(
        "integral-4",
        "Luas daerah",
        "Luas geometris perlu memperhatikan tanda fungsi dan posisi batas daerah.",
        "Jika grafik berada di bawah sumbu x, nilai integral bertanda negatif; luas geometrisnya tetap positif.",
      ),
    ],
  },
];
export const TOTAL_LESSONS = topics.reduce(
  (sum, t) => sum + t.lessons.length,
  0,
);
