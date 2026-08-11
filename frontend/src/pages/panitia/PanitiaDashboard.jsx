import React from 'react';
import { useAuth } from '../../providers/AuthProvider';

const PANITIA_EVENTS = [
  { title: 'Seminar Nasional: Generative AI & Career Transformation 2026', date: '20 Agt 2026', status: 'published', peserta: 2, quota: 100 },
  { title: 'Hackathon Kampus 24 Jam: Build Smart Campus Apps', date: '01 Sep 2026', status: 'rejected', peserta: 0, quota: 60 },
];

const PanitiaDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { num: '5', lbl: 'Total Event Dibuat', accent: '' },
    { num: '1', lbl: 'Pending Verifikasi', accent: 'amber' },
    { num: '2', lbl: 'Event Published', accent: 'mint' },
    { num: '1', lbl: 'Event Ditolak', accent: 'coral' },
  ];

  return (
    <div className="page-fade">
      <div className="section-title">
        <span className="eyebrow">Statistik Organisasi</span>
        <h2 style={{ color: '#fff' }}>Dashboard Panitia Organisasi</h2>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.lbl} className={`stat-card ${s.accent}`}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <h3 style={{ fontSize: '18px', margin: 0 }}>Ringkasan Event Milik Organisasi Saya</h3>
          <button className="btn btn-primary btn-sm">+ Buat Draft Event Baru</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Judul Event</th>
                <th>Tanggal</th>
                <th>Status Verifikasi Admin</th>
                <th>Peserta Terdaftar / Kuota</th>
              </tr>
            </thead>
            <tbody>
              {PANITIA_EVENTS.map((ev) => (
                <tr key={ev.title}>
                  <td><strong>{ev.title}</strong></td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{ev.date}</td>
                  <td><span className={`badge ${ev.status}`}>{ev.status}</span></td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>{ev.peserta} / {ev.quota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PanitiaDashboard;
