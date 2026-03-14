import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import './Dashboard.css';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'internal' });

  const fetchLocations = async () => {
    try {
      const data = await api.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', type: 'internal' });
    setModalOpen(true);
  };

  const openEdit = (loc) => {
    setEditing(loc);
    setForm({ name: loc.name, type: loc.type });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateLocation(editing.id, form);
      } else {
        await api.createLocation(form);
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return;
    try {
      await api.deleteLocation(id);
      fetchLocations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner"></div>
        <span>Loading locations...</span>
      </div>
    );
  }

  return (
    <main className="dashboard fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Locations</h1>
          <p className="page-subtitle">{locations.length} locations configured</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate} id="add-location-btn">
          + Add Location
        </button>
      </header>

      <div className="page-table-wrapper slide-up">
        <table className="data-table" id="locations-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id}>
                <td className="data-table__name">{loc.name}</td>
                <td><StatusBadge status={loc.type} /></td>
                <td>{new Date(loc.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn--secondary btn--sm" onClick={() => openEdit(loc)}>
                      ✏️
                    </button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(loc.id)}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Location' : 'Add Location'} size="sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loc-name">Location Name</label>
            <input
              id="loc-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="loc-type">Type</label>
            <select
              id="loc-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="internal">Internal (Warehouse/Rack)</option>
              <option value="vendor">Vendor</option>
              <option value="customer">Customer</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary">{editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
