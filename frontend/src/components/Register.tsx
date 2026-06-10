import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface RegisterProps {
  onLoginClick: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
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
            <h1 className="fw-bold mt-2">Join EcoPilot AI</h1>
            <p className="text-muted">Start tracking, reducing, and saving carbon today</p>
          </div>

          <div className="eco-card p-4">
            <h2 className="fs-4 fw-bold mb-3 text-center">Create Your Account</h2>

            {error && (
              <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                <i className="bi bi-exclamation-circle-fill me-2" aria-hidden="true"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="mb-3">
                <label htmlFor="regName" className="form-label fw-medium text-white-50">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-muted">
                    <i className="bi bi-person-fill" aria-hidden="true"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-transparent text-white border-secondary border-opacity-25"
                    id="regName"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="regEmail" className="form-label fw-medium text-white-50">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-muted">
                    <i className="bi bi-envelope-fill" aria-hidden="true"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-transparent text-white border-secondary border-opacity-25"
                    id="regEmail"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="regPassword" className="form-label fw-medium text-white-50">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-muted">
                    <i className="bi bi-lock-fill" aria-hidden="true"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-transparent text-white border-secondary border-opacity-25"
                    id="regPassword"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="regConfirmPassword" className="form-label fw-medium text-white-50">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-muted">
                    <i className="bi bi-lock-fill" aria-hidden="true"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-transparent text-white border-secondary border-opacity-25"
                    id="regConfirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Register button */}
              <button
                type="submit"
                className="w-100 eco-btn-primary py-2.5 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>

            <div className="text-center mt-3 small text-muted">
              Already have an account?{' '}
              <button 
                type="button" 
                className="btn btn-link btn-sm text-success text-decoration-none p-0 fw-bold" 
                onClick={onLoginClick}
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
