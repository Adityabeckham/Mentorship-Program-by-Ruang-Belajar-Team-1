import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

const MY_EVENTS = [
  { id: 'm1', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', org: 'BEM Fakultas Ilmu Komputer', date: '20 Agustus 2026, 09:00', location: 'Auditorium Utama & Zoom Hybrid', status: 'published', hadir: 'hadir', ticketCode: 'EHK-AI-2026-0091' },
  { id: 'm2', title: 'Donor Darah Massal & Pemeriksaan Kesehatan Gratis', org: 'Himpunan Mahasiswa Kesehatan', date: '25 Agustus 2026, 08:00', location: 'Gedung Serbaguna Kampus', status: 'published', hadir: 'hadir', ticketCode: 'EHK-HEALTH-2026-0104' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const stats = [
    { num: '2', lbl: 'Event Didaftarkan', accent: 'navy', icon: '🎟️' },
    { num: '2', lbl: 'Kehadiran Dikonfirmasi', accent: 'mint', icon: '✅' },
    { num: '1', lbl: 'E-Sertifikat SKKM', accent: 'coral', icon: '🏆' },
  ];

  return (
    <div className="page-fade">
      {/* Title */}
      <div className="section-title">
        <span className="eyebrow">Portal Mahasiswa • {user?.nama || 'Mahasiswa'}</span>
        <h2 style={{ color: '#fff' }}>Event Saya &amp; E-Tiket Kehadiran</h2>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.lbl} className={`stat-card ${s.accent}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="num">{s.num}</div>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
            </div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="toolbar">
          <div>
            <h3 style={{ fontSize: '19px', margin: 0 }}>Daftar Registrasi Event Resmi Kampus</h3>
            <p style={{ fontSize: '12.5px', color: '#8a7355', margin: '2px 0 0' }}>
              Tunjukkan E-Tiket kepada panitia di lokasi acara untuk konfirmasi kehadiran &amp; klaim sertifikat SKKM.
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Judul Event</th>
                <th>Organisasi Penyelenggara</th>
                <th>Tanggal Pelaksanaan</th>
                <th>Status Registrasi</th>
                <th>Kehadiran Peserta</th>
                <th style={{ textAlign: 'right' }}>Aksi E-Tiket</th>
              </tr>
            </thead>
            <tbody>
              {MY_EVENTS.map((ev) => (
                <tr key={ev.id}>
                  <td><strong>{ev.title}</strong></td>
                  <td>{ev.org}</td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11.5px' }}>{ev.date}</td>
                  <td><span className={`badge ${ev.status}`}>Terdaftar</span></td>
                  <td><span className={`badge ${ev.hadir}`}>{ev.hadir === 'hadir' ? 'Hadir ✅' : 'Belum'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-navy btn-sm" onClick={() => setSelectedTicket(ev)}>
                      🎟️ Lihat E-Tiket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setSelectedTicket(null)}>✕</button>

            <div className="ticket">
              <div>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div className="eyebrow" style={{ color: '#8a7355' }}>Resmi Kampus • E-TIKET</div>
                  <h3 style={{ fontSize: '20px', margin: '4px 0 0' }}>{selectedTicket.title}</h3>
                  <div style={{ fontSize: '11.5px', fontFamily: "'Space Mono', monospace", color: '#8a7355', marginTop: '2px' }}>
                    {selectedTicket.org}
                  </div>
                </div>

                <div className="perforation" />

                <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1.5px solid #e5dcc8' }}>
                  <div style={{ fontSize: '12px', color: '#8a7355', fontFamily: "'Space Mono', monospace" }}>KODE TIKET UNIK</div>
                  <div style={{ fontSize: '18px', fontFamily: "'Anton', sans-serif", letterSpacing: '1px', color: 'var(--navy)' }}>
                    {selectedTicket.ticketCode}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12.5px', lineHeight: '1.5' }}>
                    👤 <strong>Nama Peserta:</strong> {user?.nama || 'Mahasiswa'}<br />
                    📅 <strong>Waktu:</strong> {selectedTicket.date}<br />
                    📍 <strong>Lokasi:</strong> {selectedTicket.location}
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <span className="stamp">VERIFIED ACARA RESMI</span>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                  toast.success('E-Tiket berhasil diunduh dalam format gambar/PDF!');
                  setSelectedTicket(null);
                }}>
                  📥 Cetak / Simpan E-Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
