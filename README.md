# Sky Shop — Static E-commerce Demo

Sky Shop adalah antarmuka toko online berbasis **HTML, CSS, dan JavaScript murni**. Proyek ini dibuat agar dapat dipublikasikan langsung melalui GitHub Pages. Tidak membutuhkan Node.js, PHP, Express, database, backend, atau proses build.

## Fitur

- Beranda premium yang responsif, kategori, banner, dan info toko.
- Katalog produk dengan pencarian, filter kategori, pengurutan, detail produk, status stok, dan produk unggulan.
- Keranjang lokal dengan ubah jumlah, hapus barang, validasi stok, dan perhitungan total.
- Checkout dengan validasi nama, nomor WhatsApp, alamat, catatan, dan nomor pesanan.
- Pembuatan pesan WhatsApp ke nomor toko yang dikonfigurasi.
- Riwayat pesanan lokal, detail pesanan, dan pengubahan status lokal dari Dashboard Admin.
- Dashboard Admin untuk CRUD produk, stok, gambar, kategori, pengaturan toko, kontak, informasi pengiriman/pembayaran, dan statistik berdasarkan data yang tersedia.
- Registrasi/login opsional untuk demonstrasi lokal. Password tidak disimpan dalam bentuk teks biasa, tetapi akun tetap **bukan autentikasi aman**.
- Sidebar desktop yang dapat diciutkan, hamburger menu pada perangkat mobile, notifikasi, kondisi kosong, dan dukungan `prefers-reduced-motion`.

## Jalankan secara lokal

Karena ini website statis, `index.html` dapat dibuka langsung di browser. Untuk pengujian yang lebih konsisten, gunakan ekstensi server statis lokal pada editor atau `python -m http.server` dari direktori proyek (Python hanya diperlukan untuk pengujian lokal, bukan untuk hosting website). Buka alamat lokal yang ditampilkan oleh tool tersebut.

## Publikasi lewat GitHub Pages

1. Buat repository baru di GitHub, misalnya `sky-shop`. Jika repository harus publik agar pengunjung mudah mengaksesnya, pilih **Public**.
2. Unggah seluruh isi folder proyek ini ke **root** repository. Pastikan `index.html` berada langsung di root, bukan di dalam folder `sky-shop/sky-shop/`.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/(root)`, lalu tekan **Save**.
6. Tunggu sampai GitHub Pages menampilkan alamat publik. Untuk repository proyek, alamat biasanya berbentuk `https://USERNAME.github.io/NAMA-REPOSITORY/`.
7. Buka link itu, coba navigasi Beranda → Shop → Keranjang, lalu uji Dashboard Admin dan pengaturan di browser yang sama.

Jika memakai Git dari komputer atau Termux, perintah dasarnya (jalankan di folder yang memuat `index.html`):

```bash
git init
git add .
git commit -m "Create Sky Shop static website"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Jika repository Git sudah ada, jangan menjalankan `git init` atau menambahkan remote kedua secara membabi buta. Periksa `git status` dan `git remote -v` lebih dulu. Semua path aset pada proyek ini relatif, sehingga kompatibel dengan URL GitHub Pages berbentuk `/NAMA-REPOSITORY/`.

## Cara mulai mengelola Sky Shop

1. Buka **Dashboard Admin → Pengaturan** untuk mengubah nama, slogan, banner (judul dan teks), profil toko, kontak, kategori, serta info pengiriman/pembayaran.
2. Buka **Dashboard Admin → Produk** dan tambahkan produk nyata yang ingin ditampilkan. Tidak ada produk contoh yang dibuat otomatis.
3. Masukkan nomor WhatsApp toko memakai kode negara, idealnya angka saja, misalnya format `62...` tanpa tanda `+` atau spasi. Pastikan itu nomor yang memang dimiliki/digunakan toko.
4. Buka Shop, tambahkan produk ke keranjang dan coba checkout. Pesanan disimpan dahulu di browser yang digunakan. Jika nomor WhatsApp diatur, WhatsApp terbuka dengan draf pesan untuk ditinjau dan dikirim pengguna.

## Keterbatasan penting

- **`localStorage` bukan database online.** Produk, pengaturan admin, akun demo, keranjang, pesanan, dan status pesanan tersimpan hanya pada browser/origin yang sedang dipakai. Pengunjung berbeda tidak otomatis berbagi data.
- Pengelolaan melalui Dashboard Admin tidak mengubah file repository atau tampilan pengunjung lain. Untuk memperbarui data publik, perubahan perlu dilakukan pada sumber proyek dan diunggah kembali ke GitHub.
- **Dashboard Admin tidak aman untuk toko publik.** Semua JavaScript dan data sisi klien dapat diperiksa atau dimodifikasi pengguna. Tidak ada password rahasia admin yang ditanam pada kode ini, dan layar admin hanya demonstrasi pengelolaan lokal.
- Login/registrasi hanyalah simulasi frontend. Jangan menggunakan password penting, jangan menyimpan data sensitif, dan jangan mengandalkannya untuk otorisasi.
- Gambar URL atau gambar yang ikut diunggah ke repository dapat dimuat oleh pengunjung lain. Gambar yang dipilih melalui unggahan file pada admin disimpan sebagai data lokal browser dan **tidak** ikut terunggah ke GitHub Pages.
- Stok dan status pesanan hanya berubah lokal. Dua pengunjung dapat melihat stok berbeda. Status “Selesai” atau status lainnya tidak membuktikan pembayaran atau pengiriman sebenarnya.
- WhatsApp perlu dibuka dan dikirim sendiri oleh pengguna. Membuka WhatsApp tidak membuktikan toko menerima pesanan. Ongkir dan pembayaran perlu dikonfirmasi dengan pengelola.
- Font memakai Google Fonts sebagai penyempurnaan visual. Jika layanan font tidak tersedia, website tetap tampil menggunakan font sistem cadangan.

## Struktur proyek

```text
sky-shop/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── storage.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   ├── admin.js
│   └── app.js
├── assets/
│   └── images/
├── .nojekyll
└── README.md
```

## Reset data lokal

Data memakai awalan key `skyshop.v1.` pada localStorage browser. Untuk reset manual, buka Developer Tools browser → Application/Storage → Local Storage pada origin website, lalu hapus key berawalan `skyshop.v1.`. Tindakan ini hanya menghapus data pada origin/browser tersebut dan tidak bisa dibatalkan.

## Pengujian minimum sebelum digunakan

- Tambahkan produk dan pastikan ia muncul di Shop.
- Cari produk, filter kategori, dan urutkan harga.
- Uji stok habis dan jumlah melebihi stok.
- Tambah/kurangi barang, muat ulang halaman, lalu cek keranjang.
- Isi checkout dengan data valid, periksa pesanan lokal, dan buka draf WhatsApp.
- Ubah pengaturan toko, pindah halaman, lalu pastikan konten berubah.
- Buka website di perangkat/browser lain dan ingat bahwa data lokal tidak ikut berpindah.
