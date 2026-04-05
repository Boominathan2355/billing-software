import { useEffect, useMemo, useState } from 'react';
import {
  LuPlus, LuPencil, LuTrash2, LuTag, LuShoppingBag,
  LuSearch, LuArrowDownUp, LuPackagePlus, LuTriangleAlert,
} from 'react-icons/lu';
import { productsApi } from '../api/services';
import type { Product } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';
import { SkeletonBlock } from '../components/Skeleton';

type SortKey = 'name' | 'stock' | 'price';

const LOW_STOCK_DEFAULT = 5;

export default function InventoryPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState('');
  const [opError, setOpError]           = useState('');
  const [search, setSearch]             = useState('');
  const [sort, setSort]                 = useState<SortKey>('name');
  const [saving, setSaving]             = useState(false);

  // Modal visibility
  const [showAdd, setShowAdd]           = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [showStockIn, setShowStockIn]   = useState(false);
  const [stockInProduct, setStockInProduct] = useState<Product | null>(null);

  // Add form
  const [pName, setPName]                     = useState('');
  const [pUnit, setPUnit]                     = useState('');
  const [pStock, setPStock]                   = useState('');
  const [pPrice, setPPrice]                   = useState('');
  const [pPurchasePrice, setPPurchasePrice]   = useState('');

  // Edit form
  const [editId, setEditId]                   = useState('');
  const [epName, setEpName]                   = useState('');
  const [epUnit, setEpUnit]                   = useState('');
  const [epStock, setEpStock]                 = useState('');
  const [epPrice, setEpPrice]                 = useState('');
  const [epPurchasePrice, setEpPurchasePrice] = useState('');

  // Stock-In form
  const [siQty, setSiQty]                     = useState('');
  const [siPurchasePrice, setSiPurchasePrice] = useState('');

  // ─── Load ─────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ─── Filtered + sorted list ───────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.unitName.toLowerCase().includes(q)
      );
    }
    if (sort === 'name')  list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'stock') list.sort((a, b) => (a.freeStock ?? 0) - (b.freeStock ?? 0));
    if (sort === 'price') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return list;
  }, [products, search, sort]);

  const lowCount = products.filter(p => (p.freeStock ?? 0) <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT)).length;

  // ─── Helpers ──────────────────────────────────────────────────────
  const openModal = (set: (v: boolean) => void) => {
    setOpError('');
    set(true);
  };

  const margin = (p: Product) => {
    const sell = p.price ?? 0;
    const buy  = p.purchasePrice ?? 0;
    if (!buy || !sell) return null;
    return (((sell - buy) / buy) * 100).toFixed(1);
  };

  const isLowStock = (p: Product) =>
    (p.freeStock ?? 0) <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT);

  // ─── Add ──────────────────────────────────────────────────────────
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setOpError('');
    try {
      await productsApi.create({
        name: pName, unitName: pUnit,
        freeStock: parseFloat(pStock) || 0,
        price: parseFloat(pPrice) || 0,
        purchasePrice: parseFloat(pPurchasePrice) || 0,
      });
      setPName(''); setPUnit(''); setPStock(''); setPPrice(''); setPPurchasePrice('');
      setShowAdd(false);
      load();
    } catch (err: any) {
      setOpError(err.message || 'Failed to add product');
    } finally { setSaving(false); }
  };

  // ─── Edit ─────────────────────────────────────────────────────────
  const openEdit = (p: Product) => {
    setOpError('');
    setEditId(p._id);
    setEpName(p.name); setEpUnit(p.unitName);
    setEpStock(String(p.freeStock ?? 0));
    setEpPrice(String(p.price ?? 0));
    setEpPurchasePrice(String(p.purchasePrice ?? 0));
    setShowEdit(true);
  };

  const editProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setOpError('');
    try {
      await productsApi.update(editId, {
        name: epName, unitName: epUnit,
        freeStock: parseFloat(epStock) || 0,
        price: parseFloat(epPrice) || 0,
        purchasePrice: parseFloat(epPurchasePrice) || 0,
      });
      setShowEdit(false);
      load();
    } catch (err: any) {
      setOpError(err.message || 'Failed to update product');
    } finally { setSaving(false); }
  };

  // ─── Delete ───────────────────────────────────────────────────────
  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setOpError('');
    try {
      await productsApi.delete(id);
      load();
    } catch (err: any) {
      setOpError(err.message || 'Failed to delete product. It may be linked to existing bills.');
    }
  };

  // ─── Stock-In ─────────────────────────────────────────────────────
  const openStockIn = (p: Product) => {
    setOpError('');
    setStockInProduct(p);
    setSiQty('');
    setSiPurchasePrice(String(p.purchasePrice ?? 0));
    setShowStockIn(true);
  };

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInProduct) return;
    const qty = parseFloat(siQty);
    if (!qty || qty <= 0) { setOpError('Enter a valid quantity'); return; }
    setSaving(true); setOpError('');
    try {
      const pp = parseFloat(siPurchasePrice);
      await productsApi.stockIn(
        stockInProduct._id,
        qty,
        !isNaN(pp) && pp >= 0 ? pp : undefined
      );
      setShowStockIn(false);
      load();
    } catch (err: any) {
      setOpError(err.message || 'Failed to add stock');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-content fade-up">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Inventory</h1>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 14px', fontSize: 13 }}
            onClick={() => openModal(setShowAdd)}
          >
            <LuPlus size={16} /> Product
          </button>
        </div>

        {/* Low stock banner */}
        {!loading && lowCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 14,
            color: 'var(--red)', fontSize: 13, fontWeight: 600,
          }}>
            <LuTriangleAlert size={16} />
            {lowCount} product{lowCount > 1 ? 's are' : ' is'} running low on stock
          </div>
        )}

        {/* Search + Sort row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
              <LuSearch size={15} />
            </span>
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input"
            style={{ width: 'auto', paddingRight: 32 }}
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            title="Sort by"
          >
            <option value="name">A–Z</option>
            <option value="stock">Low Stock</option>
            <option value="price">High Price</option>
          </select>
          <button
            className="btn btn-ghost"
            style={{ padding: '0 14px', fontSize: 13 }}
            onClick={() => setSort(s => s === 'name' ? 'stock' : 'name')}
            title="Toggle sort"
          >
            <LuArrowDownUp size={16} />
          </button>
        </div>

        {/* Op error */}
        {opError && !showAdd && !showEdit && !showStockIn && (
          <div className="error-box" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{opError}</span>
            <button onClick={() => setOpError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Load error */}
        {loadError && !loading && (
          <div className="error-box" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{loadError}</span>
            <button onClick={load} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Retry</button>
          </div>
        )}

        {/* Skeleton */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <SkeletonBlock w="55%" h={17} />
              <SkeletonBlock w={48} h={48} radius={12} />
            </div>
            <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <SkeletonBlock w={88} h={36} radius={10} />
              <SkeletonBlock w={88} h={36} radius={10} />
              <SkeletonBlock w={72} h={36} radius={10} />
            </div>
          </div>
        ))}

        {/* Product cards */}
        {!loading && filtered.map(p => {
          const low = isLowStock(p);
          return (
            <div key={p._id} className="card" style={{
              marginBottom: 12,
              borderLeft: low ? '3px solid var(--red)' : '3px solid transparent',
            }}>
              {/* Top row: name + actions + stock count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {p.name}
                    {low && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                        LOW
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>Unit: {p.unitName}</div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: '5px 10px', gap: 4 }}
                      onClick={() => openStockIn(p)}
                      title="Add incoming stock"
                    >
                      <LuPackagePlus size={13} /> Stock In
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: '5px 10px', gap: 4 }}
                      onClick={() => openEdit(p)}
                      title="Edit product"
                    >
                      <LuPencil size={13} /> Edit
                    </button>
                    <button
                      style={{ color: '#ef4444', background: 'none', border: 'none', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      onClick={() => deleteProduct(p._id)}
                      title="Delete product"
                    >
                      <LuTrash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stock badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: low ? 'var(--red)' : 'var(--green)' }}>
                    {p.freeStock ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.unitName} free</div>
                </div>
              </div>

              {/* Price row */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--blue)' }}><LuTag size={13} /></span>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sell</div>
                    <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 15 }}>₹ {(p.price ?? 0).toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}><LuShoppingBag size={13} /></span>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purchase</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: 15 }}>₹ {(p.purchasePrice ?? 0).toFixed(2)}</div>
                  </div>
                </div>
                {margin(p) && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                      background: parseFloat(margin(p)!) >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color:      parseFloat(margin(p)!) >= 0 ? 'var(--green)' : 'var(--red)',
                    }}>
                      {margin(p)}% margin
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty states */}
        {!loading && !loadError && products.length === 0 && (
          <div className="empty">No products yet. Add one!</div>
        )}
        {!loading && !loadError && products.length > 0 && filtered.length === 0 && (
          <div className="empty">No products match "{search}"</div>
        )}

        <div style={{ height: 24 }} />
      </div>

      <BottomNav />

      {/* ── Add Modal ─────────────────────────────────────── */}
      {showAdd && (
        <Modal title="New Product" onClose={() => { setShowAdd(false); setOpError(''); }}>
          <form onSubmit={addProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {opError && <div className="error-box">{opError}</div>}
            <div>
              <label className="label">Product Name</label>
              <input className="input" value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Sugar" required />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={pUnit} onChange={e => setPUnit(e.target.value)} placeholder="e.g. KG, Litre, Pcs" required />
            </div>
            <div>
              <label className="label">Initial Stock</label>
              <input className="input" type="number" step="0.01" min="0" value={pStock} onChange={e => setPStock(e.target.value)} placeholder="0" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Selling Price (₹)</label>
                <input className="input" type="number" step="0.01" min="0" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="0.00" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Purchase Price (₹)</label>
                <input className="input" type="number" step="0.01" min="0" value={pPurchasePrice} onChange={e => setPPurchasePrice(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ────────────────────────────────────── */}
      {showEdit && (
        <Modal title="Edit Product" onClose={() => { setShowEdit(false); setOpError(''); }}>
          <form onSubmit={editProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {opError && <div className="error-box">{opError}</div>}
            <div>
              <label className="label">Product Name</label>
              <input className="input" value={epName} onChange={e => setEpName(e.target.value)} placeholder="Product Name" required />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={epUnit} onChange={e => setEpUnit(e.target.value)} placeholder="e.g. KG, Litre, Pcs" required />
            </div>
            <div>
              <label className="label">Free Stock</label>
              <input className="input" type="number" step="0.01" min="0" value={epStock} onChange={e => setEpStock(e.target.value)} placeholder="0" required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Selling Price (₹)</label>
                <input className="input" type="number" step="0.01" min="0" value={epPrice} onChange={e => setEpPrice(e.target.value)} placeholder="0.00" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Purchase Price (₹)</label>
                <input className="input" type="number" step="0.01" min="0" value={epPurchasePrice} onChange={e => setEpPurchasePrice(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Stock-In Modal ────────────────────────────────── */}
      {showStockIn && stockInProduct && (
        <Modal
          title={`Stock In — ${stockInProduct.name}`}
          onClose={() => { setShowStockIn(false); setOpError(''); }}
        >
          <form onSubmit={handleStockIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {opError && <div className="error-box">{opError}</div>}

            {/* Current stock info */}
            <div style={{
              background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stock</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: isLowStock(stockInProduct) ? 'var(--red)' : 'var(--green)' }}>
                  {stockInProduct.freeStock ?? 0} {stockInProduct.unitName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Purchase</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>₹ {(stockInProduct.purchasePrice ?? 0).toFixed(2)}</div>
              </div>
            </div>

            <div>
              <label className="label">Incoming Quantity ({stockInProduct.unitName})</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0.01"
                value={siQty}
                onChange={e => setSiQty(e.target.value)}
                placeholder={`e.g. 50 ${stockInProduct.unitName}`}
                required
                autoFocus
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                New total will be: <strong>{((stockInProduct.freeStock ?? 0) + (parseFloat(siQty) || 0)).toFixed(2)} {stockInProduct.unitName}</strong>
              </div>
            </div>

            <div>
              <label className="label">Purchase Price per Unit (₹) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — updates cost price)</span></label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                value={siPurchasePrice}
                onChange={e => setSiPurchasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <button type="submit" className="btn btn-success btn-full" style={{ marginTop: 4 }} disabled={saving}>
              {saving ? 'Adding Stock…' : <><LuPackagePlus size={16} /> Add Stock</>}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
