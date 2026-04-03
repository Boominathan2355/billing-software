import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/client';
import type { Product } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';

export default function InventoryPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showProd, setShowProd]     = useState(false);
  const [showVer, setShowVer]       = useState(false);

  // New product form
  const [pName, setPName]   = useState('');
  const [pUnit, setPUnit]   = useState('');
  const [pStock, setPStock] = useState('');

  // New version form
  const [vProd, setVProd]   = useState('');
  const [vName, setVName]   = useState('');
  const [vMult, setVMult]   = useState('');
  const [vPrice, setVPrice] = useState('');

  // Edit prod form
  const [showEditProd, setShowEditProd] = useState(false);
  const [editProdId, setEditProdId]     = useState('');
  const [epName, setEpName]             = useState('');
  const [epUnit, setEpUnit]             = useState('');
  const [epStock, setEpStock]           = useState('');

  // Edit ver form
  const [showEditVer, setShowEditVer]   = useState(false);
  const [editVerId, setEditVerId]       = useState('');
  const [evName, setEvName]             = useState('');
  const [evMult, setEvMult]             = useState('');
  const [evPrice, setEvPrice]           = useState('');

  const load = () => api.get('/products').then(r => { setProducts(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', { name: pName, unitName: pUnit, freeStock: parseFloat(pStock) });
    setPName(''); setPUnit(''); setPStock('');
    setShowProd(false);
    load();
  };

  const addVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/products/${vProd}/versions`, {
      name: vName, multiplier: parseFloat(vMult), price: parseFloat(vPrice),
    });
    setVName(''); setVMult(''); setVPrice('');
    setShowVer(false);
    load();
  };

  const editProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put(`/products/${editProdId}`, { name: epName, unitName: epUnit, freeStock: parseFloat(epStock) });
    setShowEditProd(false);
    load();
  };

  const deleteProduct = async (id: string, versionCount: number) => {
    if (versionCount > 0) return alert('Delete all versions first!');
    if (!confirm('Are you sure you want to delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const editVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put(`/products/versions/${editVerId}`, { name: evName, multiplier: parseFloat(evMult), price: parseFloat(evPrice) });
    setShowEditVer(false);
    load();
  };

  const deleteVersion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;
    await api.delete(`/products/versions/${id}`);
    load();
  };

  return (
    <div>
      <div className="page-content fade-up">
        <div className="page-header">
          <h1 className="page-title">Inventory</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: '10px 14px', fontSize: 13 }}
              onClick={() => setShowVer(true)}>
              <Plus size={16} /> Version
            </button>
            <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: 13 }}
              onClick={() => setShowProd(true)}>
              <Plus size={16} /> Product
            </button>
          </div>
        </div>

        {loading && <div className="spinner" />}

        {products.map(p => (
          <div key={p._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.name}
                  <button style={{ color: '#3b82f6', background: 'none', border: 'none', padding: 0 }} onClick={() => {
                    setEditProdId(p._id); setEpName(p.name); setEpUnit(p.unitName); setEpStock(p.freeStock.toString()); setShowEditProd(true);
                  }}>
                    <Edit2 size={14} />
                  </button>
                  {p.versions?.length === 0 && (
                    <button style={{ color: '#ef4444', background: 'none', border: 'none', padding: 0 }} onClick={() => deleteProduct(p._id, p.versions.length)}>
                      <Trash2 size={14} />
                    </button>
                  )}
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

            {p.versions?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div className="label" style={{ marginBottom: 8 }}>Versions</div>
                {p.versions.map(v => (
                  <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {v.name} (×{v.multiplier})
                      <button style={{ color: '#3b82f6', background: 'none', border: 'none', padding: 0 }} onClick={() => {
                        setEditVerId(v._id); setEvName(v.name); setEvMult(v.multiplier.toString()); setEvPrice(v.price.toString()); setShowEditVer(true);
                      }}>
                        <Edit2 size={13} />
                      </button>
                      <button style={{ color: '#ef4444', background: 'none', border: 'none', padding: 0 }} onClick={() => deleteVersion(v._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--blue)' }}>₹ {v.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {!loading && products.length === 0 && (
          <div className="empty">No products yet. Add one!</div>
        )}
        <div style={{ height: 24 }} />
      </div>

      <BottomNav />

      {showProd && (
        <Modal title="New Product" onClose={() => setShowProd(false)}>
          <form onSubmit={addProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Material Name</label>
              <input className="input" value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Sugar" required />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={pUnit} onChange={e => setPUnit(e.target.value)} placeholder="e.g. KG" required />
            </div>
            <div>
              <label className="label">Initial Free Stock</label>
              <input className="input" type="number" step="0.01" value={pStock} onChange={e => setPStock(e.target.value)} placeholder="0" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Save Product</button>
          </form>
        </Modal>
      )}

      {showVer && (
        <Modal title="New Version" onClose={() => setShowVer(false)}>
          <form onSubmit={addVersion} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Product</label>
              <select className="input" value={vProd} onChange={e => setVProd(e.target.value)} required>
                <option value="">Select product…</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Version Name</label>
              <input className="input" value={vName} onChange={e => setVName(e.target.value)} placeholder="e.g. 500g Pack" required />
            </div>
            <div>
              <label className="label">Multiplier</label>
              <input className="input" type="number" step="0.0001" value={vMult} onChange={e => setVMult(e.target.value)} placeholder="e.g. 0.5" required />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input className="input" type="number" value={vPrice} onChange={e => setVPrice(e.target.value)} placeholder="e.g. 45" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Link Version</button>
          </form>
        </Modal>
      )}

      {showEditProd && (
        <Modal title="Edit Product" onClose={() => setShowEditProd(false)}>
          <form onSubmit={editProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <input className="input" value={epName} onChange={e => setEpName(e.target.value)} placeholder="Material Name" required />
            </div>
            <div>
              <input className="input" value={epUnit} onChange={e => setEpUnit(e.target.value)} placeholder="Unit" required />
            </div>
            <div>
              <input className="input" type="number" step="0.01" value={epStock} onChange={e => setEpStock(e.target.value)} placeholder="Free Stock" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Save Changes</button>
          </form>
        </Modal>
      )}

      {showEditVer && (
        <Modal title="Edit Version" onClose={() => setShowEditVer(false)}>
          <form onSubmit={editVersion} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <input className="input" value={evName} onChange={e => setEvName(e.target.value)} placeholder="Version Name" required />
            </div>
            <div>
              <input className="input" type="number" step="0.0001" value={evMult} onChange={e => setEvMult(e.target.value)} placeholder="Multiplier" required />
            </div>
            <div>
              <input className="input" type="number" value={evPrice} onChange={e => setEvPrice(e.target.value)} placeholder="Price" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Save Changes</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
