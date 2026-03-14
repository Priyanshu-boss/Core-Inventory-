const { initDb, getDb } = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');

  const db = await initDb();

  // Clear existing data
  db.exec('DELETE FROM stock_moves');
  db.exec('DELETE FROM document_lines');
  db.exec('DELETE FROM documents');
  db.exec('DELETE FROM products');
  db.exec('DELETE FROM locations');
  db.exec('DELETE FROM users');
  db._save();

  // ── Users ──
  const bcrypt = require('bcryptjs');
  const adminHash = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run('admin@example.com', adminHash);
  db._save();

  // ── Locations ──
  const locations = [
    ['Warehouse A', 'internal'],
    ['Rack 1', 'internal'],
    ['Rack 2', 'internal'],
    ['Rack 3', 'internal'],
    ['Vendor Location', 'vendor'],
    ['Customer Location', 'customer'],
    ['Inventory Loss', 'virtual'],
  ];
  const locIds = {};
  for (const [name, type] of locations) {
    const result = db.prepare('INSERT INTO locations (name, type) VALUES (?, ?)').run(name, type);
    locIds[name] = result.lastInsertRowid;
  }
  db._save();

  // ── Products ──
  const products = [
    ['SKU-001', 'Steel Bolts M10',      'Hardware',    'unit', 50],
    ['SKU-002', 'Copper Wire 2.5mm',     'Electrical',  'm',   100],
    ['SKU-003', 'Hydraulic Fluid ISO 46','Lubricants',  'kg',  20],
    ['SKU-004', 'LED Panel Light 40W',   'Electrical',  'unit', 30],
    ['SKU-005', 'PVC Pipe 4 inch',       'Plumbing',    'm',   25],
    ['SKU-006', 'Safety Helmet Type II', 'Safety',      'unit', 15],
    ['SKU-007', 'Welding Rod E6013',     'Consumables', 'kg',  40],
    ['SKU-008', 'Bearing 6205-2RS',      'Mechanical',  'unit', 20],
  ];
  const prodIds = {};
  for (const [sku, name, category, uom, reorder] of products) {
    const result = db.prepare(
      'INSERT INTO products (sku, name, category, uom, reorder_point) VALUES (?, ?, ?, ?, ?)'
    ).run(sku, name, category, uom, reorder);
    prodIds[sku] = result.lastInsertRowid;
  }
  db._save();

  // ── Helper: create document + moves ──
  function createDoneDoc(type, ref, notes, items) {
    const result = db.prepare(
      `INSERT INTO documents (type, status, reference, notes, validated_at) VALUES (?, 'done', ?, ?, datetime('now'))`
    ).run(type, ref, notes);
    const docId = result.lastInsertRowid;
    for (const [pid, from, to, qty] of items) {
      db.prepare(
        `INSERT INTO document_lines (document_id, product_id, from_location_id, to_location_id, quantity) VALUES (?, ?, ?, ?, ?)`
      ).run(docId, pid, from, to, qty);
      db.prepare(
        `INSERT INTO stock_moves (document_id, product_id, from_location_id, to_location_id, quantity) VALUES (?, ?, ?, ?, ?)`
      ).run(docId, pid, from, to, qty);
    }
    return docId;
  }

  // Receipt 1: Receive goods from vendor
  createDoneDoc('receipt', 'REC-001', 'Initial stock receipt', [
    [prodIds['SKU-001'], locIds['Vendor Location'], locIds['Warehouse A'], 200],
    [prodIds['SKU-002'], locIds['Vendor Location'], locIds['Warehouse A'], 500],
    [prodIds['SKU-003'], locIds['Vendor Location'], locIds['Warehouse A'], 80],
    [prodIds['SKU-004'], locIds['Vendor Location'], locIds['Warehouse A'], 60],
    [prodIds['SKU-005'], locIds['Vendor Location'], locIds['Warehouse A'], 120],
    [prodIds['SKU-006'], locIds['Vendor Location'], locIds['Warehouse A'], 45],
    [prodIds['SKU-007'], locIds['Vendor Location'], locIds['Warehouse A'], 90],
    [prodIds['SKU-008'], locIds['Vendor Location'], locIds['Warehouse A'], 70],
  ]);

  // Delivery 1: Ship to customer
  createDoneDoc('delivery', 'DEL-001', 'Customer order fulfillment', [
    [prodIds['SKU-001'], locIds['Warehouse A'], locIds['Customer Location'], 150],
    [prodIds['SKU-004'], locIds['Warehouse A'], locIds['Customer Location'], 35],
    [prodIds['SKU-006'], locIds['Warehouse A'], locIds['Customer Location'], 30],
  ]);

  // Transfer 1: Organize into racks
  createDoneDoc('transfer', 'TRF-001', 'Organize into Rack 1', [
    [prodIds['SKU-002'], locIds['Warehouse A'], locIds['Rack 1'], 200],
    [prodIds['SKU-007'], locIds['Warehouse A'], locIds['Rack 1'], 50],
  ]);

  db._save();

  // Draft receipts (pending)
  const r2 = db.prepare(
    `INSERT INTO documents (type, status, reference, notes) VALUES ('receipt', 'draft', ?, ?)`
  ).run('REC-002', 'Awaiting vendor shipment');
  db.prepare(
    `INSERT INTO document_lines (document_id, product_id, from_location_id, to_location_id, quantity) VALUES (?, ?, ?, ?, ?)`
  ).run(r2.lastInsertRowid, prodIds['SKU-001'], locIds['Vendor Location'], locIds['Warehouse A'], 100);
  db.prepare(
    `INSERT INTO document_lines (document_id, product_id, from_location_id, to_location_id, quantity) VALUES (?, ?, ?, ?, ?)`
  ).run(r2.lastInsertRowid, prodIds['SKU-008'], locIds['Vendor Location'], locIds['Warehouse A'], 50);

  const r3 = db.prepare(
    `INSERT INTO documents (type, status, reference, notes) VALUES ('receipt', 'draft', ?, ?)`
  ).run('REC-003', 'Emergency restock order');
  db.prepare(
    `INSERT INTO document_lines (document_id, product_id, from_location_id, to_location_id, quantity) VALUES (?, ?, ?, ?, ?)`
  ).run(r3.lastInsertRowid, prodIds['SKU-006'], locIds['Vendor Location'], locIds['Warehouse A'], 25);

  db._save();

  console.log('✅ Seed complete!');
  console.log(`   ${products.length} products`);
  console.log(`   ${locations.length} locations`);
  console.log(`   5 documents (3 done, 2 draft)`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
