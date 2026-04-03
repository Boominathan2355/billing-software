import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import Transaction from '../models/Transaction';

const router = Router();

// GET /api/transactions
router.get('/', auth, async (_req, res: Response) => {
  const transactions = await Transaction.find()
    .sort({ date: -1 })
    .populate('customerId', 'name');
  res.json(transactions);
});

// POST /api/transactions  (manual entry)
router.post('/', auth, async (req, res: Response) => {
  try {
    const txn = await Transaction.create(req.body);
    res.status(201).json(txn);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
