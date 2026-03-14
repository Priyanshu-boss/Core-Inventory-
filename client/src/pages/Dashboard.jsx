import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiData, lowStockData, recentData] = await Promise.all([
          api.getKPIs(),
          api.getLowStock(),
          api.getRecentActivity(),
        ]);
        setKpis(kpiData);
        setLowStock(lowStockData);
        setRecentActivity(recentData);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <main className="dashboard fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time inventory overview</p>
        </div>
      </header>

      <section className="kpi-grid" aria-label="Key Performance Indicators">
        <KPICard
          icon="📦"
          label="Total Products"
          value={kpis?.totalProducts ?? 0}
          color="primary"
          delay={0}
        />
        <KPICard
          icon="📊"
          label="Total Stock"
          value={kpis?.totalStock ?? 0}
          color="accent"
          delay={80}
        />
        <KPICard
          icon="⚠️"
          label="Low Stock Alerts"
          value={kpis?.lowStockCount ?? 0}
          color={kpis?.lowStockCount > 0 ? 'danger' : 'success'}
          delay={160}
        />
        <KPICard
          icon="📥"
          label="Pending Receipts"
          value={kpis?.pendingReceipts ?? 0}
          color="warning"
          delay={240}
        />
      </section>

      <div className="dashboard__grid">
        <section className="dashboard__card slide-up" style={{ animationDelay: '300ms' }}>
          <header className="dashboard__card-header">
            <h2>⚠️ Low Stock Items</h2>
            <Link to="/alerts" className="dashboard__card-link">View all →</Link>
          </header>
          <div className="dashboard__card-body">
            {lowStock.length === 0 ? (
              <p className="dashboard__empty">All items are well stocked 🎉</p>
            ) : (
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current</th>
                    <th>Reorder At</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="data-table__name">{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td>
                        <span className={`stock-value ${p.current_stock <= 0 ? 'stock-value--critical' : 'stock-value--low'}`}>
                          {p.current_stock}
                        </span>
                      </td>
                      <td>{p.reorder_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="dashboard__card slide-up" style={{ animationDelay: '400ms' }}>
          <header className="dashboard__card-header">
            <h2>🕐 Recent Activity</h2>
            <Link to="/receipts" className="dashboard__card-link">View docs →</Link>
          </header>
          <div className="dashboard__card-body">
            {recentActivity.length === 0 ? (
              <p className="dashboard__empty">No recent activity</p>
            ) : (
              <div className="activity-feed">
                {recentActivity.map((doc) => (
                  <div key={doc.id} className="activity-item">
                    <div className="activity-item__icon">
                      <StatusBadge status={doc.type} />
                    </div>
                    <div className="activity-item__content">
                      <span className="activity-item__ref">{doc.reference || `DOC-${doc.id}`}</span>
                      <span className="activity-item__meta">
                        {doc.line_count} items · {new Date(doc.validated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
