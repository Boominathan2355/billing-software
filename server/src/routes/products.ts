import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import Product from '../models/Product';
import Version from '../models/Version';

const router = Router();

// GET /api/products  (with their versions)
router.get('/', auth, async (_req, res: Response) => {
  const products = await Product.find().sort({ name: 1 });
  const versions = await Version.find();
  const result = products.map(p => ({
    ...p.toObject(),
    versions: versions.filter(v => v.productId.toString() === p._id.toString()),
  }));
  res.json(result);
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

// GET /api/products/:id/versions
router.get('/:id/versions', auth, async (req, res: Response) => {
  const versions = await Version.find({ productId: req.params.id });
  res.json(versions);
});

// POST /api/products/:id/versions
router.post('/:id/versions', auth, async (req, res: Response) => {
  try {
    const version = await Version.create({ ...req.body, productId: req.params.id });
    res.status(201).json(version);
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
    const versions = await Version.countDocuments({ productId: req.params.id });
    if (versions > 0) return res.status(400).json({ error: 'Cannot delete product with existing versions. Delete versions first.' });
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/versions/:versionId
router.put('/versions/:versionId', auth, async (req, res: Response) => {
  try {
    const version = await Version.findByIdAndUpdate(req.params.versionId, req.body, { new: true });
    if (!version) return res.status(404).json({ error: 'Not found' });
    res.json(version);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/versions/:versionId
router.delete('/versions/:versionId', auth, async (req, res: Response) => {
  try {
    await Version.findByIdAndDelete(req.params.versionId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
