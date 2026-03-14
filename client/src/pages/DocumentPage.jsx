import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import './Dashboard.css';

export default function DocumentPage({ docType, title, icon, fromLocationType, toLocationType }) {
  const [documents, setDocuments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ reference: '', notes: '', lines: [{ product_id: '', from_location_id: '', to_location_id: '', quantity: 1 }] });

  const fetchDocuments = async () => {
    try {
      const params = { type: docType };
      if (statusFilter) params.status = statusFilter;
      const data = await api.getDocuments(params);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    api.getProducts().then(setProducts).catch(() => {});
    api.getLocations().then(setLocations).catch(() => {});
  }, [statusFilter]);

  const fromLocations = locations.filter(l => fromLocationType ? l.type === fromLocationType : true);
  const toLocations = locations.filter(l => toLocationType ? l.type === toLocationType : true);

  const openCreate = () => {
    const defaultFrom = fromLocations[0]?.id || '';
    const defaultTo = toLocations[0]?.id || '';
    setForm({
      reference: '',
      notes: '',
      lines: [{ product_id: products[0]?.id || '', from_location_id: defaultFrom, to_location_id: defaultTo, quantity: 1 }],
    });
    setModalOpen(true);
  };

  const addLine = () => {
    const defaultFrom = fromLocations[0]?.id || '';
    const defaultTo = toLocations[0]?.id || '';
    setForm({
      ...form,
      lines: [...form.lines, { product_id: products[0]?.id || '', from_location_id: defaultFrom, to_location_id: defaultTo, quantity: 1 }],
    });
  };

  const removeLine = (idx) => {
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  };

  const updateLine = (idx, field, value) => {
    const newLines = [...form.lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    setForm({ ...form, lines: newLines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDocument({
        type: docType,
        reference: form.reference,
        notes: form.notes,
        lines: form.lines.map(l => ({
          ...l,
          product_id: Number(l.product_id),
          from_location_id: Number(l.from_location_id),
          to_location_id: Number(l.to_location_id),
          quantity: Number(l.quantity),
        })),
      });
      setModalOpen(false);
      fetchDocuments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleValidate = async (id) => {
    if (!confirm('Validate this document? Stock levels will be updated.')) return;
    try {
      const result = await api.validateDocument(id);
      if (result.low_stock_alerts && result.low_stock_alerts.length > 0) {
        alert('⚠️ Low Stock Alert!\n\n' + result.low_stock_alerts.map(a =>
          `${a.name}: ${a.current_stock} remaining (reorder at ${a.reorder_point})`
        ).join('\n'));
      }
      fetchDocuments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft document?')) return;
    try {
      await api.deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      alert(err.message);
    }
  };

  const viewDetail = async (id) => {
    try {
      const doc = await api.getDocument(id);
      setDetailModal(doc);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner"></div>
        <span>Loading {title.toLowerCase()}...</span>
      </div>
    );
  }

  return (
    <main className="dashboard fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">{icon} {title}</h1>
          <p className="page-subtitle">{documents.length} documents</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate} id={`add-${docType}-btn`}>
          + New {title.slice(0, -1)}
        </button>
      </header>

      <div className="toolbar">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id={`${docType}-status-filter`}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="done">Validated</option>
        </select>
      </div>

      <div className="page-table-wrapper slide-up">
        <table className="data-table" id={`${docType}-table`}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Created</th>
              <th>Validated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="data-table__name">{doc.reference || `DOC-${doc.id}`}</td>
                <td><StatusBadge status={doc.status} /></td>
                <td>{doc.notes || '—'}</td>
                <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                <td>{doc.validated_at ? new Date(doc.validated_at).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn--secondary btn--sm" onClick={() => viewDetail(doc.id)}>
                      👁 View
                    </button>
                    {doc.status === 'draft' && (
                      <>
                        <button className="btn btn--success btn--sm" onClick={() => handleValidate(doc.id)}>
                          ✓ Validate
                        </button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(doc.id)}>
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`New ${title.slice(0, -1)}`} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`${docType}-ref`}>Reference</label>
              <input
                id={`${docType}-ref`}
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g. REC-004"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`${docType}-notes`}>Notes</label>
              <input
                id={`${docType}-notes`}
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            LINE ITEMS
          </h3>

          {form.lines.map((line, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr auto', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {idx === 0 && <label>Product</label>}
                <select
                  value={line.product_id}
                  onChange={(e) => updateLine(idx, 'product_id', e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {idx === 0 && <label>From</label>}
                <select
                  value={line.from_location_id}
                  onChange={(e) => updateLine(idx, 'from_location_id', e.target.value)}
                  required
                >
                  {fromLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {idx === 0 && <label>To</label>}
                <select
                  value={line.to_location_id}
                  onChange={(e) => updateLine(idx, 'to_location_id', e.target.value)}
                  required
                >
                  {toLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {idx === 0 && <label>Qty</label>}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn--danger btn--icon btn--sm"
                onClick={() => removeLine(idx)}
                disabled={form.lines.length === 1}
                style={{ marginBottom: '2px' }}
              >
                ✕
              </button>
            </div>
          ))}

          <button type="button" className="btn btn--secondary btn--sm" onClick={addLine} style={{ marginTop: 'var(--space-2)' }}>
            + Add Line
          </button>

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary">Create Draft</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`${detailModal?.reference || 'Document'} Details`} size="lg">
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Status</span>
                <div style={{ marginTop: 'var(--space-1)' }}><StatusBadge status={detailModal.status} /></div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Type</span>
                <div style={{ marginTop: 'var(--space-1)' }}><StatusBadge status={detailModal.type} /></div>
              </div>
            </div>
            {detailModal.notes && <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>{detailModal.notes}</p>}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {detailModal.lines?.map((line) => (
                  <tr key={line.id}>
                    <td className="data-table__name">{line.product_name}</td>
                    <td><code>{line.product_sku}</code></td>
                    <td>{line.from_location_name}</td>
                    <td>{line.to_location_name}</td>
                    <td><strong>{line.quantity}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </main>
  );
}
