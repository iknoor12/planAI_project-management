import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎯 PlanAI</h1>
          <h2>Create Account</h2>
          <p>Start managing your projects with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>

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
                placeholder="Create a password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
