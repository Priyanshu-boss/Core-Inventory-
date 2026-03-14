import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import './Dashboard.css';
import './Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlerts()
      .then(setAlerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner"></div>
        <span>Loading alerts...</span>
      </div>
    );
  }

  return (
    <main className="dashboard fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">🔔 Alerts</h1>
          <p className="page-subtitle">
            {alerts.length === 0
              ? 'All products are adequately stocked'
              : `${alerts.length} product${alerts.length > 1 ? 's' : ''} need attention`}
          </p>
        </div>
      </header>

      {alerts.length === 0 ? (
        <div className="alerts-empty slide-up">
          <span className="alerts-empty__icon">✅</span>
          <h2>All Clear!</h2>
          <p>All products are above their reorder points. No action required.</p>
        </div>
      ) : (
        <div className="alerts-grid">
          {alerts.map((alert, idx) => (
            <article
              key={alert.id}
              className={`alert-card alert-card--${alert.severity} slide-up`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="alert-card__header">
                <StatusBadge status={alert.severity} />
                <span className="alert-card__sku">{alert.sku}</span>
              </div>
              <h3 className="alert-card__name">{alert.name}</h3>
              <p className="alert-card__message">{alert.message}</p>
              <div className="alert-card__bar">
                <div className="alert-card__bar-track">
                  <div
                    className="alert-card__bar-fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, (alert.current_stock / alert.reorder_point) * 100))}%`,
                    }}
                  ></div>
                </div>
                <span className="alert-card__bar-label">
                  {alert.current_stock} / {alert.reorder_point}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
