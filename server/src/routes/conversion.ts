import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import Product from '../models/Product';

const router = Router();

// POST /api/conversion
router.post('/', auth, async (req, res: Response) => {
  try {
    const { fromProductId, fromQty, toProductId, toQty } = req.body;
    const from = await Product.findById(fromProductId);
    const to = await Product.findById(toProductId);
    if (!from || !to) return res.status(404).json({ error: 'Product not found' });

    const fq = parseFloat(fromQty);
    const tq = parseFloat(toQty);

    if (from.freeStock < fq) return res.status(400).json({ error: 'Insufficient stock' });

    from.freeStock -= fq;
    to.freeStock += tq;
    await from.save();
    await to.save();

    res.json({ success: true, from, to });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
