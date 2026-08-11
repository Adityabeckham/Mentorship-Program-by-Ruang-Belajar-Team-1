import React from 'react';
import { useAuth } from '../providers/AuthProvider';

const statusBadge = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending_verification: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabel = {
  published: '✅ Published',
  pending_verification: '⏳ Pending',
  rejected: '❌ Rejected',
  draft: '📝 Draft',
};

const StatCard = ({ title, value, icon, gradient }) => (
  <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-semibold opacity-90">{title}</span>
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-extrabold">{value}</p>
  </div>
);

const RecentEventRow = ({ name, status, date }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 -mx-4 px-4 rounded-lg transition-colors duration-150">
    <div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{date}</p>
    </div>
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge[status] || statusBadge.draft}`}>
      {statusLabel[status] || status}
    </span>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  // Placeholder data — will be replaced by real API later
  const stats = [
    { title: 'Event Diikuti', value: '3', gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { title: 'Sertifikat Diperoleh', value: '2', gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
    { title: 'Event Mendatang', value: '1', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const recentEvents = [
    { name: 'Seminar Nasional AI 2025', status: 'published', date: '20 Jul 2025' },
    { name: 'Workshop React.js', status: 'pending_verification', date: '15 Aug 2025' },
    { name: 'Hackathon Kampus', status: 'draft', date: '01 Sep 2025' },
  ];

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold border border-white/30">
            {user?.nama?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-200">Selamat datang kembali 👋</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.nama || 'Mahasiswa'}</h1>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full capitalize font-semibold mt-1 inline-block">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Recent Events Table */}
      <div className="rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-800 shadow-sm p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Event Terbaru</h2>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">Lihat semua →</span>
        </div>
        <div>
          {recentEvents.map((ev) => (
            <RecentEventRow key={ev.name} {...ev} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
