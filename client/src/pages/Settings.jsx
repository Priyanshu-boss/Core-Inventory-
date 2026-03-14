import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container fade-in" style={{ padding: 'var(--space-6)' }}>
      <header className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700' }}>Account Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your profile and system preferences</p>
      </header>

      <section className="settings-section" style={{ 
        background: 'var(--color-bg-card)', 
        padding: 'var(--space-6)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--color-border)',
        maxWidth: '600px'
      }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>Profile Details</h2>
        
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Email Address</label>
          <div style={{ 
            background: 'var(--color-bg-tertiary)', 
            padding: 'var(--space-3)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)'
          }}>
            {user?.email || 'Unknown User'}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Account ID</label>
          <div style={{ 
            background: 'var(--color-bg-tertiary)', 
            padding: 'var(--space-3)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)'
          }}>
            #{user?.id || 'N/A'}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-6) 0' }} />

        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>Account Actions</h2>
        <button 
          onClick={handleLogout}
          style={{
            background: 'var(--color-danger-dim)',
            color: 'var(--color-danger)',
            border: '1px solid var(--color-danger)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'var(--color-danger)';
            e.target.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'var(--color-danger-dim)';
            e.target.style.color = 'var(--color-danger)';
          }}
        >
          Sign Out of IMS
        </button>
      </section>
    </div>
  );
}
