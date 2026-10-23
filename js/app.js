(() => {
  'use strict';
  const C = window.Crystal = window.Crystal || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const main = $('#appMain');
  const modal = $('#globalModal');
  const modalBody = $('#modalBody');
  let shopState = { query: '', category: 'Semua kategori', sort: 'recommended' };
  let detailQty = 1;
  let accountMode = 'login';
  const pageNames = { home: 'Beranda', shop: 'Shop', cart: 'Keranjang', checkout: 'Checkout', orders: 'Pesanan', about: 'Tentang Kami', account: 'Akun' };

  function iconImage(product, extra = '') {
    const src = C.safeImage(product && product.image);
    if (src) return `<img src="${C.escapeHtml(src)}" alt="${C.escapeHtml(product.name || 'Foto produk')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="product-placeholder" hidden><span class="placeholder-gem">✧</span></span>`;
    return `<span class="product-placeholder ${extra}"><span class="placeholder-gem">✧</span></span>`;
  }
  function photo(product, cls = '') {
    const src = C.safeImage(product && product.image);
    if (src) return `<div class="${cls}"><img src="${C.escapeHtml(src)}" alt="${C.escapeHtml(product.name || 'Foto produk')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><span class="product-placeholder" hidden><span class="placeholder-gem">✧</span></span></div>`;
    return `<div class="${cls}"><span class="product-placeholder"><span class="placeholder-gem">✧</span></span></div>`;
  }
  function activeProducts() { return C.products().filter(p => p.active); }
  function productCard(product) {
    const stock = product.stock > 0 ? (product.stock <= 4 ? `<span class="stock-note low">Sisa ${product.stock}</span>` : `<span class="stock-note">Stok tersedia</span>`) : '<span class="stock-note out">Stok habis</span>';
    return `<article class="product-card">
      <div class="product-photo">${photo(product, 'product-image-fill').replace('product-image-fill', 'product-photo-inner')}
        ${product.featured ? '<span class="product-badge featured">✦ Unggulan</span>' : ''}
      </div>
      <div class="product-body"><div class="product-category">${C.escapeHtml(product.category)}</div>
        <h3 class="product-title" title="${C.escapeHtml(product.name)}">${C.escapeHtml(product.name)}</h3>
        <p class="product-description">${C.escapeHtml(product.description || 'Informasi produk belum ditambahkan.')}</p>
        <div class="product-meta"><strong class="product-price">${C.formatPrice(product.price)}</strong>${stock}</div>
        <div class="product-actions"><button type="button" class="btn btn-primary" data-add-cart="${C.escapeHtml(product.id)}" ${product.stock < 1 ? 'disabled' : ''}>${product.stock < 1 ? 'Stok habis' : '＋ Keranjang'}</button><button type="button" class="btn btn-secondary quick-view" data-detail="${C.escapeHtml(product.id)}" aria-label="Detail ${C.escapeHtml(product.name)}">↗</button></div>
      </div>
    </article>`;
  }
  function productGrid(products) {
    return products.length ? `<div class="product-grid">${products.map(productCard).join('')}</div>` : emptyState('Koleksi belum tersedia', 'Belum ada produk yang ditambahkan. Kalau kamu mengelola toko ini, tambahkan produk lewat halaman admin khusus.', 'Buka katalog', '#shop', 'empty-collection');
  }
  function emptyState(title, description, button = '', href = '#shop', symbol = '✧') {
    return `<div class="empty-state"><div class="empty-illustration">${symbol === 'empty-collection' ? '◇' : symbol === '▱' ? '▱' : symbol === '▤' ? '▤' : '✧'}</div><h3>${C.escapeHtml(title)}</h3><p>${C.escapeHtml(description)}</p>${button ? `<a class="btn btn-primary" href="${href}">${C.escapeHtml(button)} <span>↗</span></a>` : ''}</div>`;
  }
  function headerHero(settings) {
    const title = String(settings.heroTitle || C.defaultSettings.heroTitle).replace(/<\/?em>/g, token => token === '<em>' ? '<em>' : '</em>');
    const safeTitle = title.split(/(<\/?em>)/g).map(part => part === '<em>' || part === '</em>' ? part : C.escapeHtml(part.replace(/<[^>]*>/g, ''))).join('');
    const banner = C.safeImage(settings.bannerUrl);
    const customStyle = banner ? `style="background-image:linear-gradient(100deg,rgba(25,48,113,.93),rgba(51,68,157,.82) 55%,rgba(37,140,155,.72)),url('${C.escapeHtml(banner).replace(/'/g, '%27')}');background-size:cover;background-position:center"` : '';
    return `<section class="home-hero" ${customStyle}>
      <div class="hero-copy"><span class="hero-kicker"><span></span>${C.escapeHtml(settings.heroKicker || 'YOUR EVERYDAY DISCOVERY')}</span>
        <h1 class="hero-title">${safeTitle}</h1><p class="hero-description">${C.escapeHtml(settings.heroDescription || settings.description || '')}</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#shop">${C.escapeHtml(settings.heroButton || 'Jelajahi koleksi')} <span>↗</span></a><a class="btn btn-secondary" href="#about">${C.escapeHtml(settings.heroSecondButton || 'Kenali toko kami')}</a></div>
      </div>
      ${banner ? '' : `<div class="hero-art" aria-hidden="true"><div class="hero-orbit"></div><div class="hero-glass"></div><span class="hero-glint">✦</span><span class="hero-glint two">✧</span><span class="hero-spark a">✧</span><span class="hero-spark b">✦</span><span class="hero-spark c">✧</span><div class="hero-float-card"><small>CRYSTAL COLLECTION</small><strong>Discover the detail</strong><span>Little things. Big feeling.</span></div></div>`}
    </section>`;
  }
  const categoryArt = ['cyan', 'blue', 'lilac', 'gold'];
  const categorySymbols = ['◇', '✧', '⌁', '✦'];
  function categoryCards(categories, counts) {
    if (!categories.length) return '';
    return `<div class="category-grid">${categories.slice(0, 8).map((category, i) => `<button type="button" class="category-card ${categoryArt[i % categoryArt.length]}" data-category="${C.escapeHtml(category)}"><span class="category-symbol">${categorySymbols[i % categorySymbols.length]}</span><span><strong>${C.escapeHtml(category)}</strong><small>${counts[category] || 0} produk</small></span></button>`).join('')}</div>`;
  }
  function homeView() {
    const settings = C.settings();
    const products = activeProducts();
    const featured = products.filter(p => p.featured).slice(0, 4);
    const latest = products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    const categories = (Array.isArray(settings.storeCategories) && settings.storeCategories.length ? settings.storeCategories : C.categories()).slice(0, 8);
    const counts = C.categoryCounts();
    return `${headerHero(settings)}
      ${settings.homeBenefitsEnabled !== false ? `<div class="home-benefits"><div class="benefit-card"><span class="benefit-icon blue">✧</span><div><strong>Pilihan yang terkurasi</strong><p>Informasi produk jelas dan bisa diperbarui oleh toko.</p></div></div><div class="benefit-card"><span class="benefit-icon teal">↗</span><div><strong>Kontak langsung</strong><p>Konfirmasi ketersediaan dan pengiriman melalui toko.</p></div></div><div class="benefit-card"><span class="benefit-icon gold">◷</span><div><strong>Praktis dan fleksibel</strong><p>Belanja sebagai tamu, tanpa wajib membuat akun.</p></div></div></div>` : ''}
      <section><div class="section-head"><div><span class="eyebrow">BROWSE BY CATEGORY</span><h2 class="page-title" style="font-size:22px;margin-top:6px">Jelajahi kategori</h2><p>Mulai dari hal yang kamu butuhkan.</p></div><a href="#shop" class="text-link">Lihat semua <span>↗</span></a></div>${categoryCards(categories, counts)}</section>
      <section class="home-empty-slot"><div class="section-head"><div><span class="eyebrow">HANDPICKED FOR YOU</span><h2>${C.escapeHtml(settings.featuredTitle || 'Pilihan untukmu')}</h2><p>${C.escapeHtml(settings.featuredDescription || 'Produk unggulan dari koleksi toko.')}</p></div><a href="#shop" class="text-link">Ke katalog <span>↗</span></a></div>${featured.length ? productGrid(featured) : emptyState(products.length ? 'Belum ada produk unggulan' : 'Toko siap diisi', products.length ? 'Admin belum menandai produk unggulan.' : 'Katalog ini masih kosong. Produk yang ditambahkan pemilik toko akan muncul di sini.', 'Lihat katalog', '#shop')}</section>
      <section class="home-empty-slot"><div class="section-head"><div><span class="eyebrow">RECENTLY ADDED</span><h2>Produk terbaru</h2><p>Produk yang paling baru dimasukkan ke katalog.</p></div><a href="#shop" class="text-link">Jelajahi <span>↗</span></a></div>${latest.length ? productGrid(latest) : emptyState('Belum ada produk terbaru', 'Produk terbaru akan tampil di sini setelah toko menambahkan katalog.', 'Buka katalog', '#shop', '◇')}</section>
      ${settings.promosEnabled && String(settings.promoTitle || '').trim() && String(settings.promoDescription || '').trim() ? `<section class="promo-panel"><div><span class="promo-badge">${C.escapeHtml(settings.promoBadge || 'INFO TOKO')}</span><h2>${C.escapeHtml(settings.promoTitle)}</h2><p>${C.escapeHtml(settings.promoDescription)}</p></div><a class="btn btn-secondary" href="#shop">Lihat koleksi ↗</a></section>` : ''}
      <section class="home-empty-slot"><div class="section-head"><div><span class="eyebrow">NEED TO KNOW</span><h2>Informasi belanja</h2><p>Informasi toko sebelum kamu memesan.</p></div></div><div class="home-benefits"><div class="benefit-card"><span class="benefit-icon blue">⌁</span><div><strong>Pengiriman</strong><p>${C.escapeHtml(settings.shippingInfo || 'Konfirmasi detail pengiriman dengan toko.')}</p></div></div><div class="benefit-card"><span class="benefit-icon gold">◇</span><div><strong>Pembayaran</strong><p>${C.escapeHtml(settings.paymentInfo || 'Metode pembayaran dikonfirmasi oleh toko.')}</p></div></div><div class="benefit-card"><span class="benefit-icon teal">☏</span><div><strong>Kontak toko</strong><p>${settings.whatsapp ? 'Hubungi toko lewat WhatsApp saat checkout.' : 'Nomor WhatsApp toko belum diatur.'}</p></div></div></div></section>`;
  }
  function shopView() {
    const products = activeProducts();
    const query = shopState.query.trim().toLowerCase();
    let filtered = products.filter(p => (!query || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query)) && (shopState.category === 'Semua kategori' || p.category === shopState.category));
    if (shopState.sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (shopState.sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (shopState.sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
    const cats = Array.from(new Set(C.categories().concat(products.map(p => p.category))));
    return `<div class="page-intro"><span class="eyebrow">THE COLLECTION</span><h1 class="page-title">Shop the collection.</h1><p class="page-lead">Jelajahi produk, gunakan filter untuk menemukan yang sesuai, lalu tambahkan ke keranjang. Informasi katalog berasal dari data toko di browser ini.</p></div>
      <div class="catalog-toolbar"><div class="toolbar-search"><input class="field-input" id="catalogSearch" type="search" value="${C.escapeHtml(shopState.query)}" placeholder="Cari nama, kategori, atau deskripsi..." aria-label="Cari katalog"></div><select class="field-select" id="categoryFilter" aria-label="Filter kategori"><option>Semua kategori</option>${cats.map(cat => `<option value="${C.escapeHtml(cat)}" ${shopState.category === cat ? 'selected' : ''}>${C.escapeHtml(cat)}</option>`).join('')}</select><select class="field-select" id="sortProducts" aria-label="Urutkan produk"><option value="recommended" ${shopState.sort === 'recommended' ? 'selected' : ''}>Pilihan toko</option><option value="price-low" ${shopState.sort === 'price-low' ? 'selected' : ''}>Harga terendah</option><option value="price-high" ${shopState.sort === 'price-high' ? 'selected' : ''}>Harga tertinggi</option><option value="newest" ${shopState.sort === 'newest' ? 'selected' : ''}>Produk terbaru</option></select></div>
      <div class="section-head"><div><h2>${filtered.length} produk ditemukan</h2><p>${query || shopState.category !== 'Semua kategori' ? 'Hasil sesuai pencarian dan filter.' : 'Katalog aktual dari data lokal toko.'}</p></div><span class="status-inline">${products.length} produk aktif</span></div>
      ${filtered.length ? productGrid(filtered) : emptyState(products.length ? 'Produk tidak ditemukan' : 'Katalog masih kosong', products.length ? 'Coba kata kunci lain atau ubah filter kategori.' : 'Belum ada produk yang ditambahkan. Katalog akan terisi setelah pemilik toko menambahkan produk.', query || shopState.category !== 'Semua kategori' ? 'Reset filter' : 'Kembali ke beranda', query || shopState.category !== 'Semua kategori' ? '#shop' : '#home', '◇')}`;
  }
  function productDetailView(id) {
    const p = C.getProduct(id);
    if (!p || !p.active) return `<div class="page-intro"><span class="eyebrow">PRODUCT DETAIL</span><h1 class="page-title">Produk tidak tersedia.</h1></div>${emptyState('Produk tidak ditemukan', 'Produk mungkin telah dihapus atau dinonaktifkan.', 'Kembali ke katalog', '#shop', '◇')}`;
    detailQty = Math.max(1, Math.min(detailQty, p.stock || 1));
    const stock = p.stock > 0 ? `Tersedia · ${p.stock} unit` : 'Stok habis';
    return `<div style="margin-bottom:17px"><a class="text-link" href="#shop">← Kembali ke katalog</a></div><section class="detail-layout">${photo(p, 'detail-photo')}<div class="detail-info"><span class="eyebrow">${C.escapeHtml(p.category)}</span><h1>${C.escapeHtml(p.name)}</h1><p class="detail-description">${C.escapeHtml(p.description || 'Deskripsi produk belum ditambahkan oleh toko.')}</p><div class="detail-price">${C.formatPrice(p.price)}</div><div class="detail-stock"><span>Ketersediaan</span><strong class="${p.stock < 1 ? 'stock-note out' : p.stock < 5 ? 'stock-note low' : ''}">${stock}</strong></div><div class="detail-divider"></div><label class="field-label" for="detailQty">Jumlah barang</label><div class="detail-buy"><div class="quantity-control"><button type="button" data-detail-qty="-1" aria-label="Kurangi jumlah" ${p.stock < 1 ? 'disabled' : ''}>−</button><output id="detailQty">${detailQty}</output><button type="button" data-detail-qty="1" aria-label="Tambah jumlah" ${p.stock < 1 || detailQty >= p.stock ? 'disabled' : ''}>+</button></div><button class="btn btn-primary" data-add-cart="${C.escapeHtml(p.id)}" data-detail-add="1" ${p.stock < 1 ? 'disabled' : ''}>＋ Tambahkan ke keranjang</button></div><p class="field-help">Jumlah pembelian tidak dapat melebihi stok yang tersedia.</p></div></section>`;
  }
  function cartView() {
    const cart = C.cart();
    if (!cart.length) return `<div class="page-intro"><span class="eyebrow">YOUR BAG</span><h1 class="page-title">Keranjang belanja</h1><p class="page-lead">Barang yang kamu pilih tersimpan di browser ini.</p></div>${emptyState('Keranjangmu masih kosong', 'Yuk, jelajahi katalog dan tambahkan barang yang kamu butuhkan.', 'Mulai belanja', '#shop', '▱')}`;
    const total = cart.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
    return `<div class="page-intro"><span class="eyebrow">YOUR BAG</span><h1 class="page-title">Keranjang belanja</h1><p class="page-lead">Periksa produk dan jumlah sebelum melanjutkan checkout.</p></div><div class="cart-layout"><section class="panel"><h2 class="panel-title">Barang pilihan <span class="muted">(${C.cartCount()} unit)</span></h2><div class="cart-items">${cart.map(({ product: p, quantity }) => `<div class="cart-row"><div class="cart-thumb">${p.image ? `<img src="${C.escapeHtml(p.image)}" alt="${C.escapeHtml(p.name)}" loading="lazy" onerror="this.hidden=true">` : '<span class="placeholder-gem">✧</span>'}</div><div><h3 class="cart-item-title">${C.escapeHtml(p.name)}</h3><div class="cart-item-sub">${C.escapeHtml(p.category)} · ${C.formatPrice(p.price)}/unit</div><div class="cart-row-tools"><div class="mini-qty"><button type="button" data-cart-change="-1" data-id="${C.escapeHtml(p.id)}" aria-label="Kurangi ${C.escapeHtml(p.name)}">−</button><span>${quantity}</span><button type="button" data-cart-change="1" data-id="${C.escapeHtml(p.id)}" aria-label="Tambah ${C.escapeHtml(p.name)}" ${quantity >= p.stock ? 'disabled' : ''}>+</button></div><button type="button" class="icon-delete" data-cart-remove="${C.escapeHtml(p.id)}" aria-label="Hapus ${C.escapeHtml(p.name)}">×</button></div></div><div class="cart-row-end"><strong class="cart-line-total">${C.formatPrice(p.price * quantity)}</strong><span class="stock-note ${p.stock < 1 ? 'out' : ''}">${p.stock > 0 ? `Stok ${p.stock}` : 'Habis'}</span></div></div>`).join('')}</div><div style="margin-top:17px"><a href="#shop" class="text-link">← Lanjut belanja</a></div></section><aside class="panel cart-summary"><h2 class="panel-title">Ringkasan belanja</h2><div class="summary-line"><span>Subtotal (${C.cartCount()} unit)</span><strong>${C.formatPrice(total)}</strong></div><div class="summary-line"><span>Pengiriman</span><strong>Dikonfirmasi toko</strong></div><div class="summary-line total"><span>Total sementara</span><strong>${C.formatPrice(total)}</strong></div><div class="summary-shipping">Nominal pengiriman atau biaya lain, jika ada, dikonfirmasi langsung dengan toko.</div><p class="summary-disclaimer">Keranjang hanya tersimpan pada browser ini. Website tidak memproses pembayaran.</p><a href="#checkout" class="btn btn-primary btn-block">Lanjut checkout <span>→</span></a></aside></div>`;
  }
  function checkoutView() {
    let cart;
    try { cart = C.validateCart(); } catch (_) { return `<div class="page-intro"><span class="eyebrow">CHECKOUT</span><h1 class="page-title">Checkout</h1></div>${emptyState('Belum ada barang untuk checkout', 'Tambahkan produk yang tersedia ke keranjang terlebih dahulu.', 'Ke katalog', '#shop', '▱')}`; }
    const subtotal = cart.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
    return `<div class="page-intro"><span class="eyebrow">CHECKOUT</span><h1 class="page-title">Selesaikan pesananmu.</h1><p class="page-lead">Isi informasi pelanggan agar toko dapat menghubungi dan mengonfirmasi pesanan.</p></div><div class="privacy-note"><span>ⓘ</span><div><strong>Penting:</strong> pesanan dibuat dan disimpan di browser ini. Setelah itu kamu dapat membuka WhatsApp untuk mengirim rinciannya ke toko. Membuka WhatsApp bukan bukti pesanan diterima atau pembayaran selesai.</div></div><div class="checkout-grid"><section class="panel"><h2 class="panel-title">Informasi pelanggan</h2><form class="checkout-form" id="checkoutForm" novalidate><div class="form-grid"><div class="form-field"><label class="field-label" for="customerName">Nama lengkap *</label><input class="field-input" id="customerName" name="name" autocomplete="name" required minlength="2" maxlength="120" placeholder="Nama penerima"></div><div class="form-field"><label class="field-label" for="customerPhone">Nomor WhatsApp *</label><input class="field-input" id="customerPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="40" placeholder="Contoh: 081234567890"></div><div class="form-field span-2"><label class="field-label" for="customerAddress">Alamat pengiriman *</label><textarea class="field-textarea" id="customerAddress" name="address" required minlength="8" maxlength="1500" autocomplete="street-address" placeholder="Nama jalan, nomor rumah, kecamatan, kota, kode pos"></textarea></div><div class="form-field span-2"><label class="field-label" for="customerNote">Catatan pesanan (opsional)</label><textarea class="field-textarea" id="customerNote" name="note" maxlength="2000" placeholder="Catatan untuk toko atau kurir"></textarea></div></div><label class="form-check"><input type="checkbox" id="acceptLocalOrder" required><span>Saya memahami pesanan disimpan di browser ini dan perlu dikonfirmasi dengan toko. *</span></label><div id="checkoutError" class="form-error hidden" role="alert"></div><button type="submit" class="btn btn-primary btn-block">Buat pesanan <span>→</span></button><p class="field-help">Tidak ada pembayaran yang diproses oleh website. Pastikan data yang kamu masukkan benar.</p></form></section><aside class="panel"><h2 class="panel-title">Ringkasan pesanan</h2><div class="order-items-summary">${cart.map(({ product, quantity }) => `<div class="order-item-line"><span>${C.escapeHtml(product.name)} × ${quantity}</span><strong>${C.formatPrice(product.price * quantity)}</strong></div>`).join('')}</div><div class="detail-divider"></div><div class="summary-line"><span>Subtotal</span><strong>${C.formatPrice(subtotal)}</strong></div><div class="summary-line"><span>Pengiriman</span><strong>Belum dihitung</strong></div><div class="summary-line total"><span>Total sementara</span><strong>${C.formatPrice(subtotal)}</strong></div><p class="summary-disclaimer">Total akhir dapat berubah jika ada biaya pengiriman atau kesepakatan lain dengan toko.</p></aside></div>`;
  }
  function ordersView() {
    const orders = C.orders();
    return `<div class="page-intro"><span class="eyebrow">ORDER HISTORY</span><h1 class="page-title">Riwayat pesanan</h1><p class="page-lead">Daftar ini hanya menunjukkan pesanan yang tersimpan di browser dan perangkat ini.</p></div><div class="privacy-note"><span>ⓘ</span><div><strong>Data lokal:</strong> pesanan di sini tidak otomatis tersinkronisasi dengan admin atau perangkat lain. Status bisa diperbarui secara lokal, bukan bukti pembayaran.</div></div>${orders.length ? `<div class="order-list">${orders.map(order => `<article class="order-card"><div class="order-card-head"><div><h3>${C.escapeHtml(order.id)}</h3><p>${C.formatDate(order.createdAt)}</p></div><span class="status-pill ${statusClass(order.status)}">${C.escapeHtml(order.status)}</span></div><div class="order-card-body"><div class="order-items-summary">${order.items.map(item => `<div class="order-item-line"><span>${C.escapeHtml(item.name)} × ${item.quantity}</span><strong>${C.formatPrice(item.price * item.quantity)}</strong></div>`).join('')}</div><div class="order-details"><p><strong>Nama:</strong> ${C.escapeHtml(order.customer && order.customer.name || '-')}</p><p><strong>Alamat:</strong> ${C.escapeHtml(order.customer && order.customer.address || '-')}</p><p><strong>Nomor WhatsApp:</strong> ${C.escapeHtml(order.customer && order.customer.phone || '-')}</p>${order.customer && order.customer.note ? `<p><strong>Catatan:</strong> ${C.escapeHtml(order.customer.note)}</p>` : ''}</div></div><div class="order-card-foot"><div class="order-total"><small>Total pesanan</small><strong>${C.formatPrice(order.total)}</strong></div><div class="contact-actions">${C.whatsappUrl(order) ? `<a class="btn btn-primary btn-sm" href="${C.escapeHtml(C.whatsappUrl(order))}" target="_blank" rel="noopener noreferrer">Kirim ke WhatsApp ↗</a>` : '<span class="field-help">WhatsApp toko belum diatur.</span>'}<button class="btn btn-secondary btn-sm" data-order-detail="${C.escapeHtml(order.id)}">Detail</button></div></div></article>`).join('')}</div>` : emptyState('Belum ada riwayat pesanan', 'Pesanan akan ditampilkan di sini setelah kamu menyelesaikan checkout dari keranjang.', 'Mulai belanja', '#shop', '▤')}`;
  }
  function statusClass(status) {
    return ({ 'Menunggu konfirmasi': 'pending', 'Diproses': 'process', 'Dikirim': 'shipped', 'Selesai': 'completed', 'Dibatalkan': 'cancelled' })[status] || '';
  }
  function aboutView() {
    const s = C.settings();
    const socials = [['Instagram', s.instagram], ['TikTok', s.tiktok]].filter(row => C.safeUrl(row[1]));
    return `<section class="about-hero"><div><span class="eyebrow" style="color:#b8f4f0">THE STORY BEHIND THE STORE</span><h1>${C.escapeHtml(s.storeName || 'Crystal Store')}<br>lebih dekat denganmu.</h1><p>${C.escapeHtml(s.aboutIntro || s.description || '')}</p></div><div class="about-stat-card"><span class="stat-gem">✧</span><strong>Curated with care.</strong><p>Pengalaman toko yang mengutamakan informasi jelas, kemudahan, dan komunikasi langsung.</p></div></section><div class="about-grid"><article class="about-card"><div class="about-card-icon">◎</div><h3>Profil toko</h3><p>${C.escapeHtml(s.aboutIntro || s.description || 'Profil toko belum diatur.')}</p></article><article class="about-card"><div class="about-card-icon">✦</div><h3>Visi</h3><p>${C.escapeHtml(s.aboutVision || 'Visi toko belum diatur.')}</p></article><article class="about-card"><div class="about-card-icon">↗</div><h3>Misi</h3><p>${C.escapeHtml(s.aboutMission || 'Misi toko belum diatur.')}</p></article></div><section class="contact-panel"><div><h3>${C.escapeHtml(s.contactTitle || 'Ada yang ingin ditanyakan?')}</h3><p>${C.escapeHtml(s.contactDescription || 'Hubungi toko untuk informasi lebih lanjut.')}</p><p style="margin-top:7px">${s.email ? `Email: ${C.escapeHtml(s.email)}` : ''}${s.address ? ` · ${C.escapeHtml(s.address)}` : ''}${s.developer ? `<br>Dikelola oleh: ${C.escapeHtml(s.developer)}` : ''}</p>${socials.length ? `<div class="social-links" style="margin-top:12px">${socials.map(([label, url]) => `<a href="${C.escapeHtml(C.safeUrl(url))}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</div>` : ''}</div><div class="contact-actions">${s.whatsapp ? `<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="https://wa.me/${C.escapeHtml(String(s.whatsapp).replace(/\D/g, ''))}">Hubungi via WhatsApp ↗</a>` : ''}${s.email ? `<a class="btn btn-secondary" href="mailto:${C.escapeHtml(s.email)}">Kirim email</a>` : ''}</div></section><p class="field-help" style="margin-top:15px">Konten toko dapat diedit melalui halaman admin khusus pada perangkat ini. Perubahan lokal tidak memperbarui website untuk pengunjung lain.</p>`;
  }
  async function accountView() {
    const user = C.account();
    if (user && user.email) return `<section class="account-card"><div class="account-card-head"><img src="assets/images/crystal-mark.svg" alt=""><h1>Halo, ${C.escapeHtml(user.name || 'Sobat')}!</h1><p>Kamu masuk dalam mode akun lokal pada browser ini.</p></div><div class="mini-account-state"><strong>${C.escapeHtml(user.email)}</strong><p>Akun demonstrasi ini tidak tersinkronisasi dengan server atau perangkat lain.</p></div><button type="button" class="btn btn-secondary btn-block" id="logoutAccount">Keluar dari akun lokal</button><p class="account-footnote">Kamu tetap bisa berbelanja sebagai tamu. Fitur akun ini bukan autentikasi aman untuk informasi sensitif.</p></section>`;
    const users = C.read(C.keys.users, []);
    const found = Array.isArray(users) && users.length > 0;
    return `<section class="account-card"><div class="account-card-head"><img src="assets/images/crystal-mark.svg" alt=""><span class="eyebrow">YOUR CRYSTAL ACCOUNT</span><h1>${accountMode === 'login' ? 'Selamat datang kembali.' : 'Buat akun lokal.'}</h1><p>Login opsional. Kamu tetap bisa berbelanja tanpa akun.</p></div><div class="account-switch"><button type="button" data-account-mode="login" class="${accountMode === 'login' ? 'is-active' : ''}">Masuk</button><button type="button" data-account-mode="register" class="${accountMode === 'register' ? 'is-active' : ''}">Registrasi</button></div><form id="accountForm" class="account-form" novalidate>${accountMode === 'register' ? `<div class="form-field"><label class="field-label" for="accountName">Nama *</label><input class="field-input" id="accountName" name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder="Nama kamu"></div>` : ''}<div class="form-field"><label class="field-label" for="accountEmail">Email *</label><input class="field-input" id="accountEmail" name="email" required type="email" maxlength="160" autocomplete="email" placeholder="nama@email.com"></div><div class="form-field"><label class="field-label" for="accountPassword">Kata sandi *</label><input class="field-input" id="accountPassword" name="password" required type="password" minlength="8" maxlength="200" autocomplete="${accountMode === 'login' ? 'current-password' : 'new-password'}" placeholder="Minimal 8 karakter"></div><div id="accountError" class="form-error hidden" role="alert"></div><button type="submit" class="btn btn-primary btn-block">${accountMode === 'login' ? 'Masuk' : 'Buat akun'} <span>→</span></button></form><p class="account-footnote">Kata sandi disimpan sebagai hash pada penyimpanan lokal jika browser mendukungnya. Namun, seluruh sistem frontend dan datanya dapat dimodifikasi; jangan gunakan kata sandi penting. Akun hanya ada di browser ini.</p>${found ? '' : '<p class="field-help">Belum ada akun pada browser ini. Buat akun baru atau lanjut belanja sebagai tamu.</p>'}<p style="text-align:center;margin:18px 0 0"><a class="text-link" href="#shop">Lanjut sebagai tamu →</a></p></section>`;
  }
  async function render() {
    const rawRoute = location.hash.replace(/^#/, '') || 'home';
    const [route, id] = rawRoute.split('/');
    const normalizedRoute = pageNames[route] ? route : 'home';
    const settings = C.settings();
    document.title = `${pageNames[normalizedRoute]} — ${settings.storeName || 'Crystal Store'}`;
    $('#pageCrumb').textContent = pageNames[normalizedRoute];
    $$('.nav-link').forEach(link => link.classList.toggle('is-active', link.dataset.route === normalizedRoute));
    main.innerHTML = '<div class="boot-skeleton"><span></span><span></span><span></span></div>';
    try {
      switch (normalizedRoute) {
        case 'home': main.innerHTML = homeView(); break;
        case 'shop': main.innerHTML = shopView(); break;
        case 'cart': main.innerHTML = cartView(); break;
        case 'checkout': main.innerHTML = checkoutView(); break;
        case 'orders': main.innerHTML = ordersView(); break;
        case 'about': main.innerHTML = aboutView(); break;
        case 'account': main.innerHTML = await accountView(); break;
        default: main.innerHTML = homeView();
      }
      if (route === 'product' && id) { main.innerHTML = productDetailView(id); $('#pageCrumb').textContent = 'Detail produk'; document.title = `Detail produk — ${settings.storeName}`; }
    } catch (error) {
      console.error(error);
      main.innerHTML = emptyState('Halaman tidak dapat ditampilkan', 'Terjadi masalah saat membaca data lokal. Muat ulang halaman atau periksa data browser.', 'Kembali ke beranda', '#home');
    }
    updateGlobalBrand(); updateCartIndicators(); closeMobileMenu();
    if (normalizedRoute === 'shop' && shopState.query) { const box = $('#catalogSearch'); if (box) { box.focus({ preventScroll: true }); box.setSelectionRange(box.value.length, box.value.length); } }
  }
  function updateGlobalBrand() {
    const s = C.settings();
    ['brandNameSide', 'footerBrandMini', 'footerBrand', 'footerBrandBottom'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = s.storeName || 'Crystal Store'; });
    ['brandTaglineSide', 'footerTagline'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = s.tagline || 'Curated for your life'; });
    const fd = $('#footerDescription'); if (fd) fd.textContent = s.description || 'Pilihan yang dikurasi untuk menemani keseharianmu.';
    $$('.footer-brand img, .brand-mark').forEach(img => { const custom = C.safeImage(s.logoUrl); if (custom) img.src = custom; else img.src = 'assets/images/crystal-mark.svg'; });
    const year = new Date().getFullYear(); $$('[data-year]').forEach(el => el.textContent = String(year));
    const account = C.account(); $('#accountLabel').textContent = account && account.name ? account.name : 'Akun tamu'; $('#accountSubLabel').textContent = account && account.email ? account.email : 'Belanja tanpa login';
  }
  function updateCartIndicators() {
    const count = C.cartCount();
    $('#cartCount').textContent = String(count > 99 ? '99+' : count);
    $('#topCartDot').textContent = String(count > 99 ? '99+' : count);
    $('#shopCount').textContent = String(activeProducts().length || '');
  }
  function closeMobileMenu() {
    $('#sidebar').classList.remove('is-open'); $('#mobileScrim').classList.remove('is-open'); $('#menuToggle').setAttribute('aria-expanded', 'false');
  }
  function openModal(html) {
    modalBody.innerHTML = html;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
  }
  function closeModal() { if (modal.open && typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); }
  function showProductModal(id) {
    const p = C.getProduct(id);
    if (!p || !p.active) { C.notify('Produk tidak tersedia.', 'error'); return; }
    openModal(`<div class="modal-detail">${photo(p, 'detail-photo')}<div class="detail-info"><span class="eyebrow">${C.escapeHtml(p.category)}</span><h1>${C.escapeHtml(p.name)}</h1><p class="detail-description">${C.escapeHtml(p.description || 'Deskripsi produk belum ditambahkan.')}</p><div class="detail-price">${C.formatPrice(p.price)}</div><div class="detail-stock"><span>Ketersediaan</span><strong class="${p.stock < 1 ? 'stock-note out' : ''}">${p.stock > 0 ? `${p.stock} unit` : 'Stok habis'}</strong></div><div class="detail-divider"></div><button type="button" class="btn btn-primary btn-block" data-add-cart="${C.escapeHtml(p.id)}" data-modal-add="1" ${p.stock < 1 ? 'disabled' : ''}>＋ Tambahkan ke keranjang</button><p class="field-help">Pembelian dibatasi oleh stok yang tercatat di browser ini.</p><a class="text-link" href="#product/${C.escapeHtml(p.id)}" data-modal-go-product="${C.escapeHtml(p.id)}" style="margin-top:13px">Buka halaman detail →</a></div></div>`);
  }
  function showOrderModal(id) {
    const order = C.orders().find(o => o.id === id);
    if (!order) return C.notify('Pesanan tidak ditemukan.', 'error');
    openModal(`<h2 class="modal-heading">Detail pesanan</h2><p class="modal-subheading">${C.escapeHtml(order.id)} · ${C.formatDate(order.createdAt)}</p><div class="order-items-summary">${order.items.map(item => `<div class="order-item-line"><span>${C.escapeHtml(item.name)} × ${item.quantity}</span><strong>${C.formatPrice(item.price * item.quantity)}</strong></div>`).join('')}</div><div class="detail-divider"></div><p class="field-help">Nama: ${C.escapeHtml(order.customer && order.customer.name || '-')}</p><p class="field-help">Alamat: ${C.escapeHtml(order.customer && order.customer.address || '-')}</p><p class="field-help">Status lokal: ${C.escapeHtml(order.status)}</p><div class="summary-line total"><span>Total</span><strong>${C.formatPrice(order.total)}</strong></div>${C.whatsappUrl(order) ? `<a class="btn btn-primary btn-block" href="${C.escapeHtml(C.whatsappUrl(order))}" target="_blank" rel="noopener noreferrer">Kirim detail ke WhatsApp ↗</a>` : '<p class="field-help">Nomor WhatsApp toko belum diatur.</p>'}`);
  }
  function searchToShop(value) { shopState.query = String(value || '').trim(); shopState.category = 'Semua kategori'; location.hash = '#shop'; }
  function updateAccountError(text) { const box = $('#accountError'); if (box) { box.textContent = text; box.classList.toggle('hidden', !text); } }

  $('#menuToggle').addEventListener('click', () => {
    const open = !$('#sidebar').classList.contains('is-open');
    $('#sidebar').classList.toggle('is-open', open); $('#mobileScrim').classList.toggle('is-open', open); $('#menuToggle').setAttribute('aria-expanded', String(open));
  });
  $('#mobileScrim').addEventListener('click', closeMobileMenu);
  $('#topCartButton').addEventListener('click', () => { location.hash = '#cart'; });
  $('#globalSearchForm').addEventListener('submit', event => { event.preventDefault(); searchToShop($('#globalSearch').value); });
  $('#globalSearch').addEventListener('input', () => { if (location.hash === '#shop') { shopState.query = $('#globalSearch').value; const pos = $('#globalSearch').selectionStart; render().then(() => { const field = $('#catalogSearch'); if (field) { field.focus({ preventScroll: true }); field.setSelectionRange(pos, pos); } }); } });
  main.addEventListener('input', event => {
    if (event.target.id === 'catalogSearch') { shopState.query = event.target.value; const pos = event.target.selectionStart; render().then(() => { const f = $('#catalogSearch'); if (f) { f.focus({ preventScroll: true }); f.setSelectionRange(pos, pos); } }); }
  });
  main.addEventListener('change', event => {
    if (event.target.id === 'categoryFilter') { shopState.category = event.target.value; render(); }
    if (event.target.id === 'sortProducts') { shopState.sort = event.target.value; render(); }
  });
  document.addEventListener('click', async event => {
    const add = event.target.closest('[data-add-cart]');
    if (add) {
      try {
        const id = add.dataset.addCart;
        const qty = add.dataset.detailAdd ? detailQty : 1;
        C.addToCart(id, qty); C.notify('Produk berhasil ditambahkan ke keranjang.'); updateCartIndicators();
        if (add.dataset.modalAdd) closeModal();
        if (location.hash === '#cart') render();
      } catch (error) { C.notify(error.message || 'Produk gagal ditambahkan.', 'error'); }
      return;
    }
    const detail = event.target.closest('[data-detail]'); if (detail) { showProductModal(detail.dataset.detail); return; }
    const cat = event.target.closest('[data-category]'); if (cat) { shopState.category = cat.dataset.category; shopState.query = ''; location.hash = '#shop'; return; }
    const change = event.target.closest('[data-cart-change]');
    if (change) { const current = C.cart().find(r => r.productId === change.dataset.id); if (!current) return; try { C.changeCartQuantity(change.dataset.id, current.quantity + Number(change.dataset.cartChange)); await render(); } catch (error) { C.notify(error.message, 'error'); } return; }
    const remove = event.target.closest('[data-cart-remove]'); if (remove) { if (window.confirm('Hapus produk ini dari keranjang?')) { C.removeFromCart(remove.dataset.cartRemove); render(); C.notify('Produk dihapus dari keranjang.'); } return; }
    const qtyBtn = event.target.closest('[data-detail-qty]'); if (qtyBtn) { const id = location.hash.split('/')[1]; const p = C.getProduct(id); if (p) { detailQty = Math.max(1, Math.min(p.stock || 1, detailQty + Number(qtyBtn.dataset.detailQty))); render(); } return; }
    const od = event.target.closest('[data-order-detail]'); if (od) { showOrderModal(od.dataset.orderDetail); return; }
    const mode = event.target.closest('[data-account-mode]'); if (mode) { accountMode = mode.dataset.accountMode; render(); return; }
    const close = event.target.closest('[data-modal-close]'); if (close) { closeModal(); return; }
    const modalProduct = event.target.closest('[data-modal-go-product]'); if (modalProduct) { event.preventDefault(); closeModal(); location.hash = `#product/${modalProduct.dataset.modalGoProduct}`; return; }
    if (event.target.closest('#logoutAccount')) { C.clearAccount(); render(); C.notify('Kamu sudah keluar dari akun lokal.'); return; }
  });
  main.addEventListener('submit', async event => {
    if (event.target.id === 'checkoutForm') {
      event.preventDefault(); const form = event.target; const errorBox = $('#checkoutError'); errorBox.classList.add('hidden');
      if (!form.reportValidity()) return;
      try {
        const order = C.createOrder({ name: $('#customerName').value, phone: $('#customerPhone').value, address: $('#customerAddress').value, note: $('#customerNote').value });
        C.notify(`Pesanan ${order.id} disimpan di browser ini.`); location.hash = '#orders';
      } catch (error) { errorBox.textContent = error.message || 'Pesanan gagal dibuat.'; errorBox.classList.remove('hidden'); }
    }
    if (event.target.id === 'accountForm') {
      event.preventDefault(); const form = event.target; updateAccountError(''); if (!form.reportValidity()) return;
      const email = $('#accountEmail').value.trim().toLowerCase(); const password = $('#accountPassword').value;
      if (password.length < 8) return updateAccountError('Kata sandi harus minimal 8 karakter.');
      try {
        const usersRaw = C.read(C.keys.users, []); const users = Array.isArray(usersRaw) ? usersRaw : [];
        const hash = await C.hashPassword(password);
        if (accountMode === 'register') {
          const name = $('#accountName').value.trim();
          if (name.length < 2) return updateAccountError('Nama harus minimal 2 karakter.');
          if (users.some(u => u.email === email)) return updateAccountError('Email sudah terdaftar pada browser ini. Silakan masuk.');
          users.push({ id: C.id('USR'), name: name.slice(0, 100), email, passwordHash: hash, createdAt: new Date().toISOString() });
          if (!C.write(C.keys.users, users)) return updateAccountError('Data akun gagal disimpan pada browser.');
          C.setAccount({ name, email, userId: users[users.length - 1].id });
          C.notify('Akun lokal berhasil dibuat.'); location.hash = '#home';
        } else {
          const user = users.find(u => u.email === email && u.passwordHash === hash);
          if (!user) return updateAccountError('Email atau kata sandi tidak cocok dengan akun lokal.');
          C.setAccount({ name: user.name, email: user.email, userId: user.id }); C.notify('Berhasil masuk ke akun lokal.'); location.hash = '#home';
        }
      } catch (error) { updateAccountError(error.message || 'Browser tidak mendukung proses hash kata sandi. Gunakan link HTTPS GitHub Pages.'); }
    }
  });
  if (modal) modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  window.addEventListener('hashchange', () => { detailQty = 1; render(); });
  window.addEventListener('crystal:storage', event => {
    if ([C.keys.products, C.keys.cart, C.keys.settings, C.keys.categories, C.keys.orders, C.keys.account].includes(event.detail && event.detail.key)) {
      updateCartIndicators(); updateGlobalBrand();
      if (!modal.open) render();
    }
  });
  window.addEventListener('storage', event => {
    if ([C.keys.products, C.keys.cart, C.keys.settings, C.keys.categories, C.keys.orders, C.keys.account].includes(event.key) || event.key === null) {
      updateCartIndicators(); updateGlobalBrand();
      if (!modal.open) render();
    }
  });
  if (!C.storagePersistent()) C.notify('Penyimpanan browser tidak tersedia. Data mungkin tidak bertahan setelah halaman ditutup.', 'error');
  render();
})();
