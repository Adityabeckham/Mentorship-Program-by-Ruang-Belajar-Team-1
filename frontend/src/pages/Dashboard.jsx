import React from 'react';
import { useAuth } from '../providers/AuthProvider';

const MY_EVENTS = [
  { title: 'Seminar Nasional: Generative AI & Career Transformation 2026', org: 'BEM Fakultas Ilmu Komputer', date: '20 Agustus 2026, 09:00', status: 'published', hadir: 'hadir' },
  { title: 'Donor Darah Massal & Pemeriksaan Kesehatan Gratis', org: 'Himpunan Mahasiswa Kesehatan', date: '25 Agustus 2026, 08:00', status: 'published', hadir: 'hadir' },
];

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { num: '2', lbl: 'Event Didaftarkan', accent: '' },
    { num: '2', lbl: 'Kehadiran Dikonfirmasi', accent: 'mint' },
    { num: '1', lbl: 'Sertifikat Diperoleh', accent: 'coral' },
  ];

  return (
    <div className="page-fade">
      {/* Section Title */}
      <div className="section-title">
        <span className="eyebrow">Pendaftaran Saya</span>
        <h2 style={{ color: '#fff' }}>Event Saya &amp; Status Kehadiran</h2>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.lbl} className={`stat-card ${s.accent}`}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Registration Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Organisasi Penyelenggara</th>
                <th>Tanggal Pelaksanaan</th>
                <th>Status Registrasi</th>
                <th>Kehadiran Peserta</th>
              </tr>
            </thead>
            <tbody>
              {MY_EVENTS.map((ev) => (
                <tr key={ev.title}>
                  <td><strong>{ev.title}</strong></td>
                  <td>{ev.org}</td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{ev.date}</td>
                  <td><span className={`badge ${ev.status}`}>{ev.status === 'published' ? 'Terdaftar' : ev.status}</span></td>
                  <td><span className={`badge ${ev.hadir}`}>{ev.hadir === 'hadir' ? 'Hadir ✅' : 'Belum'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
