import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FootprintTracker from './components/FootprintTracker';
import EcoLens from './components/EcoLens';
import Challenges from './components/Challenges';
import Goals from './components/Goals';
import Leaderboard from './components/Leaderboard';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setTab] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading Session...</span>
        </div>
        <h5 className="text-white-50">Checking Active Session...</h5>
      </div>
    );
  }

  // Render auth forms if user is not authenticated
  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', padding: '1rem' }}>
        {authView === 'login' ? (
          <Login onRegisterClick={() => setAuthView('register')} />
        ) : (
          <Register onLoginClick={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-h-screen">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setTab={setTab} />

      {/* Main Tab Routing */}
      <main className="flex-grow-1" id="main-content" tabIndex={-1}>
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'tracker' && <FootprintTracker />}
        {currentTab === 'ecolens' && <EcoLens />}
        {currentTab === 'challenges' && <Challenges />}
        {currentTab === 'goals' && <Goals />}
        {currentTab === 'leaderboard' && <Leaderboard />}
      </main>

      {/* Accessible Skip Link / Footer */}
      <footer className="py-4 mt-auto text-center border-top border-secondary border-opacity-10 small text-muted">
        <div className="container">
          <p className="m-0">© 2026 EcoPilot AI. Built for the Carbon Footprint Awareness Challenge.</p>
          <a href="#main-content" className="text-success text-decoration-none mt-1 d-inline-block">
            Skip to main content
          </a>
        </div>
      </footer>
    </div>
  );
};
export default App;
