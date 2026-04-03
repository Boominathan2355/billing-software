import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import Transaction from '../models/Transaction';
import Product from '../models/Product';
import Customer from '../models/Customer';

const router = Router();

// GET /api/dashboard
router.get('/', auth, async (_req, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    // Sales Today
    const salesToday = await Transaction.aggregate([
      { $match: { date: { $gte: today }, category: { $in: ['Sale', 'Credit Sale'] }, type: 'IN' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Sales This Week
    const salesWeek = await Transaction.aggregate([
      { $match: { date: { $gte: weekAgo }, category: { $in: ['Sale', 'Credit Sale'] }, type: 'IN' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Low stock products (< 5)
    const lowStock = await Product.find({ freeStock: { $lt: 5 } }).limit(5);

    // Recent activity
    const recentActivity = await Transaction.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('customerId', 'name');

    // Total outstanding debt
    const debtAgg = await Customer.aggregate([
      { $match: { balance: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);

    res.json({
      salesToday: salesToday[0]?.total || 0,
      salesWeek: salesWeek[0]?.total || 0,
      lowStock,
      recentActivity,
      outstandingDebt: Math.abs(debtAgg[0]?.total || 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
