import './KPICard.css';

export default function KPICard({ icon, label, value, trend, color = 'primary', delay = 0 }) {
  return (
    <article
      className={`kpi-card kpi-card--${color} slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="kpi-card__icon">{icon}</div>
      <div className="kpi-card__content">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__value">{value}</span>
        {trend !== undefined && (
          <span className={`kpi-card__trend ${trend >= 0 ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="kpi-card__glow"></div>
    </article>
  );
}
