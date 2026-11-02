export type LocalText = { id: string; en: string };
export const bi = (id: string, en: string): LocalText => ({ id, en });
export interface Question {
  id: string;
  prompt: LocalText;
  options: LocalText[];
  answer: number;
  hint: LocalText;
  explanation: LocalText;
}
export interface LearningUnit {
  id: string;
  steps: LocalText[];
  questions: Question[];
}
const q = (
  prompt: LocalText,
  options: (string | LocalText)[],
  answer: number,
  hint: LocalText,
  explanation: LocalText,
): Omit<Question, "id"> => ({
  prompt,
  options: options.map((o) => (typeof o === "string" ? bi(o, o) : o)),
  answer,
  hint,
  explanation,
});
const u = (
  id: string,
  steps: LocalText[],
  questions: Omit<Question, "id">[],
): LearningUnit => ({
  id,
  steps,
  questions: questions.map((question, i) => ({
    ...question,
    id: `${id}-q${i + 1}`,
  })),
});
export const curriculum: LearningUnit[] = [
  u(
    "fungsi-1",
    [
      bi(
        "Tentukan input x, lalu ikuti operasi dalam rumus secara berurutan.",
        "Identify the input x, then follow the operations in the formula in order.",
      ),
      bi(
        "Contoh: f(x)=3x−2. Untuk x=4, hitung 3×4−2=10. Setiap input wajib memiliki tepat satu output.",
        "Example: f(x)=3x−2. At x=4, calculate 3×4−2=10. Every input must have exactly one output.",
      ),
    ],
    [
      q(
        bi("Jika f(x)=2x+3, berapa f(4)?", "If f(x)=2x+3, what is f(4)?"),
        ["11", "14", "9", "7"],
        0,
        bi(
          "Ganti x dengan 4, lalu kerjakan perkalian dahulu.",
          "Replace x with 4 and multiply first.",
        ),
        bi("f(4)=2×4+3=11.", "f(4)=2×4+3=11."),
      ),
      q(
        bi("Jika f(x)=x²−1, berapa f(3)?", "If f(x)=x²−1, what is f(3)?"),
        ["5", "8", "9", "2"],
        1,
        bi(
          "Kuadratkan input sebelum mengurangi satu.",
          "Square the input before subtracting one.",
        ),
        bi("3²−1=9−1=8.", "3²−1=9−1=8."),
      ),
      q(
        bi("Manakah yang bukan fungsi?", "Which relation is not a function?"),
        ["{(1,2),(2,3)}", "{(1,2),(1,3)}", "{(1,2),(2,2)}", "{(0,0)}"],
        1,
        bi(
          "Cari satu input yang mempunyai dua output berbeda.",
          "Look for one input with two different outputs.",
        ),
        bi(
          "Input 1 dipasangkan dengan 2 dan 3, sehingga bukan fungsi.",
          "Input 1 maps to both 2 and 3, so this is not a function.",
        ),
      ),
    ],
  ),
  u(
    "fungsi-2",
    [
      bi(
        "Domain adalah input yang boleh dipakai; kodomain adalah himpunan tujuan. Range hanya output yang benar-benar muncul.",
        "The domain contains allowed inputs; the codomain is the target set. The range contains outputs actually produced.",
      ),
      bi(
        "Untuk f(x)=x², domain {−1,0,1}, kodomain {0,1,2}: outputnya 1,0,1 sehingga range {0,1}.",
        "For f(x)=x², domain {−1,0,1}, codomain {0,1,2}: outputs are 1,0,1, so the range is {0,1}.",
      ),
    ],
    [
      q(
        bi(
          "Range f(x)=x² untuk domain {−2,0,2}?",
          "Range of f(x)=x² on domain {−2,0,2}?",
        ),
        ["{−2,0,2}", "{0,2}", "{0,4}", "{−4,0,4}"],
        2,
        bi(
          "Hitung setiap output dan hilangkan nilai yang berulang.",
          "Compute every output and remove duplicates.",
        ),
        bi(
          "Output 4,0,4 memberi range {0,4}.",
          "Outputs 4,0,4 give the range {0,4}.",
        ),
      ),
      q(
        bi("Domain real f(x)=1/(x−2)?", "Real domain of f(x)=1/(x−2)?"),
        ["x ≠ 2", "x > 2", "x = 2", "x ≥ 0"],
        0,
        bi("Penyebut tidak boleh nol.", "The denominator cannot be zero."),
        bi("x−2≠0, jadi x≠2.", "x−2≠0, so x≠2."),
      ),
      q(
        bi(
          "Range f(x)=x+1 untuk domain {1,2,3}?",
          "Range of f(x)=x+1 on domain {1,2,3}?",
        ),
        ["{1,2,3}", "{0,1,2}", "{2,3,4}", "{1,4}"],
        2,
        bi(
          "Tambahkan satu pada setiap anggota domain.",
          "Add one to each domain element.",
        ),
        bi(
          "1→2, 2→3, 3→4, jadi range {2,3,4}.",
          "1→2, 2→3, 3→4, so the range is {2,3,4}.",
        ),
      ),
    ],
  ),
  u(
    "fungsi-3",
    [
      bi(
        "Titik potong sumbu y ditemukan dengan x=0. Titik potong sumbu x ditemukan dengan y=0.",
        "Find the y-intercept by setting x=0. Find the x-intercept by setting y=0.",
      ),
      bi(
        "Untuk y=2x−4: titik potong y adalah (0,−4), sedangkan 0=2x−4 memberi titik potong x (2,0).",
        "For y=2x−4: the y-intercept is (0,−4), while 0=2x−4 gives the x-intercept (2,0).",
      ),
    ],
    [
      q(
        bi("Titik potong y dari y=3x+2?", "The y-intercept of y=3x+2?"),
        ["(2,0)", "(0,3)", "(0,2)", "(3,2)"],
        2,
        bi(
          "Pada sumbu y, nilai x selalu nol.",
          "On the y-axis, x is always zero.",
        ),
        bi("x=0 memberi y=2, jadi (0,2).", "x=0 gives y=2, so (0,2)."),
      ),
      q(
        bi("Titik potong x dari y=2x−6?", "The x-intercept of y=2x−6?"),
        ["(0,−6)", "(3,0)", "(−3,0)", "(6,0)"],
        1,
        bi(
          "Set y=0 lalu selesaikan persamaannya.",
          "Set y=0 and solve the equation.",
        ),
        bi("0=2x−6 memberi x=3.", "0=2x−6 gives x=3."),
      ),
      q(
        bi("Manakah titik pada y=x²?", "Which point lies on y=x²?"),
        ["(2,2)", "(3,6)", "(−2,4)", "(0,1)"],
        2,
        bi(
          "Cek apakah koordinat y sama dengan kuadrat x.",
          "Check whether y equals x squared.",
        ),
        bi(
          "(−2)²=4, jadi (−2,4) berada pada grafik.",
          "(−2)²=4, so (−2,4) lies on the graph.",
        ),
      ),
    ],
  ),
  u(
    "fungsi-4",
    [
      bi(
        "Pada y=f(x−a)+b, grafik bergeser a satuan ke kanan dan b satuan ke atas.",
        "In y=f(x−a)+b, the graph shifts a units right and b units up.",
      ),
      bi(
        "y=(x−3)²+2 mempunyai puncak (3,2). Tanda minus di depan fungsi, −f(x), mencerminkan grafik terhadap sumbu x.",
        "y=(x−3)²+2 has vertex (3,2). A minus sign before the function, −f(x), reflects it across the x-axis.",
      ),
    ],
    [
      q(
        bi("Puncak y=(x−2)²+3?", "Vertex of y=(x−2)²+3?"),
        ["(−2,3)", "(2,3)", "(2,−3)", "(0,3)"],
        1,
        bi(
          "Bentuk puncak adalah (x−a)²+b dengan puncak (a,b).",
          "The vertex form is (x−a)²+b with vertex (a,b).",
        ),
        bi("a=2 dan b=3, jadi (2,3).", "a=2 and b=3, so (2,3)."),
      ),
      q(
        bi(
          "y=(x+4)² bergeser ke mana dari y=x²?",
          "How does y=(x+4)² shift from y=x²?",
        ),
        [
          bi("Kanan 4", "Right 4"),
          bi("Atas 4", "Up 4"),
          bi("Kiri 4", "Left 4"),
          bi("Bawah 4", "Down 4"),
        ],
        2,
        bi("Tuliskan x+4 sebagai x−(−4).", "Write x+4 as x−(−4)."),
        bi(
          "a=−4, sehingga bergeser ke kiri 4 satuan.",
          "a=−4, so it shifts left by 4 units.",
        ),
      ),
      q(
        bi(
          "Pencerminan y=f(x) terhadap sumbu x menghasilkan?",
          "Reflecting y=f(x) across the x-axis gives?",
        ),
        ["y=f(−x)", "y=−f(x)", "y=f(x)+1", "y=2f(x)"],
        1,
        bi(
          "Koordinat x tetap, tanda y berubah.",
          "x stays the same and the sign of y changes.",
        ),
        bi(
          "Setiap output y menjadi −y, sehingga y=−f(x).",
          "Each output y becomes −y, so y=−f(x).",
        ),
      ),
    ],
  ),
  u(
    "statistika-1",
    [
      bi(
        "Tabel frekuensi menghitung berapa kali setiap nilai muncul. Jumlah frekuensi harus sama dengan banyaknya data.",
        "A frequency table counts how often each value occurs. Total frequency must equal the number of observations.",
      ),
      bi(
        "Data 6,7,7,8,8,8 mempunyai frekuensi 6:1, 7:2, 8:3. Diagram batang cocok untuk membandingkan kategori.",
        "Data 6,7,7,8,8,8 have frequencies 6:1, 7:2, 8:3. Bar charts work well for comparing categories.",
      ),
    ],
    [
      q(
        bi("Frekuensi 8 pada data 7,8,8,9,8?", "Frequency of 8 in 7,8,8,9,8?"),
        ["2", "3", "4", "5"],
        1,
        bi("Hitung kemunculan angka 8 saja.", "Count only occurrences of 8."),
        bi("Angka 8 muncul tiga kali.", "The number 8 occurs three times."),
      ),
      q(
        bi(
          "Frekuensi A=3, B=5, C=2. Jumlah data?",
          "Frequencies A=3, B=5, C=2. Total observations?",
        ),
        ["8", "5", "10", "15"],
        2,
        bi("Jumlahkan semua frekuensi.", "Add all frequencies."),
        bi("3+5+2=10 data.", "3+5+2=10 observations."),
      ),
      q(
        bi(
          "Diagram terbaik membandingkan jumlah siswa per kelas?",
          "Best chart to compare student counts across classes?",
        ),
        [
          bi("Diagram batang", "Bar chart"),
          bi("Diagram garis waktu", "Time-series line chart"),
          bi("Peta kontur", "Contour map"),
          bi("Diagram pencar", "Scatter plot"),
        ],
        0,
        bi(
          "Kelas merupakan kategori yang terpisah.",
          "Classes are separate categories.",
        ),
        bi(
          "Diagram batang membandingkan jumlah pada kategori terpisah.",
          "Bar charts compare counts in separate categories.",
        ),
      ),
    ],
  ),
  u(
    "statistika-2",
    [
      bi(
        "Rata-rata = jumlah nilai ÷ banyak data. Urutkan data untuk mencari median. Modus adalah nilai dengan frekuensi terbesar.",
        "Mean = sum ÷ count. Sort the data to find the median. The mode has the greatest frequency.",
      ),
      bi(
        "Data 2,3,3,8: rata-rata 16÷4=4; median (3+3)÷2=3; modus 3.",
        "For 2,3,3,8: mean 16÷4=4; median (3+3)÷2=3; mode 3.",
      ),
    ],
    [
      q(
        bi("Rata-rata 4,6,8?", "Mean of 4,6,8?"),
        ["5", "6", "7", "8"],
        1,
        bi(
          "Jumlahkan lalu bagi tiga.",
          "Add the values, then divide by three.",
        ),
        bi("(4+6+8)/3=6.", "(4+6+8)/3=6."),
      ),
      q(
        bi("Median 9,1,5,3?", "Median of 9,1,5,3?"),
        ["3", "5", "4", "6"],
        2,
        bi(
          "Urutkan dan ambil rata-rata dua nilai tengah.",
          "Sort and average the two middle values.",
        ),
        bi(
          "Urutan 1,3,5,9 memberi median (3+5)/2=4.",
          "Sorted: 1,3,5,9. Median=(3+5)/2=4.",
        ),
      ),
      q(
        bi("Modus 2,4,4,5,7?", "Mode of 2,4,4,5,7?"),
        ["2", "4", "5", "7"],
        1,
        bi(
          "Cari nilai yang paling sering muncul.",
          "Find the most frequent value.",
        ),
        bi(
          "4 muncul dua kali; yang lain satu kali.",
          "4 occurs twice; all other values occur once.",
        ),
      ),
    ],
  ),
  u(
    "statistika-3",
    [
      bi(
        "Jangkauan = nilai terbesar − terkecil. Untuk kuartil di sini, median data ganjil tidak disertakan saat membagi separuh bawah dan atas.",
        "Range = maximum − minimum. Our quartile convention excludes the overall median from each half when the count is odd.",
      ),
      bi(
        "Untuk 1,3,5,7,9: median 5, Q1=(1+3)/2=2, Q3=(7+9)/2=8. Jangkauan antarkuartil=8−2=6.",
        "For 1,3,5,7,9: median 5, Q1=(1+3)/2=2, Q3=(7+9)/2=8. Interquartile range=8−2=6.",
      ),
    ],
    [
      q(
        bi("Jangkauan 3,5,9,12?", "Range of 3,5,9,12?"),
        ["7", "9", "12", "15"],
        1,
        bi(
          "Kurangi nilai terkecil dari terbesar.",
          "Subtract the minimum from the maximum.",
        ),
        bi("12−3=9.", "12−3=9."),
      ),
      q(
        bi(
          "Q1 data 1,3,5,7,9 (median dikeluarkan)?",
          "Q1 of 1,3,5,7,9 (excluding the median)?",
        ),
        ["1", "2", "3", "5"],
        1,
        bi(
          "Cari median separuh bawah: 1 dan 3.",
          "Find the median of the lower half: 1 and 3.",
        ),
        bi("Q1=(1+3)/2=2.", "Q1=(1+3)/2=2."),
      ),
      q(
        bi(
          "Q1=4 dan Q3=10. Jangkauan antarkuartil?",
          "Q1=4 and Q3=10. Interquartile range?",
        ),
        ["14", "7", "6", "4"],
        2,
        bi("Gunakan Q3−Q1.", "Use Q3−Q1."),
        bi("10−4=6.", "10−4=6."),
      ),
    ],
  ),
  u(
    "statistika-4",
    [
      bi(
        "Varians populasi = rata-rata kuadrat selisih tiap nilai dari rata-rata. Simpangan baku adalah akar varians.",
        "Population variance is the mean squared deviation from the mean. Standard deviation is the square root of variance.",
      ),
      bi(
        "Data 2,4 memiliki rata-rata 3. Varians populasi=((2−3)²+(4−3)²)/2=1, simpangan baku=1.",
        "Data 2,4 have mean 3. Population variance=((2−3)²+(4−3)²)/2=1; standard deviation=1.",
      ),
    ],
    [
      q(
        bi("Varians populasi data 2,4?", "Population variance of 2,4?"),
        ["0", "1", "2", "4"],
        1,
        bi(
          "Rata-rata 3; kuadratkan dua selisihnya dan rata-ratakan.",
          "Mean is 3; square both deviations and average them.",
        ),
        bi("((−1)²+1²)/2=1.", "((−1)²+1²)/2=1."),
      ),
      q(
        bi(
          "Simpangan baku jika varians 9?",
          "Standard deviation when variance is 9?",
        ),
        ["81", "9", "3", "4.5"],
        2,
        bi("Ambil akar kuadrat varians.", "Take the square root of variance."),
        bi("√9=3.", "√9=3."),
      ),
      q(
        bi("Varians data 5,5,5?", "Variance of 5,5,5?"),
        ["0", "1", "5", "15"],
        0,
        bi(
          "Semua data sama dengan rata-ratanya.",
          "Every observation equals the mean.",
        ),
        bi(
          "Semua selisih nol, jadi varians nol.",
          "All deviations are zero, so the variance is zero.",
        ),
      ),
    ],
  ),
  u(
    "peluang-1",
    [
      bi(
        "Tuliskan semua hasil yang mungkin, tanpa duplikasi. Banyaknya anggota ruang sampel disebut n(S).",
        "List every possible outcome without duplicates. The number of outcomes is n(S).",
      ),
      bi(
        "Dua lemparan koin memberi {AA,AG,GA,GG}; urutan dibedakan, sehingga ada 4 hasil.",
        "Two coin tosses give {HH,HT,TH,TT}; order matters, so there are 4 outcomes.",
      ),
    ],
    [
      q(
        bi(
          "Banyak hasil satu lemparan dadu enam sisi?",
          "Number of outcomes for one six-sided die?",
        ),
        ["2", "3", "6", "12"],
        2,
        bi(
          "Setiap sisi memberikan satu hasil.",
          "Each face gives one outcome.",
        ),
        bi("S={1,2,3,4,5,6}, jadi n(S)=6.", "S={1,2,3,4,5,6}, so n(S)=6."),
      ),
      q(
        bi(
          "Banyak hasil dua lemparan koin?",
          "Number of outcomes for two coin tosses?",
        ),
        ["2", "3", "4", "8"],
        2,
        bi(
          "Setiap lemparan memiliki dua pilihan; gunakan perkalian.",
          "Each toss has two possibilities; multiply.",
        ),
        bi("2×2=4 hasil.", "2×2=4 outcomes."),
      ),
      q(
        bi(
          "Anggota kejadian angka genap pada dadu?",
          "Event of an even result on a die?",
        ),
        ["{1,3,5}", "{2,4,6}", "{2,3,4}", "{6}"],
        1,
        bi(
          "Bilangan genap habis dibagi dua.",
          "Even numbers are divisible by two.",
        ),
        bi("Hasil genap adalah 2,4,6.", "Even outcomes are 2,4,6."),
      ),
    ],
  ),
  u(
    "peluang-2",
    [
      bi(
        "Jika semua hasil sama mungkin, P(A)=n(A)/n(S). Peluang selalu antara 0 dan 1.",
        "For equally likely outcomes, P(A)=n(A)/n(S). Probability is always between 0 and 1.",
      ),
      bi(
        "Pada dadu, kejadian lebih dari 4 adalah {5,6}. Peluangnya 2/6=1/3. Peluang komplemen=1−P(A).",
        "On a die, results greater than 4 are {5,6}. Their probability is 2/6=1/3. The complement has probability 1−P(A).",
      ),
    ],
    [
      q(
        bi(
          "Peluang angka genap pada dadu adil?",
          "Probability of an even result on a fair die?",
        ),
        ["1/6", "1/3", "1/2", "2/3"],
        2,
        bi(
          "Bandingkan banyak hasil genap dengan seluruh hasil.",
          "Compare the count of even outcomes with all outcomes.",
        ),
        bi(
          "3 dari 6 hasil genap, jadi 1/2.",
          "3 of 6 outcomes are even, so 1/2.",
        ),
      ),
      q(
        bi(
          "Jika P(A)=0,3, berapa P(bukan A)?",
          "If P(A)=0.3, what is P(not A)?",
        ),
        ["0.3", "0.7", "1.3", "0"],
        1,
        bi(
          "Jumlah peluang kejadian dan komplemennya adalah satu.",
          "An event and its complement have probabilities summing to one.",
        ),
        bi("1−0,3=0,7.", "1−0.3=0.7."),
      ),
      q(
        bi(
          "Dadu adil: peluang angka lebih dari 4?",
          "Fair die: probability of a result greater than 4?",
        ),
        ["1/6", "1/3", "1/2", "5/6"],
        1,
        bi(
          "Daftar hasil yang memenuhi syarat sebelum membagi enam.",
          "List favorable outcomes before dividing by six.",
        ),
        bi(
          "{5,6} mempunyai 2 hasil: 2/6=1/3.",
          "{5,6} has 2 outcomes: 2/6=1/3.",
        ),
      ),
    ],
  ),
  u(
    "peluang-3",
    [
      bi(
        "Gunakan permutasi jika urutan penting: nPr=n!/(n−r)!. Gunakan kombinasi jika hanya kelompok yang penting: nCr=n!/(r!(n−r)!).",
        "Use permutations when order matters: nPr=n!/(n−r)!. Use combinations for unordered groups: nCr=n!/(r!(n−r)!).",
      ),
      bi(
        "Memilih dua dari tiga orang: 3C2=3. Menentukan ketua dan wakil dari tiga orang: 3P2=6.",
        "Choosing two of three people: 3C2=3. Choosing a chair and deputy from three: 3P2=6.",
      ),
    ],
    [
      q(
        bi(
          "Banyak kombinasi memilih 2 dari 4 orang?",
          "Ways to choose 2 of 4 people?",
        ),
        ["4", "6", "8", "12"],
        1,
        bi("Gunakan 4!/(2!2!).", "Use 4!/(2!2!)."),
        bi("4×3/(2×1)=6.", "4×3/(2×1)=6."),
      ),
      q(
        bi(
          "Banyak susunan ketua dan wakil dari 3 orang?",
          "Ways to select a chair and deputy from 3 people?",
        ),
        ["3", "4", "6", "9"],
        2,
        bi(
          "Setelah ketua dipilih, tersisa dua pilihan wakil.",
          "After choosing the chair, two choices remain for deputy.",
        ),
        bi(
          "3×2=6 karena jabatan berbeda.",
          "3×2=6 because the roles are distinct.",
        ),
      ),
      q(
        bi("Nilai 4!?", "Value of 4!?"),
        ["4", "12", "16", "24"],
        3,
        bi(
          "Kalikan semua bilangan bulat positif dari 4 sampai 1.",
          "Multiply positive integers from 4 down to 1.",
        ),
        bi("4!=4×3×2×1=24.", "4!=4×3×2×1=24."),
      ),
    ],
  ),
  u(
    "peluang-4",
    [
      bi(
        "Informasi B membatasi ruang sampel. P(A|B)=P(A∩B)/P(B), dengan P(B)>0.",
        "Information B restricts the sample space. P(A|B)=P(A∩B)/P(B), where P(B)>0.",
      ),
      bi(
        "Diketahui dadu menunjukkan bilangan genap {2,4,6}. Peluang lebih dari 3 adalah 2/3 karena hanya {4,6} memenuhi.",
        "Given an even die result {2,4,6}, the probability it exceeds 3 is 2/3, since {4,6} qualify.",
      ),
    ],
    [
      q(
        bi(
          "P(A∩B)=0,2 dan P(B)=0,5. P(A|B)?",
          "P(A∩B)=0.2 and P(B)=0.5. P(A|B)?",
        ),
        ["0.1", "0.4", "0.7", "2.5"],
        1,
        bi(
          "Bagi peluang irisan dengan peluang syarat.",
          "Divide intersection probability by the condition probability.",
        ),
        bi("0,2/0,5=0,4.", "0.2/0.5=0.4."),
      ),
      q(
        bi(
          "Diketahui hasil dadu genap. Peluang hasilnya 6?",
          "Given an even die result, probability it is 6?",
        ),
        ["1/6", "1/2", "1/3", "2/3"],
        2,
        bi(
          "Ruang sampel sekarang hanya {2,4,6}.",
          "The sample space is now only {2,4,6}.",
        ),
        bi(
          "Satu dari tiga hasil adalah 6, jadi 1/3.",
          "One of three outcomes is 6, so 1/3.",
        ),
      ),
      q(
        bi(
          "Jika A dan B independen, P(A|B) sama dengan?",
          "If A and B are independent, P(A|B) equals?",
        ),
        ["P(A)", "P(B)", "0", "1"],
        0,
        bi(
          "Independensi berarti informasi B tidak mengubah peluang A.",
          "Independence means knowing B does not change A's probability.",
        ),
        bi(
          "Untuk P(B)>0, P(A|B)=P(A) pada kejadian independen.",
          "For P(B)>0, independent events satisfy P(A|B)=P(A).",
        ),
      ),
    ],
  ),
  u(
    "geometri-1",
    [
      bi(
        "Titik menyatakan posisi, garis memanjang satu dimensi, dan bidang mempunyai dua dimensi. Sisi kubus berada pada bidang.",
        "A point represents position, a line extends in one dimension, and a plane has two dimensions. A cube face lies in a plane.",
      ),
      bi(
        "Kubus memiliki 8 titik sudut, 12 rusuk, dan 6 sisi. Tiga titik yang tidak segaris menentukan satu bidang.",
        "A cube has 8 vertices, 12 edges, and 6 faces. Three non-collinear points determine one plane.",
      ),
    ],
    [
      q(
        bi("Banyak rusuk kubus?", "Number of edges of a cube?"),
        ["6", "8", "12", "16"],
        2,
        bi(
          "Hitung rusuk atas, bawah, lalu tegak.",
          "Count top, bottom, and vertical edges.",
        ),
        bi("4+4+4=12 rusuk.", "4+4+4=12 edges."),
      ),
      q(
        bi("Banyak titik sudut kubus?", "Number of vertices of a cube?"),
        ["6", "8", "10", "12"],
        1,
        bi(
          "Ada empat titik pada sisi atas dan empat di bawah.",
          "There are four vertices on top and four below.",
        ),
        bi("4+4=8 titik sudut.", "4+4=8 vertices."),
      ),
      q(
        bi(
          "Satu bidang ditentukan oleh tiga titik yang…",
          "One plane is determined by three points that are…",
        ),
        [
          bi("Segaris", "Collinear"),
          bi("Tidak segaris", "Non-collinear"),
          bi("Berimpit", "Coincident"),
          bi("Selalu sama", "Always identical"),
        ],
        1,
        bi(
          "Titik ketiga harus memberi arah yang berbeda dari garis dua titik pertama.",
          "The third point must give a direction distinct from the line through the first two.",
        ),
        bi(
          "Tiga titik tidak segaris menentukan tepat satu bidang.",
          "Three non-collinear points determine exactly one plane.",
        ),
      ),
    ],
  ),
  u(
    "geometri-2",
    [
      bi(
        "Gunakan Teorema Pythagoras pada segitiga siku-siku. Diagonal sisi kubus a√2; diagonal ruang a√3.",
        "Use the Pythagorean theorem on right triangles. A cube's face diagonal is a√2; its space diagonal is a√3.",
      ),
      bi(
        "Rusuk kubus 2: diagonal sisi √(2²+2²)=2√2. Diagonal ruang √((2√2)²+2²)=2√3.",
        "For a cube edge of 2: face diagonal √(2²+2²)=2√2. Space diagonal √((2√2)²+2²)=2√3.",
      ),
    ],
    [
      q(
        bi(
          "Diagonal ruang kubus rusuk 3?",
          "Space diagonal of a cube with edge 3?",
        ),
        ["3√2", "3√3", "9", "6"],
        1,
        bi(
          "Gunakan panjang rusuk dikali √3.",
          "Multiply the edge length by √3.",
        ),
        bi("d=a√3=3√3.", "d=a√3=3√3."),
      ),
      q(
        bi(
          "Diagonal sisi kubus rusuk 4?",
          "Face diagonal of a cube with edge 4?",
        ),
        ["4√2", "4√3", "8", "16"],
        0,
        bi(
          "Diagonal sisi berada pada persegi, bukan melintasi ruang.",
          "A face diagonal lies on a square, not across the solid.",
        ),
        bi("√(4²+4²)=4√2.", "√(4²+4²)=4√2."),
      ),
      q(
        bi("Jarak (0,0,0) ke (1,2,2)?", "Distance from (0,0,0) to (1,2,2)?"),
        ["√5", "3", "5", "9"],
        1,
        bi(
          "Gunakan akar jumlah kuadrat tiga selisih koordinat.",
          "Take the square root of the sum of the three squared coordinate differences.",
        ),
        bi("√(1²+2²+2²)=√9=3.", "√(1²+2²+2²)=√9=3."),
      ),
    ],
  ),
  u(
    "geometri-3",
    [
      bi(
        "Sudut garis dengan bidang adalah sudut garis terhadap proyeksinya pada bidang. Gunakan segitiga siku-siku untuk menentukan sinus, cosinus, atau tangen.",
        "The angle between a line and a plane is measured against the line's projection onto the plane. Use a right triangle for sine, cosine, or tangent.",
      ),
      bi(
        "Jika tinggi 3 dan proyeksi mendatar 4, tan θ=3/4. Panjang garis miring=5, sehingga sin θ=3/5.",
        "If height is 3 and horizontal projection is 4, tan θ=3/4. The sloping line has length 5, so sin θ=3/5.",
      ),
    ],
    [
      q(
        bi(
          "Tinggi 3, proyeksi mendatar 4. Tan θ?",
          "Height 3, horizontal projection 4. Tan θ?",
        ),
        ["3/4", "4/3", "3/5", "4/5"],
        0,
        bi(
          "Tangen = sisi depan ÷ sisi samping.",
          "Tangent = opposite ÷ adjacent.",
        ),
        bi("tan θ=3/4.", "tan θ=3/4."),
      ),
      q(
        bi(
          "Garis tegak lurus bidang membentuk sudut?",
          "A line perpendicular to a plane forms an angle of?",
        ),
        ["0°", "30°", "45°", "90°"],
        3,
        bi(
          "Tegak lurus berarti sudut siku-siku.",
          "Perpendicular means a right angle.",
        ),
        bi(
          "Sudut garis dengan bidang adalah 90°.",
          "The line-plane angle is 90°.",
        ),
      ),
      q(
        bi("Sinus sudut 30°?", "Sine of 30°?"),
        ["0", "1/2", "√3/2", "1"],
        1,
        bi(
          "Ingat perbandingan sisi segitiga 30°–60°–90°.",
          "Recall the side ratios of a 30°–60°–90° triangle.",
        ),
        bi("sin 30°=1/2.", "sin 30°=1/2."),
      ),
    ],
  ),
  u(
    "geometri-4",
    [
      bi(
        "Volume kubus a³ dan luas permukaan 6a². Volume balok p×l×t. Bedakan satuan luas (persegi) dengan volume (kubik).",
        "A cube's volume is a³ and surface area is 6a². A rectangular prism has volume l×w×h. Distinguish square from cubic units.",
      ),
      bi(
        "Kubus rusuk 3: volume 27 dan luas permukaan 54. Balok 2×3×4: volume 24.",
        "A cube of edge 3 has volume 27 and surface area 54. A 2×3×4 prism has volume 24.",
      ),
    ],
    [
      q(
        bi("Volume kubus rusuk 4?", "Volume of a cube with edge 4?"),
        ["16", "24", "48", "64"],
        3,
        bi(
          "Kalikan rusuk dengan dirinya tiga kali.",
          "Multiply the edge by itself three times.",
        ),
        bi("4³=64 satuan kubik.", "4³=64 cubic units."),
      ),
      q(
        bi(
          "Luas permukaan kubus rusuk 2?",
          "Surface area of a cube with edge 2?",
        ),
        ["8", "12", "24", "16"],
        2,
        bi(
          "Ada enam sisi persegi, masing-masing luas 2².",
          "There are six square faces, each of area 2².",
        ),
        bi("6×2²=24 satuan persegi.", "6×2²=24 square units."),
      ),
      q(
        bi("Volume balok 2×3×5?", "Volume of a 2×3×5 rectangular prism?"),
        ["10", "15", "25", "30"],
        3,
        bi(
          "Kalikan panjang, lebar, dan tinggi.",
          "Multiply length, width, and height.",
        ),
        bi("2×3×5=30.", "2×3×5=30."),
      ),
    ],
  ),
  u(
    "turunan-1",
    [
      bi(
        "Laju perubahan rata-rata adalah Δy/Δx. Saat selang mendekati nol, kita memperoleh laju sesaat atau turunan.",
        "Average rate of change is Δy/Δx. As the interval approaches zero, we obtain the instantaneous rate, or derivative.",
      ),
      bi(
        "Posisi s(t)=t². Dari t=1 ke t=3, laju rata-rata=(9−1)/(3−1)=4. Laju sesaat s′(t)=2t.",
        "Position s(t)=t². From t=1 to t=3, average rate=(9−1)/(3−1)=4. Instantaneous rate is s′(t)=2t.",
      ),
    ],
    [
      q(
        bi(
          "Laju rata-rata f(x)=x² dari x=1 ke 3?",
          "Average rate of f(x)=x² from x=1 to 3?",
        ),
        ["2", "3", "4", "8"],
        2,
        bi(
          "Hitung perubahan output dibagi perubahan input.",
          "Divide the change in output by the change in input.",
        ),
        bi("(9−1)/(3−1)=4.", "(9−1)/(3−1)=4."),
      ),
      q(
        bi(
          "s(t)=t². Kecepatan sesaat di t=3?",
          "s(t)=t². Instantaneous velocity at t=3?",
        ),
        ["3", "6", "9", "12"],
        1,
        bi(
          "Turunkan posisi terlebih dahulu: s′(t)=2t.",
          "Differentiate position first: s′(t)=2t.",
        ),
        bi("s′(3)=2×3=6.", "s′(3)=2×3=6."),
      ),
      q(
        bi(
          "Satuan turunan jarak (meter) terhadap waktu (detik)?",
          "Unit of the derivative of distance (meters) with respect to time (seconds)?",
        ),
        ["m²", "s/m", "m/s", "m·s"],
        2,
        bi(
          "Satuan output dibagi satuan input.",
          "Divide the output unit by the input unit.",
        ),
        bi("Meter per detik, m/s.", "Meters per second, m/s."),
      ),
    ],
  ),
  u(
    "turunan-2",
    [
      bi(
        "Aturan pangkat: d(xⁿ)/dx=n xⁿ⁻¹. Turunan konstanta nol. Turunkan setiap suku pada penjumlahan.",
        "Power rule: d(xⁿ)/dx=n xⁿ⁻¹. A constant's derivative is zero. Differentiate sums term by term.",
      ),
      bi(
        "f(x)=2x³+5x−7 memberi f′(x)=6x²+5. Koefisien dikalikan pangkat, lalu pangkat dikurangi satu.",
        "f(x)=2x³+5x−7 gives f′(x)=6x²+5. Multiply the coefficient by the exponent, then reduce the exponent by one.",
      ),
    ],
    [
      q(
        bi("Turunan x⁴?", "Derivative of x⁴?"),
        ["x³", "4x³", "4x⁴", "x⁵/5"],
        1,
        bi(
          "Kalikan dengan pangkat, kurangi pangkat satu.",
          "Multiply by the exponent and subtract one from it.",
        ),
        bi("d(x⁴)/dx=4x³.", "d(x⁴)/dx=4x³."),
      ),
      q(
        bi("Turunan 3x²+2x?", "Derivative of 3x²+2x?"),
        ["3x+2", "6x", "6x+2", "6x²+2"],
        2,
        bi(
          "Turunkan kedua suku secara terpisah.",
          "Differentiate both terms separately.",
        ),
        bi("d(3x²)/dx=6x dan d(2x)/dx=2.", "d(3x²)/dx=6x and d(2x)/dx=2."),
      ),
      q(
        bi("Turunan konstanta 7?", "Derivative of the constant 7?"),
        ["0", "1", "7", "7x"],
        0,
        bi(
          "Konstanta tidak berubah saat x berubah.",
          "A constant does not change as x changes.",
        ),
        bi(
          "Laju perubahan konstanta adalah nol.",
          "The rate of change of a constant is zero.",
        ),
      ),
    ],
  ),
  u(
    "turunan-3",
    [
      bi(
        "Gradien garis singgung m=f′(a). Persamaan garis di (a,f(a)) adalah y−f(a)=m(x−a).",
        "The tangent slope is m=f′(a). Its equation at (a,f(a)) is y−f(a)=m(x−a).",
      ),
      bi(
        "Untuk f(x)=x² di x=2, titiknya (2,4), gradien 4, sehingga y−4=4(x−2) atau y=4x−4.",
        "For f(x)=x² at x=2, the point is (2,4), slope 4, so y−4=4(x−2), or y=4x−4.",
      ),
    ],
    [
      q(
        bi(
          "Gradien garis singgung y=x² di x=3?",
          "Tangent slope of y=x² at x=3?",
        ),
        ["3", "6", "9", "12"],
        1,
        bi(
          "Evaluasi turunan 2x pada titik yang diminta.",
          "Evaluate the derivative 2x at the given input.",
        ),
        bi("2×3=6.", "2×3=6."),
      ),
      q(
        bi("Garis singgung y=x² di x=1?", "Tangent to y=x² at x=1?"),
        ["y=x", "y=2x+1", "y=2x−1", "y=x−1"],
        2,
        bi(
          "Titiknya (1,1), gradiennya 2; gunakan rumus titik-gradien.",
          "The point is (1,1), slope 2; use point-slope form.",
        ),
        bi("y−1=2(x−1), sehingga y=2x−1.", "y−1=2(x−1), so y=2x−1."),
      ),
      q(
        bi(
          "Garis singgung mendatar memiliki gradien?",
          "A horizontal tangent has slope?",
        ),
        ["0", "1", "−1", "90"],
        0,
        bi(
          "Garis mendatar tidak mempunyai perubahan vertikal.",
          "A horizontal line has no vertical change.",
        ),
        bi("Gradien=Δy/Δx=0.", "Slope=Δy/Δx=0."),
      ),
    ],
  ),
  u(
    "turunan-4",
    [
      bi(
        "Cari titik stasioner dengan f′(x)=0. Turunan kedua positif menunjukkan minimum lokal; negatif menunjukkan maksimum lokal.",
        "Find stationary points with f′(x)=0. A positive second derivative indicates a local minimum; a negative one a local maximum.",
      ),
      bi(
        "f(x)=x²−4x+5: f′=2x−4=0 memberi x=2. f″=2>0, jadi minimum dengan nilai f(2)=1.",
        "f(x)=x²−4x+5: f′=2x−4=0 gives x=2. f″=2>0, so the minimum value is f(2)=1.",
      ),
    ],
    [
      q(
        bi("Titik minimum f(x)=x²−4x+5?", "Minimum point of f(x)=x²−4x+5?"),
        ["(0,5)", "(2,1)", "(4,5)", "(−2,17)"],
        1,
        bi(
          "Selesaikan 2x−4=0 lalu substitusikan ke f.",
          "Solve 2x−4=0, then substitute into f.",
        ),
        bi("x=2 dan f(2)=1, jadi (2,1).", "x=2 and f(2)=1, so (2,1)."),
      ),
      q(
        bi("Nilai maksimum f(x)=−x²+6x?", "Maximum value of f(x)=−x²+6x?"),
        ["3", "6", "9", "12"],
        2,
        bi(
          "Turunan −2x+6 nol di titik puncak.",
          "The derivative −2x+6 is zero at the vertex.",
        ),
        bi("x=3, f(3)=−9+18=9.", "x=3, f(3)=−9+18=9."),
      ),
      q(
        bi(
          "Jika f′(a)=0 dan f″(a)>0, titik a adalah?",
          "If f′(a)=0 and f″(a)>0, a is a?",
        ),
        [
          bi("Minimum lokal", "Local minimum"),
          bi("Maksimum lokal", "Local maximum"),
          bi("Selalu titik belok", "Always an inflection point"),
          bi("Tidak terdefinisi", "Undefined point"),
        ],
        0,
        bi(
          "Turunan kedua positif berarti kurva melengkung ke atas.",
          "A positive second derivative means the curve bends upward.",
        ),
        bi(
          "Uji turunan kedua menunjukkan minimum lokal.",
          "The second derivative test gives a local minimum.",
        ),
      ),
    ],
  ),
  u(
    "integral-1",
    [
      bi(
        "Antiturunan F memenuhi F′(x)=f(x). Tambahkan konstanta C karena semua konstanta mempunyai turunan nol.",
        "An antiderivative F satisfies F′(x)=f(x). Add C because every constant has derivative zero.",
      ),
      bi(
        "Karena turunan x² adalah 2x, ∫2x dx=x²+C. C mewakili semua kemungkinan konstanta.",
        "Since the derivative of x² is 2x, ∫2x dx=x²+C. C represents all possible constants.",
      ),
    ],
    [
      q(
        bi("∫2x dx = ?", "∫2x dx = ?"),
        ["2x²+C", "x²+C", "2+C", "x+C"],
        1,
        bi(
          "Cari fungsi yang turunannya 2x.",
          "Find a function whose derivative is 2x.",
        ),
        bi(
          "Turunan x² adalah 2x, jadi x²+C.",
          "The derivative of x² is 2x, so x²+C.",
        ),
      ),
      q(
        bi(
          "Mengapa integral tak tentu memakai +C?",
          "Why does an indefinite integral include +C?",
        ),
        [
          bi("Turunan konstanta nol", "Constants have derivative zero"),
          bi("Semua fungsi bernilai nol", "Every function is zero"),
          bi("C selalu satu", "C is always one"),
          bi("Agar hasil positif", "To make the result positive"),
        ],
        0,
        bi(
          "Bandingkan turunan x² dan x²+5.",
          "Compare derivatives of x² and x²+5.",
        ),
        bi(
          "Konstanta berbeda menghasilkan turunan sama, sehingga diperlukan keluarga +C.",
          "Different constants give the same derivative, hence the family +C.",
        ),
      ),
      q(
        bi("∫3 dx = ?", "∫3 dx = ?"),
        ["0+C", "3x+C", "x³+C", "3/x+C"],
        1,
        bi("Turunan fungsi linear ax adalah a.", "The derivative of ax is a."),
        bi("Turunan 3x+C adalah 3.", "The derivative of 3x+C is 3."),
      ),
    ],
  ),
  u(
    "integral-2",
    [
      bi(
        "Aturan pangkat integral: ∫xⁿ dx=xⁿ⁺¹/(n+1)+C untuk n≠−1. Konstanta pengali tetap dipertahankan.",
        "Integral power rule: ∫xⁿ dx=xⁿ⁺¹/(n+1)+C for n≠−1. Constant multipliers are preserved.",
      ),
      bi(
        "∫6x² dx=6x³/3+C=2x³+C. Untuk x⁻¹ aturan ini tidak berlaku karena pembaginya nol.",
        "∫6x² dx=6x³/3+C=2x³+C. For x⁻¹ this rule does not apply because the denominator would be zero.",
      ),
    ],
    [
      q(
        bi("∫x² dx = ?", "∫x² dx = ?"),
        ["2x+C", "x³+C", "x³/3+C", "x²/2+C"],
        2,
        bi(
          "Naikkan pangkat menjadi tiga lalu bagi pangkat baru.",
          "Raise the exponent to three, then divide by it.",
        ),
        bi("∫x² dx=x³/3+C.", "∫x² dx=x³/3+C."),
      ),
      q(
        bi("∫6x dx = ?", "∫6x dx = ?"),
        ["6x²+C", "3x²+C", "6+C", "x²+C"],
        1,
        bi(
          "Pertahankan 6 lalu integralkan x.",
          "Keep the factor 6, then integrate x.",
        ),
        bi("6×x²/2+C=3x²+C.", "6×x²/2+C=3x²+C."),
      ),
      q(
        bi(
          "Pangkat yang dikecualikan pada rumus xⁿ⁺¹/(n+1)?",
          "Excluded exponent in the rule xⁿ⁺¹/(n+1)?",
        ),
        ["0", "1", "−1", "2"],
        2,
        bi(
          "Cari pangkat yang membuat n+1 nol.",
          "Find the exponent that makes n+1 zero.",
        ),
        bi(
          "n=−1 membuat penyebut nol; perlu aturan logaritma.",
          "n=−1 makes the denominator zero; the logarithmic rule is needed.",
        ),
      ),
    ],
  ),
  u(
    "integral-3",
    [
      bi(
        "Jika F adalah antiturunan f, integral tentu dari a ke b adalah F(b)−F(a). Konstanta saling menghapus.",
        "If F is an antiderivative of f, its definite integral from a to b is F(b)−F(a). Constants cancel.",
      ),
      bi(
        "∫₀²2x dx=[x²]₀²=4−0=4. Membalik batas mengubah tanda hasil.",
        "∫₀²2x dx=[x²]₀²=4−0=4. Reversing the bounds changes the sign.",
      ),
    ],
    [
      q(
        bi("∫₀²2x dx = ?", "∫₀²2x dx = ?"),
        ["2", "4", "6", "8"],
        1,
        bi(
          "Antiturunannya x²; evaluasi batas atas dikurangi bawah.",
          "The antiderivative is x²; evaluate upper minus lower.",
        ),
        bi("2²−0²=4.", "2²−0²=4."),
      ),
      q(
        bi("∫₁³1 dx = ?", "∫₁³1 dx = ?"),
        ["1", "2", "3", "4"],
        1,
        bi("Antiturunan 1 adalah x.", "The antiderivative of 1 is x."),
        bi("[x]₁³=3−1=2.", "[x]₁³=3−1=2."),
      ),
      q(
        bi(
          "Jika ∫ₐᵇ f(x)dx=5, berapa ∫ᵇₐ f(x)dx?",
          "If ∫ₐᵇ f(x)dx=5, what is ∫ᵇₐ f(x)dx?",
        ),
        ["5", "0", "−5", "1/5"],
        2,
        bi(
          "Batas dibalik, tanda berubah.",
          "Reversing the bounds changes the sign.",
        ),
        bi(
          "Integral dengan batas terbalik bernilai −5.",
          "The reversed integral equals −5.",
        ),
      ),
    ],
  ),
  u(
    "integral-4",
    [
      bi(
        "Integral adalah luas bertanda. Untuk luas geometris, pisahkan interval pada titik potong sumbu x dan jumlahkan nilai mutlak setiap bagian.",
        "An integral is signed area. For geometric area, split at x-intercepts and add the absolute values of each part.",
      ),
      bi(
        "Grafik y=x pada [−1,1] memiliki integral 0, tetapi luas dua segitiganya adalah 1/2+1/2=1.",
        "The graph y=x on [−1,1] has integral 0, but its two triangles have total area 1/2+1/2=1.",
      ),
    ],
    [
      q(
        bi("Luas di bawah y=2 pada [0,3]?", "Area under y=2 on [0,3]?"),
        ["2", "3", "5", "6"],
        3,
        bi(
          "Daerahnya persegi panjang: tinggi dikali lebar.",
          "The region is a rectangle: height times width.",
        ),
        bi("2×3=6.", "2×3=6."),
      ),
      q(
        bi(
          "Luas geometris antara y=x dan sumbu x pada [−1,1]?",
          "Geometric area between y=x and the x-axis on [−1,1]?",
        ),
        ["0", "1/2", "1", "2"],
        2,
        bi(
          "Jumlahkan luas kedua segitiga, jangan kurangkan.",
          "Add the two triangle areas instead of subtracting.",
        ),
        bi(
          "1/2+1/2=1; integral bertandanya berbeda, yaitu 0.",
          "1/2+1/2=1; the signed integral is different, namely 0.",
        ),
      ),
      q(
        bi(
          "Grafik f(x)=−2 pada [0,1]. Luas geometrisnya?",
          "Graph f(x)=−2 on [0,1]. Its geometric area?",
        ),
        ["−2", "−1", "0", "2"],
        3,
        bi(
          "Luas geometris tidak negatif, meskipun grafik di bawah sumbu.",
          "Geometric area is nonnegative even below the axis.",
        ),
        bi("Luas=|−2×1|=2.", "Area=|−2×1|=2."),
      ),
    ],
  ),
];
export const lessonIds = curriculum.map((unit) => unit.id);
export const findUnit = (id: string) =>
  curriculum.find((unit) => unit.id === id);
// One checkpoint from each topic. Victory needs five of six hits.
export const bossQuestions = curriculum
  .filter((_, i) => i % 4 === 3)
  .map((unit) => unit.questions[1]);
