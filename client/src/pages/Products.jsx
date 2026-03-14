import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import './Dashboard.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ sku: '', name: '', category: 'General', uom: 'unit', reorder_point: 10 });

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    api.getCategories().then(setCategories).catch(() => {});
  }, [search, category]);

  const openCreate = () => {
    setEditing(null);
    setForm({ sku: '', name: '', category: 'General', uom: 'unit', reorder_point: 10 });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      uom: product.uom,
      reorder_point: product.reorder_point,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateProduct(editing.id, form);
      } else {
        await api.createProduct(form);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner"></div>
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <main className="dashboard fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in inventory</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate} id="add-product-btn">
          + Add Product
        </button>
      </header>

      <div className="toolbar">
        <div className="toolbar__search">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="product-search"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          id="product-category-filter"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="page-table-wrapper slide-up">
        <table className="data-table" id="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>UoM</th>
              <th>Stock</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><code>{p.sku}</code></td>
                <td className="data-table__name">{p.name}</td>
                <td>{p.category}</td>
                <td>{p.uom}</td>
                <td>
                  <span className={`stock-value ${
                    p.current_stock <= 0 ? 'stock-value--critical' :
                    p.current_stock < p.reorder_point ? 'stock-value--low' :
                    'stock-value--ok'
                  }`}>
                    {p.current_stock}
                  </span>
                </td>
                <td>{p.reorder_point}</td>
                <td>
                  {p.current_stock <= 0 ? <StatusBadge status="critical" /> :
                   p.current_stock < p.reorder_point ? <StatusBadge status="low" /> :
                   <StatusBadge status="done" />}
                </td>
                <td>
                  <div className="table-actions">
                    <Link to={`/stock-ledger?product=${p.id}`} className="btn btn--secondary btn--sm">
                      📋 History
                    </Link>
                    <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)}>
                      ✏️
                    </button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-sku">SKU</label>
              <input
                id="product-sku"
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-name">Name</label>
              <input
                id="product-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-category">Category</label>
              <input
                id="product-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-uom">Unit of Measure</label>
              <select
                id="product-uom"
                value={form.uom}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
              >
                <option value="unit">Unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="m">Meter (m)</option>
                <option value="l">Liter (L)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="product-reorder">Reorder Point</label>
            <input
              id="product-reorder"
              type="number"
              min="0"
              value={form.reorder_point}
              onChange={(e) => setForm({ ...form, reorder_point: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {editing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
