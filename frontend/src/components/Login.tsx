import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onRegisterClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="text-center mb-4">
            <i className="bi bi-compass-fill text-success" style={{ fontSize: '3rem' }} aria-hidden="true"></i>
            <h1 className="fw-bold mt-2">Welcome to EcoPilot AI</h1>
            <p className="text-muted">Track, understand, and reduce your carbon footprint</p>
          </div>

          <div className="eco-card p-4">
            <h2 className="fs-4 fw-bold mb-3 text-center">Login to Your Dashboard</h2>

            {error && (
              <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                <i className="bi bi-exclamation-circle-fill me-2" aria-hidden="true"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label fw-medium text-white-50">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-muted">
                    <i className="bi bi-envelope-fill" aria-hidden="true"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-transparent text-white border-secondary border-opacity-25"
                    id="loginEmail"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="loginPassword" className="form-label fw-medium text-white-50">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-muted">
                    <i className="bi bi-lock-fill" aria-hidden="true"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-transparent text-white border-secondary border-opacity-25"
                    id="loginPassword"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-100 eco-btn-primary py-2.5 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="text-center mt-3 small text-muted">
              Don't have an account?{' '}
              <button 
                type="button" 
                className="btn btn-link btn-sm text-success text-decoration-none p-0 fw-bold" 
                onClick={onRegisterClick}
              >
                Register here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
