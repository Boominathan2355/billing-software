import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import Product from '../models/Product';

const router = Router();

// GET /api/products
router.get('/', auth, async (_req, res: Response) => {
  const products = await Product.find().sort({ name: 1 });
  res.json(products);
});

// POST /api/products
router.post('/', auth, async (req, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
