import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

const navItemsByRole = {
  mahasiswa: [
    { name: 'Papan Event', path: '/dashboard' },
  ],
  panitia: [
    { name: 'Dashboard Panitia', path: '/panitia/dashboard' },
  ],
  admin: [
    { name: 'Dashboard Admin', path: '/admin/dashboard' },
  ],
};

const defaultNav = [
  { name: 'Papan Event', path: '/dashboard' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user ? (navItemsByRole[user.role] || defaultNav) : defaultNav;

  return (
    <aside className="w-64 hidden md:flex flex-col h-[calc(100vh-80px)] p-6">
      <div className="bg-paper-white rounded-xl shadow-pin h-full flex flex-col relative">
        {/* Pin decoration */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-[0_3px_6px_rgba(0,0,0,.45)]"
          style={{ background: 'radial-gradient(circle at 35% 30%, #fff8, var(--color-stamp-red) 60%)' }}>
        </div>

        {/* Header */}
        <div className="p-5 border-b-2 border-dashed border-[#c9bda2]">
          <p className="font-mono text-xs font-bold text-[#8a7355] uppercase tracking-widest text-center">Navigasi</p>
        </div>

        {/* Nav items */}
        <nav className="p-4 space-y-2 flex-1 font-work">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-lg text-[13.5px] font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-paper-yellow text-ink shadow-[0_4px_10px_rgba(0,0,0,0.2)] scale-[1.02]'
                    : 'text-ink-soft hover:bg-[#efe7d7] hover:scale-[1.02]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User card at bottom */}
        {user && (
          <div className="p-4 border-t-2 border-dashed border-[#c9bda2] bg-[#fbf7ee] rounded-b-xl">
            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0 font-anton">
                {user.nama?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 font-mono">
                <p className="text-xs font-bold text-ink truncate">{user.nama}</p>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#e5dcc8] text-ink-soft inline-block mt-1">{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
