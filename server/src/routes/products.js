const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/products — list all products with computed current_stock
router.get('/', (req, res) => {
  const db = getDb();
  const { search, category } = req.query;

  let query = `
    SELECT p.*,
      COALESCE(
        (SELECT SUM(sm.quantity) FROM stock_moves sm
         JOIN locations l_to ON l_to.id = sm.to_location_id
         WHERE sm.product_id = p.id AND l_to.type = 'internal'), 0
      )
      -
      COALESCE(
        (SELECT SUM(sm.quantity) FROM stock_moves sm
         JOIN locations l_from ON l_from.id = sm.from_location_id
         WHERE sm.product_id = p.id AND l_from.type = 'internal'), 0
      ) AS current_stock
    FROM products p
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ` AND p.category = ?`;
    params.push(category);
  }

  query += ` ORDER BY p.name`;

  const products = db.prepare(query).all(...params);
  res.json(products);
});

// GET /api/products/categories — unique category list
router.get('/categories', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
  res.json(rows.map(r => r.category));
});

// GET /api/products/:id — single product with stock
router.get('/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare(`
    SELECT p.*,
      COALESCE(
        (SELECT SUM(sm.quantity) FROM stock_moves sm
         JOIN locations l_to ON l_to.id = sm.to_location_id
         WHERE sm.product_id = p.id AND l_to.type = 'internal'), 0
      )
      -
      COALESCE(
        (SELECT SUM(sm.quantity) FROM stock_moves sm
         JOIN locations l_from ON l_from.id = sm.from_location_id
         WHERE sm.product_id = p.id AND l_from.type = 'internal'), 0
      ) AS current_stock
    FROM products p WHERE p.id = ?
  `).get(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products — create
router.post('/', (req, res) => {
  const db = getDb();
  const { sku, name, category, uom, reorder_point } = req.body;
  if (!sku || !name) return res.status(400).json({ error: 'SKU and Name are required' });

  try {
    const result = db.prepare(
      `INSERT INTO products (sku, name, category, uom, reorder_point) VALUES (?, ?, ?, ?, ?)`
    ).run(sku, name, category || 'General', uom || 'unit', reorder_point || 10);
    db._save();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    throw err;
  }
});

// PUT /api/products/:id — update
router.put('/:id', (req, res) => {
  const db = getDb();
  const { sku, name, category, uom, reorder_point } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  try {
    db.prepare(
      `UPDATE products SET sku=?, name=?, category=?, uom=?, reorder_point=? WHERE id=?`
    ).run(
      sku || existing.sku,
      name || existing.name,
      category || existing.category,
      uom || existing.uom,
      reorder_point ?? existing.reorder_point,
      req.params.id
    );
    db._save();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(product);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    throw err;
  }
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  db._save();
  res.json({ message: 'Product deleted' });
});

module.exports = router;
