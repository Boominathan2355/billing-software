/**
 * BillPreviewModal
 *
 * Shown after a bill is saved successfully. Displays a full formatted
 * receipt with action buttons:
 *  - Print (browser print dialog)
 *  - Save as PDF (opens print dialog with PDF destination pre-suggested)
 *  - Share via WhatsApp (deep-link with text summary)
 *  - New Bill (clears form, closes modal)
 *  - Close (keeps form cleared too)
 */
import { useRef } from 'react';
import { LuPrinter, LuFileText, LuShare2, LuX, LuCircleCheck, LuPlus } from 'react-icons/lu';

interface BillItem {
  productName?: string;
  productId?: any;
  qty: number;
  price: number;
  taxAmount?: number;
}

interface PreviewBill {
  _id: string;
  date: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: { name: string; phone: string } | string;
  paymentType: string;
  items: BillItem[];
  subTotal: number;
  taxAmount: number;
  discount?: { type: string; value: number; amount: number };
  total: number;
}

interface Props {
  bill: PreviewBill;
  onClose: () => void;
  onNewBill: () => void;
}

export default function BillPreviewModal({ bill, onClose, onNewBill }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const customerDisplayName =
    bill.customerName ||
    (typeof bill.customerId === 'object' && bill.customerId ? bill.customerId.name : '') ||
    'Walk-in Customer';

  const customerPhone =
    bill.customerPhone ||
    (typeof bill.customerId === 'object' && bill.customerId ? bill.customerId.phone : '') ||
    '';

  const dateStr = new Date(bill.date).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  });

  // ── Actions ────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  const handlePDF = () => window.print();

  const handleWhatsApp = () => {
    const lines = [
      `*Invoice*`,
      `Date: ${dateStr}`,
      `Customer: ${customerDisplayName}`,
      ``,
      ...bill.items.map(i => `• ${i.productName || 'Item'} × ${i.qty} = ₹${(i.qty * i.price).toFixed(2)}`),
      ``,
      `Subtotal: ₹${bill.subTotal.toFixed(2)}`,
      bill.taxAmount > 0 ? `GST: ₹${bill.taxAmount.toFixed(2)}` : '',
      bill.discount?.amount ? `Discount: -₹${bill.discount.amount.toFixed(2)}` : '',
      `*Total: ₹${bill.total.toFixed(2)}*`,
      `Payment: ${bill.paymentType}`,
      ``,
      `_Thank you vist again!!_`,
    ].filter(Boolean).join('\n');

    const phone = customerPhone.replace(/\D/g, '');
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(lines)}`
      : `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.location.href = url;
  };

  return (
    <>
      <style>{`
        .glass-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media print {
          body > *:not(.printable-receipt) { display: none !important; }
          .printable-receipt { display: block !important; position: fixed; inset: 0; background: white; padding: 20px; color: black; font-family: monospace; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Modal Parent ────────────────────────── */}
      <div className="glass-overlay no-print" onClick={onClose}>
        
        {/* ── The Sheet ───────────────────────────── */}
        <div
          onClick={(e) => e.stopPropagation()} 
          style={{
            width: '100%', maxWidth: 400,
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px 20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            animation: 'modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--green)', display: 'flex' }}><LuCircleCheck size={22} /></span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Bill Saved</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateStr}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'var(--surface2)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 8, borderRadius: 12 }}>
              <LuX size={18} />
            </button>
          </div>

          {/* ── Printable receipt ───────────────────── */}
          <div
            ref={receiptRef}
            className="printable-receipt"
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              borderRadius: 14,
              padding: '18px 20px',
              marginBottom: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Receipt header */}
            <div style={{ textAlign: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px dashed #cbd5e1' }}>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '0.05em', color: '#0f172a' }}>INVOICE</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{dateStr}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginTop: 8, color: '#1e293b' }}>{customerDisplayName}</div>
              {customerPhone && <div style={{ fontSize: 12, color: '#64748b' }}>{customerPhone}</div>}
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 20,
                  background: bill.paymentType === 'CASH' ? '#dcfce7' : bill.paymentType === 'ONLINE' ? '#dbeafe' : '#fee2e2',
                  color:      bill.paymentType === 'CASH' ? '#15803d' : bill.paymentType === 'ONLINE' ? '#1d4ed8' : '#b91c1c',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {bill.paymentType}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 12px', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                <span>Item</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Amount</span>
              </div>
              {bill.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 12px', padding: '8px 0', borderTop: '1px solid #f1f5f9', fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{it.productName || 'Item'}</span>
                  <span style={{ textAlign: 'center', color: '#64748b' }}>× {it.qty}</span>
                  <span style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹ {(it.qty * it.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '2px 0' }}>
                <span>Subtotal</span><span>₹ {bill.subTotal.toFixed(2)}</span>
              </div>
              {bill.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '2px 0' }}>
                  <span>GST</span><span>₹ {bill.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {(bill.discount?.amount ?? 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#b91c1c', padding: '2px 0' }}>
                  <span>Discount</span><span>− ₹ {bill.discount!.amount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                <span>Total</span><span>₹ {bill.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>
              Thank you vist again!!
            </div>
          </div>

          {/* ── Action buttons ──────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <button className="btn btn-ghost" onClick={handlePrint} style={{ fontSize: 13, gap: 6, flexDirection: 'column', height: 64, border: '1px solid var(--border)' }}>
              <LuPrinter size={20} />
              <span>Print</span>
            </button>
            <button className="btn btn-ghost" onClick={handlePDF} style={{ fontSize: 13, gap: 6, flexDirection: 'column', height: 64, border: '1px solid var(--border)' }}>
              <LuFileText size={20} />
              <span>Save PDF</span>
            </button>
            <button
              onClick={handleWhatsApp}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 6, height: 64,
                background: '#25d366', color: '#fff',
                border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}
            >
              <LuShare2 size={20} />
              <span>WhatsApp</span>
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13, gap: 6, flexDirection: 'column', height: 64, border: '1px solid var(--border)' }}>
              <LuX size={20} />
              <span>Close</span>
            </button>
          </div>

          <button className="btn btn-primary btn-full" onClick={onNewBill} style={{ fontSize: 15, gap: 10, height: 48 }}>
            <LuPlus size={18} /> New Bill
          </button>
        </div>
      </div>
    </>
  );
}
