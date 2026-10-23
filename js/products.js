/* Product catalogue and inventory rules. */
(() => {
  'use strict';
  const S = window.SkyStore;
  function all() { return S.get('products').filter(p => p && p.id && p.name); }
  function byId(id) { return all().find(p => p.id === id) || null; }
  function save(list) { return S.set('products', list); }
  function valid(input, existingId='') {
    const name = String(input.name || '').trim();
    const price = Number(input.price);
    const stock = Number(input.stock);
    if (!name) return 'Nama produk wajib diisi.';
    if (!Number.isFinite(price) || price < 0) return 'Harga harus berupa angka nol atau lebih.';
    if (!Number.isInteger(stock) || stock < 0) return 'Stok harus berupa bilangan bulat nol atau lebih.';
    if (!String(input.category || '').trim()) return 'Kategori wajib diisi.';
    if (name.length > 120) return 'Nama produk maksimal 120 karakter.';
    return '';
  }
  function upsert(input) {
    const list = all();
    const existing = input.id ? list.find(p => p.id === input.id) : null;
    const error = valid(input, input.id || '');
    if (error) return { ok: false, error };
    const product = {
      id: existing ? existing.id : S.id('prd'), name: String(input.name).trim(),
      price: Math.round(Number(input.price)), category: String(input.category).trim(),
      description: String(input.description || '').trim(), stock: Number(input.stock),
      image: S.safeImage(input.image || ''), featured: Boolean(input.featured),
      available: input.available !== false, updatedAt: new Date().toISOString(),
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };
    const next = existing ? list.map(p => p.id === existing.id ? product : p) : [product, ...list];
    if (!save(next)) return { ok: false, error: 'Produk tidak tersimpan. Periksa ruang penyimpanan browser.' };
    return { ok: true, product };
  }
  function remove(id) {
    const list = all(); const next = list.filter(p => p.id !== id);
    if (next.length === list.length) return false;
    return save(next);
  }
  function categories() {
    const configured = S.get('settings').categories;
    const known = [...(Array.isArray(configured) ? configured : []), ...all().map(p => p.category)];
    return [...new Set(known.map(c => String(c || '').trim()).filter(Boolean))];
  }
  function countForCategory(category) { return all().filter(p => p.available !== false && p.category === category).length; }
  window.SkyProducts = { all, byId, save, valid, upsert, remove, categories, countForCategory };
})();
