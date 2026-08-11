import React from 'react';
import { useAuth } from '../../providers/AuthProvider';

const PanitiaDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Panitia</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Selamat datang, Panitia <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.nama}</span> ({user?.organization_name || 'Organisasi Kampus'})!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-blue-800 dark:text-blue-300 text-sm font-medium">Event Saya</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">8</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
            <h3 className="text-green-800 dark:text-green-300 text-sm font-medium">Total Peserta Mendaftar</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">240</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">Kehadiran Terkonfirmasi</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">185</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanitiaDashboard;
