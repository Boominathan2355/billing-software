import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LuShoppingCart } from 'react-icons/lu';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(160deg, #080d1a 0%, #0e1a35 100%)',
    }}>
      {/* Logo */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: '0 0 40px rgba(99,102,241,0.4)',
      }}>
        <LuShoppingCart size={36} color="#fff" />
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>BillERP</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 14, fontWeight: 500 }}>
        Sign in to continue
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360 }}>
        {error && <div className="error-box">{error}</div>}

        <div style={{ marginBottom: 14 }}>
          <label className="label">Username</label>
          <input
            className="input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
          style={{ fontSize: 16 }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
        Default: admin / admin123
      </p>
    </div>
  );
}
