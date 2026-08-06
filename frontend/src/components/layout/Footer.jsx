import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
      &copy; {new Date().getFullYear()} EventHub Kampus. All rights reserved.
    </footer>
  );
};

export default Footer;
