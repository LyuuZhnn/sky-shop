/* Cart stays separate from account/session lifecycle. */
(() => {
  'use strict';
  const S = window.SkyStore, P = window.SkyProducts;
  function raw() { return S.get('cart').filter(i => i && i.productId && Number.isInteger(i.qty) && i.qty > 0); }
  function list() {
    return raw().map(i => ({ ...i, product: P.byId(i.productId) })).filter(i => i.product);
  }
  function save(items) { const ok = S.set('cart', items); if (ok) window.dispatchEvent(new CustomEvent('sky:cart')); return ok; }
  function add(id, qty=1) {
    const product = P.byId(id); if (!product) return { ok:false, error:'Produk tidak ditemukan.' };
    if (product.available === false || product.stock <= 0) return { ok:false, error:'Produk sedang tidak tersedia.' };
    qty = Math.floor(Number(qty)); if (!Number.isFinite(qty) || qty < 1) return { ok:false, error:'Jumlah barang tidak valid.' };
    const items = raw(); const current = items.find(i => i.productId === id); const target = (current ? current.qty : 0) + qty;
    if (target > product.stock) return { ok:false, error:`Stok ${product.name} hanya ${product.stock} barang.` };
    if (current) current.qty = target; else items.push({ productId:id, qty });
    return save(items) ? {ok:true} : {ok:false,error:'Keranjang belum dapat disimpan.'};
  }
  function setQty(id, qty) {
    const product = P.byId(id); qty = Math.floor(Number(qty));
    if (!product) return {ok:false,error:'Produk tidak ditemukan.'};
    if (!Number.isInteger(qty) || qty < 1) return remove(id) ? {ok:true} : {ok:false,error:'Perubahan tidak tersimpan.'};
    if (qty > product.stock) return {ok:false,error:`Stok tersedia ${product.stock} barang.`};
    const items = raw().map(i => i.productId === id ? {...i,qty} : i);
    return save(items) ? {ok:true} : {ok:false,error:'Perubahan tidak tersimpan.'};
  }
  function remove(id) { return save(raw().filter(i => i.productId !== id)); }
  function clear() { return save([]); }
  function summary() { const items = list(); return { count:items.reduce((n,i)=>n+i.qty,0), subtotal:items.reduce((n,i)=>n+i.qty*i.product.price,0), items }; }
  function validate() {
    for (const item of list()) {
      if (item.product.available === false || item.product.stock < item.qty) return `Stok ${item.product.name} berubah. Sesuaikan jumlah sebelum checkout.`;
    }
    return '';
  }
  window.SkyCart = { list, add, setQty, remove, clear, summary, validate };
})();
