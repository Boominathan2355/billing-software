import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPlus, LuChevronRight, LuMail, LuMapPin } from 'react-icons/lu';
import api from '../api/client';
import type { Customer } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';
import { SkeletonCardList } from '../components/Skeleton';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);

  // Form state
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [address, setAddress] = useState('');
  const [error, setError]     = useState('');

  const load = () =>
    api.get('/customers').then(r => { setCustomers(r.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const addCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customers', { name, phone, email: email || undefined, address: address || undefined });
      setName(''); setPhone(''); setEmail(''); setAddress('');
      setShowAdd(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error adding customer');
    }
  };

  return (
    <div>
      <div className="page-content fade-up">
        <div className="page-header">
          <h1 className="page-title">Customers</h1>
          <button className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 13 }}
            onClick={() => setShowAdd(true)}>
            <LuPlus size={16} /> Add
          </button>
        </div>

        {loading && <SkeletonCardList count={5} />}

        {customers.map(c => (
          <div key={c._id} className="card" style={{ marginBottom: 10, cursor: 'pointer' }}
            onClick={() => navigate(`/customers/${c._id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 18, color: '#fff', flexShrink: 0,
              }}>
                {c.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.phone}</div>
                {c.email && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <LuMail size={11} /> {c.email}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <span className={c.balance > 0 ? 'badge-green' : c.balance < 0 ? 'badge-red' : 'badge-muted'}>
                  ₹ {Math.abs(c.balance).toFixed(0)}
                </span>
                <LuChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          </div>
        ))}

        {!loading && customers.length === 0 && (
          <div className="empty">No customers yet. Add one!</div>
        )}
        <div style={{ height: 24 }} />
      </div>

      <BottomNav />

      {showAdd && (
        <Modal title="New Customer" onClose={() => setShowAdd(false)}>
          <form onSubmit={addCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && <div className="error-box">{error}</div>}

            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile number" required />
            </div>
            <div>
              <label className="label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <LuMail size={15} />
                </span>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div>
              <label className="label">Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <LuMapPin size={15} />
                </span>
                <textarea
                  className="input"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, City..."
                  rows={2}
                  style={{ paddingLeft: 36, resize: 'none', lineHeight: '1.5' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Add Customer</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
