import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import './Dashboard.css';

export default function StockLedger() {
  const [searchParams] = useSearchParams();
  const preselectedProduct = searchParams.get('product') || '';

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(preselectedProduct);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setMoves([]);
      return;
    }
    setLoading(true);
    api.getStockMoves({ product_id: selectedProduct })
      .then(setMoves)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  // Calculate running balance
  const movesWithBalance = [...moves].reverse().reduce((acc, move) => {
    const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    
    let balanceChange = 0;
    if (move.to_location_type === 'internal' && move.from_location_type !== 'internal') {
      balanceChange = move.quantity; // incoming to stock
    } else if (move.from_location_type === 'internal' && move.to_location_type !== 'internal') {
      balanceChange = -move.quantity; // outgoing from stock
    }
    // internal transfer = 0 net change

    acc.push({ ...move, balance: lastBalance + balanceChange, balanceChange });
    return acc;
  }, []).reverse();

  return (
    <main className="dashboard fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">📋 Stock Ledger</h1>
          <p className="page-subtitle">Complete audit trail of stock movements</p>
        </div>
      </header>

      <div className="toolbar">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ minWidth: '300px' }}
          id="stock-ledger-product"
        >
          <option value="">Select a product to view history...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) — Stock: {p.current_stock}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="page-loading__spinner"></div>
          <span>Loading stock history...</span>
        </div>
      ) : !selectedProduct ? (
        <div className="dashboard__card slide-up" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📦</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)' }}>
            Select a product above to view its complete stock movement history.
          </p>
        </div>
      ) : moves.length === 0 ? (
        <div className="dashboard__card slide-up" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No stock movements found for this product.</p>
        </div>
      ) : (
        <div className="page-table-wrapper slide-up">
          <table className="data-table" id="stock-ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Document</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Quantity</th>
                <th>Change</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {movesWithBalance.map((move) => (
                <tr key={move.id}>
                  <td>{new Date(move.created_at).toLocaleString()}</td>
                  <td className="data-table__name">{move.document_reference || `DOC-${move.document_id}`}</td>
                  <td><StatusBadge status={move.document_type} /></td>
                  <td>{move.from_location_name}</td>
                  <td>{move.to_location_name}</td>
                  <td><strong>{move.quantity}</strong></td>
                  <td>
                    <span className={
                      move.balanceChange > 0 ? 'stock-value--ok' :
                      move.balanceChange < 0 ? 'stock-value--critical' :
                      ''
                    } style={{ fontWeight: 600 }}>
                      {move.balanceChange > 0 ? '+' : ''}{move.balanceChange}
                    </span>
                  </td>
                  <td><strong>{move.balance}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
