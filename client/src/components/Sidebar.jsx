import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/locations', label: 'Locations', icon: '📍' },
  { path: '/receipts', label: 'Receipts', icon: '📥' },
  { path: '/deliveries', label: 'Deliveries', icon: '📤' },
  { path: '/transfers', label: 'Transfers', icon: '🔄' },
  { path: '/stock-ledger', label: 'Stock Ledger', icon: '📋' },
  { path: '/alerts', label: 'Alerts', icon: '🔔' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          {!collapsed && <span className="sidebar__logo-text">IMS</span>}
          <span className="sidebar__logo-icon">⚙️</span>
        </div>
        <button className="sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar__nav" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__footer-info">
            <span className="sidebar__footer-dot"></span>
            <span>Inventory v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
