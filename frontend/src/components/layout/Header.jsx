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

  const roleBadgeClass = user?.role === 'admin' 
    ? 'role-badge admin' 
    : user?.role === 'panitia' 
    ? 'role-badge panitia' 
    : 'role-badge';

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

        {user?.role === 'admin' && (
          <>
            <Link
              to="/admin/dashboard"
              className={`nav-btn ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
            >
              🛡️ Dashboard Admin
            </Link>
            <Link
              to="/admin/verify"
              className={`nav-btn ${location.pathname === '/admin/verify' ? 'active' : ''}`}
            >
              🔍 Verifikasi Event
            </Link>
            <Link
              to="/admin/panitia"
              className={`nav-btn ${location.pathname === '/admin/panitia' ? 'active' : ''}`}
            >
              👥 Kelola Panitia
            </Link>
          </>
        )}

        {user?.role === 'panitia' && (
          <Link
            to="/panitia/dashboard"
            className={`nav-btn ${location.pathname.includes('panitia') ? 'active' : ''}`}
          >
            📢 Dashboard Panitia
          </Link>
        )}

        {user?.role === 'mahasiswa' && (
          <Link
            to="/dashboard"
            className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            🎓 Event Saya
          </Link>
        )}

        {user && (
          <div className={roleBadgeClass}>
            <span>{user.nama} &bull; {user.role}</span>
            <button onClick={handleLogout}>Keluar</button>
          </div>
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
