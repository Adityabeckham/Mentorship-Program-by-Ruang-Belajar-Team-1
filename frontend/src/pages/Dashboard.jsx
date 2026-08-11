import React from 'react';
import { useAuth } from '../providers/AuthProvider';

const statusBadge = {
  published: 'c-mint', // Using the paper-mint color
  pending_verification: 'c-yellow',
  rejected: 'c-coral',
  draft: 'c-sky',
};

const statusLabel = {
  published: 'Published',
  pending_verification: 'Pending',
  rejected: 'Rejected',
  draft: 'Draft',
};

const StatCard = ({ title, value, customClass }) => (
  <div className={`relative p-5 rounded-lg shadow-pin text-ink cursor-pointer transition-transform duration-250 hover:scale-105 hover:-translate-y-1 hover:shadow-card flex flex-col justify-between min-h-[140px] z-10 ${customClass}`}>
    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-[0_3px_6px_rgba(0,0,0,.45)]"
      style={{ background: 'radial-gradient(circle at 35% 30%, #fff8, var(--color-stamp-red) 60%)' }}>
    </div>
    
    <div>
      <span className="font-mono text-[10px] font-bold uppercase py-1 px-2.5 rounded-[10px] bg-black/15 inline-block mb-2">
        Statistik
      </span>
      <h3 className="font-anton text-[22px] leading-tight mb-2 opacity-90">{title}</h3>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="font-work text-3xl font-extrabold">{value}</span>
      <span className="text-[10px] font-bold uppercase bg-black/10 px-2 py-1 rounded">Total</span>
    </div>
  </div>
);

const RecentEventRow = ({ name, status, date }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#ece3d2] last:border-0 hover:bg-[#fbf7ee] transition-colors bg-[#fffdf8]">
    <div>
      <p className="text-[13.5px] font-bold text-ink mb-1">{name}</p>
      <p className="font-mono text-[11px] text-[#8a7355]">{date}</p>
    </div>
    <span className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold mt-2 sm:mt-0 shadow-sm ${statusBadge[status] || statusBadge.draft}`}>
      {statusLabel[status] || status}
    </span>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  // Placeholder data
  const stats = [
    { title: 'Event Diikuti', value: '3', customClass: 'c-yellow' },
    { title: 'Sertifikat Diperoleh', value: '2', customClass: 'c-mint' },
    { title: 'Event Mendatang', value: '1', customClass: 'c-sky' },
  ];

  const recentEvents = [
    { name: 'Seminar Nasional AI 2025', status: 'published', date: '20 Jul 2025' },
    { name: 'Workshop React.js', status: 'pending_verification', date: '15 Aug 2025' },
    { name: 'Hackathon Kampus', status: 'draft', date: '01 Sep 2025' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1180px] mx-auto min-h-screen font-work pb-20">
      {/* Hero / Banner */}
      <div className="mb-10 text-white">
        <span className="font-mono text-xs text-[#f0e6cf] uppercase tracking-[1.5px] opacity-85 mb-2 inline-block">
          DASHBOARD MAHASISWA
        </span>
        <h1 className="font-anton text-[40px] md:text-[46px] leading-[1.1] text-white" style={{ textShadow: '2px 3px 0 rgba(0, 0, 0, .3)' }}>
          SELAMAT DATANG, {user?.nama?.split(' ')[0] || 'MAHASISWA'}!
        </h1>
        <p className="text-[#f4ede0] max-w-[680px] leading-[1.6] text-[15px] mt-4 font-work">
          Pantau event yang Anda ikuti, lihat riwayat pendaftaran, dan akses sertifikat kegiatan Anda di sini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 mb-12">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Recent Events Table/Card */}
      <div className="bg-paper-white rounded-xl shadow-pin p-6 md:p-8 text-ink">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-anton text-[28px] m-0">Event Terbaru</h2>
          <button className="bg-transparent border-2 border-ink text-ink font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-black/5 transition-colors font-work cursor-pointer">
            LIHAT SEMUA
          </button>
        </div>
        
        <div className="border border-[#e5dcc8] rounded-lg overflow-hidden">
          <div className="bg-[#efe7d7] border-b-2 border-[#e5dcc8] p-3 text-left">
            <span className="font-mono text-[11px] uppercase text-[#8a7355] font-bold tracking-wider">Riwayat Pendaftaran</span>
          </div>
          <div>
            {recentEvents.map((ev) => (
              <RecentEventRow key={ev.name} {...ev} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
