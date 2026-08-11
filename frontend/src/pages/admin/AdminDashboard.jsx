import React from 'react';
import { Link } from 'react-router-dom';

const ADMIN_EVENTS = [
  { org: 'UKM Robotika Kampus', title: 'Robotics Bootcamp & Battle Bot Tournament 2026', date: '22 Agt 2026', status: 'pending_verification' },
  { org: 'BEM Fakultas Ilmu Komputer', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', date: '20 Agt 2026', status: 'published' },
  { org: 'BEM Fakultas Ilmu Komputer', title: 'Hackathon Kampus 24 Jam', date: '01 Sep 2026', status: 'rejected' },
];

const AdminDashboard = () => {
  const stats = [
    { num: '4', lbl: 'Total Organisasi/Panitia', accent: 'purple' },
    { num: '5', lbl: 'Total Event Platform', accent: '' },
    { num: '1', lbl: 'Perlu Verifikasi Admin', accent: 'amber' },
    { num: '1,280', lbl: 'Total Peserta Platform', accent: 'mint' },
  ];

  return (
    <div className="page-fade">
      <div className="section-title">
        <span className="eyebrow">Statistik Platform</span>
        <h2 style={{ color: '#fff' }}>Dashboard Platform (Admin Global)</h2>
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
        <h3 style={{ fontSize: '18px' }}>Pusat Kontrol &amp; Verifikasi Admin</h3>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
          Sebagai Admin Platform, Anda bertanggung jawab penuh melakukan verifikasi kelayakan event yang diajukan oleh
          seluruh panitia (UKM/BEM/Himpunan) agar aman dan sesuai aturan kampus sebelum ditayangkan di Papan Event.
        </p>

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-navy btn-sm">🔍 Buka Verifikasi Event</button>
          <button className="btn btn-outline dark btn-sm">👥 Kelola Akun Panitia</button>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div className="toolbar">
            <span style={{ fontSize: '13.5px', color: '#8a7355', fontWeight: 600 }}>Tinjau pengajuan event dari seluruh panitia organisasi</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Organisasi Pembuat</th>
                  <th>Judul Event</th>
                  <th>Tanggal</th>
                  <th>Status Review</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_EVENTS.map((ev) => (
                  <tr key={ev.title}>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700 }}>{ev.org}</td>
                    <td><strong>{ev.title}</strong></td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{ev.date}</td>
                    <td><span className={`badge ${ev.status}`}>{ev.status}</span></td>
                    <td>
                      {ev.status === 'pending_verification' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-success btn-sm">✅ Approve</button>
                          <button className="btn btn-danger btn-sm">❌ Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
