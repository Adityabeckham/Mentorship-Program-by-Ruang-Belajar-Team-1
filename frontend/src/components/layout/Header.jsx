import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center transition-colors duration-200 z-10 relative">
      <div className="font-bold text-xl text-blue-600 dark:text-blue-400">
        EventHub Kampus
      </div>
      <button 
        onClick={toggleTheme}
        className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200 transition-colors"
      >
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
    </header>
  );
};

export default Header;
