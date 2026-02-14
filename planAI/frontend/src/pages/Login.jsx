import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎯 PlanAI</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.1 3.5 1 4.6l3.2 3.2C2.6 9.3 1.4 11.1 1 12c1.7 3.5 5.8 7 11 7 2 0 3.9-.5 5.6-1.4l3.8 3.8 1.1-1.1L2.1 3.5Zm9.9 13.5c-3.7 0-6.9-2.2-8.6-5 0-.1 1-1.9 2.6-3.4l2.1 2.1c-.1.4-.2.8-.2 1.3 0 2.2 1.8 4 4 4 .5 0 1-.1 1.4-.3l2.1 2.1c-1 .4-2.1.6-3.4.6Zm1.9-4.9-4-4c.1-1.1 1-2 2.1-2.1l2 2c.1.3.2.7.2 1.1 0 1.1-.9 2-2.1 2Z" />
                    <path d="M12 7c3.7 0 6.9 2.2 8.6 5 0 .1-1 1.9-2.6 3.4l1.4 1.4c1.4-1.3 2.5-2.9 3-4-.8-1.7-2.2-3.3-4-4.5C16.6 7.2 14.4 6.6 12 6.6c-1.2 0-2.3.2-3.3.5l1.6 1.6c.6-.2 1.2-.3 1.7-.3Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5c-5.2 0-9.3 3.6-11 7 1.7 3.4 5.8 7 11 7s9.3-3.6 11-7c-1.7-3.4-5.8-7-11-7Zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5Zm0-8.2A3.2 3.2 0 1 0 12 15a3.2 3.2 0 0 0 0-6.4Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
