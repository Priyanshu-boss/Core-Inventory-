const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Helper: get current stock for a product using subquery approach
const STOCK_SUBQUERY = `
  (
    COALESCE(
      (SELECT SUM(sm.quantity) FROM stock_moves sm
       JOIN locations l ON l.id = sm.to_location_id
       WHERE sm.product_id = p.id AND l.type = 'internal'), 0
    ) -
    COALESCE(
      (SELECT SUM(sm.quantity) FROM stock_moves sm
       JOIN locations l ON l.id = sm.from_location_id
       WHERE sm.product_id = p.id AND l.type = 'internal'), 0
    )
  )
`;

// GET /api/dashboard/kpis
router.get('/kpis', (req, res) => {
  const db = getDb();

  const totalProducts = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;

  const totalIncoming = db.prepare(`
    SELECT COALESCE(SUM(sm.quantity), 0) AS total
    FROM stock_moves sm
    JOIN locations l ON l.id = sm.to_location_id
    WHERE l.type = 'internal'
  `).get().total;

  const totalOutgoing = db.prepare(`
    SELECT COALESCE(SUM(sm.quantity), 0) AS total
    FROM stock_moves sm
    JOIN locations l ON l.id = sm.from_location_id
    WHERE l.type = 'internal'
  `).get().total;

  const netStock = totalIncoming - totalOutgoing;

  // Low stock count — use subquery to avoid HAVING issue
  const lowStockCount = db.prepare(`
    SELECT COUNT(*) AS count FROM (
      SELECT p.id, ${STOCK_SUBQUERY} AS current_stock, p.reorder_point
      FROM products p
    ) sub WHERE sub.current_stock < sub.reorder_point
  `).get().count;

  const pendingReceipts = db.prepare(
    `SELECT COUNT(*) AS count FROM documents WHERE type = 'receipt' AND status = 'draft'`
  ).get().count;

  res.json({ totalProducts, totalStock: netStock, lowStockCount, pendingReceipts });
});

// GET /api/dashboard/low-stock
router.get('/low-stock', (req, res) => {
  const db = getDb();
  // Use subquery pattern — no HAVING clause
  const products = db.prepare(`
    SELECT * FROM (
      SELECT p.*, ${STOCK_SUBQUERY} AS current_stock
      FROM products p
    ) sub
    WHERE sub.current_stock < sub.reorder_point
    ORDER BY (sub.current_stock - sub.reorder_point) ASC
  `).all();

  res.json(products);
});

// GET /api/dashboard/recent-activity
router.get('/recent-activity', (req, res) => {
  const db = getDb();
  const docs = db.prepare(`
    SELECT d.*,
      (SELECT COUNT(*) FROM document_lines dl WHERE dl.document_id = d.id) AS line_count
    FROM documents d
    WHERE d.status = 'done'
    ORDER BY d.validated_at DESC
    LIMIT 10
  `).all();

  res.json(docs);
});

// GET /api/dashboard/alerts
router.get('/alerts', (req, res) => {
  const db = getDb();
  // Use subquery pattern — no HAVING clause
  const alerts = db.prepare(`
    SELECT * FROM (
      SELECT p.id, p.sku, p.name, p.reorder_point,
        ${STOCK_SUBQUERY} AS current_stock
      FROM products p
    ) sub
    WHERE sub.current_stock < sub.reorder_point
    ORDER BY (sub.current_stock - sub.reorder_point) ASC
  `).all();

  res.json(alerts.map(a => ({
    ...a,
    severity: a.current_stock <= 0 ? 'critical' : a.current_stock < a.reorder_point / 2 ? 'warning' : 'low',
    message: a.current_stock <= 0
      ? `${a.name} is OUT OF STOCK!`
      : `${a.name} is below reorder point (${a.current_stock}/${a.reorder_point})`,
  })));
});

module.exports = router;
