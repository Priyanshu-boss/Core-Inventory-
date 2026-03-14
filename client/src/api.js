const API_BASE = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  sendOtp: (data) => request('/auth/send-otp', { method: 'POST', body: data }),
  verifyOtp: (data) => request('/auth/verify-otp', { method: 'POST', body: data }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),

  // Dashboard
  getKPIs: () => request('/dashboard/kpis'),
  getLowStock: () => request('/dashboard/low-stock'),
  getRecentActivity: () => request('/dashboard/recent-activity'),
  getAlerts: () => request('/dashboard/alerts'),

  // Products
  getProducts: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Locations
  getLocations: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/locations${qs ? `?${qs}` : ''}`);
  },
  createLocation: (data) => request('/locations', { method: 'POST', body: data }),
  updateLocation: (id, data) => request(`/locations/${id}`, { method: 'PUT', body: data }),
  deleteLocation: (id) => request(`/locations/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/documents${qs ? `?${qs}` : ''}`);
  },
  getDocument: (id) => request(`/documents/${id}`),
  createDocument: (data) => request('/documents', { method: 'POST', body: data }),
  validateDocument: (id) => request(`/documents/${id}/validate`, { method: 'POST' }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

  // Stock Moves
  getStockMoves: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/stock-moves${qs ? `?${qs}` : ''}`);
  },
  getStockMovesByLocation: (locationId) =>
    request(`/stock-moves/by-location?location_id=${locationId}`),
};
