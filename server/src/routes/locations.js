const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/locations
router.get('/', (req, res) => {
  const db = getDb();
  const { type } = req.query;
  let query = 'SELECT * FROM locations';
  const params = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  query += ' ORDER BY type, name';

  res.json(db.prepare(query).all(...params));
});

// GET /api/locations/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!location) return res.status(404).json({ error: 'Location not found' });
  res.json(location);
});

// POST /api/locations
router.post('/', (req, res) => {
  const db = getDb();
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Name and Type are required' });

  try {
    const result = db.prepare('INSERT INTO locations (name, type) VALUES (?, ?)').run(name, type);
    db._save();
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(location);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Location name already exists' });
    }
    if (err.message && err.message.includes('CHECK')) {
      return res.status(400).json({ error: 'Invalid location type. Use: internal, vendor, customer, virtual' });
    }
    throw err;
  }
});

// PUT /api/locations/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, type } = req.body;
  const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Location not found' });

  try {
    db.prepare('UPDATE locations SET name=?, type=? WHERE id=?').run(
      name || existing.name,
      type || existing.type,
      req.params.id
    );
    db._save();
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
    res.json(location);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Location name already exists' });
    }
    throw err;
  }
});

// DELETE /api/locations/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Location not found' });
  db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
  db._save();
  res.json({ message: 'Location deleted' });
});

module.exports = router;
