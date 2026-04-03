import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import Product from '../models/Product';
import Version from '../models/Version';
import Customer from '../models/Customer';
import Transaction from '../models/Transaction';
import Bill from '../models/Bill';

const router = Router();

// GET /api/bills
router.get('/', auth, async (req: any, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const bills = await Bill.find(filter).populate('customerId', 'name phone').sort({ date: -1 }).limit(50);
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills
router.post('/', auth, async (req, res: Response) => {
  try {
    const { items, customerId, customerName, customerPhone, paymentType, discount, status = 'COMPLETED', draftId } = req.body;
    let subTotal = 0;
    let totalTax = 0;
    const populatedItems = [];

    // Process items, deduct stock if completed
    for (const item of items) {
      const v = await Version.findById(item.versionId);
      if (!v) throw new Error('Version not found');
      
      const p = await Product.findById(v.productId);
      if (!p) throw new Error('Product not found');

      const qtyNeeded = item.qty * v.multiplier;
      if (status === 'COMPLETED') {
        if (p.freeStock < qtyNeeded) {
          throw new Error(`Insufficient stock for ${p.name}`);
        }
        p.freeStock -= qtyNeeded;
        await p.save();
      }

      const itemTotal = v.price * item.qty;
      const taxRate = p.taxRate || 0;
      const itemTax = itemTotal * (taxRate / 100);
      
      subTotal += itemTotal;
      totalTax += itemTax;

      populatedItems.push({
        versionId: item.versionId,
        productName: item.productName || p.name,
        versionName: item.versionName || v.name,
        qty: item.qty,
        price: v.price,
        taxAmount: itemTax
      });
    }

    let discountAmount = 0;
    if (discount) {
      if (discount.type === 'FLAT') discountAmount = discount.value;
      else if (discount.type === 'PERCENTAGE') discountAmount = subTotal * (discount.value / 100);
    }
    
    // Prevent negative total
    const total = Math.max(0, subTotal + totalTax - discountAmount);
    let txnId;

    if (status === 'COMPLETED') {
      if (customerId) {
        const customer = await Customer.findById(customerId);
        if (!customer) throw new Error('Customer not found');

        if (paymentType === 'UDHAAR') {
          customer.balance -= total;
          const txn = await Transaction.create({ type: 'OUT', category: 'Credit Sale', details: `Bill to ${customer.name}`, amount: total, customerId: customer._id });
          txnId = txn._id;
        } else {
          const txn = await Transaction.create({ type: 'IN', category: 'Sale', details: `Bill to ${customer.name}`, amount: total, customerId: customer._id });
          txnId = txn._id;
        }
        await customer.save();
      } else {
        const adhocName = customerName || 'Walk-in Cash Sale';
        const txn = await Transaction.create({ type: 'IN', category: 'Sale', details: `Bill to ${adhocName}`, amount: total });
        txnId = txn._id;
      }
    }

    // If saving from a draft, delete the old draft
    if (draftId) {
      await Bill.findOneAndDelete({ _id: draftId, status: 'DRAFT' });
    }

    const bill = await Bill.create({
      customerId,
      customerName,
      customerPhone,
      paymentType,
      items: populatedItems,
      subTotal,
      taxAmount: totalTax,
      discount: discount ? { type: discount.type, value: discount.value, amount: discountAmount } : undefined,
      total,
      transactionId: txnId,
      status
    });

    res.json(bill);
  } catch (err: any) {
    console.error("DEBUG BILLS ERROR:", err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/bills/:id (Only for drafts)
router.delete('/:id', auth, async (req, res: Response) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, status: 'DRAFT' });
    if (!bill) return res.status(404).json({ error: 'Draft bill not found or cannot be deleted' });
    await bill.deleteOne();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills/:id/cancel
router.post('/:id/cancel', auth, async (req, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.cancelled) return res.status(400).json({ error: 'Bill already cancelled' });

    // Restore stock
    for (const item of bill.items) {
      const v = await Version.findById(item.versionId);
      if (v) {
        const qtyToRestore = item.qty * v.multiplier;
        const p = await Product.findById(v.productId);
        if (p) {
          p.freeStock += qtyToRestore;
          await p.save();
        }
      }
    }

    // Revert ledger & balance
    if (bill.customerId) {
      const customer = await Customer.findById(bill.customerId);
      if (customer) {
        if (bill.paymentType === 'UDHAAR') {
          customer.balance += bill.total; // Restore balance
        }
        await customer.save();
      }
    }
    if (bill.transactionId) {
      await Transaction.findByIdAndDelete(bill.transactionId);
    }

    bill.cancelled = true;
    await bill.save();

    res.json({ success: true, bill });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
