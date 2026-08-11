import React from 'react';
import { useAuth } from '../providers/AuthProvider';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Mahasiswa</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Halo <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.nama}</span>, pantau event yang Anda ikuti di sini.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-blue-800 dark:text-blue-300 font-medium">Event Diikuti</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">3</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
            <h3 className="text-green-800 dark:text-green-300 font-medium">Sertifikat Diperoleh</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
