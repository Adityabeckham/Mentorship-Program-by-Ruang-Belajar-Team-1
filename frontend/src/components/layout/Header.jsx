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

  const navItems = [
    { name: 'Papan Event', path: '/dashboard', role: 'mahasiswa' },
    { name: 'Dashboard Panitia', path: '/panitia/dashboard', role: 'panitia' },
    { name: 'Dashboard Admin', path: '/admin/dashboard', role: 'admin' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between flex-wrap gap-3 py-3.5 px-6"
      style={{
        background: `repeating-linear-gradient(90deg, rgba(0, 0, 0, .08) 0 2px, transparent 2px 34px), linear-gradient(var(--color-navy), var(--color-navy-dark))`,
        borderBottom: '6px solid var(--color-cork-darker)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link to="/" className="inline-block bg-paper-yellow text-ink font-anton text-[22px] px-4 py-1.5 rounded rotate-[-2deg] shadow-pin hover:rotate-0 hover:scale-105 transition-transform tracking-wide">
          EventHub Kampus
        </Link>
        <span className="text-[#dbe6f2] text-xs font-mono opacity-90 hidden sm:inline-block">papan digital & verifikasi acara kampus</span>
      </div>

      {/* Nav & Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <Link 
                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'panitia' ? '/panitia/dashboard' : '/dashboard'}
                className="bg-white/5 border border-white/20 text-[#f2ede0] px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-white/15 hover:-translate-y-px transition-all font-work"
              >
                Dashboard
              </Link>
            </div>
            <div className="font-mono text-[11px] font-bold text-ink bg-paper-mint px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              <span className="hidden sm:inline">👋 {user.nama} ({user.role})</span>
              <button onClick={handleLogout} className="underline text-ink hover:text-black font-bold text-[11px] bg-transparent border-none p-0 cursor-pointer">
                Keluar
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="font-mono text-[11px] font-bold text-white bg-paper-sky px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:-translate-y-px transition-transform">
            <span className="underline">Masuk / Publik</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
