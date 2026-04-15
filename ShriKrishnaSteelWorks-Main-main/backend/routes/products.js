import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category = 'All', page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;

    if (search.trim()) {
      filter.$or = [
        { productName:   { $regex: search, $options: 'i' } },
        { category:      { $regex: search, $options: 'i' } },
        { steelGrade:    { $regex: search, $options: 'i' } },
        { furnitureType: { $regex: search, $options: 'i' } },
        { features:      { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).skip(skip).limit(Number(limit)).lean(),
    ]);

    res.json({ products, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const agg = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(agg);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/products — create a product (admin) ────────────────────────────
router.post('/', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    const productId = `SKW-P-${String(count + 1).padStart(4, '0')}`;
    const product = await Product.create({ ...req.body, productId });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// ── PUT /api/products/:id — update a product (admin) ─────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// ── DELETE /api/products/:id — delete a product (admin) ──────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', product });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

export default router;