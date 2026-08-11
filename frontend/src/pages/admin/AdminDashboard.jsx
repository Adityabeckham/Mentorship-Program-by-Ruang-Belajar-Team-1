import React from 'react';
import { useAuth } from '../../providers/AuthProvider';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Administrator</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Selamat datang kembali, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.nama}</span>! Anda memiliki kontrol penuh platform.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
            <h3 className="text-purple-800 dark:text-purple-300 text-sm font-medium">Total Organisasi</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">6</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-blue-800 dark:text-blue-300 text-sm font-medium">Total Event Platform</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">42</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30">
            <h3 className="text-amber-800 dark:text-amber-300 text-sm font-medium">Perlu Verifikasi</h3>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">5</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
            <h3 className="text-green-800 dark:text-green-300 text-sm font-medium">Total Peserta Platform</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">1,280</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
