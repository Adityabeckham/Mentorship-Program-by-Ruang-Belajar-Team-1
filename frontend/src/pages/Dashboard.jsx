import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import registrationService from '../services/registrationService';

const Dashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchMyRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      const list = (res.data || []).map((r) => {
        const rawDate = r.event_date || r.events?.event_date;
        const formattedDate = rawDate
          ? new Date(rawDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-';

        return {
          id: r.registration_id || r.id,
          eventId: r.event_id || r.events?.id,
          ticketCode: r.ticket_code || `EHK-${(r.registration_id || r.id || '').substring(0, 8).toUpperCase()}`,
          title: r.event_title || r.events?.title || 'Event Kampus',
          org: r.organization_name || r.events?.users?.organization_name || r.events?.users?.nama || 'Panitia Kampus',
          date: formattedDate,
          location: r.location || r.events?.location || '-',
          status: r.status || 'published',
          isPresent: r.is_present === true,
        };
      });
      setRegistrations(list);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat daftar registrasi event.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const isPresentCount = registrations.filter((r) => r.isPresent).length;
    return [
      { num: String(total), lbl: 'Event Didaftarkan', accent: 'navy', icon: '🎟️' },
      { num: String(isPresentCount), lbl: 'Kehadiran Dikonfirmasi', accent: 'mint', icon: '✅' },
      { num: String(isPresentCount), lbl: 'E-Sertifikat SKKM', accent: 'coral', icon: '🏆' },
    ];
  }, [registrations]);

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
                <th>Penyelenggara</th>
                <th>Waktu Pelaksanaan</th>
                <th>Lokasi</th>
                <th>Status Kehadiran</th>
                <th style={{ textAlign: 'right' }}>Aksi Tiket</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Memuat data registrasi...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Anda belum mendaftar ke event manapun. Silakan lihat Papan Event di Halaman Utama.
                  </td>
                </tr>
              ) : (
                registrations.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong>{ev.title}</strong></td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700 }}>
                      {ev.org}
                    </td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{ev.date}</td>
                    <td style={{ fontSize: '12.5px' }}>📍 {ev.location}</td>
                    <td>
                      <span className={`badge ${ev.isPresent ? 'active' : 'pending_verification'}`}>
                        {ev.isPresent ? '✅ HADIR' : '⏳ BELUM HADIR'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-navy btn-sm" onClick={() => setSelectedTicket(ev)}>
                        🎟️ Lihat E-Tiket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setSelectedTicket(null)}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>E-Tiket Peserta Kampus</div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>{selectedTicket.title}</h2>

            <div style={{ background: '#fcf8f0', border: '2px dashed #c9bda2', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: '#8a7355' }}>
                KODE TIKET RESMI
              </div>
              <div style={{ fontSize: '22px', fontFamily: "'Space Mono', monospace", fontWeight: 700, color: 'var(--navy)', margin: '6px 0' }}>
                {selectedTicket.ticketCode}
              </div>
              <div style={{ fontSize: '12px', color: '#8a7355' }}>
                Nama Peserta: <strong>{user?.nama}</strong> ({user?.email})
              </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.6', color: 'var(--ink)' }}>
              📍 <strong>Lokasi:</strong> {selectedTicket.location}<br />
              🗓️ <strong>Waktu:</strong> {selectedTicket.date}<br />
              🏢 <strong>Organisasi:</strong> {selectedTicket.org}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-navy" onClick={() => setSelectedTicket(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
