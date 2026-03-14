const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

async function startServer() {
  // Initialize database first
  await initDb();
  console.log('✅ Database initialized');

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/locations', require('./routes/locations'));
  app.use('/api/documents', require('./routes/documents'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/stock-moves', require('./routes/stockMoves'));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 IMS Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
