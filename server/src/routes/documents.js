const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/documents — list all, filterable by type and status
router.get('/', (req, res) => {
  const db = getDb();
  const { type, status } = req.query;
  let query = 'SELECT * FROM documents WHERE 1=1';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';

  const docs = db.prepare(query).all(...params);
  res.json(docs);
});

// GET /api/documents/:id — detail with line items
router.get('/:id', (req, res) => {
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const lines = db.prepare(`
    SELECT dl.*,
      p.name AS product_name, p.sku AS product_sku,
      lf.name AS from_location_name,
      lt.name AS to_location_name
    FROM document_lines dl
    JOIN products p ON p.id = dl.product_id
    JOIN locations lf ON lf.id = dl.from_location_id
    JOIN locations lt ON lt.id = dl.to_location_id
    WHERE dl.document_id = ?
  `).all(req.params.id);

  res.json({ ...doc, lines });
});

// POST /api/documents — create a draft document with line items
router.post('/', (req, res) => {
  const db = getDb();
  const { type, reference, notes, lines } = req.body;
  if (!type) return res.status(400).json({ error: 'Document type is required' });
  if (!lines || !lines.length) return res.status(400).json({ error: 'At least one line item is required' });

  const txn = db.transaction(() => {
    const result = db.prepare(
      `INSERT INTO documents (type, status, reference, notes) VALUES (?, 'draft', ?, ?)`
    ).run(type, reference || null, notes || null);
    const docId = result.lastInsertRowid;

    for (const line of lines) {
      db.prepare(
        `INSERT INTO document_lines (document_id, product_id, from_location_id, to_location_id, quantity)
         VALUES (?, ?, ?, ?, ?)`
      ).run(docId, line.product_id, line.from_location_id, line.to_location_id, line.quantity);
    }

    return docId;
  });

  const docId = txn();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId);
  const docLines = db.prepare(`
    SELECT dl.*, p.name AS product_name, p.sku AS product_sku,
      lf.name AS from_location_name, lt.name AS to_location_name
    FROM document_lines dl
    JOIN products p ON p.id = dl.product_id
    JOIN locations lf ON lf.id = dl.from_location_id
    JOIN locations lt ON lt.id = dl.to_location_id
    WHERE dl.document_id = ?
  `).all(docId);

  res.status(201).json({ ...doc, lines: docLines });
});

// POST /api/documents/:id/validate — two-step validation
router.post('/:id/validate', (req, res) => {
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status === 'done') return res.status(400).json({ error: 'Document already validated' });

  const lines = db.prepare('SELECT * FROM document_lines WHERE document_id = ?').all(req.params.id);

  const txn = db.transaction(() => {
    for (const line of lines) {
      db.prepare(
        `INSERT INTO stock_moves (document_id, product_id, from_location_id, to_location_id, quantity)
         VALUES (?, ?, ?, ?, ?)`
      ).run(req.params.id, line.product_id, line.from_location_id, line.to_location_id, line.quantity);
    }
    db.prepare(
      `UPDATE documents SET status = 'done', validated_at = datetime('now') WHERE id = ?`
    ).run(req.params.id);
  });

  txn();

  // Check for low stock alerts
  const alerts = [];
  for (const line of lines) {
    const product = db.prepare(`
      SELECT p.*,
        COALESCE(
          (SELECT SUM(sm.quantity) FROM stock_moves sm
           JOIN locations l ON l.id = sm.to_location_id
           WHERE sm.product_id = p.id AND l.type = 'internal'), 0
        ) -
        COALESCE(
          (SELECT SUM(sm.quantity) FROM stock_moves sm
           JOIN locations l ON l.id = sm.from_location_id
           WHERE sm.product_id = p.id AND l.type = 'internal'), 0
        ) AS current_stock
      FROM products p WHERE p.id = ?
    `).get(line.product_id);

    if (product && product.current_stock < product.reorder_point) {
      alerts.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        current_stock: product.current_stock,
        reorder_point: product.reorder_point,
      });
    }
  }

  const updatedDoc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  res.json({ ...updatedDoc, low_stock_alerts: alerts });
});

// DELETE /api/documents/:id — only drafts
router.delete('/:id', (req, res) => {
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status === 'done') return res.status(400).json({ error: 'Cannot delete validated documents' });

  db.prepare('DELETE FROM document_lines WHERE document_id = ?').run(req.params.id);
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  db._save();
  res.json({ message: 'Document deleted' });
});

module.exports = router;
