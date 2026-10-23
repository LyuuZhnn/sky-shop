(() => {
  'use strict';
  const C = window.Crystal = window.Crystal || {};
  C.products = function () {
    const rows = C.read(C.keys.products, []);
    if (!Array.isArray(rows)) return [];
    return rows.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string').map(p => ({
      id: p.id, name: p.name.slice(0, 140), price: Math.max(0, Number(p.price) || 0),
      category: String(p.category || 'Lainnya'), description: String(p.description || ''),
      image: C.safeImage(p.image), stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
      featured: p.featured === true, active: p.active !== false, createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || p.createdAt || new Date().toISOString()
    }));
  };
  C.getProduct = id => C.products().find(p => p.id === String(id)) || null;
  C.saveProducts = products => C.write(C.keys.products, products);
  C.upsertProduct = function (input) {
    const name = String(input.name || '').trim();
    const price = Number(input.price);
    const stock = Number(input.stock);
    if (!name) throw new Error('Nama produk wajib diisi.');
    if (!Number.isFinite(price) || price < 0) throw new Error('Harga harus berupa angka nol atau lebih.');
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) throw new Error('Stok harus berupa bilangan bulat nol atau lebih.');
    const products = C.products();
    const existing = input.id ? products.find(p => p.id === input.id) : null;
    const product = {
      id: existing ? existing.id : C.id('PRD'), name: name.slice(0, 140), price,
      category: String(input.category || 'Lainnya').trim() || 'Lainnya',
      description: String(input.description || '').trim().slice(0, 3000), image: C.safeImage(input.image),
      stock, featured: input.featured === true, active: input.active !== false,
      createdAt: existing ? existing.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    const next = existing ? products.map(p => p.id === existing.id ? product : p) : [product, ...products];
    if (!C.saveProducts(next)) throw new Error('Penyimpanan browser gagal. Periksa ruang penyimpanan atau izin browser.');
    return product;
  };
  C.deleteProduct = function (id) {
    const next = C.products().filter(p => p.id !== String(id));
    // Keep historical order item snapshots; remove only from live catalog and cart.
    const cart = C.read(C.keys.cart, []);
    C.write(C.keys.cart, Array.isArray(cart) ? cart.filter(item => item.productId !== String(id)) : []);
    return C.saveProducts(next);
  };
  C.categoryCounts = function () {
    const counts = Object.create(null);
    C.products().filter(p => p.active).forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  };
})();
