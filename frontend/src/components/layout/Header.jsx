import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'panitia') return '/panitia/dashboard';
    return '/dashboard';
  };

  const roleBadgeClass = user?.role === 'admin' ? 'role-badge admin' : user?.role === 'panitia' ? 'role-badge panitia' : 'role-badge';

  return (
    <header className="board-header">
      {/* Brand */}
      <div className="brand">
        <Link to="/" className="tag">EventHub Kampus</Link>
        <div className="sub">papan digital &amp; verifikasi acara kampus</div>
      </div>

      {/* Nav & Role Badge */}
      <nav className="main-nav">
        <Link to="/" className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}>
          📋 Papan Event
        </Link>

        {user && (
          <>
            <Link
              to={getDashboardPath()}
              className={`nav-btn ${location.pathname.includes('dashboard') ? 'active' : ''}`}
            >
              {user.role === 'admin' ? '🛡️ Event Saya' : user.role === 'panitia' ? '📢 Event Saya' : '🎓 Event Saya'}
            </Link>

            <div className={roleBadgeClass}>
              <span>{user.nama} &bull; {user.role}</span>
              <button onClick={handleLogout}>Keluar</button>
            </div>
          </>
        )}

        {!user && (
          <Link to="/login" className="nav-btn">
            🔑 Masuk
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
