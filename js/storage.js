/* Sky Shop — guarded, versioned localStorage helpers. */
(() => {
  'use strict';
  const PREFIX = 'skyshop.v1.';
  const defaults = {
    settings: {
      storeName: 'Sky Shop', logoImage: '', slogan: 'Belanja lebih cerdas, pilihanmu lebih luas.',
      description: 'Temukan pilihan yang pas untuk kebutuhan dan gaya kamu. Jelajahi katalog, simpan favoritmu di keranjang, lalu pesan dengan mudah.',
      heroTitle: 'Pilihan tepat,\npengalaman belanja hebat.',
      heroText: 'Temukan produk pilihan untuk menemani aktivitasmu. Mulai dari sini, temukan yang cocok buat kamu.',
      heroImage: '', about: 'Sky Shop adalah konsep toko online yang dirancang untuk membuat pengalaman menjelajah produk terasa sederhana, nyaman, dan menyenangkan.',
      vision: 'Menjadi ruang belanja yang mudah dijelajahi, informatif, dan nyaman digunakan.',
      mission: 'Menyajikan informasi produk dengan jelas, proses pemesanan yang praktis, dan pengalaman yang mengutamakan kebutuhan pelanggan.',
      developer: 'Pengelola Sky Shop', whatsapp: '', email: '', instagram: '', tiktok: '',
      shippingInfo: 'Informasi pengiriman ditentukan oleh pengelola toko saat pesanan dikonfirmasi.',
      paymentMethods: 'Konfirmasi metode pembayaran langsung dengan pengelola toko.',
      categories: ['Elektronik', 'Fashion', 'Rumah & Gaya Hidup', 'Aksesori'],
      showFeatured: true, showLatest: true, announcement: ''
    }, products: [], cart: [], orders: [], users: [], session: null,
    preferences: { sidebarCollapsed: false, darkMode: false }
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function getRaw(key) { try { return window.localStorage.getItem(PREFIX + key); } catch (err) { return null; } }
  function get(key) {
    const fallback = defaults[key];
    try {
      const raw = getRaw(key);
      if (raw === null) return clone(fallback);
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return clone(fallback);
      if (fallback && !Array.isArray(fallback) && typeof fallback === 'object' && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) return clone(fallback);
      return parsed;
    } catch (err) { return clone(fallback); }
  }
  function set(key, value) {
    try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch (err) {
      const message = err && err.name === 'QuotaExceededError' ? 'Penyimpanan browser penuh. Hapus sebagian gambar atau data lokal.' : 'Browser tidak mengizinkan penyimpanan lokal. Coba gunakan browser biasa dengan penyimpanan aktif.';
      if (typeof window.skyToast === 'function') window.skyToast(message, 'error');
      return false;
    }
  }
  function reset(key) { try { window.localStorage.removeItem(PREFIX + key); return true; } catch (err) { return false; } }
  function id(prefix='id') { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function money(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0); }
  function escape(value='') { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function safeImage(value) {
    const src = String(value || '').trim();
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(src)) return src;
    if (/^(https:\/\/|\.\.\/|\.\/|assets\/|\/)/i.test(src) && !/^javascript:/i.test(src)) return src;
    return '';
  }
  function date(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  }
  window.SkyStore = { PREFIX, defaults, get, set, reset, id, money, escape, safeImage, date, clone };
})();
