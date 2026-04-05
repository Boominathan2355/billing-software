import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LuPlus, LuTrendingUp, LuTrendingDown } from 'react-icons/lu';
import api from '../api/client';
import type { Transaction } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';

const CATEGORIES = ['Sale', 'Expense', 'Rent', 'Purchase', 'Salary', 'Other'];

export default function BooksPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);

  const [txnType, setTxnType]   = useState<'IN' | 'OUT'>('IN');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount]     = useState('');
  const [details, setDetails]   = useState('');

  const load = () =>
    api.get('/transactions').then(r => { setTransactions(r.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const addTxn = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/transactions', { type: txnType, category, amount: parseFloat(amount), details });
    setAmount(''); setDetails('');
    setShowAdd(false);
    load();
  };

  const totalIn  = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="page-content fade-up">
        <div className="page-header">
          <h1 className="page-title">Books</h1>
          <button className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 13 }} onClick={() => setShowAdd(true)}>
            <LuPlus size={16} /> Entry
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)' }}>₹ {totalIn.toFixed(0)}</div>
            <div className="stat-label">Total In</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--red)' }}>₹ {totalOut.toFixed(0)}</div>
            <div className="stat-label">Total Out</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: totalIn - totalOut >= 0 ? 'var(--green)' : 'var(--red)' }}>
              ₹ {Math.abs(totalIn - totalOut).toFixed(0)}
            </div>
            <div className="stat-label">{totalIn - totalOut >= 0 ? 'Profit' : 'Loss'}</div>
          </div>
        </div>

        {loading && <div className="spinner" />}

        <div className="card">
          {transactions.length === 0 && !loading && (
            <div className="empty" style={{ padding: '24px 0' }}>No transactions yet</div>
          )}
          {transactions.map(t => (
            <div key={t._id} className="row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 6,
                    background: t.type === 'IN' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: t.type === 'IN' ? 'var(--green)' : 'var(--red)',
                  }}>
                    {t.category}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.details}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {new Date(t.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <span className={t.type === 'IN' ? 'amount-in' : 'amount-out'} style={{ fontSize: 15, flexShrink: 0 }}>
                {t.type === 'IN' ? '+' : '-'}₹ {t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>

      <BottomNav />

      {showAdd && (
        <Modal title="Record Transaction" onClose={() => setShowAdd(false)}>
          <form onSubmit={addTxn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['IN', 'OUT'] as const).map(t => (
                <button type="button" key={t}
                  className={`btn ${txnType === t ? (t === 'IN' ? 'btn-success' : 'btn-danger') : 'btn-ghost'}`}
                  style={{ flex: 1, fontSize: 14 }} onClick={() => setTxnType(t)}>
                  {t === 'IN'
                    ? <><LuTrendingUp size={16} /> Money In</>
                    : <><LuTrendingDown size={16} /> Money Out</>}
                </button>
              ))}
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required style={{ fontSize: 20, fontWeight: 800 }} />
            </div>
            <div>
              <label className="label">Details</label>
              <input className="input" value={details} onChange={e => setDetails(e.target.value)} placeholder="Description…" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Save Transaction</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
