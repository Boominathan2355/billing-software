import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import Customer from '../models/Customer';
import Transaction from '../models/Transaction';

const router = Router();

// GET /api/customers
router.get('/', auth, async (_req, res: Response) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.json(customers);
});

// POST /api/customers
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', auth, async (req, res: Response) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  const history = await Transaction.find({ customerId: req.params.id }).sort({ date: -1 }).limit(50);
  res.json({ customer, history });
});

// POST /api/customers/:id/adjust
router.post('/:id/adjust', auth, async (req, res: Response) => {
  try {
    const { amount, type } = req.body; // type: 'receive' | 'give'
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });

    const amt = parseFloat(amount);
    if (type === 'receive') {
      customer.balance += amt;
      await Transaction.create({ type: 'IN', category: 'Payment', details: `Cash from ${customer.name}`, amount: amt, customerId: customer._id });
    } else {
      customer.balance -= amt;
      await Transaction.create({ type: 'OUT', category: 'Credit', details: `Credit to ${customer.name}`, amount: amt, customerId: customer._id });
    }
    await customer.save();
    res.json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', auth, async (req, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', auth, async (req, res: Response) => {
  try {
    const txns = await Transaction.countDocuments({ customerId: req.params.id });
    if (txns > 0) return res.status(400).json({ error: 'Cannot delete customer with transaction history' });
    
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
