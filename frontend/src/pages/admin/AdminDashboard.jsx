import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const INITIAL_EVENTS = [
  { id: 'ev-1', org: 'UKM Robotika Kampus', title: 'Robotics Bootcamp & Battle Bot Tournament 2026', date: '22 Agt 2026', status: 'pending_verification', quota: 80, category: 'Technology' },
  { id: 'ev-2', org: 'BEM Fakultas Ilmu Komputer', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', date: '20 Agt 2026', status: 'published', quota: 100, category: 'Technology' },
  { id: 'ev-3', org: 'Himpunan Mahasiswa Kesehatan', title: 'Donor Darah Massal & Pemeriksaan Kesehatan Gratis', date: '25 Agt 2026', status: 'published', quota: 150, category: 'Health' },
  { id: 'ev-4', org: 'UKM Seni & Seni Suara', title: 'Kampus Art Exhibition & Live Acoustic Concert', date: '28 Agt 2026', status: 'pending_verification', quota: 200, category: 'Art' },
  { id: 'ev-5', org: 'BEM Fakultas Ilmu Komputer', title: 'Hackathon Kampus 24 Jam: Build Smart Campus Apps', date: '01 Sep 2026', status: 'rejected', quota: 60, category: 'Technology' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const pendingCount = events.filter(e => e.status === 'pending_verification').length;
  const activeCount = events.filter(e => e.status === 'published').length;

  // Summary cards required by Acceptance Criteria:
  // (Total Mahasiswa, Total Panitia, Event Active, Pending Approval)
  const summaryCards = [
    { id: 'mahasiswa', num: '1,280', lbl: 'Total Mahasiswa', sub: 'Terdaftar Aktif', accent: 'mint', icon: '🎓' },
    { id: 'panitia', num: '12', lbl: 'Total Panitia', sub: 'BEM, Himpunan & UKM', accent: 'purple', icon: '👥' },
    { id: 'active', num: String(activeCount), lbl: 'Event Active', sub: 'Published di Papan Event', accent: 'navy', icon: '🌟' },
    { id: 'pending', num: String(pendingCount), lbl: 'Pending Approval', sub: 'Perlu Verifikasi Admin', accent: 'amber', icon: '⏳' },
  ];

  const handleApprove = (id) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'published' } : ev));
    toast.success('Event berhasil disetujui & dipublikasikan ke Papan Event!');
  };

  const handleReject = (id) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'rejected' } : ev));
    toast.error('Event telah ditolak.');
  };

  return (
    <div className="page-fade">
      {/* Header Title */}
      <div className="section-title">
        <span className="eyebrow">Statistik Global Platform</span>
        <h2 style={{ color: '#fff' }}>Dashboard Admin Platform</h2>
      </div>

      {/* Summary Cards (Acceptance Criteria 1) */}
      <div className="stat-grid">
        {summaryCards.map((s) => (
          <div key={s.id} className={`stat-card ${s.accent}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="num">{s.num}</div>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
            </div>
            <div className="lbl">{s.lbl}</div>
            <div style={{ fontSize: '11px', color: '#8a7355', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Navigation Cards (Acceptance Criteria 2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: '#8a7355' }}>Fitur Utama Admin</div>
            <h3 style={{ fontSize: '20px', margin: '4px 0 8px' }}>🔍 Modul Verifikasi Event</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
              Tinjau dokumen pengajuan, narasumber, dan kuota dari panitia sebelum ditayangkan resmi.
            </p>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge pending_verification">
              {pendingCount} Event Menunggu
            </span>
            <button className="btn btn-navy btn-sm" onClick={() => navigate('/admin/verify')}>
              Buka Verifikasi →
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: '#8a7355' }}>Manajemen Pengguna</div>
            <h3 style={{ fontSize: '20px', margin: '4px 0 8px' }}>👥 Modul Kelola Panitia</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
              Kelola status aktivasi akun BEM, Himpunan Mahasiswa, &amp; UKM penyelenggara event kampus.
            </p>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge active">
              12 Panitia Aktif
            </span>
            <button className="btn btn-outline dark btn-sm" onClick={() => navigate('/admin/panitia')}>
              Kelola Panitia →
            </button>
          </div>
        </div>
      </div>

      {/* Activity Summary Table */}
      <div className="card">
        <div className="toolbar">
          <div>
            <h3 style={{ fontSize: '19px', margin: 0 }}>📋 Ringkasan Aktivitas Pengajuan Event Terbaru</h3>
            <p style={{ fontSize: '12.5px', color: '#8a7355', margin: '2px 0 0' }}>
              Daftar pengajuan event terkini dari seluruh organisasi kampus
            </p>
          </div>
          <Link to="/admin/verify" className="btn btn-navy btn-sm">
            Lihat Semua Event Verifikasi
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Organisasi Penyelenggara</th>
                <th>Judul Event</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Status Review</th>
                <th style={{ textAlign: 'right' }}>Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700 }}>
                    {ev.org}
                  </td>
                  <td><strong>{ev.title}</strong></td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{ev.date}</td>
                  <td>
                    <span className="cat-badge" style={{ margin: 0 }}>{ev.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${ev.status}`}>
                      {ev.status === 'published' ? '✅ Approved' : ev.status === 'pending_verification' ? '⏳ Pending' : '❌ Rejected'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {ev.status === 'pending_verification' ? (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(ev.id)}>
                          ✅ Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(ev.id)}>
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#8a7355', fontFamily: "'Space Mono', monospace" }}>
                        Selesai Ditinjau
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
