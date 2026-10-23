/* Local order history only; no server sync is implied. */
(() => {
  'use strict';
  const S = window.SkyStore, P = window.SkyProducts, C = window.SkyCart;
  const STATUSES = ['Menunggu konfirmasi','Diproses','Dikirim','Selesai','Dibatalkan'];
  function all() { return S.get('orders').filter(o => o && o.id && Array.isArray(o.items)); }
  function byId(id) { return all().find(o => o.id === id) || null; }
  function create(customer) {
    const validation = C.validate(); if (validation) return {ok:false,error:validation};
    const cart = C.summary(); if (!cart.items.length) return {ok:false,error:'Keranjang masih kosong.'};
    const name = String(customer.name || '').trim(), phone = String(customer.phone || '').trim(), address = String(customer.address || '').trim();
    if (name.length < 2) return {ok:false,error:'Nama pelanggan minimal 2 karakter.'};
    if (!/^[+\d][\d\s().-]{7,19}$/.test(phone)) return {ok:false,error:'Masukkan nomor WhatsApp yang valid.'};
    if (address.length < 8) return {ok:false,error:'Alamat pengiriman terlalu singkat.'};
    const settings = S.get('settings');
    const order = {
      id: 'SS-' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '-' + Math.random().toString(36).slice(2,7).toUpperCase(),
      createdAt: new Date().toISOString(), status: 'Menunggu konfirmasi',
      customer: {name, phone, address, note:String(customer.note || '').trim()},
      items: cart.items.map(i => ({productId:i.product.id, name:i.product.name, price:i.product.price, qty:i.qty, image:i.product.image || ''})),
      subtotal: cart.subtotal, total: cart.subtotal, storeName: settings.storeName
    };
    const saved = S.set('orders',[order,...all()]);
    if (!saved) return {ok:false,error:'Pesanan tidak tersimpan di browser. Periksa penyimpanan perangkat.'};
    // Inventory is adjusted only in this browser; this is not a central stock system.
    const current = P.all();
    order.items.forEach(item => { const p = current.find(p => p.id === item.productId); if (p) p.stock = Math.max(0, p.stock - item.qty); });
    P.save(current);
    C.clear();
    window.dispatchEvent(new CustomEvent('sky:orders'));
    return {ok:true,order};
  }
  function updateStatus(id, status) {
    if (!STATUSES.includes(status)) return false;
    const orders = all(), target = orders.find(o => o.id === id); if (!target) return false;
    target.status = status; target.updatedAt = new Date().toISOString();
    const ok = S.set('orders',orders); if (ok) window.dispatchEvent(new CustomEvent('sky:orders')); return ok;
  }
  function remove(id) { const next = all().filter(o => o.id !== id); const ok = S.set('orders',next); if (ok) window.dispatchEvent(new CustomEvent('sky:orders')); return ok; }
  function stats() { const orders = all(); return { count:orders.length, waiting:orders.filter(o=>o.status==='Menunggu konfirmasi').length, processing:orders.filter(o=>o.status==='Diproses').length, delivered:orders.filter(o=>o.status==='Dikirim').length, completed:orders.filter(o=>o.status==='Selesai').length, total:orders.filter(o=>o.status!=='Dibatalkan').reduce((n,o)=>n+(Number(o.total)||0),0) }; }
  function message(order) {
    const s = S.get('settings');
    const items = order.items.map(i => `• ${i.name} x${i.qty} — ${S.money(i.price*i.qty)}`).join('\n');
    return `Halo ${s.storeName || 'Sky Shop'}, saya ingin mengonfirmasi pesanan berikut.\n\nNomor pesanan: ${order.id}\nNama: ${order.customer.name}\nWhatsApp: ${order.customer.phone}\nAlamat: ${order.customer.address}\n\nBarang:\n${items}\n\nSubtotal: ${S.money(order.subtotal)}\nTotal: ${S.money(order.total)}\nCatatan: ${order.customer.note || '-'}\n\nPesanan ini dibuat melalui website statis; mohon konfirmasi ketersediaan dan pembayaran.`;
  }
  window.SkyOrders = { STATUSES, all, byId, create, updateStatus, remove, stats, message };
})();
