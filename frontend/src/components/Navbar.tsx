import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const { user, logout } = useAuth();
  const { highContrast, toggleHighContrast } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30s
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { id: 'tracker', name: 'Log Footprint', icon: 'bi-plus-circle-fill' },
    { id: 'ecolens', name: 'EcoLens AI', icon: 'bi-camera-fill' },
    { id: 'challenges', name: 'Challenges', icon: 'bi-trophy-fill' },
    { id: 'goals', name: 'Goals', icon: 'bi-flag-fill' },
    { id: 'leaderboard', name: 'Leaderboard', icon: 'bi-people-fill' }
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark eco-card rounded-0 border-top-0 border-start-0 border-end-0 py-3 mb-4 sticky-top">
      <div className="container-fluid px-4">
        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center" href="#" onClick={() => setTab('dashboard')}>
          <i className="bi bi-compass-fill text-success fs-3 me-2" aria-hidden="true"></i>
          <span className="fw-bold tracking-wider fs-4">
            <span style={{ color: 'var(--eco-primary)' }}>Eco</span>Pilot AI
          </span>
        </a>

        {/* User Stats & Toggles for Mobile (collapsible nav) */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Main Nav Tabs */}
          {user && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
              {tabs.map(tab => (
                <li className="nav-item" key={tab.id}>
                  <button
                    className={`nav-link btn btn-link border-0 text-start d-flex align-items-center w-100 py-2 py-lg-0 px-3 px-lg-2 ${currentTab === tab.id ? 'active fw-bold' : ''}`}
                    onClick={() => {
                      setTab(tab.id);
                      const collapse = document.getElementById('navbarContent');
                      if (collapse && collapse.classList.contains('show')) {
                        collapse.classList.remove('show');
                      }
                    }}
                    aria-current={currentTab === tab.id ? 'page' : undefined}
                  >
                    <i className={`bi ${tab.icon} me-2`} aria-hidden="true"></i>
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* User actions / stats */}
          <div className="d-flex align-items-center ms-auto gap-3 flex-wrap flex-lg-nowrap mt-3 mt-lg-0">
            {user ? (
              <>
                {/* Gamified score widget */}
                <div className="d-flex align-items-center gap-2 bg-success bg-opacity-10 border border-success border-opacity-20 px-3 py-1.5 rounded-pill" title="Your points and active daily login streak">
                  <span className="text-success small fw-bold d-flex align-items-center">
                    <i className="bi bi-star-fill text-warning me-1.5" aria-hidden="true"></i>
                    {user.points} pts
                  </span>
                  <div className="vr bg-success bg-opacity-25" style={{ height: '16px' }}></div>
                  <span className="text-warning small fw-bold d-flex align-items-center">
                    <i className="bi bi-fire me-1.5" aria-hidden="true"></i>
                    {user.streak} day streak
                  </span>
                </div>

                {/* Notification Bell Dropdown */}
                <div className="position-relative">
                  <button 
                    className="btn btn-outline-secondary border-0 position-relative p-2"
                    onClick={() => setShowNotifications(!showNotifications)}
                    aria-label={`${unreadCount} unread notifications`}
                    aria-expanded={showNotifications}
                  >
                    <i className="bi bi-bell-fill fs-5" aria-hidden="true"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="eco-card position-absolute end-0 mt-2 p-0 overflow-hidden shadow-lg" style={{ width: '320px', zIndex: 1050 }}>
                      <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25">
                        <h6 className="m-0 fw-bold">Notifications</h6>
                        {unreadCount > 0 && (
                          <button className="btn btn-link btn-sm text-success text-decoration-none p-0" onClick={handleMarkAllRead}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="text-center text-muted p-4 small">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n._id} 
                              className={`p-3 border-bottom border-secondary border-opacity-10 small ${n.read ? 'opacity-60' : 'bg-success bg-opacity-5'}`}
                            >
                              <div className="d-flex gap-2">
                                <i className={`bi ${n.type === 'alert' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-info-circle-fill text-info'} fs-6`} aria-hidden="true"></i>
                                <div>
                                  <p className="m-0 text-white-50">{n.message}</p>
                                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* High Contrast Accessibility Toggler */}
                <button
                  className="btn btn-outline-secondary border-0 p-2"
                  onClick={toggleHighContrast}
                  aria-label={highContrast ? 'Switch to normal mode' : 'Switch to high contrast mode'}
                  title={highContrast ? 'Switch to normal mode' : 'Switch to high contrast mode'}
                >
                  <i className={`bi ${highContrast ? 'bi-brightness-high-fill text-warning' : 'bi-circle-half'}`} aria-hidden="true"></i>
                </button>

                {/* User badge + profile details */}
                <div className="d-flex align-items-center gap-2">
                  <div className="text-end d-none d-sm-block">
                    <div className="fw-bold small">{user.name}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {user.badges[user.badges.length - 1] || 'Beginner'}
                    </div>
                  </div>
                  <button 
                    className="eco-btn-outline px-3 py-1.5 fs-7 btn btn-sm"
                    onClick={logout}
                    aria-label="Logout from account"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn btn-outline-secondary border-0 p-2"
                onClick={toggleHighContrast}
                aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
              >
                <i className="bi bi-circle-half" aria-hidden="true"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
