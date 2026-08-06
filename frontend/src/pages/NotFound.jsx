import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
