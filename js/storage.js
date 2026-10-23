/* Crystal Store local-only persistence. No backend or cross-device sync. */
(() => {
  'use strict';
  const C = window.Crystal = window.Crystal || {};
  const PREFIX = 'crystal.store.v1.';
  const memory = Object.create(null);
  C.keys = Object.freeze({
    products: PREFIX + 'products', categories: PREFIX + 'categories', cart: PREFIX + 'cart',
    orders: PREFIX + 'orders', settings: PREFIX + 'settings', account: PREFIX + 'account',
    users: PREFIX + 'users', adminHash: PREFIX + 'admin.hash', adminName: PREFIX + 'admin.name', adminSession: PREFIX + 'admin.session'
  });
  C.defaultCategories = ['Elektronik', 'Fashion', 'Aksesoris', 'Rumah & Gaya Hidup', 'Kesehatan & Kecantikan', 'Lainnya'];
  C.defaultSettings = Object.freeze({
    storeName: 'Crystal Store', tagline: 'Curated for your life', description: 'Pilihan yang dikurasi untuk menemani keseharianmu. Tambahkan produk dan mulai bangun toko impianmu.',
    heroTitle: 'Temukan sesuatu yang <em>istimewa.</em>', heroDescription: 'Jelajahi koleksi pilihan yang dirancang untuk melengkapi gaya dan kebutuhan sehari-harimu.',
    heroKicker: 'YOUR EVERYDAY DISCOVERY', heroButton: 'Jelajahi koleksi', heroSecondButton: 'Kenali toko kami',
    logoUrl: '', bannerUrl: '', whatsapp: '', email: '', instagram: '', tiktok: '', address: '',
    shippingInfo: 'Informasi pengiriman dapat dikonfirmasi langsung dengan toko melalui WhatsApp.',
    paymentInfo: 'Metode pembayaran dikonfirmasi langsung dengan toko. Website ini tidak memproses pembayaran.',
    aboutIntro: 'Crystal Store adalah konsep toko online yang membantu pelanggan menemukan produk pilihan dalam pengalaman belanja yang praktis dan menyenangkan.',
    aboutVision: 'Menghadirkan pengalaman berbelanja yang mudah, jelas, dan nyaman.',
    aboutMission: 'Mengutamakan informasi produk yang transparan, layanan yang komunikatif, dan pengalaman digital yang mudah digunakan.',
    developer: '', featuredTitle: 'Pilihan untukmu', featuredDescription: 'Produk unggulan dari koleksi toko.', contactTitle: 'Ada yang ingin ditanyakan?', contactDescription: 'Hubungi toko untuk informasi produk, pengiriman, dan pembayaran.',
    promoTitle: '', promoDescription: '', promoBadge: 'INFO TOKO', promosEnabled: false, homeBenefitsEnabled: true, storeCategories: C.defaultCategories.slice()
  });
  C.clone = value => JSON.parse(JSON.stringify(value));
  C.read = function (key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return C.clone(fallback);
      const data = JSON.parse(raw);
      return data === null || typeof data === 'undefined' ? C.clone(fallback) : data;
    } catch (error) {
      console.warn('Crystal Store: data lokal tidak dapat dibaca.', error);
      try { return Object.prototype.hasOwnProperty.call(memory, key) ? C.clone(memory[key]) : C.clone(fallback); }
      catch (_) { return C.clone(fallback); }
    }
  };
  C.write = function (key, value) {
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      memory[key] = C.clone(value);
      window.dispatchEvent(new CustomEvent('crystal:storage', { detail: { key } }));
      return true;
    } catch (error) {
      console.warn('Crystal Store: data lokal tidak dapat disimpan.', error);
      try { memory[key] = C.clone(value); } catch (_) { /* ignore */ }
      return false;
    }
  };
  C.remove = function (key) {
    try { window.localStorage.removeItem(key); } catch (error) { console.warn(error); }
    delete memory[key];
    window.dispatchEvent(new CustomEvent('crystal:storage', { detail: { key } }));
  };
  C.settings = function () {
    const current = C.read(C.keys.settings, C.defaultSettings);
    return { ...C.clone(C.defaultSettings), ...(current && typeof current === 'object' && !Array.isArray(current) ? current : {}) };
  };
  C.saveSettings = settings => C.write(C.keys.settings, { ...C.settings(), ...settings });
  C.categories = function () {
    const cats = C.read(C.keys.categories, C.defaultCategories);
    return Array.isArray(cats) ? cats.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : C.defaultCategories.slice();
  };
  C.saveCategories = categories => C.write(C.keys.categories, Array.from(new Set(categories.map(x => String(x).trim()).filter(Boolean))));
  C.formatPrice = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
  C.formatDate = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'Tanggal tidak tersedia' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };
  C.escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  C.safeUrl = function (value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try { const url = new URL(raw, window.location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
    catch (_) { return ''; }
  };
  C.safeImage = function (value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(raw)) return raw;
    return C.safeUrl(raw);
  };
  C.id = prefix => `${prefix || 'CS'}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  C.notify = function (message, type = 'success') {
    const region = document.getElementById('toastRegion');
    if (!region) { window.alert(message); return; }
    const toast = document.createElement('div');
    toast.className = `toast${type === 'error' ? ' error' : ''}`;
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3800);
  };
  C.hashPassword = async function (password) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) throw new Error('Penyimpanan hash membutuhkan browser modern pada konteks HTTPS (GitHub Pages).');
    const bytes = new TextEncoder().encode(String(password));
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  };
  C.hasAdminPassword = () => Boolean(C.read(C.keys.adminHash, ''));
  C.isAdminSession = () => C.read(C.keys.adminSession, false) === true;
  C.logoutAdmin = () => C.write(C.keys.adminSession, false);
  C.account = () => C.read(C.keys.account, null);
  C.setAccount = account => C.write(C.keys.account, account);
  C.clearAccount = () => C.remove(C.keys.account);
  // Detect persistence limitations instead of silently pretending data was saved.
  C.storagePersistent = function () {
    try { const key = PREFIX + 'test'; window.localStorage.setItem(key, '1'); window.localStorage.removeItem(key); return true; }
    catch (_) { return false; }
  };
})();
