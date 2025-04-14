# PintarHitung - Kalkulator Nilai Akademik

[![GitHub Pages Deploy](https://github.com/pintarhitung/PintarHitung.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/pintarhitung/PintarHitung.github.io/actions/workflows/pages/pages-build-deployment)


Website ini dapat diakses langsung melalui:
**[https://PintarHitung.github.io/](https://PintarHitung.github.io/)**

---

## Tentang PintarHitung

PintarHitung adalah sebuah website kalkulator nilai akademik yang dirancang khusus untuk membantu pelajar dan mahasiswa di Indonesia. Proyek ini bertujuan menyediakan alat bantu perhitungan nilai yang:

* **Mudah Digunakan:** Antarmuka yang simpel dan intuitif.
* **Interaktif:** Hasil perhitungan diperbarui secara dinamis.
* **Modern:** Tampilan yang bersih dan responsif.

Website ini dibangun menggunakan teknologi web front-end standar dan dihosting secara gratis menggunakan GitHub Pages.

## Fitur Kalkulator

Saat ini PintarHitung menyediakan beberapa jenis kalkulator:

* 📊 **Kalkulator Nilai Akhir:** Menghitung nilai akhir mata pelajaran/kuliah berdasarkan bobot nilai tugas, UTS, dan UAS. Termasuk fitur untuk menghitung target nilai UAS minimum yang dibutuhkan.
* 🎓 **Kalkulator IP & IPK:** Menghitung Indeks Prestasi (IP) semester dan Indeks Prestasi Kumulatif (IPK) berdasarkan SKS dan nilai huruf mata kuliah. Data mata kuliah semester ini akan tersimpan otomatis di browser Anda (menggunakan Local Storage).
* 🏫 **Kalkulator Nilai Gabungan PPDB DIY (ASPD):** Alat bantu spesifik untuk menghitung nilai gabungan Penerimaan Peserta Didik Baru (PPDB) SMA/SMK di Daerah Istimewa Yogyakarta berdasarkan formula yang melibatkan rata-rata nilai rapor, nilai ASPD, dan nilai akreditasi sekolah asal.
* 📝 **Kalkulator Rata-rata Rapor:** Menghitung nilai rata-rata dari keseluruhan nilai mata pelajaran selama beberapa semester.
* 🔄 **Konversi Nilai:** Mengkonversi nilai dalam format angka (skala 0-100) menjadi format nilai huruf (A, A-, B+, B, dst.) berdasarkan skala nilai standar.

## Tampilan

![Screenshot PintarHitung](url_screenshot_anda.png)
*(Sangat disarankan untuk menambahkan screenshot website Anda di sini. Upload gambar ke repo atau hosting lain, lalu ganti `url_screenshot_anda.png` dengan link gambarnya)*

## Teknologi yang Digunakan

* **HTML5**
* **CSS3**
* **Tailwind CSS:** Framework CSS utility-first (digunakan via CDN).
* **JavaScript:** Bahasa pemrograman utama untuk logika kalkulator.
* **Alpine.js:** Framework JavaScript minimalis untuk interaktivitas (digunakan via CDN).
* **AOS (Animate On Scroll):** Library untuk efek animasi saat scroll (digunakan via CDN).
* **GitHub Pages:** Platform hosting website statis.

## Menjalankan Secara Lokal

Untuk menjalankan website ini di komputer lokal Anda:

1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/USERNAME/PintarHitung.github.io.git](https://github.com/USERNAME/PintarHitung.github.io.git)
    ```
    *(Ganti `USERNAME/PintarHitung.github.io` dengan URL repositori Anda)*
2.  **Buka File HTML:**
    Navigasi ke folder hasil clone, lalu buka file `index.html` (atau nama file HTML utama Anda, misalnya `y.html` jika belum diganti) menggunakan browser web Anda.

Karena semua library (Tailwind, Alpine, AOS) dimuat melalui CDN, tidak diperlukan langkah instalasi dependensi atau proses build.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
*(Opsional: Anda bisa memilih lisensi lain atau menghapus bagian ini. Jika menggunakan lisensi, jangan lupa tambahkan file `LICENSE` di repo Anda)*.

## Author

Dikembangkan oleh **FawwazDzaky**.

---

Semoga website ini bermanfaat! Jika Anda menemukan bug atau memiliki saran, jangan ragu untuk membuat *Issue* di repositori ini.
