import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuPencil, LuTrash2, LuMail, LuMapPin } from 'react-icons/lu';
import api from '../api/client';
import type { Customer, Transaction } from '../types';
import Modal from '../components/Modal';

export default function CustomerDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [history, setHistory]   = useState<Transaction[]>([]);
  const [amount, setAmount]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // Edit states
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName]         = useState('');
  const [editPhone, setEditPhone]       = useState('');
  const [editEmail, setEditEmail]       = useState('');
  const [editAddress, setEditAddress]   = useState('');

  const load = () =>
    api.get(`/customers/${id}`).then(r => {
      setCustomer(r.data.customer);
      setHistory(r.data.history);
      setLoading(false);
    });

  useEffect(() => { load(); }, [id]);

  const adjust = async (type: 'receive' | 'give') => {
    if (!amount || !customer) return;
    setSaving(true);
    await api.post(`/customers/${id}/adjust`, { amount: parseFloat(amount), type });
    setAmount('');
    setSaving(false);
    load();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.put(`/customers/${id}`, {
      name: editName, phone: editPhone,
      email: editEmail || undefined,
      address: editAddress || undefined,
    });
    setSaving(false);
    setShowEdit(false);
    load();
  };

  const handleDelete = async () => {
    if (history.length > 0) {
      alert('Cannot delete customer with transaction history');
      return;
    }
    if (!confirm('Are you sure you want to delete this customer?')) return;
    await api.delete(`/customers/${id}`);
    navigate('/customers');
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!customer) return <div className="empty">Customer not found</div>;

  const isDebt = customer.balance < 0;

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', padding: '20px 16px 32px' }}>
      <button className="back-btn" onClick={() => navigate('/customers')}>
        <LuArrowLeft size={18} /> Back
      </button>

      {/* Customer hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingRight: 10 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 26, color: '#fff', flexShrink: 0,
        }}>
          {customer.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>{customer.name}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{customer.phone}</div>
          {customer.email && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <LuMail size={12} /> {customer.email}
            </div>
          )}
          {customer.address && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <LuMapPin size={12} /> {customer.address}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ color: '#3b82f6', background: 'none', border: 'none', padding: 4 }}
            onClick={() => {
              setEditName(customer.name);
              setEditPhone(customer.phone);
              setEditEmail(customer.email || '');
              setEditAddress(customer.address || '');
              setShowEdit(true);
            }}>
            <LuPencil size={20} />
          </button>
          {history.length === 0 && (
            <button style={{ color: '#ef4444', background: 'none', border: 'none', padding: 4 }} onClick={handleDelete}>
              <LuTrash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Balance card */}
      <div style={{
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        background: isDebt ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
        border: `1px solid ${isDebt ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDebt ? 'var(--red)' : 'var(--green)', marginBottom: 4 }}>
          {isDebt ? 'Debt Amount' : 'Advance Balance'}
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: isDebt ? 'var(--red)' : 'var(--green)' }}>
          ₹ {Math.abs(customer.balance).toFixed(2)}
        </div>
      </div>

      {/* Adjust balance */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="label">Adjust Balance</label>
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ marginBottom: 12, fontSize: 22, textAlign: 'center', fontWeight: 800 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => adjust('give')} disabled={saving || !amount}>
            Give Credit
          </button>
          <button className="btn btn-success" style={{ flex: 1 }} onClick={() => adjust('receive')} disabled={saving || !amount}>
            Receive Cash
          </button>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <label className="label">Transaction History</label>
        {history.length === 0 && <div className="empty" style={{ padding: '24px 0' }}>No transactions yet</div>}
        {history.map(t => (
          <div key={t._id} className="row">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.details}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {new Date(t.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
            <span className={t.type === 'IN' ? 'amount-in' : 'amount-out'}>
              {t.type === 'IN' ? '+' : '-'}₹ {t.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="Edit Customer">
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Name</label>
              <input className="input" required value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone" />
            </div>
            <div>
              <label className="label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <label className="label">Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="input" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Street, City..." rows={2} style={{ resize: 'none' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
