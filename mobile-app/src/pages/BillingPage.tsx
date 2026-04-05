import { useEffect, useState } from 'react';
import { LuPlus, LuTrash2, LuCircleCheck, LuCircleX, LuSave, LuFolderOpen, LuCoins, LuNotebook } from 'react-icons/lu';
import api from '../api/client';
import type { Customer, Product, BillItem } from '../types';
import BottomNav from '../components/BottomNav';
import Modal from '../components/Modal';

export default function BillingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);

  const [selectedCustomer, setSelectedCustomer]   = useState('');
  const [customerName, setCustomerName]           = useState('');
  const [customerPhone, setCustomerPhone]         = useState('');

  const [selectedProduct, setSelectedProduct]     = useState('');
  const [qty, setQty]                             = useState('');
  const [paymentType, setPaymentType]             = useState<'CASH' | 'UDHAAR'>('CASH');

  const [discountType, setDiscountType]           = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [discountValue, setDiscountValue]         = useState('');

  const [bill, setBill]                           = useState<BillItem[]>([]);
  const [draftId, setDraftId]                     = useState<string | null>(null);

  const [showHistory, setShowHistory]   = useState(false);
  const [history, setHistory]           = useState<any[]>([]);

  const [showDrafts, setShowDrafts]     = useState(false);
  const [drafts, setDrafts]             = useState<any[]>([]);

  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [printBillData, setPrintBillData] = useState<any>(null);

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data));
    api.get('/products').then(r => setProducts(r.data));
  }, []);

  const addItem = () => {
    const prod = products.find(p => p._id === selectedProduct);
    if (!prod || !qty) return;
    setBill(prev => [...prev, {
      productId: prod._id,
      productName: prod.name,
      qty: parseFloat(qty),
      price: prod.price,
      taxAmount: parseFloat(qty) * prod.price * (prod.taxRate || 0) / 100,
    }]);
    setQty('');
  };

  const subTotal = bill.reduce((s, i) => s + i.qty * i.price, 0);
  const totalTax = bill.reduce((s, i) => s + (i.taxAmount || 0), 0);
  const dVal = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'FLAT' ? dVal : subTotal * (dVal / 100);
  const total = Math.max(0, subTotal + totalTax - discountAmount);

  const saveBill = async (status: 'DRAFT' | 'COMPLETED' = 'COMPLETED') => {
    if (!bill.length) return;
    setSaving(true);

    const payload: any = {
      customerId: selectedCustomer || null,
      paymentType,
      items: bill.map(i => ({ productId: i.productId, qty: i.qty, price: i.price })),
      status,
    };
    if (!selectedCustomer) {
      if (customerName) payload.customerName = customerName;
      if (customerPhone) payload.customerPhone = customerPhone;
    }
    if (dVal > 0) {
      payload.discount = { type: discountType, value: dVal };
    }
    if (draftId) {
      payload.draftId = draftId;
    }

    try {
      const { data } = await api.post('/bills', payload);
      setSaving(false);
      setSaved(true);

      if (status === 'COMPLETED') {
        setPrintBillData(data);
        setTimeout(() => window.print(), 100);
      }

      resetForm();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message;
      alert('Failed to save bill: ' + errMsg);
      console.error('Save bill error:', err.response?.data || err);
      setSaving(false);
    }
  };

  const resetForm = () => {
    setBill([]);
    setSelectedCustomer('');
    setCustomerName('');
    setCustomerPhone('');
    setDiscountValue('');
    setDraftId(null);
  };

  const cancelBill = async (id: string, isDraft = false) => {
    if (!confirm('Are you sure you want to cancel this bill?')) return;
    if (isDraft) {
      await api.delete(`/bills/${id}`);
      loadDrafts();
    } else {
      await api.post(`/bills/${id}/cancel`);
      loadHistory();
    }
  };

  const loadHistory = async () => {
    const r = await api.get('/bills?status=COMPLETED');
    setHistory(r.data);
    setShowHistory(true);
  };

  const loadDrafts = async () => {
    const r = await api.get('/bills?status=DRAFT');
    setDrafts(r.data);
    setShowDrafts(true);
  };

  const resumeDraft = (d: any) => {
    setSelectedCustomer(d.customerId?._id || '');
    setCustomerName(d.customerName || '');
    setCustomerPhone(d.customerPhone || '');
    setPaymentType(d.paymentType);
    if (d.discount) {
      setDiscountType(d.discount.type);
      setDiscountValue(d.discount.value.toString());
    }
    setDraftId(d._id);
    setBill(d.items.map((i: any) => ({
      productId: i.productId,
      productName: i.productName,
      qty: i.qty,
      price: i.price,
      taxAmount: i.taxAmount,
    })));
    setShowDrafts(false);
  };

  const customer = customers.find(c => c._id === selectedCustomer);

  return (
    <div>
      {printBillData && (
        <div className="printable-receipt" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>INVOICE</h2>
            <div style={{ fontSize: 12 }}>{new Date(printBillData.date).toLocaleString()}</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>To: {printBillData.customerName}</div>
          </div>

          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '4px 0' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {printBillData.items.map((it: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px dashed #ccc' }}>
                  <td style={{ padding: '4px 0' }}>
                    <div>{it.productName}</div>
                    {it.taxAmount > 0 && <div style={{ fontSize: 10, color: '#555' }}>Inc. GST</div>}
                  </td>
                  <td style={{ textAlign: 'center', padding: '4px 0' }}>{it.qty}</td>
                  <td style={{ textAlign: 'right', padding: '4px 0' }}>Rs. {(it.qty * it.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '2px solid #000', paddingTop: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>Rs. {printBillData.subTotal.toFixed(2)}</span>
            </div>
            {printBillData.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST:</span>
                <span>Rs. {printBillData.taxAmount.toFixed(2)}</span>
              </div>
            )}
            {printBillData.discount?.amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount:</span>
                <span>- Rs. {printBillData.discount.amount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 'bold', marginTop: 4, paddingTop: 4, borderTop: '1px solid #000' }}>
              <span>Total:</span>
              <span>Rs. {printBillData.total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, fontStyle: 'italic' }}>
            Thank you for your business!
          </div>
        </div>
      )}

      <div className="page-content fade-up no-print">
        {/* Header */}
        <div className="page-header" style={{ alignItems: 'center' }}>
          <h1 className="page-title">Billing <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'normal' }}>{draftId ? ' (Resuming Draft)' : ''}</span></h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={loadDrafts}>
              <LuFolderOpen size={14} /> Drafts
            </button>
            <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={loadHistory}>
              History
            </button>
          </div>
        </div>

        {saved && (
          <div className="slide-down" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            color: 'var(--green)', borderRadius: 14, padding: '12px 18px', marginBottom: 16,
            fontWeight: 700,
          }}>
            <LuCircleCheck size={18} /> Bill saved successfully!
          </div>
        )}

        {/* Customer selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label className="label">Customer</label>
          <select className="input" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
            ))}
          </select>

          {!selectedCustomer && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <input type="text" className="input" placeholder="Ad-hoc Name (optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ flex: 1 }} />
              <input type="text" className="input" placeholder="Phone (optional)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ flex: 1 }} />
            </div>
          )}

          {customer && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="label" style={{ marginBottom: 0 }}>Balance:</span>
              <span className={customer.balance >= 0 ? 'badge-green' : 'badge-red'}>
                ₹ {Math.abs(customer.balance).toFixed(2)} {customer.balance >= 0 ? '(Advance)' : '(Debt)'}
              </span>
            </div>
          )}
        </div>

        {/* Add item row */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label className="label">Add Item</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
              <option value="">Select Product…</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} — ₹{p.price} (Stock: {p.freeStock} {p.unitName})</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="input"
                type="number"
                placeholder="Qty"
                value={qty}
                onChange={e => setQty(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={addItem} disabled={!selectedProduct || !qty}>
                <LuPlus size={18} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Bill items */}
        {bill.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <label className="label">Bill Items</label>
            {bill.map((item, idx) => (
              <div key={idx} className="row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{item.productName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Qty: {item.qty} × ₹{item.price}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--blue)' }}>
                  ₹ {(item.qty * item.price).toFixed(2)}
                </div>
                <button onClick={() => setBill(b => b.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>
                  <LuTrash2 size={18} />
                </button>
              </div>
            ))}

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>₹ {subTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>GST Tax</span>
                <span>₹ {totalTax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Disc:</span>
                <select className="input" style={{ width: 80, padding: 4 }} value={discountType} onChange={e => setDiscountType(e.target.value as any)}>
                  <option value="FLAT">₹ Flat</option>
                  <option value="PERCENTAGE">% Pct</option>
                </select>
                <input className="input" type="number" placeholder="Value" value={discountValue} onChange={e => setDiscountValue(e.target.value)} style={{ width: 80, padding: 4 }} />
                {discountAmount > 0 && <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--green)' }}>- ₹ {discountAmount.toFixed(2)}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Total Amount</span>
                <span style={{ fontWeight: 900, fontSize: 24, color: 'var(--text)' }}>₹ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment & save */}
        {bill.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <label className="label">Payment Type</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {(['CASH', 'UDHAAR'] as const).map(t => (
                <button
                  key={t}
                  className={`btn ${paymentType === t ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, fontSize: 14 }}
                  onClick={() => setPaymentType(t)}
                >
                  {t === 'CASH'
                    ? <><LuCoins size={17} /> Cash</>
                    : <><LuNotebook size={17} /> Udhaar</>}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => saveBill('DRAFT')} disabled={saving} style={{ flex: 1, fontSize: 16 }}>
                <LuSave size={18} /> Draft
              </button>
              <button className="btn btn-success" onClick={() => saveBill('COMPLETED')} disabled={saving} style={{ flex: 2, fontSize: 16 }}>
                {saving ? 'Saving…' : <><LuCircleCheck size={18} /> Save Bill</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="no-print">
        <BottomNav />
      </div>

      {/* History modal */}
      {showHistory && (
        <div className="no-print">
          <Modal title="Recent Bills" onClose={() => setShowHistory(false)}>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 20 }}>
              {history.length === 0 && <div className="empty">No completed bills yet</div>}
              {history.map(b => (
                <div key={b._id} className="row" style={{ opacity: b.cancelled ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      Bill to {b.customerName || (b.customerId ? b.customerId.name : 'Walk-in')}
                      {b.cancelled && <span style={{ color: 'red', marginLeft: 6, fontSize: 11 }}>[CANCELLED]</span>}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(b.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      <span style={{ marginLeft: 8 }}>· {b.paymentType}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--green)' }}>₹ {b.total.toFixed(2)}</div>
                    {!b.cancelled && (
                      <button onClick={() => cancelBill(b._id)} style={{ color: '#ef4444', background: 'none', border: 'none', padding: 0, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, marginLeft: 'auto', cursor: 'pointer' }}>
                        <LuCircleX size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        </div>
      )}

      {/* Drafts Modal */}
      {showDrafts && (
        <div className="no-print">
          <Modal title="Draft Bills" onClose={() => setShowDrafts(false)}>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 20 }}>
              {drafts.length === 0 && <div className="empty">No draft bills yet</div>}
              {drafts.map(b => (
                <div key={b._id} className="row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      Draft: {b.customerName || (b.customerId ? b.customerId.name : 'Walk-in')}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(b.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      <span style={{ marginLeft: 8 }}>· {b.items.length} items</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 800, color: 'var(--text)' }}>₹ {b.total.toFixed(2)}</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => cancelBill(b._id, true)} style={{ color: '#ef4444', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                        <LuTrash2 size={12} /> Discard
                      </button>
                      <button onClick={() => resumeDraft(b)} style={{ color: 'var(--blue)', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
