(() => {
  'use strict';
  const C = window.Crystal = window.Crystal || {};
  C.cart = function () {
    const rows = C.read(C.keys.cart, []);
    if (!Array.isArray(rows)) return [];
    const products = C.products();
    return rows.filter(row => row && typeof row.productId === 'string').map(row => {
      const product = products.find(p => p.id === row.productId);
      return product ? { productId: product.id, quantity: Math.max(1, Math.min(Math.floor(Number(row.quantity) || 1), Math.max(1, product.stock))), product } : null;
    }).filter(Boolean);
  };
  C.saveCart = rows => C.write(C.keys.cart, rows.map(row => ({ productId: row.productId, quantity: row.quantity })));
  C.cartCount = () => C.cart().reduce((sum, row) => sum + row.quantity, 0);
  C.cartSubtotal = () => C.cart().reduce((sum, row) => sum + row.product.price * row.quantity, 0);
  C.addToCart = function (productId, quantity = 1) {
    const product = C.getProduct(productId);
    if (!product || !product.active) throw new Error('Produk tidak tersedia.');
    const qty = Math.floor(Number(quantity));
    if (!Number.isInteger(qty) || qty < 1) throw new Error('Jumlah barang tidak valid.');
    if (product.stock < 1) throw new Error('Stok produk sedang habis.');
    const rows = C.read(C.keys.cart, []);
    const cart = Array.isArray(rows) ? rows.filter(row => row && typeof row.productId === 'string') : [];
    const found = cart.find(row => row.productId === product.id);
    const nextQuantity = (found ? Math.floor(Number(found.quantity) || 0) : 0) + qty;
    if (nextQuantity > product.stock) throw new Error(`Stok tersedia hanya ${product.stock} unit.`);
    if (found) found.quantity = nextQuantity; else cart.push({ productId: product.id, quantity: qty });
    if (!C.saveCart(cart)) throw new Error('Keranjang gagal disimpan di browser.');
    return true;
  };
  C.changeCartQuantity = function (productId, quantity) {
    const product = C.getProduct(productId);
    if (!product) throw new Error('Produk sudah tidak tersedia.');
    const qty = Math.floor(Number(quantity));
    const rows = C.read(C.keys.cart, []);
    const cart = Array.isArray(rows) ? rows.filter(row => row && typeof row.productId === 'string') : [];
    if (qty < 1) return C.removeFromCart(productId);
    if (qty > product.stock) throw new Error(`Stok tersedia hanya ${product.stock} unit.`);
    const found = cart.find(row => row.productId === product.id);
    if (!found) return false;
    found.quantity = qty;
    if (!C.saveCart(cart)) throw new Error('Keranjang gagal disimpan di browser.');
    return true;
  };
  C.removeFromCart = function (productId) {
    const rows = C.read(C.keys.cart, []);
    const next = (Array.isArray(rows) ? rows : []).filter(row => row && row.productId !== String(productId));
    return C.saveCart(next);
  };
  C.clearCart = () => C.saveCart([]);
  C.validateCart = function () {
    const rows = C.cart();
    if (!rows.length) throw new Error('Keranjang masih kosong.');
    rows.forEach(({ product, quantity }) => {
      if (!product.active || product.stock < 1) throw new Error(`${product.name} tidak tersedia saat ini.`);
      if (quantity > product.stock) throw new Error(`Jumlah ${product.name} melebihi stok tersedia.`);
    });
    return rows;
  };
})();
