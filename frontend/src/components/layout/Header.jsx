import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import toast from 'react-hot-toast';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center transition-colors duration-200 z-10 relative border-b border-gray-200 dark:border-gray-700">
      <div className="font-bold text-xl text-blue-600 dark:text-blue-400">
        <Link to="/">EventHub Kampus</Link>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.nama} <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors"
            >
              Keluar
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
