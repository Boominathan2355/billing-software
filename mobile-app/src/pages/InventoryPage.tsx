import { useEffect, useState } from 'react';
import { LuPlus, LuPencil, LuTrash2, LuTag, LuShoppingBag } from 'react-icons/lu';
import api from '../api/client';
import type { Product } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';
import { SkeletonBlock } from '../components/Skeleton';

export default function InventoryPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [opError, setOpError]       = useState('');
  const [showAdd, setShowAdd]       = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [editId, setEditId]         = useState('');

  // Add form
  const [pName, setPName]               = useState('');
  const [pUnit, setPUnit]               = useState('');
  const [pStock, setPStock]             = useState('');
  const [pPrice, setPPrice]               = useState('');
  const [pPurchasePrice, setPPurchasePrice] = useState('');

  // Edit form
  const [epName, setEpName]               = useState('');
  const [epUnit, setEpUnit]               = useState('');
  const [epStock, setEpStock]             = useState('');
  const [epPrice, setEpPrice]               = useState('');
  const [epPurchasePrice, setEpPurchasePrice] = useState('');

  const load = () => api.get('/products').then(r => { setProducts(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', {
      name: pName,
      unitName: pUnit,
      freeStock: parseFloat(pStock) || 0,
      price: parseFloat(pPrice) || 0,
      purchasePrice: parseFloat(pPurchasePrice) || 0,
    });
    setPName(''); setPUnit(''); setPStock(''); setPPrice(''); setPPurchasePrice('');
    setShowAdd(false);
    load();
  };

  const openEdit = (p: Product) => {
    setEditId(p._id);
    setEpName(p.name);
    setEpUnit(p.unitName);
    setEpStock(p.freeStock.toString());
    setEpPrice((p.price ?? 0).toString());
    setEpPurchasePrice((p.purchasePrice ?? 0).toString());
    setShowEdit(true);
  };

  const editProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError('');
    try {
      await api.put(`/products/${editId}`, {
        name: epName,
        unitName: epUnit,
        freeStock: parseFloat(epStock) || 0,
        price: parseFloat(epPrice) || 0,
        purchasePrice: parseFloat(epPurchasePrice) || 0,
      });
      setShowEdit(false);
      load();
    } catch (err: any) {
      setOpError(err.response?.data?.error || 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setOpError('');
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err: any) {
      setOpError(err.response?.data?.error || 'Failed to delete product. It may have bills linked to it.');
    }
  };

  const margin = (p: Product) => {
    const sell = p.price ?? 0;
    const buy  = p.purchasePrice ?? 0;
    if (!buy || !sell) return null;
    return (((sell - buy) / buy) * 100).toFixed(1);
  };

  return (
    <div>
      <div className="page-content fade-up">
        <div className="page-header">
          <h1 className="page-title">Inventory</h1>
          <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: 13 }}
            onClick={() => setShowAdd(true)}>
            <LuPlus size={16} /> Product
          </button>
        </div>

        {opError && (
          <div className="error-box" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{opError}</span>
            <button onClick={() => setOpError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
          </div>
        )}

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

        {products.map(p => (
          <div key={p._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.name}
                  <button style={{ color: '#3b82f6', background: 'none', border: 'none', padding: 0 }} onClick={() => openEdit(p)}>
                    <LuPencil size={14} />
                  </button>
                  <button style={{ color: '#ef4444', background: 'none', border: 'none', padding: 0 }} onClick={() => deleteProduct(p._id)}>
                    <LuTrash2 size={14} />
                  </button>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Unit: {p.unitName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: p.freeStock > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {p.freeStock}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.unitName} free</div>
              </div>
            </div>

            {/* Price info */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--blue)' }}><LuTag size={13} /></span>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sell</div>
                  <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 15 }}>₹ {p.price ?? 0}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}><LuShoppingBag size={13} /></span>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purchase</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: 15 }}>₹ {p.purchasePrice ?? 0}</div>
                </div>
              </div>
              {margin(p) && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                    background: parseFloat(margin(p)!) >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: parseFloat(margin(p)!) >= 0 ? 'var(--green)' : 'var(--red)',
                  }}>
                    {margin(p)}% margin
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {!loading && products.length === 0 && (
          <div className="empty">No products yet. Add one!</div>
        )}
        <div style={{ height: 24 }} />
      </div>

      <BottomNav />

      {/* Add Modal */}
      {showAdd && (
        <Modal title="New Product" onClose={() => setShowAdd(false)}>
          <form onSubmit={addProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Product Name</label>
              <input className="input" value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Sugar" required />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={pUnit} onChange={e => setPUnit(e.target.value)} placeholder="e.g. KG" required />
            </div>
            <div>
              <label className="label">Initial Stock</label>
              <input className="input" type="number" step="0.01" value={pStock} onChange={e => setPStock(e.target.value)} placeholder="0" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Selling Price (₹)</label>
                <input className="input" type="number" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="0.00" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Purchase Price (₹)</label>
                <input className="input" type="number" step="0.01" value={pPurchasePrice} onChange={e => setPPurchasePrice(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Save Product</button>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title="Edit Product" onClose={() => setShowEdit(false)}>
          <form onSubmit={editProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Product Name</label>
              <input className="input" value={epName} onChange={e => setEpName(e.target.value)} placeholder="Product Name" required />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={epUnit} onChange={e => setEpUnit(e.target.value)} placeholder="Unit" required />
            </div>
            <div>
              <label className="label">Free Stock</label>
              <input className="input" type="number" step="0.01" value={epStock} onChange={e => setEpStock(e.target.value)} placeholder="0" required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Selling Price (₹)</label>
                <input className="input" type="number" step="0.01" value={epPrice} onChange={e => setEpPrice(e.target.value)} placeholder="0.00" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Purchase Price (₹)</label>
                <input className="input" type="number" step="0.01" value={epPurchasePrice} onChange={e => setEpPurchasePrice(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full">Save Changes</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
