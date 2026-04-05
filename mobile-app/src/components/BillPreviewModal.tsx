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
import { LuPrinter, LuFileText, LuShare2, LuX, LuCircleCheck } from 'react-icons/lu';

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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13, fontWeight: bold ? 900 : 500, padding: bold ? '6px 0 0' : '2px 0' }}>
      <span style={{ color: bold ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: bold ? 'var(--text)' : 'var(--text-muted)' }}>{value}</span>
    </div>
  );
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

  const handlePDF = () => {
    // Most browsers show "Save as PDF" in the print dialog
    window.print();
  };

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
      `_Thank you for your business!_`,
    ].filter(Boolean).join('\n');

    const phone = customerPhone.replace(/\D/g, '');
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(lines)}`
      : `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* ── Overlay ────────────────────────────── */}
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{ zIndex: 1000 }}
      />

      {/* ── Sheet ──────────────────────────────── */}
      <div className="modal-sheet no-print" style={{ zIndex: 1001, maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--green)', display: 'flex' }}><LuCircleCheck size={22} /></span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Bill Saved</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateStr}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <LuX size={20} />
          </button>
        </div>

        {/* ── Printable receipt ───────────────────── */}
        <div
          ref={receiptRef}
          className="printable-receipt"
          style={{
            background: 'var(--surface2)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 20,
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Receipt header */}
          <div style={{ textAlign: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px dashed var(--border)' }}>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '0.05em' }}>INVOICE</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>{customerDisplayName}</div>
            {customerPhone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customerPhone}</div>}
            <div style={{ marginTop: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: bill.paymentType === 'CASH' ? 'rgba(34,197,94,0.15)' : bill.paymentType === 'ONLINE' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                color: bill.paymentType === 'CASH' ? 'var(--green)' : bill.paymentType === 'ONLINE' ? 'var(--blue)' : 'var(--red)',
              }}>
                {bill.paymentType}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              <span>Item</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Amount</span>
            </div>
            {bill.items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 12px', padding: '6px 0', borderTop: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{it.productName || 'Item'}</span>
                <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>× {it.qty}</span>
                <span style={{ textAlign: 'right', fontWeight: 700 }}>₹ {(it.qty * it.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 10 }}>
            <Row label="Subtotal" value={`₹ ${bill.subTotal.toFixed(2)}`} />
            {bill.taxAmount > 0 && <Row label="GST" value={`₹ ${bill.taxAmount.toFixed(2)}`} />}
            {(bill.discount?.amount ?? 0) > 0 && (
              <Row label={`Discount (${bill.discount!.type === 'FLAT' ? '₹' + bill.discount!.value : bill.discount!.value + '%'})`}
                   value={`− ₹ ${bill.discount!.amount.toFixed(2)}`} />
            )}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
              <Row label="Total" value={`₹ ${bill.total.toFixed(2)}`} bold />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
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

        <button className="btn btn-primary btn-full" onClick={onNewBill} style={{ fontSize: 15, gap: 8 }}>
          <LuCircleCheck size={18} /> New Bill
        </button>
      </div>

      {/* ── Print stylesheet ───────────────────── */}
      <style>{`
        @media print {
          body > *:not(.printable-receipt) { display: none !important; }
          .printable-receipt {
            display: block !important;
            position: fixed; top: 0; left: 0; right: 0;
            background: white !important; color: black !important;
            padding: 24px; font-family: monospace;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}
