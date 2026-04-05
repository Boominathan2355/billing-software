import { useEffect, useMemo, useState } from 'react';
import { LuPlus, LuPencil, LuTrash2, LuTag, LuShoppingBag, LuSearch } from 'react-icons/lu';
import { productsApi } from '../api/services';
import type { Product } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';
import { SkeletonBlock } from '../components/Skeleton';

export default function InventoryPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState('');
  const [opError, setOpError]           = useState('');
  const [search, setSearch]             = useState('');
  const [showAdd, setShowAdd]           = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [editId, setEditId]             = useState('');
  const [saving, setSaving]             = useState(false);

  // Add form
  const [pName, setPName]                     = useState('');
  const [pUnit, setPUnit]                     = useState('');
  const [pStock, setPStock]                   = useState('');
  const [pPrice, setPPrice]                   = useState('');
  const [pPurchasePrice, setPPurchasePrice]   = useState('');

  // Edit form
  const [epName, setEpName]                   = useState('');
  const [epUnit, setEpUnit]                   = useState('');
  const [epStock, setEpStock]                 = useState('');
  const [epPrice, setEpPrice]                 = useState('');
  const [epPurchasePrice, setEpPurchasePrice] = useState('');

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

  // ─── Filtered list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.unitName.toLowerCase().includes(q)
    );
  }, [products, search]);

  // ─── Add ──────────────────────────────────────────────────────────
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setOpError('');
    try {
      await productsApi.create({
        name: pName,
        unitName: pUnit,
        freeStock: parseFloat(pStock) || 0,
        price: parseFloat(pPrice) || 0,
        purchasePrice: parseFloat(pPurchasePrice) || 0,
      });
      setPName(''); setPUnit(''); setPStock(''); setPPrice(''); setPPurchasePrice('');
      setShowAdd(false);
      load();
    } catch (err: any) {
      setOpError(err.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────
  const openEdit = (p: Product) => {
    setOpError('');
    setEditId(p._id);
    setEpName(p.name);
    setEpUnit(p.unitName);
    setEpStock(String(p.freeStock ?? 0));
    setEpPrice(String(p.price ?? 0));
    setEpPurchasePrice(String(p.purchasePrice ?? 0));
    setShowEdit(true);
  };

  const editProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError('');
    setSaving(true);
    try {
      await productsApi.update(editId, {
        name: epName,
        unitName: epUnit,
        freeStock: parseFloat(epStock) || 0,
        price: parseFloat(epPrice) || 0,
        purchasePrice: parseFloat(epPurchasePrice) || 0,
      });
      setShowEdit(false);
      load();
    } catch (err: any) {
      setOpError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
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

  // ─── Margin helper ────────────────────────────────────────────────
  const margin = (p: Product) => {
    const sell = p.price ?? 0;
    const buy  = p.purchasePrice ?? 0;
    if (!buy || !sell) return null;
    return (((sell - buy) / buy) * 100).toFixed(1);
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
            onClick={() => { setOpError(''); setShowAdd(true); }}
          >
            <LuPlus size={16} /> Product
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}><LuSearch size={16} /></span>
          <input
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Error banner (op errors) */}
        {opError && (
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
        {loading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SkeletonBlock w="50%" h={17} />
                  <SkeletonBlock w={44} h={44} radius={12} />
                </div>
                <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <SkeletonBlock w={80} h={36} radius={10} />
                  <SkeletonBlock w={80} h={36} radius={10} />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Product cards */}
        {!loading && filtered.map(p => (
          <div key={p._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.name}
                  <button
                    title="Edit product"
                    style={{ color: '#3b82f6', background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
                    onClick={() => openEdit(p)}
                  >
                    <LuPencil size={14} />
                  </button>
                  <button
                    title="Delete product"
                    style={{ color: '#ef4444', background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
                    onClick={() => deleteProduct(p._id)}
                  >
                    <LuTrash2 size={14} />
                  </button>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Unit: {p.unitName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: (p.freeStock ?? 0) > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {p.freeStock ?? 0}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.unitName} free</div>
              </div>
            </div>

            {/* Price row */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 16 }}>
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
        ))}

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

      {/* ── Add Modal ──────────────────────────────────────── */}
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

      {/* ── Edit Modal ─────────────────────────────────────── */}
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
    </div>
  );
}
