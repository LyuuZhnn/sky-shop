# Crystal Store — Static E-commerce Demo

Crystal Store adalah proyek toko online statis menggunakan HTML, CSS, dan JavaScript murni. Proyek ini dirancang untuk GitHub Pages; tidak memerlukan Node.js, PHP, Express, server tambahan, atau database backend.

## Struktur proyek

```text
Crystal_Store/
├── index.html             # Toko publik
├── admin.html             # Halaman admin lokal terpisah, tidak ada di navigasi publik
├── css/
│   └── style.css
├── js/
│   ├── storage.js         # localStorage, format, validasi helper
│   ├── products.js        # katalog/CRUD produk lokal
│   ├── cart.js            # keranjang dan validasi stok
│   ├── orders.js          # checkout, riwayat, status, WhatsApp
│   ├── app.js             # navigasi dan tampilan toko publik
│   └── admin.js           # login demo, dashboard dan pengaturan lokal
├── assets/images/
│   └── crystal-mark.svg
├── .nojekyll
└── README.md
```

## Menjalankan lokal

Bisa dibuka langsung dengan `index.html` di browser, tetapi beberapa fitur hash kata sandi menggunakan Web Crypto yang umumnya memerlukan konteks aman. Untuk pengujian login akun/admin, gunakan alamat HTTPS setelah diterbitkan oleh GitHub Pages. Tidak ada proses build.

## Publikasi GitHub Pages

1. Buat repository GitHub baru, misalnya `crystal-store`.
2. Unggah **isi folder ini** ke root repository. Pastikan `index.html`, `admin.html`, `.nojekyll`, folder `css`, `js`, dan `assets` berada di root yang sama.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/(root)`, kemudian tekan **Save**.
6. Tunggu deployment selesai. Link biasanya `https://USERNAME.github.io/crystal-store/`.
7. Uji beranda, katalog, tampilan mobile, keranjang, checkout, pesanan, dan akses admin melalui HTTPS.

Semua referensi berkas bersifat relatif (`css/style.css`, `js/app.js`, `assets/images/...`) sehingga bekerja pada alamat repositori seperti `username.github.io/nama-repository/`.

## Membuka halaman admin

Halaman admin tidak ditautkan dari navigasi publik. Buka langsung:

`https://USERNAME.github.io/crystal-store/admin.html`

Pada browser/origin yang baru, buat kata sandi admin lokal minimal 10 karakter. Kata sandi tidak disimpan sebagai teks biasa; hash SHA-256 disimpan di `localStorage`. Jangan gunakan kata sandi penting.

**Peringatan keamanan:** halaman admin ini hanyalah pagar demonstrasi di frontend. Siapa pun yang dapat memeriksa atau memodifikasi JavaScript, `localStorage`, dan status sesi dapat melewati pemeriksaan. Jangan gunakan untuk pengelolaan uang, data pribadi, atau sebagai perlindungan toko publik. Tidak ada password admin bawaan yang ditanam dalam kode.

## Fitur publik

- Beranda, katalog, pencarian langsung, kategori, filter, pengurutan harga/tanggal, dan detail produk.
- Tambah/ubah/hapus jumlah keranjang dan validasi jumlah terhadap stok lokal.
- Checkout tamu dengan validasi nama, nomor WhatsApp, alamat, catatan dan persetujuan penyimpanan lokal.
- Nomor pesanan unik, riwayat pesanan pada browser yang sama, perubahan status lokal melalui admin, dan komposisi pesan WhatsApp.
- Halaman Tentang Kami dan kontak yang dapat disesuaikan oleh pengaturan lokal.
- Akun pengguna demonstrasi opsional; kata sandi di-hash, bukan disimpan sebagai teks biasa.
- Dashboard admin lokal: CRUD produk, status pesanan lokal, statistik yang dihitung dari data lokal, pengaturan toko, serta ekspor JSON.

## Batasan yang disengaja

- `localStorage` berbeda untuk setiap browser/origin dan tidak tersinkronisasi antarperangkat. Pengunjung lain tidak akan otomatis melihat produk yang ditambahkan admin lokal. Pesanan pelanggan juga tidak terkirim ke admin secara otomatis.
- Ketika data toko diedit dari panel admin, perubahan hanya ada di browser itu. Untuk membuat perubahan katalog tampil bagi semua pengunjung di GitHub Pages, ubah file statis di repository dan publikasikan ulang, atau pindah ke layanan data terpusat (di luar cakupan statis ini).
- Pesanan yang dibuat disimpan secara lokal. Tombol WhatsApp hanya membuka pesan yang disiapkan untuk dikirim oleh pengguna; hal itu bukan bukti toko telah menerima pesanan atau pembayaran.
- Website tidak memproses pembayaran, menghitung tarif pengiriman, atau memverifikasi transaksi.
- Produk tidak diisi otomatis dengan data contoh. Pemilik toko perlu memasukkan katalog sendiri. Statistik awal bernilai nol.
- Foto produk/logo/banner sebaiknya memakai URL HTTPS yang dapat diakses publik atau aset dalam repository. Gambar yang hanya tersedia sebagai data lokal/browser tidak otomatis dapat dilihat pengguna lain.
- Font DM Sans dan Manrope mengambil Google Fonts secara opsional. Jika jaringan memblokirnya, browser memakai font sistem sebagai fallback.

## Penyimpanan lokal

Prefiks key `crystal.store.v1.*` digunakan untuk memisahkan data produk, kategori, keranjang, pesanan, pengaturan toko, akun lokal, hash sandi, dan sesi admin. Data dapat dihapus pengguna melalui pengaturan browser. Gunakan tombol ekspor untuk mengunduh salinan JSON data toko lokal.

## Catatan nama

Nama antarmuka proyek ini **Crystal Store**. Ini adalah website statis demonstrasi, bukan platform e-commerce dengan server produksi.
