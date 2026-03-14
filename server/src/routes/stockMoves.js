const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/stock-moves — filterable by product_id
router.get('/', (req, res) => {
  const db = getDb();
  const { product_id } = req.query;

  let query = `
    SELECT sm.*,
      p.name AS product_name, p.sku AS product_sku,
      lf.name AS from_location_name, lf.type AS from_location_type,
      lt.name AS to_location_name, lt.type AS to_location_type,
      d.type AS document_type, d.reference AS document_reference
    FROM stock_moves sm
    JOIN products p ON p.id = sm.product_id
    JOIN locations lf ON lf.id = sm.from_location_id
    JOIN locations lt ON lt.id = sm.to_location_id
    JOIN documents d ON d.id = sm.document_id
    WHERE 1=1
  `;
  const params = [];

  if (product_id) {
    query += ' AND sm.product_id = ?';
    params.push(product_id);
  }

  query += ' ORDER BY sm.created_at DESC, sm.id DESC';

  const moves = db.prepare(query).all(...params);
  res.json(moves);
});

// GET /api/stock-moves/by-location
router.get('/by-location', (req, res) => {
  const db = getDb();
  const { location_id } = req.query;
  if (!location_id) return res.status(400).json({ error: 'location_id is required' });

  const moves = db.prepare(`
    SELECT sm.*,
      p.name AS product_name, p.sku AS product_sku,
      lf.name AS from_location_name, lf.type AS from_location_type,
      lt.name AS to_location_name, lt.type AS to_location_type,
      d.type AS document_type, d.reference AS document_reference
    FROM stock_moves sm
    JOIN products p ON p.id = sm.product_id
    JOIN locations lf ON lf.id = sm.from_location_id
    JOIN locations lt ON lt.id = sm.to_location_id
    JOIN documents d ON d.id = sm.document_id
    WHERE sm.from_location_id = ? OR sm.to_location_id = ?
    ORDER BY sm.created_at DESC, sm.id DESC
  `).all(location_id, location_id);

  res.json(moves);
});

module.exports = router;
