import './StatusBadge.css';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'warning' },
  done: { label: 'Validated', variant: 'success' },
  receipt: { label: 'Receipt', variant: 'info' },
  delivery: { label: 'Delivery', variant: 'accent' },
  transfer: { label: 'Transfer', variant: 'primary' },
  adjustment: { label: 'Adjustment', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
  warning: { label: 'Warning', variant: 'warning' },
  low: { label: 'Low', variant: 'info' },
  internal: { label: 'Internal', variant: 'primary' },
  vendor: { label: 'Vendor', variant: 'accent' },
  customer: { label: 'Customer', variant: 'success' },
  virtual: { label: 'Virtual', variant: 'warning' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'primary' };
  return (
    <span className={`status-badge status-badge--${config.variant}`}>
      {config.label}
    </span>
  );
}
