import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form" style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      {error && <div className="error" style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Don't have an account?{' '}
          <button 
            onClick={() => navigate('/register')}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
