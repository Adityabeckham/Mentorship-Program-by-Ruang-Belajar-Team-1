import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-blue-800 dark:text-blue-300 font-medium">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">0</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
            <h3 className="text-green-800 dark:text-green-300 font-medium">Participants</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
