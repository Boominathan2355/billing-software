import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../api/client';
import type { Product } from '../types';
import BottomNav from '../components/BottomNav';

export default function ConversionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [fromId, setFromId]     = useState('');
  const [fromQty, setFromQty]   = useState('');
  const [toId, setToId]         = useState('');
  const [toQty, setToQty]       = useState('');
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');

  useEffect(() => { api.get('/products').then(r => setProducts(r.data)); }, []);

  const convert = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/conversion', {
        fromProductId: fromId, fromQty: parseFloat(fromQty),
        toProductId: toId,   toQty: parseFloat(toQty),
      });
      const from = products.find(p => p._id === fromId);
      const to   = products.find(p => p._id === toId);
      setMsg(`✅ Converted ${fromQty} ${from?.unitName} of ${from?.name} → ${toQty} ${to?.unitName} of ${to?.name}`);
      setFromQty(''); setToQty('');
      // Reload to refresh stock levels
      api.get('/products').then(r => setProducts(r.data));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Conversion failed');
    }
  };

  const fromProduct = products.find(p => p._id === fromId);
  const toProduct   = products.find(p => p._id === toId);

  return (
    <div>
      <div className="page-content fade-up">
        <div className="page-header">
          <h1 className="page-title">Stock Conversion</h1>
        </div>

        {msg   && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--green)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, fontWeight: 600, fontSize: 14 }}>{msg}</div>}
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={convert}>
          {/* From */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', marginBottom: 12 }}>
              📤 Stock Out (From)
            </div>
            <label className="label">Product</label>
            <select className="input" value={fromId} onChange={e => setFromId(e.target.value)} required style={{ marginBottom: 12 }}>
              <option value="">Select product…</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (Available: {p.freeStock} {p.unitName})
                </option>
              ))}
            </select>
            {fromProduct && (
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Free Stock: <span style={{ color: 'var(--text)', fontWeight: 800 }}>{fromProduct.freeStock} {fromProduct.unitName}</span>
              </div>
            )}
            <label className="label">Decrease Qty</label>
            <input className="input" type="number" step="0.01" value={fromQty}
              onChange={e => setFromQty(e.target.value)} placeholder="0" required />
          </div>

          {/* Arrow divider */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowRight size={20} color="#fff" />
            </div>
          </div>

          {/* To */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green)', marginBottom: 12 }}>
              📥 Stock In (To)
            </div>
            <label className="label">Product</label>
            <select className="input" value={toId} onChange={e => setToId(e.target.value)} required style={{ marginBottom: 12 }}>
              <option value="">Select product…</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.freeStock} {p.unitName})</option>
              ))}
            </select>
            {toProduct && (
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Free Stock: <span style={{ color: 'var(--text)', fontWeight: 800 }}>{toProduct.freeStock} {toProduct.unitName}</span>
              </div>
            )}
            <label className="label">Increase Qty</label>
            <input className="input" type="number" step="0.01" value={toQty}
              onChange={e => setToQty(e.target.value)} placeholder="0" required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ fontSize: 16 }}>
            ⚡ Perform Conversion
          </button>
        </form>
        <div style={{ height: 24 }} />
      </div>
      <BottomNav />
    </div>
  );
}
