(() => {
  'use strict';
  const C = window.Crystal = window.Crystal || {};
  const STATUSES = ['Menunggu konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
  C.orderStatuses = STATUSES.slice();
  C.orders = function () {
    const rows = C.read(C.keys.orders, []);
    return Array.isArray(rows) ? rows.filter(o => o && typeof o.id === 'string' && Array.isArray(o.items)).map(o => ({ ...o, total: Math.max(0, Number(o.total) || 0), status: STATUSES.includes(o.status) ? o.status : STATUSES[0] })) : [];
  };
  C.createOrder = function (customer) {
    const cart = C.validateCart();
    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    const address = String(customer.address || '').trim();
    if (name.length < 2) throw new Error('Masukkan nama pelanggan yang valid.');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 16) throw new Error('Nomor WhatsApp harus berisi 8–16 digit.');
    if (address.length < 8) throw new Error('Alamat pengiriman terlalu singkat.');
    const products = C.products();
    // Recheck current stocks and subtract atomically in the same browser tab.
    cart.forEach(row => {
      const current = products.find(p => p.id === row.productId);
      if (!current || current.stock < row.quantity || current.active !== true) throw new Error(`Stok ${row.product.name} berubah. Periksa kembali keranjang.`);
    });
    const items = cart.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.price, quantity, image: product.image || '', category: product.category }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      id: C.id('CS'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: STATUSES[0],
      customer: { name: name.slice(0, 120), phone: phone.slice(0, 40), address: address.slice(0, 1500), note: String(customer.note || '').trim().slice(0, 2000) },
      items, subtotal: total, shipping: 0, total, storageNote: 'Pesanan lokal pada browser ini; tidak terkirim ke server.'
    };
    const nextProducts = products.map(p => {
      const matching = cart.find(row => row.productId === p.id);
      return matching ? { ...p, stock: p.stock - matching.quantity, updatedAt: new Date().toISOString() } : p;
    });
    const newOrders = [order, ...C.orders()];
    // If storage isn't working, don't tell the customer the order was saved.
    if (!C.saveProducts(nextProducts)) throw new Error('Stok tidak dapat disimpan. Coba lagi setelah memeriksa penyimpanan browser.');
    if (!C.write(C.keys.orders, newOrders)) { C.saveProducts(products); throw new Error('Pesanan tidak dapat disimpan di browser. Perubahan stok dibatalkan; periksa penyimpanan lalu coba lagi.'); }
    C.clearCart();
    return order;
  };
  C.updateOrderStatus = function (id, status) {
    if (!STATUSES.includes(status)) throw new Error('Status pesanan tidak valid.');
    const orders = C.orders();
    const found = orders.find(o => o.id === String(id));
    if (!found) throw new Error('Pesanan tidak ditemukan pada browser ini.');
    found.status = status; found.updatedAt = new Date().toISOString();
    return C.write(C.keys.orders, orders);
  };
  C.deleteOrder = id => C.write(C.keys.orders, C.orders().filter(o => o.id !== String(id)));
  C.whatsappMessage = function (order) {
    const settings = C.settings();
    const lines = [
      `Halo ${settings.storeName || 'toko'}, saya ingin mengirim detail pesanan.`,
      `Nomor pesanan: ${order.id}`,
      `Tanggal: ${C.formatDate(order.createdAt)}`,
      '', 'Rincian barang:',
      ...order.items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} — ${C.formatPrice(item.price * item.quantity)}`),
      '', `Nama: ${order.customer.name}`, `WhatsApp pelanggan: ${order.customer.phone}`,
      `Alamat: ${order.customer.address}`, `Subtotal: ${C.formatPrice(order.subtotal)}`, `Total: ${C.formatPrice(order.total)}`,
      `Catatan: ${order.customer.note || '-'}`,
      '', 'Catatan: pesanan ini dibuat melalui website statis; mohon konfirmasi ketersediaan dan pembayaran.'
    ];
    return lines.join('\n');
  };
  C.whatsappUrl = function (order) {
    const digits = String(C.settings().whatsapp || '').replace(/\D/g, '');
    if (!digits) return '';
    return `https://wa.me/${digits}?text=${encodeURIComponent(C.whatsappMessage(order))}`;
  };
})();
